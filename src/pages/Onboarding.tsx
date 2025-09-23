import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Upload, FileText } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [resumeData, setResumeData] = useState({
    type: "text", // "upload" or "text"
    content: "",
    filename: ""
  });
  const [field, setField] = useState("");
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("");
  
  const navigate = useNavigate();

  const fields = [
    "Software Engineering",
    "Data Science",
    "Product Management",
    "Design (UI/UX)",
    "Sales",
    "Marketing",
    "Finance",
    "Consulting"
  ];

  const roles = {
    "Software Engineering": ["Frontend Developer", "Backend Developer", "Full-Stack Developer", "DevOps Engineer", "Mobile Developer"],
    "Data Science": ["Data Scientist", "Data Analyst", "Machine Learning Engineer", "Data Engineer", "Research Scientist"],
    "Product Management": ["Product Manager", "Senior Product Manager", "Product Owner", "Technical Product Manager"],
    "Design (UI/UX)": ["UX Designer", "UI Designer", "Product Designer", "Visual Designer", "UX Researcher"],
    "Sales": ["Account Executive", "Sales Development Representative", "Account Manager", "Sales Manager"],
    "Marketing": ["Digital Marketing Manager", "Content Marketing Manager", "Growth Marketing Manager", "Brand Manager"],
    "Finance": ["Financial Analyst", "Investment Banking Analyst", "Corporate Development", "Finance Manager"],
    "Consulting": ["Management Consultant", "Strategy Consultant", "Business Analyst", "Operations Consultant"]
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeData({
        type: "upload",
        content: "", // TODO: Process file content
        filename: file.name
      });
    }
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Navigate to interview
      navigate("/interview");
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return (resumeData.type === "upload" && resumeData.filename) || 
               (resumeData.type === "text" && resumeData.content.trim().length > 50);
      case 2:
        return field !== "";
      case 3:
        return role !== "" && level !== "";
      case 4:
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Upload your resume</h2>
              <p className="text-muted-foreground">
                Share your background so we can generate personalized interview questions
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className={`cursor-pointer border-2 ${resumeData.type === "upload" ? "border-primary" : "border-border"}`}
                    onClick={() => setResumeData({...resumeData, type: "upload"})}>
                <CardContent className="p-6 text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Upload PDF/DOCX</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload your resume file directly
                  </p>
                  {resumeData.type === "upload" && (
                    <div>
                      <Input
                        type="file"
                        accept=".pdf,.docx,.doc"
                        onChange={handleFileUpload}
                        className="mt-2"
                      />
                      {resumeData.filename && (
                        <p className="text-sm text-primary mt-2">
                          ✓ {resumeData.filename}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className={`cursor-pointer border-2 ${resumeData.type === "text" ? "border-primary" : "border-border"}`}
                    onClick={() => setResumeData({...resumeData, type: "text"})}>
                <CardContent className="p-6 text-center">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Paste as text</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Copy and paste your resume content
                  </p>
                  {resumeData.type === "text" && (
                    <Textarea
                      placeholder="Paste your resume content here..."
                      value={resumeData.content}
                      onChange={(e) => setResumeData({...resumeData, content: e.target.value})}
                      className="mt-2 min-h-32"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Select your field</h2>
              <p className="text-muted-foreground">
                Choose the industry or function you're interviewing for
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <Label htmlFor="field">Field</Label>
              <Select value={field} onValueChange={setField}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Choose your field" />
                </SelectTrigger>
                <SelectContent>
                  {fields.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Select role & level</h2>
              <p className="text-muted-foreground">
                Specify your target role and experience level
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-6">
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choose your target role" />
                  </SelectTrigger>
                  <SelectContent>
                    {field && roles[field as keyof typeof roles]?.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Experience Level</Label>
                <RadioGroup value={level} onValueChange={setLevel} className="mt-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="intern" id="intern" />
                    <Label htmlFor="intern">Intern / Entry Level</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="junior" id="junior" />
                    <Label htmlFor="junior">Junior (1-3 years)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mid" id="mid" />
                    <Label htmlFor="mid">Mid-level (3-7 years)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="senior" id="senior" />
                    <Label htmlFor="senior">Senior (7+ years)</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Ready to start?</h2>
              <p className="text-muted-foreground">
                Review your setup and begin your mock interview session
              </p>
            </div>

            <Card className="max-w-md mx-auto">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Resume</p>
                    <p className="font-medium">
                      {resumeData.type === "upload" ? resumeData.filename : "Text content provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Field</p>
                    <p className="font-medium">{field}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Role</p>
                    <p className="font-medium">{role}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Level</p>
                    <p className="font-medium capitalize">{level}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Your session will include 8-10 tailored questions with detailed feedback
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to dashboard
          </Link>
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 bg-primary rounded flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">P</span>
            </div>
            <span className="text-lg font-semibold text-foreground">Prep</span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Step {step} of 4</p>
            <p className="text-sm text-muted-foreground">{Math.round((step / 4) * 100)}% complete</p>
          </div>
          <Progress value={(step / 4) * 100} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {step === 4 ? "Start Interview" : "Next"}
            {step < 4 && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;