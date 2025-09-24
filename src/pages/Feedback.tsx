import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import { CheckCircle, AlertCircle, TrendingUp, RotateCcw, Save } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Feedback = () => {
  const navigate = useNavigate();

  // Mock feedback data
  const sessionData = {
    role: "Frontend Developer",
    level: "Mid-level",
    duration: "28:34",
    questionsAnswered: 9,
    starScore: 72,
    overallGrade: "B",
    strengths: [
      "Clear communication and structured thinking",
      "Good use of specific examples from past experience", 
      "Demonstrated technical knowledge and problem-solving skills"
    ],
    improvements: [
      "Include more quantifiable results and impact metrics",
      "Elaborate more on the 'Result' portion of STAR responses",
      "Provide more context about team dynamics and collaboration"
    ],
    detailedAnalysis: {
      situation: 85,
      task: 78,
      action: 75,
      result: 58
    }
  };

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Session Summary */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Session Complete!</h1>
              <p className="text-muted-foreground">
                Here's your personalized feedback for the {sessionData.role} interview
              </p>
            </div>
            <div className="text-sm text-muted-foreground">Grade: <span className="font-medium text-foreground">{sessionData.overallGrade}</span></div>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{sessionData.starScore}%</p>
                <p className="text-sm text-muted-foreground">STAR Score</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{sessionData.duration}</p>
                <p className="text-sm text-muted-foreground">Duration</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{sessionData.questionsAnswered}</p>
                <p className="text-sm text-muted-foreground">Questions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{sessionData.level}</p>
                <p className="text-sm text-muted-foreground">Level</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* STAR Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-foreground" />
                STAR Framework Analysis
              </CardTitle>
              <CardDescription>
                How well you covered each component of the STAR method
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Situation</span>
                  <span className="text-sm text-muted-foreground">{sessionData.detailedAnalysis.situation}%</span>
                </div>
                <Progress value={sessionData.detailedAnalysis.situation} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Task</span>
                  <span className="text-sm text-muted-foreground">{sessionData.detailedAnalysis.task}%</span>
                </div>
                <Progress value={sessionData.detailedAnalysis.task} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Action</span>
                  <span className="text-sm text-muted-foreground">{sessionData.detailedAnalysis.action}%</span>
                </div>
                <Progress value={sessionData.detailedAnalysis.action} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Result</span>
                  <span className="text-sm text-muted-foreground">{sessionData.detailedAnalysis.result}%</span>
                </div>
                <Progress value={sessionData.detailedAnalysis.result} className="h-2" />
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Overall STAR Score</span>
                  <span className="text-base font-semibold">{sessionData.starScore}%</span>
                </div>
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
                  {sessionData.strengths.map((strength, index) => (
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
                  {sessionData.improvements.map((improvement, index) => (
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

        {/* Sample STAR Rewrite */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Sample STAR Rewrite</CardTitle>
            <CardDescription>
              See how one of your answers could be improved using the STAR framework
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-3">Your Original Answer:</h4>
              <div className="p-4 bg-muted rounded-lg border-l-4 border-muted-foreground">
                <p className="text-sm italic">{sampleRewrite.original}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-3">Improved STAR Version:</h4>
              <div className="p-4 bg-muted rounded-lg border-l-4 border-muted-foreground">
                <p className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: sampleRewrite.improved }} />
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