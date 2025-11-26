import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useApp } from "../../lib/store";
import { getInitials } from "../../lib/utils";
import { Crown, User as UserIcon, Pencil } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { User } from "../../types";
import { toast } from "sonner";

export function FamilySettings() {
  const { currentUser, currentFamily, users, updateUser } = useApp();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditPhone(user.phone || "");
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      const updatedUser: User = {
        ...editingUser,
        name: editName.trim(),
        phone: editPhone.trim() || undefined,
      };
      await updateUser(updatedUser);
      toast.success("Profile updated successfully");
      setEditingUser(null);
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

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
                className={`flex items-center justify-between p-3 rounded-lg border ${user.id === currentUser?.id ? "bg-accent/50 border-primary/20" : ""
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
                      {(user.id === currentUser?.id || currentUser?.role === "admin") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 ml-2 text-muted-foreground hover:text-primary"
                          onClick={() => handleEditClick(user)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      )}
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
                      <UserIcon className="h-3 w-3" />
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
      {/* Edit Profile Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your contact information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your Name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="+91 98765 43210"
                type="tel"
              />
              <p className="text-xs text-muted-foreground">Used for Nudge reminders</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
              <Button onClick={handleUpdateUser} disabled={!editName.trim()}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
