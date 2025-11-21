import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { generateId } from "../../lib/utils";
import { User, Family } from "../../types";
import { db } from "../../lib/db";
import { useApp } from "../../lib/store";

interface JoinFamilyProps {
  onComplete: () => void;
  onBack: () => void;
}

export function JoinFamily({ onComplete, onBack }: JoinFamilyProps) {
  const { setCurrentUser, setCurrentFamily } = useApp();
  const [inviteCode, setInviteCode] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [foundFamily, setFoundFamily] = useState<Family | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearchFamily = async () => {
    if (!inviteCode.trim()) return;

    setIsLoading(true);
    setError("");
    try {
      const families = await db.getAll<Family>("families");
      const family = families.find(
        (f) => f.invite_code.toLowerCase() === inviteCode.trim().toLowerCase()
      );

      if (family) {
        setFoundFamily(family);
      } else {
        setError("Invalid invite code. Please check and try again.");
      }
    } catch (error) {
      console.error("Failed to search family:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinFamily = async () => {
    if (!foundFamily || !memberName.trim()) return;

    setIsLoading(true);
    try {
      const userId = generateId();

      const user: User = {
        id: userId,
        family_id: foundFamily.id,
        name: memberName.trim(),
        phone: memberPhone.trim() || undefined,
        role: "member",
        created_at: new Date().toISOString(),
      };

      await db.addUser(user);

      setCurrentFamily(foundFamily);
      setCurrentUser(user);

      onComplete();
    } catch (error) {
      console.error("Failed to join family:", error);
      alert("Failed to join family. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle>Join a Family</CardTitle>
          <CardDescription>
            {!foundFamily
              ? "Enter the invite code shared by your family admin"
              : `Join ${foundFamily.name}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!foundFamily ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="inviteCode">Invite Code</Label>
                <Input
                  id="inviteCode"
                  placeholder="e.g., ABC123"
                  value={inviteCode}
                  onChange={(e) => {
                    setInviteCode(e.target.value.toUpperCase());
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && inviteCode.trim() && handleSearchFamily()}
                  maxLength={6}
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onBack} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleSearchFamily}
                  disabled={!inviteCode.trim() || isLoading}
                  className="flex-1"
                >
                  {isLoading ? "Searching..." : "Continue"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-tertiary-container/30 p-4 rounded-lg border border-tertiary/20">
                <p className="text-sm text-on-tertiary-container">
                  ✓ Family found: <strong>{foundFamily.name}</strong>
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="memberName">Your Name</Label>
                <Input
                  id="memberName"
                  placeholder="e.g., Rohit Sharma"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="memberPhone">Phone Number (optional)</Label>
                <Input
                  id="memberPhone"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={memberPhone}
                  onChange={(e) => setMemberPhone(e.target.value)}
                />
              </div>
              <div className="bg-secondary-container/30 p-4 rounded-lg border border-secondary/20">
                <p className="text-sm text-on-secondary-container">
                  <strong>You'll be a Member</strong> — You can track your own expenses and view shared family data.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFoundFamily(null);
                    setInviteCode("");
                  }}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleJoinFamily}
                  disabled={!memberName.trim() || isLoading}
                  className="flex-1"
                >
                  {isLoading ? "Joining..." : "Join Family"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
