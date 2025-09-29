import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import { CheckCircle, AlertCircle, TrendingUp, RotateCcw, Save } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { aiGenerate, ChatMessage } from "@/utils/ai";
import { buildCompactProfile, trimMessages } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getLatestRecording, clearLatestRecording } from "@/lib/idb";

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
  const [error, setError] = useState<string | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);

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
    setError(null);
    try {
      let transcript: any[] = [];
      try { transcript = JSON.parse(localStorage.getItem("prep_transcript") || "[]"); } catch {}
      if (!Array.isArray(transcript) || transcript.length === 0) {
        setError("No interview answers found to analyze.");
        setAnalysis(null);
        return;
      }
      // Use entire transcript but lightly trim each entry to avoid extremes
      // Cap total payload to avoid 503; if very long, summarize older parts inline
      let messages: ChatMessage[] = (transcript as any[]).map((m) => ({
        role: m.type === "user" ? "user" : "model",
        text: String(m.content || "").slice(0, 500)
      }));
      const MAX_ITEMS = 40;
      if (messages.length > MAX_ITEMS) {
        const head = messages.slice(0, 5);
        const tail = messages.slice(-30);
        const middleSummary = { role: "model" as const, text: `Summary: ${head.map(m=>m.text).join(" ").slice(0, 240)} ... (omitted middle) ...` };
        messages = [...head, middleSummary, ...tail];
      }
      const profile = localStorage.getItem("prep_profile");
      const compactProfile = (() => {
        try { return buildCompactProfile(JSON.parse(profile || "null")); } catch { return "unknown"; }
      })();
      const sys = `You are an expert interview coach.
Return STRICT JSON (no markdown, no text outside JSON) with keys:
{"summary":string,"strengths":string[3],"improvements":string[3],"star":{"situation":number,"task":number,"action":number,"result":number},"sampleAnswer":string,"hireScore":number}
Rules: Be concise, scores 0-100, sampleAnswer must follow STAR and be 4-8 sentences.`;
      let text = await aiGenerate(sys + `\nProfile: ${compactProfile}. Analyze the transcript.`, messages, {
        // Use the default app model (same as interview). No model override.
        maxOutputTokens: 120,
        temperature: 0.4,
        timeoutMs: 9000
      });
      // If still empty after first pass, retry with smaller payload
      if (!text) {
        const small = messages.slice(-16).map(m => ({ ...m, text: m.text.slice(0, 220) }));
        text = await aiGenerate(sys + `\nProfile: ${compactProfile}. Analyze the transcript.`, small, {
          maxOutputTokens: 100,
          temperature: 0.4,
          timeoutMs: 8000
        });
      }
      // Sanitize responses that include code fences or truncated/invalid JSON
      const stripFences = (s: string) => {
        const fenceStart = s.indexOf("```");
        if (fenceStart >= 0) {
          const after = s.slice(fenceStart + 3);
          const second = after.indexOf("```");
          if (second >= 0) {
            return after.slice(after.indexOf("\n") + 1, second).trim();
          }
          // No closing fence; drop the prefix and continue
          return after.slice(after.indexOf("\n") + 1).trim();
        }
        return s;
      };
      const balancedJsonSlice = (s: string) => {
        const start = s.indexOf("{");
        if (start < 0) return "";
        let buf = s.slice(start);
        // Try to cut off at the last brace if present
        const last = buf.lastIndexOf("}");
        if (last >= 0) buf = buf.slice(0, last + 1);
        // Balance braces/brackets if truncated
        const openCurly = (buf.match(/\{/g) || []).length;
        const closeCurly = (buf.match(/\}/g) || []).length;
        const openSq = (buf.match(/\[/g) || []).length;
        const closeSq = (buf.match(/\]/g) || []).length;
        buf = buf + "}".repeat(Math.max(0, openCurly - closeCurly)) + "]".repeat(Math.max(0, openSq - closeSq));
        return buf;
      };
      const removeTrailingCommas = (s: string) => {
        // Remove trailing commas before } or ] across the text
        return s.replace(/,\s*([}\]])/g, "$1");
      };
      const extractLikelyJson = (s: string) => {
        // Greedy match first opening brace to last closing brace
        const first = s.indexOf("{");
        const last = s.lastIndexOf("}");
        if (first >= 0 && last > first) return s.slice(first, last + 1);
        return s;
      };
      let cleaned = stripFences(text);
      let jsonText = balancedJsonSlice(extractLikelyJson(cleaned));
      jsonText = removeTrailingCommas(jsonText);
      let parsed: Analysis | null = null;
      try {
        parsed = JSON.parse(jsonText) as Analysis;
      } catch {}

      const missing = !parsed || !parsed.summary || !parsed.strengths || !parsed.improvements || !parsed.star;
      if (missing) {
        // Retry once with slightly higher tokens and stricter framing
        const sysRetry = `Return ONLY valid JSON with the exact keys required. No extra text.`;
        const retry = await aiGenerate((sys + "\n" + sysRetry) + `\nProfile: ${compactProfile}. Analyze the transcript.`, messages.slice(-12), {
          maxOutputTokens: 160,
          temperature: 0.35,
          timeoutMs: 12000
        });
        cleaned = stripFences(retry);
        jsonText = balancedJsonSlice(extractLikelyJson(cleaned));
        jsonText = removeTrailingCommas(jsonText);
        try { parsed = JSON.parse(jsonText) as Analysis; } catch {}
      }

      if (parsed) {
        // Coerce and fill defaults to avoid runtime nulls
        const safe: Analysis = {
          summary: parsed.summary || "",
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 3) : [],
          improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 3) : [],
          star: {
            situation: Math.max(0, Math.min(100, Number(parsed.star?.situation ?? 0))) || 0,
            task: Math.max(0, Math.min(100, Number(parsed.star?.task ?? 0))) || 0,
            action: Math.max(0, Math.min(100, Number(parsed.star?.action ?? 0))) || 0,
            result: Math.max(0, Math.min(100, Number(parsed.star?.result ?? 0))) || 0,
          },
          sampleAnswer: parsed.sampleAnswer || "",
          hireScore: typeof parsed.hireScore === 'number' ? Math.max(0, Math.min(100, parsed.hireScore)) : undefined,
        };
        setAnalysis(safe);
      } else {
        console.error("Analysis parse failed", { raw: text, extracted: jsonText });
        setError("Couldn't generate analysis. Please try again.");
        setAnalysis(null);
      }
    } catch (e) {
      setAnalysis(null);
      setError("Analysis service is currently unavailable. Please try again.");
      console.error("Feedback analysis failed:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load latest recording if available
    (async () => {
      try {
        const blob = await getLatestRecording();
        if (blob) {
          const url = URL.createObjectURL(blob);
          setRecordingUrl(url);
          // Clear after load to avoid stale storage growth
          try { await clearLatestRecording(); } catch {}
        }
      } catch {}
    })();
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
            {typeof analysis?.hireScore === 'number' && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Hire Likelihood</span>
                <div className="min-w-[120px]">
                  <Progress value={analysis.hireScore} className="h-2" />
                </div>
                <span className="text-sm font-medium">{analysis.hireScore}%</span>
              </div>
            )}
          </div>
          {loading && (
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
          {!loading && error && (
            <Card>
              <CardContent className="p-5 text-center">
                <div className="text-sm text-muted-foreground mb-3">{error}</div>
                <Button variant="outline" onClick={analyzeTranscript}>Retry analysis</Button>
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

        {/* Recording Download (if present) */}
        {recordingUrl && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Recording</CardTitle>
              <CardDescription>Your mock interview video</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <video className="w-full rounded" controls src={recordingUrl} />
              <div className="flex justify-end">
                <a
                  href={recordingUrl}
                  download={`prep-interview-${new Date().toISOString().replace(/[:.]/g,'-')}.webm`}
                  className="inline-flex items-center px-4 py-2 text-sm rounded-md border border-border hover:bg-secondary/50"
                >
                  Download Recording
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sample STAR Rewrite removed per request */}

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