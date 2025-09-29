import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-background/60">
      <div className="container mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center">
          <img src="/images/preplogo.png" alt="PrepPH" className="h-6 w-auto mr-2" />
          <span className="text-sm text-muted-foreground">PrepPH</span>
        </Link>
        <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} PrepPH. All rights reserved.</div>
      </div>
    </footer>
  );
};

export default Footer;


