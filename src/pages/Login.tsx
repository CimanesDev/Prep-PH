import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement authentication logic
    console.log("Login attempt:", { email, password });
  };

  const handleGoogleLogin = () => {
    // TODO: Hook up real Google OAuth
    console.log("Login with Google clicked");
  };

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center px-6">
      {/* subtle background effects to match landing */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-24 right-24 w-72 h-72 bg-muted/20 rounded-full blur-3xl" />
        <div className="absolute bottom-24 left-24 w-96 h-96 bg-muted/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm rounded-2xl">
          <CardHeader className="text-center pb-2">
            <span className="text-2xl font-extrabold tracking-tight">
              Prep <span className="text-primary">PH</span>
            </span>
            <CardTitle className="text-xl font-semibold mt-2">Welcome back</CardTitle>
            <CardDescription className="text-sm">Sign in to continue your interview preparation</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90">
                Sign in
              </Button>
            </form>

            {/* Social auth below primary action */}
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-px bg-border/70 flex-1" />
                <span className="text-xs text-muted-foreground">or continue with</span>
                <div className="h-px bg-border/70 flex-1" />
              </div>
              <Button type="button" onClick={handleGoogleLogin} className="w-full rounded-full bg-white text-neutral-900 hover:bg-white/90 border border-border/50" aria-label="Continue with Google">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="mr-2 h-4 w-4">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.602 32.243 29.256 35 24 35c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.156 7.961 3.039l5.657-5.657C33.64 5.1 28.983 3 24 3 12.955 3 4 11.955 4 23s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"/>
                  <path fill="#FF3D00" d="M6.306 14.691l6.571 4.817C14.297 16.108 18.82 13 24 13c3.059 0 5.842 1.156 7.961 3.039l5.657-5.657C33.64 5.1 28.983 3 24 3 16.318 3 9.656 7.337 6.306 14.691z"/>
                  <path fill="#4CAF50" d="M24 43c5.176 0 9.86-1.979 13.409-5.197l-6.191-5.238C29.152 34.664 26.715 35 24 35c-5.236 0-9.566-3.721-10.955-8.732l-6.6 5.087C9.758 38.556 16.357 43 24 43z"/>
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.135 3.731-4.046 6.719-7.894 8.082l6.191 5.238C36.94 39.203 40 31.5 40 23c0-1.341-.138-2.651-.389-3.917z"/>
                </svg>
                Continue with Google
              </Button>
            </div>

            <div className="mt-5 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/signup" className="text-foreground underline-offset-4 hover:underline">
                  Sign up
                </Link>
              </p>
            </div>

            <div className="mt-3 text-center">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">
                Continue without an account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;