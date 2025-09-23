import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Users, 
  Target, 
  BarChart3, 
  ArrowRight, 
  Zap, 
  Brain, 
  TrendingUp,
  PlayCircle,
  Star,
  MessageSquare,
  Clock,
  Award
} from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Questions",
      description: "Dynamic questions tailored to your resume and target role using advanced AI"
    },
    {
      icon: Target,
      title: "STAR Framework",
      description: "Get detailed feedback on Situation, Task, Action, Result completeness"
    },
    {
      icon: TrendingUp,
      title: "Progress Analytics", 
      description: "Track improvement with detailed scoring and performance insights"
    },
    {
      icon: Users,
      title: "Multi-Industry",
      description: "Practice for tech, consulting, finance, design, and more industries"
    }
  ];

  const stats = [
    { value: "10k+", label: "Interviews Practiced" },
    { value: "95%", label: "Success Rate" },
    { value: "4.9/5", label: "User Rating" },
    { value: "50+", label: "Role Types" }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer at Google",
      content: "Prep helped me nail my behavioral interviews. The STAR feedback was incredibly detailed and actionable.",
      rating: 5
    },
    {
      name: "Marcus Johnson", 
      role: "Product Manager at Meta",
      content: "The AI questions felt so realistic. I was completely prepared for my actual interviews.",
      rating: 5
    },
    {
      name: "Elena Rodriguez",
      role: "Data Scientist at Netflix", 
      content: "Finally, an interview coach that understands technical roles. The progress tracking kept me motivated.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="relative border-b border-border/50 backdrop-blur-xl bg-background/95">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-primary-foreground font-bold text-lg">P</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-xl blur-sm"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                Prep
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost" className="hover:bg-secondary/50">Log in</Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary-hover hover:to-primary text-primary-foreground shadow-lg">
                  Start Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-32 px-6 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary-glow/5"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary-glow/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-8 px-4 py-2 text-sm font-medium">
              <Zap className="mr-2 h-4 w-4" />
              Powered by Advanced AI
            </Badge>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text">
                Master Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                Interview Game
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Get personalized mock interviews with AI-powered feedback. Upload your resume, 
              practice with role-specific questions, and receive detailed STAR framework analysis 
              to land your dream job.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link to="/signup">
                <Button size="lg" className="px-8 py-4 text-lg bg-gradient-to-r from-primary to-primary-glow hover:from-primary-hover hover:to-primary text-primary-foreground shadow-glow">
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Start Practicing Free
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-border/50 hover:bg-secondary/50">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <Badge variant="secondary" className="mb-6 px-4 py-2">
              <Target className="mr-2 h-4 w-4" />
              Core Features
            </Badge>
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Everything you need to succeed
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform provides comprehensive interview preparation 
              with personalized feedback and actionable insights.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="relative group border-border/50 bg-gradient-to-br from-card to-card/80 hover:from-card/90 hover:to-card transition-all duration-500 hover:shadow-elegant">
                <CardContent className="p-8 text-center">
                  <div className="mb-6 inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-2xl group-hover:from-primary/30 group-hover:to-primary-glow/30 transition-all duration-500">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative py-24 px-6 bg-gradient-to-br from-muted/20 to-transparent">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <Badge variant="secondary" className="mb-6 px-4 py-2">
              <Clock className="mr-2 h-4 w-4" />
              Simple Process
            </Badge>
            <h2 className="text-4xl font-bold text-foreground mb-6">
              From upload to mastery in minutes
            </h2>
            <p className="text-lg text-muted-foreground">
              Get started with personalized interview practice in just four steps
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              {[
                {
                  step: "01",
                  title: "Upload Your Resume",
                  description: "Share your background so our AI can generate personalized questions tailored to your experience and target role."
                },
                {
                  step: "02", 
                  title: "Choose Your Path",
                  description: "Select your industry, target role, and seniority level to get the most relevant interview questions."
                },
                {
                  step: "03",
                  title: "Practice with AI",
                  description: "Engage in realistic mock interviews with our AI interviewer that adapts to your responses."
                },
                {
                  step: "04",
                  title: "Master with Feedback",
                  description: "Receive detailed STAR analysis, improvement suggestions, and sample answer rewrites."
                }
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-6 group">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary to-primary-glow text-primary-foreground rounded-2xl flex items-center justify-center text-sm font-bold shadow-lg group-hover:shadow-glow transition-all duration-500">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/80">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-3xl mb-4">
                    <Award className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Ready to Excel?</h3>
                  <p className="text-muted-foreground mb-8">
                    Join thousands of successful candidates who've mastered their interviews with Prep
                  </p>
                </div>
                
                <div className="space-y-4">
                  <Link to="/signup">
                    <Button size="lg" className="w-full bg-gradient-to-r from-primary to-primary-glow hover:from-primary-hover hover:to-primary text-primary-foreground shadow-lg">
                      <PlayCircle className="mr-2 h-5 w-5" />
                      Start Your Journey
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    No credit card required • Free to start
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <Badge variant="secondary" className="mb-6 px-4 py-2">
              <Star className="mr-2 h-4 w-4" />
              Success Stories
            </Badge>
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Trusted by top performers
            </h2>
            <p className="text-lg text-muted-foreground">
              See how Prep has helped candidates land roles at leading companies
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative group border-border/50 bg-gradient-to-br from-card to-card/80 hover:from-card/90 hover:to-card transition-all duration-500 hover:shadow-elegant">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-primary fill-current" />
                    ))}
                  </div>
                  <p className="text-foreground mb-6 leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6 bg-gradient-to-br from-primary/10 via-transparent to-primary-glow/10">
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-background/60"></div>
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h2 className="text-5xl font-bold text-foreground mb-6">
            Your dream job is waiting
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Don't let interview anxiety hold you back. Start practicing today and 
            build the confidence you need to succeed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="px-12 py-4 text-lg bg-gradient-to-r from-primary to-primary-glow hover:from-primary-hover hover:to-primary text-primary-foreground shadow-glow">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border/50 py-16 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="relative">
              <div className="h-8 w-8 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">P</span>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-xl blur-sm"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              Prep
            </span>
          </div>
          <p className="text-muted-foreground">
            © 2024 Prep. Empowering careers through intelligent interview preparation.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;