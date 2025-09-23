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
  PlayCircle
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface Message {
  id: string;
  type: "interviewer" | "user";
  content: string;
  timestamp: Date;
  typing?: boolean;
}

const Interview = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "interviewer",
      content: "Hey! I'm your interviewer today. Let's get started. First question: Can you tell me about yourself and what interests you in this role?",
      timestamp: new Date()
    }
  ]);
  
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [sessionTime, setSessionTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const totalQuestions = 10;
  const progress = (questionNumber / totalQuestions) * 100;

  // Enhanced mock interview questions
  const mockQuestions = [
    "Can you tell me about yourself and what draws you to this frontend developer position?",
    "Describe a challenging technical project you've worked on. What obstacles did you encounter and how did you overcome them?",
    "Tell me about a time when you had to learn a new technology or framework quickly for a project. How did you approach it?",
    "Describe a situation where you had to work with a difficult team member or stakeholder. How did you handle the conflict?",
    "Walk me through your debugging process when you encounter a complex frontend issue that's affecting user experience.",
    "Tell me about a time when you had to make a trade-off between perfect code quality and meeting a tight deadline.",
    "Describe a situation where you received constructive criticism on your code. How did you respond and what did you learn?",
    "Tell me about a project where you had to collaborate closely with designers and backend developers. What challenges arose?",
    "Describe a time when you had to advocate for a technical decision to non-technical stakeholders. How did you communicate your position?",
    "What would you do if you disagreed with an architectural decision made by a senior developer on your team?"
  ];

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

    // Simulate AI processing time
    setTimeout(() => {
      setMessages(prev => prev.filter(msg => !msg.typing));
      
      if (questionNumber < mockQuestions.length) {
        const nextQuestion: Message = {
          id: (Date.now() + 2).toString(),
          type: "interviewer",
          content: mockQuestions[questionNumber],
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, nextQuestion]);
        setQuestionNumber(prev => prev + 1);
      } else {
        const endMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: "interviewer",
          content: "Excellent work! That concludes our interview session. I'll now analyze all your responses and provide comprehensive feedback with detailed STAR framework scoring. Click 'View Results' to see your personalized report.",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, endMessage]);
      }
      setIsLoading(false);
    }, 2000);
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Premium Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link to="/onboarding" className="inline-flex items-center text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
              <div className="flex items-center space-x-3">
                <Link to="/" className="text-lg sm:text-xl font-bold hover:opacity-90">Prep PH</Link>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4 text-sm">
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-secondary/50 rounded-lg">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span className="font-medium">{questionNumber}</span>
                  <span className="text-muted-foreground">of {totalQuestions}</span>
                </div>
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-secondary/50 rounded-lg">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-medium">{formatTime(sessionTime)}</span>
                </div>
              </div>
              
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

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 h-full">
          {/* Chat Column */}
          <div className="lg:col-span-2 flex flex-col h-full">
            <Card className="flex-1 flex flex-col border-border/50 bg-gradient-to-br from-card to-card/80 shadow-elegant">
              <CardContent className="relative p-4 sm:p-6 overflow-y-auto h-[58vh] min-h-[58vh] max-h-[58vh] sm:h-[60vh] sm:min-h-[60vh] sm:max-h-[60vh]">
            {/* Subtle background pattern */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "22px 22px" }} />
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
                      className="min-h-[48px] sm:min-h-[56px] max-h-40 resize-y bg-secondary/30 border-border/50 focus:border-primary/50 transition-colors flex-1"
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

          {/* Tips Sidebar */}
          <div className="hidden lg:flex flex-col h-full gap-4">
            <Card className="border-border/50 bg-gradient-to-br from-card to-card/80">
              <CardHeader>
                <CardTitle>Conversation Tips</CardTitle>
                <CardDescription>Keep it natural and specific</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-primary mt-0.5" />
                  <span>Answer like you would in real life. Skip jargon unless needed.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-primary mt-0.5" />
                  <span>Mention concrete facts: numbers, timelines, team size, tools.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-primary mt-0.5" />
                  <span>If you need a moment, say it—then structure your thoughts.</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-gradient-to-br from-card to-card/80 flex-1 min-h-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">STAR Guide</CardTitle>
                <CardDescription>Use if it helps, ignore if not</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 overflow-auto h-full">
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
    </div>
  );
};

export default Interview;