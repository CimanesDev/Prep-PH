import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Send, 
  Clock, 
  MessageSquare, 
  User, 
  Bot,
  Lightbulb,
  Target,
  Zap,
  ChevronRight,
  PauseCircle,
  PlayCircle,
  Menu,
  X
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { aiGenerate, ChatMessage } from "@/utils/ai";

interface Message {
  id: string;
  type: "interviewer" | "user";
  content: string;
  timestamp: Date;
  typing?: boolean;
}

const Interview = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [lastQuestion, setLastQuestion] = useState<string>("");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [sessionTime, setSessionTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Adaptive/continuous interview: no hard cap
  const totalQuestions = 0; // informational only; not used for cap
  const progress = Math.min(100, questionNumber * 8); // simple visual progress indicator

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
    let timer: NodeJS.Timeout;
    if (!isPaused) {
      timer = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPaused]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Generate the first AI question on mount
  useEffect(() => {
    if (messages.length === 0) {
      (async () => {
        setIsLoading(true);
        // show typing indicator
        setMessages([{ id: "typing-boot", type: "interviewer", content: "", timestamp: new Date(), typing: true }]);
        try {
          let profile: any = null;
          try { profile = JSON.parse(localStorage.getItem("prep_profile") || "null"); } catch {}
          const system = `You are a friendly, supportive Filipino interviewer.
Guidelines:
- Ask exactly ONE question per turn, in 1–3 sentences (natural, conversational).
- Start with an appropriate opener like "Can you introduce yourself?" If the role fits (sales/retail), mix in simple exercises like "Sell me this pen." when logical.
- If the candidate struggles in English or asks, freely use Taglish (English + Tagalog) and offer short guidance or clarifying examples before/after the question.
- Maintain a professional interview tone. Avoid casual chit‑chat or overly personal topics.
- Keep continuity with the profile and prior answers. No bullet lists. No prefaces like "Next question:"`;
          const firstQ = await aiGenerate(`${system}\n\nProfile: ${profile ? JSON.stringify(profile) : "unknown"}.\nAsk ONLY the very first interview question now (1–3 sentences). Prefer starting with "Introduce yourself."`, []);
          const q = firstQ?.trim() || "Pwede bang magpakilala ka muna? Tell me about yourself.";
          setLastQuestion(q);
          setMessages([{ id: Date.now().toString(), type: "interviewer", content: q, timestamp: new Date() }]);
        } catch (e) {
          setMessages([]);
          alert("Couldn't reach the AI interviewer. Please try again.");
        } finally {
          setIsLoading(false);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    setMessages(prev => [...prev, userMessage]);
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
    setMessages(prev => [...prev, typingMessage]);

    try {
      // Build dynamic prompt using onboarding profile and transcript
      let profile: any = null;
      try { profile = JSON.parse(localStorage.getItem("prep_profile") || "null"); } catch {}

      const historyForAi: ChatMessage[] = messages.map((m) => ({
        role: m.type === "user" ? "user" : "model",
        text: m.content,
      }));

      const system = `You are a friendly, supportive Filipino interviewer.
Guidelines:
- Ask ONE question per turn (1–3 sentences). Natural tone.
- Use the candidate's last answer for a relevant follow‑up. Offer short guidance or examples if they seem unsure.
- If they struggle in English, switch to simple English or Taglish (mix Tagalog), but keep the question clear.
- Stay professional—avoid small talk; keep questions job‑related.
- Keep continuity with profile/company context. No lists, no multiple questions.`;

      const prompt = `${system}\n\nProfile: ${profile ? JSON.stringify(profile) : "unknown"}.\nLast asked question: ${lastQuestion || "(none)"}.\nGiven the transcript so far, respond as the interviewer with ONLY one utterance: either a brief acknowledgement then a single follow‑up question, or the next logical question. Length 1–3 sentences, conversational, Taglish allowed.`;

      const nextQ = await aiGenerate(prompt, historyForAi.concat([{ role: "user", text: currentAnswer }]));

      setMessages(prev => prev.filter(msg => !msg.typing));
      const nextQuestion: Message = {
        id: (Date.now() + 2).toString(),
        type: "interviewer",
        content: (nextQ || "Please share more details relevant to this role."),
        timestamp: new Date()
      };
      setLastQuestion(nextQuestion.content);
      setMessages(prev => [...prev, nextQuestion]);
      setQuestionNumber(prev => prev + 1);
    } catch (e) {
      setMessages(prev => prev.filter(msg => !msg.typing));
      alert("Couldn't reach the AI interviewer. Please try again.");
    } finally {
      setIsLoading(false);
      // Persist transcript for feedback analysis
      try { localStorage.setItem("prep_transcript", JSON.stringify(messages)); } catch {}
    }
  };

  const handleEndSession = () => {
    navigate("/feedback");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSendAnswer();
    }
  };

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      
      {/* Session Controls */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm">
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-secondary/50 rounded-lg">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span className="font-medium">Question {questionNumber}</span>
              </div>
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-secondary/50 rounded-lg">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-medium">{formatTime(sessionTime)}</span>
              </div>
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPaused(!isPaused)}
                className="hover:bg-secondary/50"
              >
                {isPaused ? <PlayCircle className="h-4 w-4" /> : <PauseCircle className="h-4 w-4" />}
              </Button>
              
              <Button variant="outline" onClick={handleEndSession} className="border-border/50">
                End Session
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 sm:mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Session Progress</span>
              <span className="text-xs text-primary font-medium">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-6xl flex-1 overflow-hidden">
        <div className="grid grid-cols-1 gap-4 sm:gap-6 h-full min-h-0">
          {/* Chat Column */}
            <div className="lg:col-span-2 flex flex-col h-full min-h-0">
            <Card className="flex-1 flex flex-col border-border/50 bg-gradient-to-br from-card to-card/80 shadow-elegant h-full min-h-[320px]">
              <CardContent className="p-0 flex-1 flex min-h-0">
                {/* Scrollable messages viewport */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  <div className="relative space-y-8">
              {messages.map((message) => (
                <div key={message.id} className={`flex items-end ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  {/* Avatar */}
                  {message.type === "interviewer" && (
                    <div className="mr-2 sm:mr-3 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shadow-sm">
                      <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
                    </div>
                  )}
                  <div className={`max-w-[85%] ${message.type === "user" ? "ml-10 sm:ml-12" : "mr-10 sm:mr-12"}`}>
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
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
                    
                    <div className={`p-3 sm:p-4 md:p-5 rounded-2xl shadow-sm ${
                      message.type === "interviewer" 
                        ? "bg-gradient-to-br from-muted/80 to-muted/40 text-foreground border border-border/30" 
                        : "bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-glow"
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

            {/* Composer at bottom */}
            <div className="mt-4">
              <Card className="border-border/50 bg-gradient-to-br from-card to-card/80">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-end gap-2 sm:gap-3">
                    <Textarea
                      placeholder="Type your message..."
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="h-14 sm:h-16 resize-none bg-secondary/30 border-border/50 focus:border-primary/50 transition-colors flex-1"
                      disabled={isLoading}
                      maxLength={500}
                    />
                    <Button 
                      onClick={handleSendAnswer} 
                      disabled={!currentAnswer.trim() || isLoading}
                      className="shrink-0 bg-gradient-to-r from-primary to-primary-glow hover:from-primary-hover hover:to-primary text-primary-foreground shadow-lg"
                      aria-label="Send message"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                      ) : (
                        <Send className="h-4 w-4" />
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
    </div>
  );
};

export default Interview;