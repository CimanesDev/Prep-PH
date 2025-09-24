import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
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
  const [roleQuery, setRoleQuery] = useState("");
  
  const navigate = useNavigate();

  const fields = [
    "Software Engineering",
    "Data Science",
    "Product Management",
    "Design (UI/UX)",
    "Sales",
    "Marketing",
    "Finance",
    "Consulting",
    // Philippines-focused categories
    "BPO / Call Center",
    "Hospitality & Food Service",
    "Retail & Merchandising",
    "Construction & Skilled Trades",
    "Transportation & Delivery",
    "Healthcare & Caregiving",
    "Education & Tutoring",
    "Government & Admin"
  ];

  const roles = {
    "Software Engineering": ["Frontend Developer", "Backend Developer", "Full-Stack Developer", "DevOps Engineer", "Mobile Developer"],
    "Data Science": ["Data Scientist", "Data Analyst", "Machine Learning Engineer", "Data Engineer", "Research Scientist"],
    "Product Management": ["Product Manager", "Senior Product Manager", "Product Owner", "Technical Product Manager"],
    "Design (UI/UX)": ["UX Designer", "UI Designer", "Product Designer", "Visual Designer", "UX Researcher"],
    "Sales": ["Account Executive", "Sales Development Representative", "Account Manager", "Sales Manager"],
    "Marketing": ["Digital Marketing Manager", "Content Marketing Manager", "Growth Marketing Manager", "Brand Manager"],
    "Finance": ["Financial Analyst", "Investment Banking Analyst", "Corporate Development", "Finance Manager"],
    "Consulting": ["Management Consultant", "Strategy Consultant", "Business Analyst", "Operations Consultant"],
    // PH market roles
    "BPO / Call Center": ["Customer Service Representative", "Technical Support Representative", "Chat/Email Support", "Team Leader"],
    "Hospitality & Food Service": ["Service Crew", "Waiter/Waitress", "Cashier", "Barista", "Cook", "Kitchen Staff", "Restaurant Supervisor", "Restaurant Manager", "Hotel Front Desk", "Housekeeping"],
    "Retail & Merchandising": ["Sales Associate", "Store Crew", "Cashier", "Visual Merchandiser", "Stock Clerk", "Store Supervisor"],
    "Construction & Skilled Trades": ["Construction Laborer", "Carpenter", "Electrician", "Plumber", "Welder", "Mason", "Foreman"],
    "Transportation & Delivery": ["Delivery Rider", "Motorcycle Courier", "Car/Van Driver", "Truck Driver", "Dispatcher"],
    "Healthcare & Caregiving": ["Nurse", "Nursing Assistant", "Caregiver", "Medical Receptionist", "Pharmacy Assistant"],
    "Education & Tutoring": ["Tutor", "English Teacher (ESL)", "Teacher's Aide", "Private Tutor"],
    "Government & Admin": ["Administrative Assistant", "Office Clerk", "Records Assistant", "Barangay Staff"]
  } as const;

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

  const handleSkip = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        // Resume is optional; allow proceeding without input
        return true;
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
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-foreground mb-2">Upload your resume (optional)</h2>
              <p className="text-sm text-muted-foreground">
                Share your background so we can generate personalized interview questions
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className={`cursor-pointer border-2 ${resumeData.type === "upload" ? "border-primary" : "border-border"}`}
                    onClick={() => setResumeData({...resumeData, type: "upload"})}>
                <CardContent className="p-4 text-center">
                  <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold mb-2 text-sm">Upload PDF/DOCX</h3>
                  <p className="text-xs text-muted-foreground mb-3">
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
                <CardContent className="p-4 text-center">
                  <FileText className="h-6 w-6 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold mb-2 text-sm">Paste as text</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Copy and paste your resume content
                  </p>
                  {resumeData.type === "text" && (
                    <Textarea
                      placeholder="Paste your resume content here..."
                      value={resumeData.content}
                      onChange={(e) => setResumeData({...resumeData, content: e.target.value})}
                      className="mt-2 min-h-24 text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="flex items-center justify-center">
              <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">Skip this step</Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-foreground mb-2">Select your field</h2>
              <p className="text-sm text-muted-foreground">
                Choose the industry or function you're interviewing for
              </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-3">
              <Label className="inline-block">Field</Label>
              <Input
                placeholder="Type your field (e.g., Service, BPO, Engineering)"
                value={field}
                onChange={(e) => setField(e.target.value)}
              />
              <div className="text-xs text-muted-foreground">Suggestions</div>
              <div className="flex flex-wrap gap-2">
                {fields.slice(0, 12).map((f) => (
                  <Button
                    key={f}
                    type="button"
                    variant={field === f ? "default" : "outline"}
                    className={`${field === f ? "" : "border-border/50"}`}
                    onClick={() => setField(f)}
                  >
                    {f}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center">
              <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">Skip this step</Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-foreground mb-2">Select role & level</h2>
              <p className="text-sm text-muted-foreground">
                Specify your target role and experience level
              </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-4">
              <div>
                <Label htmlFor="role">Role</Label>
                <Input
                  aria-label="Search roles"
                  placeholder="Search roles (e.g., Service Crew, CSR, Frontend Developer)"
                  className="mt-2"
                  value={roleQuery}
                  onChange={(e) => setRoleQuery(e.target.value)}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {(field ? (roles[field as keyof typeof roles] || []) : [])
                    .filter((r: string) => r.toLowerCase().includes(roleQuery.toLowerCase()))
                    .slice(0, 24)
                    .map((r: string) => (
                      <Button
                        key={r}
                        type="button"
                        size="sm"
                        variant={role === r ? "default" : "outline"}
                        className={`text-sm ${role === r ? "" : "border-border/50"}`}
                        onClick={() => setRole(r)}
                      >
                        {r}
                      </Button>
                    ))}
                  {roleQuery.trim().length > 0 && (
                    <Button
                      type="button"
                      size="sm"
                      variant={role === roleQuery ? "default" : "outline"}
                      className={`text-sm ${role === roleQuery ? "" : "border-border/50"}`}
                      onClick={() => setRole(roleQuery.trim())}
                      aria-label={`Use ${roleQuery} as role`}
                    >
                      Use “{roleQuery.trim()}”
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <Label>Experience Level</Label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    { value: "internship", label: "Internship" },
                    { value: "entry", label: "Entry" },
                    { value: "junior", label: "Junior" },
                    { value: "mid", label: "Mid" },
                    { value: "senior", label: "Senior" },
                    { value: "supervisor", label: "Supervisor" },
                    { value: "manager", label: "Manager" },
                  ].map((opt) => (
                    <Button
                      key={opt.value}
                      type="button"
                      size="sm"
                      variant={level === opt.value ? "default" : "outline"}
                      className={`text-sm ${level === opt.value ? "" : "border-border/50"}`}
                      onClick={() => setLevel(opt.value)}
                      aria-label={opt.label}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
              
            </div>

            <div className="flex items-center justify-center">
              <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">Skip this step</Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-foreground mb-2">Ready to start?</h2>
              <p className="text-sm text-muted-foreground">
                Review your setup and begin your mock interview session
              </p>
            </div>

            <Card className="max-w-md mx-auto">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Resume</p>
                    <p className="font-medium">
                      {resumeData.type === "upload"
                        ? (resumeData.filename || "Not provided")
                        : (resumeData.content.trim().length > 0 ? "Text content provided" : "Not provided")}
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
      <Navbar />
      <div className="container mx-auto px-6 py-6 max-w-6xl">
        {/* Compact Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Step {step} of 4</p>
            <p className="text-sm text-muted-foreground">{Math.round((step / 4) * 100)}% complete</p>
          </div>
          <Progress value={(step / 4) * 100} className="h-1.5" />
        </div>

        {/* Main Content - Single Column, no sidebar */}
        <div className="mb-6">
          {renderStep()}
        </div>

        {/* Compact Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
            className="rounded-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="rounded-full bg-foreground text-background hover:bg-foreground/90"
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