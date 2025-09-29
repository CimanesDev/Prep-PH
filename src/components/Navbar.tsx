import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface NavbarProps {
  showBackButton?: boolean;
  backTo?: string;
  backText?: string;
}

const Navbar = ({ showBackButton = false, backTo = "/", backText = "Back" }: NavbarProps) => {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-xl bg-background/70 supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between rounded-full border border-border/60 bg-card/60 px-4 py-2 shadow-sm">
          <div className="flex items-center">
            <Link to="/" className="inline-flex items-center group">
              <img src="/images/preplogo.png" alt="PrepPH" className="h-6 w-auto sm:h-8 mr-2" />
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
  );
};

export default Navbar;
