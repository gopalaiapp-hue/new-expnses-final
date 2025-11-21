import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useApp } from "../../lib/store";
import { getInitials } from "../../lib/utils";
import { Crown, User } from "lucide-react";

export function FamilySettings() {
  const { currentUser, currentFamily, users } = useApp();

  return (
    <div className="space-y-6">
      {/* Family Info */}
      <Card>
        <CardHeader>
          <CardTitle>Family Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Family Name</span>
            <span className="font-medium">{currentFamily?.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Currency</span>
            <span className="font-medium">{currentFamily?.currency}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Created</span>
            <span className="font-medium">
              {currentFamily?.created_at
                ? new Date(currentFamily.created_at).toLocaleDateString("en-IN")
                : "Unknown"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Invite Code</span>
            <Badge variant="secondary" className="font-mono">
              {currentFamily?.invite_code}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Family Members</CardTitle>
          <CardDescription>
            {users.length} {users.length === 1 ? "member" : "members"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  user.id === currentUser?.id ? "bg-accent/50 border-primary/20" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {user.name}
                        {user.id === currentUser?.id && (
                          <span className="text-muted-foreground ml-1">(You)</span>
                        )}
                      </p>
                    </div>
                    {user.phone && (
                      <p className="text-sm text-muted-foreground">{user.phone}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(user.created_at).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>
                <Badge variant={user.role === "admin" ? "default" : "secondary"} className="gap-1">
                  {user.role === "admin" ? (
                    <>
                      <Crown className="h-3 w-3" />
                      Admin
                    </>
                  ) : (
                    <>
                      <User className="h-3 w-3" />
                      Member
                    </>
                  )}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>About KharchaPal</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            KharchaPal is your simple, offline-first household expense tracker designed for Indian families.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Track expenses together with your family</li>
            <li>Split payments across UPI, Cash, and Card</li>
            <li>Manage informal IOUs</li>
            <li>Set budgets and get alerts</li>
            <li>Works offline - all data stored locally</li>
          </ul>
          <p className="pt-2 text-xs">
            Version 1.0.0 • Built with ❤️ for Indian households
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
