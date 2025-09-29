import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { lazy } from "react";
const VoiceInput = lazy(() => import("@/components/VoiceInput"));
const FloatingCamera = lazy(() => import("@/components/FloatingCamera"));
import { saveLatestRecording } from "@/lib/idb";
import { 
  Send, 
  Clock, 
  MessageSquare, 
  User, 
  Bot,
  Menu,
  X,
  Lightbulb,
  Mic
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
// removed tooltip-based sidebars
import { aiGenerate, ChatMessage } from "@/utils/ai";
import { useToast } from "@/components/ui/use-toast";
import { buildCompactProfile, summarizeMessages, trimMessages } from "@/lib/utils";

interface Message {
  id: string;
  type: "interviewer" | "user";
  content: string;
  timestamp: Date;
  typing?: boolean;
}

const Interview = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [lastQuestion, setLastQuestion] = useState<string>("");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [sessionTime, setSessionTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const recorderRef = useRef<any>(null);
  const [askRecordConsent, setAskRecordConsent] = useState(true);
  const [recordConsent, setRecordConsent] = useState<"yes" | "no" | null>(null);
  const [showDownloadDialog, setShowDownloadDialog] = useState<Blob | null>(null);
  const [screenRecorder, setScreenRecorder] = useState<MediaRecorder | null>(null);
  const screenChunksRef = useRef<BlobPart[]>([]);
  const [displayStream, setDisplayStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const [profileHeader, setProfileHeader] = useState<string>("");
  const [profile, setProfile] = useState<any>(null);
  const [confirmEndOpen, setConfirmEndOpen] = useState(false);

  // No local fallback questions: all questions must be AI-generated

  const starTips = [
    {
      letter: "S",
      word: "Situation",
      tip: "Set the scene with context and background"
    },
    {
      letter: "T", 
      word: "Task",
      tip: "Describe your specific responsibility or goal"
    },
    {
      letter: "A",
      word: "Action", 
      tip: "Explain the steps you took to address the situation"
    },
    {
      letter: "R",
      word: "Result",
      tip: "Share the outcome and quantify impact when possible"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem("prep_profile") || "null");
      if (p) {
        setProfile(p);
        const role = p.role || "Interview";
        const company = p.company ? ` @ ${p.company}` : "";
        setProfileHeader(`${role}${company}`);
      }
    } catch {}
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Ask for recording consent once per session
  useEffect(() => {
    if (askRecordConsent && recordConsent === null) {
      setShowCamera(false);
    }
  }, [askRecordConsent, recordConsent]);

  // Generate the first AI question only after the user answers the recording consent
  useEffect(() => {
    if (messages.length === 0 && recordConsent !== null) {
      (async () => {
        setIsLoading(true);
        // show typing indicator
        setMessages([{ id: "typing-boot", type: "interviewer", content: "", timestamp: new Date(), typing: true }]);
        try {
          let profile: any = null;
          try { profile = JSON.parse(localStorage.getItem("prep_profile") || "null"); } catch {}
          const compactProfile = buildCompactProfile(profile);
      const system = `Interviewer: ask ONE concise opener (1–3 sentences). Default to clear, simple English. If the candidate struggles in English (short answers, asks for help), you may switch to light Taglish to guide them. Professional.`;
          const firstQ = await aiGenerate(`${system}\nProfile: ${compactProfile}.\nAsk only the first interview question. Prefer "Introduce yourself."`, [], { maxOutputTokens: 60, temperature: 0.6 });
          const q = firstQ?.trim() || "Pwede bang magpakilala ka muna? Tell me about yourself.";
          setLastQuestion(q);
          const firstMessages = [{ id: Date.now().toString(), type: "interviewer", content: q, timestamp: new Date() }];
          setMessages(firstMessages as any);
          try { localStorage.setItem("prep_transcript", JSON.stringify(firstMessages)); } catch {}
        } catch (e) {
          setMessages([]);
          alert("Couldn't reach the AI interviewer. Please try again.");
        } finally {
          setIsLoading(false);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordConsent]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSendAnswer = async () => {
    if (!currentAnswer.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: currentAnswer,
      timestamp: new Date()
    };

    const baseMessages = [...messages, userMessage];
    setMessages(baseMessages);
    setCurrentAnswer("");
    setIsLoading(true);

    // Show typing indicator
    const typingMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: "interviewer",
      content: "",
      timestamp: new Date(),
      typing: true
    };
    const withTyping = [...baseMessages, typingMessage];
    setMessages(withTyping);

    try {
      // Build dynamic prompt using onboarding profile and transcript
      let profile: any = null;
      try { profile = JSON.parse(localStorage.getItem("prep_profile") || "null"); } catch {}

      // Keep only the last N exchanges and trim each message to reduce tokens
      const trimmed = trimMessages(
        messages.map((m) => ({ role: m.type === "user" ? "user" : "model", text: m.content })),
        6,
        280
      );
      const historyForAi: ChatMessage[] = trimmed;
      const summary = summarizeMessages(trimmed, 360);

      const system = `Interviewer: ask ONE concise follow‑up (1–3 sentences).
Default to clear English. If the candidate struggles, lightly use Taglish to guide.
Requirements: Reference the candidate's last answer directly; ask a specific, natural follow‑up. Professional. No lists.`;

      const compactProfile = buildCompactProfile(profile);
      const lastUserAnswer = userMessage.content;
      const prompt = `${system}\nProfile: ${compactProfile}.\nContext: ${summary}.\nLast question: ${lastQuestion || "(none)"}.\nLast user answer: ${lastUserAnswer}.\nReply with a brief ack (optional) + ONE next question (1–3 sentences).`;

      let nextQ = await aiGenerate(prompt, historyForAi.concat([{ role: "user", text: currentAnswer }]), { maxOutputTokens: 80, temperature: 0.6 });
      if (!nextQ || nextQ.length > 320) {
        // Retry with tighter cap
        nextQ = await aiGenerate(prompt, historyForAi.concat([{ role: "user", text: currentAnswer }]), { maxOutputTokens: 60, temperature: 0.6 });
      }

      const filtered = withTyping.filter(msg => !msg.typing);
      const nextQuestion: Message = {
        id: (Date.now() + 2).toString(),
        type: "interviewer",
        content: (nextQ || "Please share more details relevant to this role."),
        timestamp: new Date()
      };
      setLastQuestion(nextQuestion.content);
      const finalMessages = [...filtered, nextQuestion];
      setMessages(finalMessages);
      try { localStorage.setItem("prep_transcript", JSON.stringify(finalMessages)); } catch {}
      setQuestionNumber(prev => prev + 1);
    } catch (e) {
      const filtered = withTyping.filter(msg => !msg.typing);
      setMessages(filtered);
      try { localStorage.setItem("prep_transcript", JSON.stringify(filtered)); } catch {}
      alert("Couldn't reach the AI interviewer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSession = () => {
    const hasUserAnswer = messages.some(m => m.type === "user" && String(m.content || "").trim().length > 0);
    try {
      // Stop any active recordings; only offer download if there is content
      stopRecording(hasUserAnswer);
    } catch {}

    if (!hasUserAnswer) {
      // No answers: discard and return to dashboard with toast
      toast({ title: "Interview discarded", description: "Your session was not saved.", duration: 3000, variant: "destructive" });
      navigate("/dashboard");
      return;
    }

    // Persist latest transcript before navigating to feedback when there are answers
    try { localStorage.setItem("prep_transcript", JSON.stringify(messages)); } catch {}
    navigate("/feedback");
  };

  const stopRecording = (offerDownload: boolean) => {
    try {
      if (recorderRef.current?.isRecording?.()) {
        recorderRef.current.stop();
        const blob = recorderRef.current.getBlob?.();
        if (blob && offerDownload) {
          try { saveLatestRecording(blob); } catch {}
          setShowDownloadDialog(blob);
        }
      }
      if (screenRecorder) {
        screenRecorder.stop();
        const final = new Blob(screenChunksRef.current, { type: 'video/webm' });
        if (offerDownload) { try { saveLatestRecording(final); } catch {} }
        setScreenRecorder(null);
      }
      if (displayStream) {
        displayStream.getTracks().forEach(t => t.stop());
        setDisplayStream(null);
      }
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
        setCameraStream(null);
      }
      setIsRecording(false);
    } catch {}
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSendAnswer();
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    setCurrentAnswer(prev => prev + (prev ? " " : "") + transcript);
  };

  const handleComposerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentAnswer(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const next = Math.min(192, Math.max(48, textareaRef.current.scrollHeight));
      textareaRef.current.style.height = next + "px";
    }
  };

  const handleCopyMessage = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied", description: "Message copied to clipboard", duration: 1500 });
    } catch {}
  };

  // Voice mode toggling removed; mic is inline in composer

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      
      {/* Session Controls */}
      <div className="border-b border-border/50 bg-card/60 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 text-sm">
              <div className="text-base sm:text-lg font-semibold truncate max-w-[50vw] flex items-center gap-2">
                {profileHeader || "Interview Session"}
                {profile?.field && (
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-secondary/60 text-[11px] text-foreground/80">{profile.field}</span>
                )}
                {profile?.level && (
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-secondary/60 text-[11px] capitalize text-foreground/80">{profile.level}</span>
                )}
              </div>
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-secondary/50 rounded-lg">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span className="font-medium">Question {questionNumber}</span>
              </div>
              <div className="hidden sm:flex items-center space-x-2">
                <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-secondary/50 rounded-lg">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-medium">{formatTime(sessionTime)}</span>
                </div>
                {isRecording && (
                  <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="font-medium">Recording…</span>
                  </div>
                )}
              </div>
              {/* Removed STAR chip for cleaner header */}
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDetails(true)}
                className="hover:bg-secondary/50"
                aria-label="Open details"
              >
                <Menu className="h-4 w-4" />
              </Button>
              
              {!showCamera && (
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      if (!cameraStream) {
                        const cam = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                        setCameraStream(cam);
                      }
                      setShowCamera(true);
                    } catch {
                      toast({ title: "Camera unavailable", description: "Permission denied or no device.", duration: 2500, variant: "destructive" });
                    }
                  }}
                  className="border-border/60"
                >
                  Show Camera
                </Button>
              )}

            <Button variant="outline" onClick={() => setConfirmEndOpen(true)} className="border-border/50">
                End Session
              </Button>
            </div>
          </div>

          {/* Progress removed - continuous interview */}
        </div>
      </div>

      <div id="interview-root" className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-6xl h-[calc(100vh-140px)] flex-1 overflow-hidden">
        {/* Recording banner moved to header next to timer */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 h-full min-h-0">
          {/* Camera Preview (top) */}
          {/* Camera popup */}
          {showCamera && cameraStream && (
            <FloatingCamera stream={cameraStream} onClose={() => setShowCamera(false)} />
          )}

          {/* Chat Column */}
            <div className="lg:col-span-2 flex flex-col h-full min-h-0">
            <Card className="flex-1 flex flex-col border-border/50 bg-card shadow-sm h-full min-h-[360px]">
              <CardContent className="p-0 flex-1 flex min-h-0">
                {/* Scrollable messages viewport */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-5 max-h-full">
                  <div className="relative space-y-5">
              {messages.map((message) => (
                <div key={message.id} className={`flex items-end ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  {/* Avatar */}
                  {message.type === "interviewer" && (
                    <div className="mr-2 sm:mr-3 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shadow-sm">
                      <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
                    </div>
                  )}
                  <div className={`max-w-[80%] sm:max-w-[75%] ${message.type === "user" ? "ml-10 sm:ml-12" : "mr-10 sm:mr-12"}`}>
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-1.5 sm:mb-2">
                      <div className={`flex items-center space-x-2 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                        message.type === "interviewer" 
                          ? "bg-primary/20 text-primary" 
                          : "bg-secondary/70 text-secondary-foreground"
                      }`}>
                        {message.type === "interviewer" ? (
                          <Bot className="h-3 w-3" />
                        ) : (
                          <User className="h-3 w-3" />
                        )}
                        <span>{message.type === "interviewer" ? "AI Interviewer" : "You"}</span>
                      </div>
                      <span className="text-[10px] sm:text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className={`group relative p-3 sm:p-4 rounded-2xl border ${
                      message.type === "interviewer" 
                        ? "bg-muted/40 text-foreground border-border/50" 
                        : "bg-primary text-primary-foreground border-transparent"
                    }`}>
                      {message.typing ? (
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                          </div>
                          <span className="text-sm text-muted-foreground">Thinking...</span>
                        </div>
                      ) : (
                        <p className="leading-relaxed text-sm sm:text-base">{message.content}</p>
                      )}
                      {!message.typing && (
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(message.content)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-0.5 rounded-md bg-secondary/60 hover:bg-secondary/80"
                          aria-label="Copy message"
                        >
                          Copy
                        </button>
                      )}
                    </div>
                  </div>
                  {message.type === "user" && (
                    <div className="ml-2 sm:ml-3 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                      <User className="h-3 w-3 sm:h-4 sm:w-4" />
                    </div>
                  )}
                </div>
              ))}
              
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Camera popup removed; preview shown at top when enabled */}

            {/* Composer at bottom */}
            <div className="mt-3">
              <Card className="border-border/50 bg-card/80 backdrop-blur rounded-2xl shadow-sm">
                <CardContent className="p-2 sm:p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="hidden sm:block text-xs text-muted-foreground">Press Enter to send</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {currentAnswer.length}/500 characters
                    </div>
                  </div>

              <div className="flex items-end gap-2 sm:gap-3">
              {currentAnswer.trim().length === 0 && (
                  <VoiceInput
                    onTranscript={handleVoiceTranscript}
                    disabled={isLoading}
                    autoStart={false}
                    compact
                    size="lg"
                  />
                )}
                <Textarea
                  placeholder="Type a message..."
                  value={currentAnswer}
                  onChange={handleComposerChange}
                  onKeyPress={handleKeyPress}
                  ref={textareaRef}
                  className="min-h-12 sm:min-h-14 max-h-48 bg-secondary/30 border-border/50 focus:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 transition-colors flex-1 resize-none rounded-xl px-4 py-3 placeholder:text-muted-foreground/70 text-base"
                  disabled={isLoading}
                  rows={1}
                />
                <Button 
                  onClick={handleSendAnswer} 
                  disabled={!currentAnswer.trim() || isLoading}
                  className="shrink-0 bg-gradient-to-r from-primary to-primary-glow hover:from-primary-hover hover:to-primary text-primary-foreground shadow px-5 py-6 rounded-xl"
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar removed; details available via overlay */}
        </div>
      </div>

      {showDetails && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setShowDetails(false)} />
          <div className="absolute right-0 top-0 h-full w-[88vw] sm:w-[420px] bg-card border-l border-border shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
              <div className="font-semibold">Interview Details</div>
              <Button variant="ghost" size="icon" onClick={() => setShowDetails(false)} aria-label="Close details">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto">
              <Card className="border-border/50 bg-gradient-to-br from-card to-card/80">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Candidate Profile</CardTitle>
                  <CardDescription>From onboarding</CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  {(() => {
                    let profile: any = null;
                    try { profile = JSON.parse(localStorage.getItem("prep_profile") || "null"); } catch {}
                    return (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-muted-foreground">Field</div>
                        <div className="truncate">{profile?.field || "—"}</div>
                        <div className="text-muted-foreground">Role</div>
                        <div className="truncate">{profile?.role || "—"}</div>
                        <div className="text-muted-foreground">Level</div>
                        <div className="truncate capitalize">{profile?.level || "—"}</div>
                        <div className="text-muted-foreground">Company</div>
                        <div className="truncate">{profile?.company || "—"}</div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-gradient-to-br from-card to-card/80">
                <CardHeader>
                  <CardTitle>Conversation Tips</CardTitle>
                  <CardDescription>Keep it professional and specific</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-primary mt-0.5" />
                    <span>Focus on STAR: Situation, Task, Action, Result.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-primary mt-0.5" />
                    <span>Use simple English/Taglish if needed; stay job‑relevant.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mic className="h-4 w-4 text-primary mt-0.5" />
                    <span>Voice mode works best in quiet environments with clear speech.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-primary mt-0.5" />
                    <span>Voice input requires internet connection and microphone permissions.</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-gradient-to-br from-card to-card/80">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">STAR Guide</CardTitle>
                  <CardDescription>Quick reference</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {starTips.map((tip, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-secondary/30 border border-border/30">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{tip.letter}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground text-sm">{tip.word}</div>
                        <div className="text-xs text-muted-foreground leading-relaxed">{tip.tip}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Recording Consent Dialog */}
      <Dialog open={askRecordConsent && recordConsent === null}>
        <DialogContent className="sm:max-w-[520px]" hideClose>
          <DialogHeader>
            <DialogTitle className="text-xl">Record your interview (optional)</DialogTitle>
            <DialogDescription>
              We can record your camera preview and the interview screen so you can review your answers later.
              This stays on your device and is never uploaded unless you download/share it yourself.
            </DialogDescription>
          </DialogHeader>
          <div className="text-xs text-muted-foreground space-y-2">
            <div className="flex items-start gap-2"><span className="mt-0.5">•</span><span>Why camera? Review eye contact, posture, and delivery.</span></div>
            <div className="flex items-start gap-2"><span className="mt-0.5">•</span><span>Why screen? Include the questions and your timing context.</span></div>
            <div className="flex items-start gap-2"><span className="mt-0.5">•</span><span>Privacy: stays on your device; nothing is uploaded.</span></div>
            <div className="flex items-start gap-2"><span className="mt-0.5">•</span><span>Control: stop anytime via End Session—streams stop immediately.</span></div>
          </div>
          <DialogFooter className="sm:justify-end gap-2">
            <Button variant="outline" onClick={() => { setRecordConsent("no"); setAskRecordConsent(false); }}>No thanks</Button>
            <Button onClick={async () => {
              setRecordConsent("yes"); setAskRecordConsent(false);
              // Start camera preview (draggable)
              try {
                const cam = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setCameraStream(cam);
                setShowCamera(true);
              } catch {
                alert("Camera/mic permission denied.");
              }
              // Start screen+mic recording of the interview page
              try {
                const display = await (navigator.mediaDevices as any).getDisplayMedia({ video: { displaySurface: "browser" }, audio: true });
                setDisplayStream(display);
                // Mix mic track from camera stream if available
                const mic = (cameraStream || (await navigator.mediaDevices.getUserMedia({ audio: true })))?.getAudioTracks?.()[0];
                if (mic) display.addTrack(mic);
                screenChunksRef.current = [];
                const rec = new MediaRecorder(display, { mimeType: (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : 'video/webm') });
                rec.ondataavailable = (e) => { if (e.data && e.data.size > 0) screenChunksRef.current.push(e.data); };
                rec.start(1000);
                setScreenRecorder(rec);
                setIsRecording(true);
              } catch {
                // If screen recording not granted, stop camera and do not record
                try {
                  if (displayStream) { displayStream.getTracks().forEach(t=>t.stop()); setDisplayStream(null); }
                  if (cameraStream) { cameraStream.getTracks().forEach(t=>t.stop()); setCameraStream(null); }
                } catch {}
                setShowCamera(false);
                setIsRecording(false);
                toast({ title: "Recording cancelled", description: "Screen recording was not granted.", duration: 2500, variant: "destructive" });
              }
            }}>Yes, record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Post-interview Download Dialog */}
      <Dialog open={!!showDownloadDialog} onOpenChange={(open) => { if (!open) setShowDownloadDialog(null); }}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Download your recording</DialogTitle>
            <DialogDescription>
              Save a copy of your mock interview to review later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <video className="w-full rounded" controls src={showDownloadDialog ? URL.createObjectURL(showDownloadDialog) : undefined} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDownloadDialog(null)}>Close</Button>
            <Button onClick={() => {
              if (!showDownloadDialog) return;
              const url = URL.createObjectURL(showDownloadDialog);
              const a = document.createElement('a');
              a.href = url;
              a.download = `prep-interview-${new Date().toISOString().replace(/[:.]/g,'-')}.webm`;
              a.click();
              URL.revokeObjectURL(url);
              setShowDownloadDialog(null);
            }}>Download</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm End Session */}
      <Dialog open={confirmEndOpen} onOpenChange={setConfirmEndOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>End session?</DialogTitle>
            <DialogDescription>
              Your current transcript will be saved. You can review feedback next.
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            If you haven't answered any questions yet, the interview will be discarded instead.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmEndOpen(false)}>Cancel</Button>
            <Button onClick={() => { setConfirmEndOpen(false); handleEndSession(); }}>End Session</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Interview;