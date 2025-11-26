import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { toast } from "sonner";

interface NotificationSettingsDialogProps {
    open: boolean;
    onClose: () => void;
}

export function NotificationSettingsDialog({ open, onClose }: NotificationSettingsDialogProps) {
    const [dailyBriefEnabled, setDailyBriefEnabled] = useState(false);
    const [briefTime, setBriefTime] = useState("09:00");
    const [showExpenses, setShowExpenses] = useState(true);
    const [showIncome, setShowIncome] = useState(true);
    const [showDebts, setShowDebts] = useState(true);

    useEffect(() => {
        // Load settings from localStorage
        const savedSettings = localStorage.getItem("notificationSettings");
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                setDailyBriefEnabled(parsed.dailyBriefEnabled ?? false);
                setBriefTime(parsed.dailyBriefTime ?? "09:00");
                setShowExpenses(parsed.showExpenses ?? true);
                setShowIncome(parsed.showIncome ?? true);
                setShowDebts(parsed.showDebts ?? true);
            } catch (e) {
                console.error("Failed to parse notification settings", e);
            }
        }
    }, [open]);

    const handleSave = () => {
        const settings = {
            dailyBriefEnabled,
            dailyBriefTime: briefTime,
            showExpenses,
            showIncome,
            showDebts
        };
        localStorage.setItem("notificationSettings", JSON.stringify(settings));
        toast.success("Notification settings saved");
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Notification Settings</DialogTitle>
                    <DialogDescription>
                        Manage your daily brief and other alerts.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-1">
                            <Label htmlFor="daily-brief">Daily Brief</Label>
                            <p className="text-sm text-muted-foreground">
                                Receive a daily summary of your finances.
                            </p>
                        </div>
                        <Switch
                            id="daily-brief"
                            checked={dailyBriefEnabled}
                            onCheckedChange={setDailyBriefEnabled}
                        />
                    </div>

                    {dailyBriefEnabled && (
                        <div className="space-y-4 border-l-2 border-primary/20 pl-4 ml-2">
                            <div className="space-y-2">
                                <Label htmlFor="brief-time">Brief Time</Label>
                                <Input
                                    id="brief-time"
                                    type="time"
                                    value={briefTime}
                                    onChange={(e) => setBriefTime(e.target.value)}
                                />
                            </div>

                            <div className="space-y-3 pt-2">
                                <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Include in Brief</Label>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="show-expenses" className="cursor-pointer">Expenses</Label>
                                    <Switch id="show-expenses" checked={showExpenses} onCheckedChange={setShowExpenses} />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="show-income" className="cursor-pointer">Income</Label>
                                    <Switch id="show-income" checked={showIncome} onCheckedChange={setShowIncome} />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="show-debts" className="cursor-pointer">Debts & Loans</Label>
                                    <Switch id="show-debts" checked={showDebts} onCheckedChange={setShowDebts} />
                                </div>
                            </div>
                        </div>
                    )}

                    <Button onClick={handleSave} className="w-full">
                        Save Settings
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
