import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  BarChart3, 
  Plus, 
  Clock,
  ChevronRight,
  Settings
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  // Mock user data
  const user = {
    name: "Alex Chen",
    email: "alex.chen@email.com",
    sessionsCompleted: 12,
    averageScore: 78,
    streak: 5
  };

  // Mock session history
  const recentSessions = [
    {
      id: "1",
      date: "2024-01-15",
      role: "Frontend Developer",
      level: "Mid-level",
      starScore: 72,
      duration: "28:34",
      grade: "B"
    },
    {
      id: "2", 
      date: "2024-01-12",
      role: "Product Manager",
      level: "Senior",
      starScore: 85,
      duration: "32:18",
      grade: "A-"
    },
    {
      id: "3",
      date: "2024-01-08",
      role: "Frontend Developer", 
      level: "Mid-level",
      starScore: 68,
      duration: "26:45",
      grade: "B-"
    },
    {
      id: "4",
      date: "2024-01-05",
      role: "UX Designer",
      level: "Junior",
      starScore: 74,
      duration: "24:12",
      grade: "B"
    }
  ];

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "text-success";
    if (grade.startsWith("B")) return "text-primary";
    return "text-warning";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Link to="/" className="text-xl font-semibold text-foreground hover:opacity-90">Prep PH</Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link to="/onboarding">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Session
                </Button>
              </Link>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Avatar>
                <AvatarFallback>{user.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user.name.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground">
            Track your interview preparation progress and continue improving your skills.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sessions Completed</p>
                  <p className="text-2xl font-bold text-foreground">{user.sessionsCompleted}</p>
                </div>
                <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                  <p className="text-2xl font-bold text-foreground">{user.averageScore}%</p>
                </div>
                <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                  <p className="text-2xl font-bold text-foreground">{user.streak} days</p>
                </div>
                <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold text-foreground">4</p>
                </div>
                <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Sessions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Sessions</CardTitle>
                    <CardDescription>Your latest interview practice sessions</CardDescription>
                  </div>
                  <Link to="/onboarding">
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      New Session
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="p-6 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-foreground">{session.role}</h3>
                            <Badge variant="secondary">{session.level}</Badge>
                            <Badge variant="outline" className={getGradeColor(session.grade)}>
                              {session.grade}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {formatDate(session.date)}
                            </div>
                            <div className="flex items-center">
                              <Clock className="mr-1 h-3 w-3" />
                              {session.duration}
                            </div>
                            <div className="flex items-center">
                              <BarChart3 className="mr-1 h-3 w-3" />
                              {session.starScore}% STAR
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress */}
          <div className="space-y-6">
            {/* Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Progress Trend</CardTitle>
                <CardDescription>Your STAR scores over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Current Average</span>
                      <span className="text-sm font-medium">{user.averageScore}%</span>
                    </div>
                    <Progress value={user.averageScore} className="h-2" />
                  </div>
                  
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-3">Recent improvement:</p>
                    <div className="flex items-center text-success">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      <span className="text-sm font-medium">+12% from last month</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Tip</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  When describing results, always include specific metrics. Instead of saying 
                  "the project was successful," try "increased user engagement by 25% and 
                  reduced load times by 2 seconds."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;