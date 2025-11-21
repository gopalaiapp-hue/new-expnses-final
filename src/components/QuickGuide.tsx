import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

export function QuickGuide() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">🎯 Quick Start Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <span>1. Add Your First Expense</span>
              <Badge variant="secondary" className="text-xs">Easy</Badge>
            </h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>Tap the <strong>+ button</strong> at bottom-right</li>
              <li>Enter amount, category, and date</li>
              <li>Toggle "Split Payment" for multi-tender (UPI + Cash + Card)</li>
              <li>Mark as "Borrowed" if you need to track an IOU</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">2. Multi-Tender Split Example</h4>
            <div className="bg-accent/50 p-3 rounded text-xs space-y-1">
              <p><strong>Total:</strong> ₹800 (Grocery shopping)</p>
              <p>💳 Card: ₹500</p>
              <p>💵 Cash: ₹300</p>
              <p className="text-muted-foreground pt-1">
                ✓ The app ensures split amounts match the total
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">3. Track IOUs</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>When adding expense, toggle "Borrowed" on any payment line</li>
              <li>Select who you borrowed from</li>
              <li>View all IOUs in the "IOUs" tab</li>
              <li>Settle debts when you pay back</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">4. Set Budgets</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>Go to "Budgets" tab</li>
              <li>Tap "Add Budget" and select category</li>
              <li>Set monthly/weekly limits</li>
              <li>Get alerts when you reach threshold (default 80%)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">5. Invite Family Members</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li><strong>Admin:</strong> Tap "Invite" button in header</li>
              <li>Share the 6-character invite code</li>
              <li><strong>Member:</strong> Use "Join Family" at welcome screen</li>
            </ul>
          </div>

          <div className="bg-purple-50 p-3 rounded border border-purple-200">
            <p className="text-xs">
              <strong>💡 Tip:</strong> All data is stored locally on your device and works offline. 
              Admin can view all family expenses, while members see their own and shared expenses.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
