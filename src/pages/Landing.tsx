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
import { useRef, useCallback, useEffect } from "react";

const Landing = () => {
  const stripRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  // Map page vertical scroll to horizontal movement of the gallery with smooth lerp
  useEffect(() => {
    const el = stripRef.current;
    const track = trackRef.current;
    if (!el || !track) return;
    let rafId = 0;
    let current = 0;
    let target = 0;
    const speed = 0.08; // lower = smoother

    const onScroll = () => {
      const maxLeft = Math.max(0, track.scrollWidth - el.clientWidth);
      target = Math.max(0, Math.min(maxLeft, window.scrollY * 0.7));
      if (!rafId) rafId = requestAnimationFrame(tick);
    };

    const tick = () => {
      current += (target - current) * speed;
      track.style.transform = `translateX(${-current}px)`;
      if (Math.abs(target - current) > 0.5) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = 0;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Scroll-linked glow behind steps
  useEffect(() => {
    const section = stepsRef.current;
    const glow = glowRef.current;
    if (!section || !glow) return;

    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      // progress through section (0..1)
      const start = viewport * 0.2; // start a bit after entering
      const end = rect.height + viewport * 0.2;
      const raw = (viewport - rect.top - start) / end;
      const progress = Math.max(0, Math.min(1, raw));

      const width = section.clientWidth;
      const extra = (window.innerWidth || 0); // allow to move past viewport
      // Reduce travel to slow the perceived speed
      const travel = Math.max(0, (width + extra) * 0.6);
      const x = (progress * 0.85) * travel - glow.clientWidth * 0.2; // slight negative offset at start
      glow.style.transform = `translateX(${x}px) translateY(-50%)`;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const galleryImages = Array.from({ length: 5 }, (_, i) => `/images/${(i % 3) + 1}.png`);
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-xl bg-background/70 supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between rounded-full border border-border/60 bg-card/60 px-4 py-2 shadow-sm">
            <div className="flex items-center">
              <Link to="/" className="inline-flex items-center group">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight transition-colors group-hover:text-foreground">
                  Prep <span className="text-primary">PH</span>
                </span>
              </Link>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition-colors">Overview</Link>
              <Link to="/onboarding" className="hover:text-foreground transition-colors">Practice</Link>
              <Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
            </nav>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link to="/login">
                <Button variant="ghost" className="hover:bg-secondary/50 rounded-full px-4">Log in</Button>
              </Link>
              <Link to="/onboarding">
                <Button className="rounded-full bg-foreground text-background hover:bg-foreground/90 px-4">
                  Start Practicing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen px-6 overflow-hidden flex items-start pt-24 md:pt-32">
        {/* Background Effects (neutralized to remove dark blue cast) */}
        <div className="absolute inset-0 bg-gradient-to-br from-muted/10 via-transparent to-muted/10"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-muted/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-muted/20 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              <span className="text-primary text-5xl sm:text-6xl md:text-7xl lg:text-8xl">PREP</span><span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl">ARE to unleash </span>
              <span className="block">your inner spark </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Prepare for every interview scenario with realistic practice, receive clear, actionable feedback to improve instantly, and build the confidence you need to shine—quickly, easily, and all in one place.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <Link to="/onboarding">
                <Button size="lg" className="px-8 py-4 text-lg bg-foreground text-background hover:bg-foreground/90">
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Start Practicing Free
                </Button>
              </Link>
              <Link to="/interview">
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-border/50 hover:bg-secondary/50">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Horizontal gallery strip that reacts to vertical scroll */}
      <section className="relative py-6 px-0" style={{ marginTop: "-25vh" }}>
        <div
          ref={stripRef}
          className="w-full overflow-hidden no-scrollbar relative"
          aria-label="Showcase gallery"
        >
          {/* Edge fades to avoid hard cutoffs without clipping shadows */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent" />
          <div ref={trackRef} className="flex gap-10 sm:gap-12 px-6 pb-4 sm:pb-6 will-change-transform" style={{ width: "max-content", transform: "translateX(0)" }}>
            {galleryImages.map((src, i) => (
              <div key={i} className="group relative h-[30vh] sm:h-[32vh] min-w-[48vw] sm:min-w-[40vw] md:min-w-[32vw] lg:min-w-[28vw] rounded-2xl overflow-hidden border border-border bg-muted/30 transition-all duration-500 ease-smooth hover:shadow-glow hover:scale-[1.02]">
                <img src={src} alt="Showcase" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Overview Bento Section */}
      <section className="relative py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Everything you need to succeed</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Our AI-powered platform provides comprehensive interview preparation with personalized feedback and actionable insights.</p>
          </div>

          <div className="grid grid-cols-12 auto-rows-[180px] gap-6">
            {/* Interview Summary */}
            <Card className="col-span-12 lg:col-span-7 row-span-2 border-border/50 bg-card/80 overflow-hidden">
              <CardContent className="h-full p-8 flex flex-col">
                <h3 className="text-2xl font-semibold mb-1">Interview Summary</h3>
                <p className="text-sm text-muted-foreground">Star-rated insights for every answer with clear next steps.</p>
                <div className="grid sm:grid-cols-3 gap-4 mt-6">
                  {[{label:"Overall Score",value:"72%"},{label:"Best Area",value:"Situation"},{label:"Needs Work",value:"Result"}].map((s)=> (
                    <div key={s.label} className="rounded-lg border border-border p-4">
                      <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
                      <div className="text-xl font-semibold">{s.value}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 grid grid-cols-4 gap-4">
                  {[{k:"Situation",v:85},{k:"Task",v:78},{k:"Action",v:75},{k:"Result",v:58}].map(({k,v}) => (
                    <div key={k} className="flex flex-col">
                      <div className="text-xs text-muted-foreground mb-1">{k}</div>
                      <div className="h-2 rounded bg-muted overflow-hidden">
                        <div className="h-2 bg-foreground" style={{ width: `${v}%` }} />
                      </div>
                      <div className="text-xs mt-1 font-medium">{v}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Practice Modes (replaces image) */}
            <Card className="col-span-12 lg:col-span-5 row-span-1 border-border/50">
              <CardContent className="h-full p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Practice Modes</h3>
                  <p className="text-sm text-muted-foreground mt-2">Timed interviews, guided mode, or quick drills when you’re busy.</p>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  {["Timed","Guided","Drill"].map((m) => (
                    <span key={m} className="rounded-md border border-border px-3 py-2 text-center text-muted-foreground">{m}</span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Dashboard Highlights */}
            <Card className="col-span-12 lg:col-span-5 row-span-1 border-border/50 overflow-hidden">
              <CardContent className="h-full p-6">
                <h3 className="text-xl font-semibold">Dashboard Highlights</h3>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    {label:"Sessions", value:12},
                    {label:"Avg Score", value:"78%"},
                    {label:"Streak", value:"5 days"}
                  ].map((k) => (
                    <div key={k.label} className="rounded-lg border border-border p-4 text-center">
                      <div className="text-2xl font-bold">{k.value}</div>
                      <div className="text-xs text-muted-foreground">{k.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI‑Powered Questions */}
            <Card className="col-span-12 md:col-span-4 row-span-1 border-border/50 overflow-hidden">
              <CardContent className="h-full p-5 flex flex-col overflow-hidden">
                <h3 className="text-xl font-semibold">AI‑Powered Questions</h3>
                <p className="text-xs text-muted-foreground mt-1">Smart prompts tailored to role and resume.</p>
                <div className="mt-2 grid grid-cols-2 gap-1 text-[10px] leading-snug overflow-hidden">
                  {[
                    'Lead a project under pressure',
                    'Handle difficult customers',
                    'Improve a process you owned',
                    'Debug a tricky production bug'
                  ].map((q, i) => (
                    <div key={i} className="rounded border border-border px-2 py-1 break-words whitespace-normal">{q}</div>
                  ))}
                </div>
                {/* Removed category chips per request */}
              </CardContent>
            </Card>

            {/* STAR Ratings */}
            <Card className="col-span-12 md:col-span-5 row-span-1 border-border/50 overflow-hidden">
              <CardContent className="h-full p-6">
                <h3 className="text-xl font-semibold">STAR Framework Rating</h3>
                <div className="mt-3 grid grid-cols-4 gap-4">
                  {[{k:"S",l:"Situation",v:85},{k:"T",l:"Task",v:78},{k:"A",l:"Action",v:75},{k:"R",l:"Result",v:58}].map(({k,l,v}) => (
                    <div key={k} className="rounded-lg border border-border p-3">
                      <div className="text-xs text-muted-foreground mb-1">{l}</div>
                      <div className="h-2 rounded bg-muted overflow-hidden"><div className="h-2 bg-foreground" style={{ width: `${v}%` }} /></div>
                      <div className="text-xs mt-1 font-medium">{v}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Multi‑Industry */}
            <Card className="col-span-12 md:col-span-3 row-span-1 border-border/50 overflow-hidden">
              <CardContent className="h-full p-6 flex flex-col">
                <h3 className="text-xl font-semibold mb-2">Multi‑Industry</h3>
                <div className="grid grid-cols-3 gap-2 text-[11px] overflow-hidden">
                  {["Tech","BPO","Hospitality","Retail","Finance","Education"].map(i => (
                    <div key={i} className="rounded-md border border-border px-2 py-1.5 text-center text-muted-foreground">{i}</div>
                  ))}
                </div>
                <p className="mt-auto text-[11px] text-muted-foreground">Localized for the Philippines.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Step-by-step Cards */}
      <section ref={stepsRef} className="relative py-28 px-6 bg-gradient-to-br from-muted/15 to-transparent overflow-hidden">
        {/* moving glow */}
        <div ref={glowRef} className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[20vw] h-[20vw] rounded-full bg-primary/30 blur-2xl shadow-[0_0_120px_theme(colors.primary/40)]"></div>
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-foreground mb-5">From upload to mastery in minutes</h2>
            <p className="text-xl text-muted-foreground">Get started with personalized interview practice in just four steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {step:'01', title:'Upload Your Resume', desc:'Share your background so our AI can generate questions tailored to your experience.'},
              {step:'02', title:'Choose Your Path', desc:'Pick your field, target role and level for relevant practice.'},
              {step:'03', title:'Practice with AI', desc:'Run realistic interviews and get guidance as you go.'},
              {step:'04', title:'Master with Feedback', desc:'See STAR ratings, improvement notes and sample rewrites.'}
            ].map((s, i) => (
              <Card key={i} className="border-border/50 bg-card/80">
                <CardContent className="p-8 h-full flex flex-col">
                  <div className="text-base text-muted-foreground">Step {s.step}</div>
                  <div className="text-2xl font-semibold mt-1 mb-3">{s.title}</div>
                  <p className="text-base text-muted-foreground leading-relaxed">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
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
            <Link to="/onboarding">
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
          </div>
          <p className="text-muted-foreground">© 2025 Prep PH. Made by @CimanesDev.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;