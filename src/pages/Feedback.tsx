import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import { CheckCircle, AlertCircle, TrendingUp, RotateCcw, Save } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { aiGenerate, ChatMessage } from "@/utils/ai";
import { useEffect, useState } from "react";

const Feedback = () => {
  const navigate = useNavigate();

  type Analysis = {
    summary: string;
    strengths: string[];
    improvements: string[];
    star: { situation: number; task: number; action: number; result: number; };
    sampleAnswer?: string;
    hireScore?: number;
  };
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);

  const sampleRewrite = {
    original: "I worked on a project where we had to migrate our frontend from jQuery to React. It was challenging because of the tight deadline. I researched different approaches and led the migration. The project was successful.",
    improved: "**Situation:** At my previous company, we had a legacy e-commerce platform built with jQuery that was becoming difficult to maintain and scale, affecting our development velocity. **Task:** As the lead frontend developer, I was responsible for planning and executing a complete migration to React within a 6-week deadline before our peak sales season. **Action:** I first conducted a thorough audit of existing components, created a migration roadmap prioritizing critical user-facing features, and set up a parallel development environment. I trained 3 junior developers on React best practices and established code review processes to ensure quality. **Result:** We successfully migrated 85% of the platform on schedule, reducing bug reports by 40% and increasing development speed by 60%. The new architecture handled 3x more traffic during peak sales with improved performance."
  };

  const handleSaveToDashboard = () => {
    // TODO: Save session data
    navigate("/dashboard");
  };

  const handleRetrySession = () => {
    navigate("/onboarding");
  };

  const analyzeTranscript = async () => {
    setLoading(true);
    try {
      let transcript: any[] = [];
      try { transcript = JSON.parse(localStorage.getItem("prep_transcript") || "[]"); } catch {}
      const messages: ChatMessage[] = transcript.map((m) => ({ role: m.type === "user" ? "user" : "model", text: m.content }));
      const profile = localStorage.getItem("prep_profile");
      const sys = `You are an interview coach. Return STRICT JSON only with this shape:
{
  "summary": string,
  "strengths": string[3],
  "improvements": string[3],
  "star": { "situation": number, "task": number, "action": number, "result": number },
  "sampleAnswer": string,
  "hireScore": number
}
Scores are 0-100. Be concise.`;
      const text = await aiGenerate(sys + `\nProfile: ${profile || "unknown"}. Analyze the transcript.`, messages);
      const jsonText = (() => {
        const start = text.indexOf("{");
        const end = text.lastIndexOf("}");
        return start >= 0 && end > start ? text.slice(start, end + 1) : "";
      })();
      const parsed = JSON.parse(jsonText) as Analysis;
      setAnalysis(parsed);
    } catch (e) {
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    analyzeTranscript();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Session Summary */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Session Complete</h1>
              <p className="text-muted-foreground">AI‑generated feedback based on your full transcript.</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={handleRetrySession}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Retry Session
              </Button>
            </div>
          </div>
          {!analysis && (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-secondary/40 text-xs text-muted-foreground mb-3">Analyzing your interview…</div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.2s" }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.4s" }} />
                </div>
              </CardContent>
            </Card>
          )}
          {analysis?.summary && (
            <Card>
              <CardContent className="p-5">
                <h3 className="text-lg font-semibold mb-2">Overall Summary</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{analysis.summary}</p>
                {typeof analysis.hireScore === 'number' && (
                  <div className="mt-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Hire Likelihood</span>
                      <span className="text-sm text-muted-foreground">{analysis.hireScore}%</span>
                    </div>
                    <Progress value={analysis.hireScore} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* STAR Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-foreground" />
                STAR Framework Analysis
              </CardTitle>
              <CardDescription>How well you covered each component of the STAR method</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Situation</span>
                  <span className="text-sm text-muted-foreground">{analysis?.star?.situation ?? 0}%</span>
                </div>
                <Progress value={analysis?.star?.situation ?? 0} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Task</span>
                  <span className="text-sm text-muted-foreground">{analysis?.star?.task ?? 0}%</span>
                </div>
                <Progress value={analysis?.star?.task ?? 0} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Action</span>
                  <span className="text-sm text-muted-foreground">{analysis?.star?.action ?? 0}%</span>
                </div>
                <Progress value={analysis?.star?.action ?? 0} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Result</span>
                  <span className="text-sm text-muted-foreground">{analysis?.star?.result ?? 0}%</span>
                </div>
                <Progress value={analysis?.star?.result ?? 0} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Strengths & Improvements */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-foreground" />
                  Top Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {(analysis?.strengths ?? []).map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="mr-2 h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5 text-foreground" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {(analysis?.improvements ?? []).map((improvement, index) => (
                    <li key={index} className="flex items-start">
                      <AlertCircle className="mr-2 h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sample STAR Rewrite (AI) */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Sample STAR Rewrite</CardTitle>
            <CardDescription>AI‑generated concise improvement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-3">Improved Version:</h4>
              <div className="p-4 bg-muted rounded-lg border-l-4 border-muted-foreground">
                <p className="text-sm whitespace-pre-wrap">{analysis?.sampleAnswer || "Re‑run analysis to generate an example."}</p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-muted rounded-lg border border-border">
              <CheckCircle className="mr-3 h-5 w-5 text-muted-foreground flex-shrink-0" />
              <p className="text-sm">
                <strong>Key improvements:</strong> Added specific metrics (40% reduction in bugs, 60% faster development), 
                detailed action steps, and clear business impact. This version demonstrates leadership and quantifiable results.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mt-8">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold text-foreground mb-4">What's next?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Practice makes perfect! Consider focusing on including more quantifiable results in your answers. 
              You can also try practicing for different roles or seniority levels.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button onClick={handleRetrySession} variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" />
                New Practice Session
              </Button>
              <Button onClick={handleSaveToDashboard}>
                <Save className="mr-2 h-4 w-4" />
                Save & View Progress
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Feedback;