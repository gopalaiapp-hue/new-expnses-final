import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { generateId, generateInviteCode } from "../../lib/utils";
import { User, Family } from "../../types";
import { db } from "../../lib/db";
import { useApp } from "../../lib/store";

interface CreateFamilyProps {
  onComplete: () => void;
  onBack?: () => void;
}

export function CreateFamily({ onComplete, onBack }: CreateFamilyProps) {
  const { setCurrentUser, setCurrentFamily } = useApp();
  const [step, setStep] = useState(1);
  const [familyName, setFamilyName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateFamily = async () => {
    if (!familyName.trim() || !adminName.trim()) return;

    setIsLoading(true);
    try {
      const familyId = generateId();
      const userId = generateId();
      const inviteCode = generateInviteCode();

      const family: Family = {
        id: familyId,
        name: familyName.trim(),
        created_at: new Date().toISOString(),
        invite_code: inviteCode,
        currency: "INR",
      };

      const user: User = {
        id: userId,
        family_id: familyId,
        name: adminName.trim(),
        phone: adminPhone.trim() || undefined,
        role: "admin",
        created_at: new Date().toISOString(),
      };

      await db.addFamily(family);
      await db.addUser(user);

      setCurrentFamily(family);
      setCurrentUser(user);

      onComplete();
    } catch (error) {
      console.error("Failed to create family:", error);
      alert("Failed to create family. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle>Create Your Family</CardTitle>
          <CardDescription>
            {step === 1
              ? "Let's start by setting up your family account"
              : "Almost done! Tell us about yourself"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="familyName">Family Name</Label>
                <Input
                  id="familyName"
                  placeholder="e.g., Sharma Family"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && familyName.trim() && setStep(2)}
                />
              </div>
              <div className="flex gap-2">
                {onBack && (
                  <Button variant="outline" onClick={onBack} className="flex-1">
                    Back
                  </Button>
                )}
                <Button
                  onClick={() => setStep(2)}
                  disabled={!familyName.trim()}
                  className={onBack ? "flex-1" : "w-full"}
                >
                  Continue
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="adminName">Your Name</Label>
                <Input
                  id="adminName"
                  placeholder="e.g., Priya Sharma"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminPhone">Phone Number (optional)</Label>
                <Input
                  id="adminPhone"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                />
              </div>
              <div className="bg-primary-container/30 p-4 rounded-lg border border-primary/20">
                <p className="text-sm text-on-primary-container">
                  <strong>You'll be the Admin</strong> — You can view all family expenses and manage members.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleCreateFamily}
                  disabled={!adminName.trim() || isLoading}
                  className="flex-1"
                >
                  {isLoading ? "Creating..." : "Create Family"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
