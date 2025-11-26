import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Zap, TrendingDown, Check } from "lucide-react";
import { useApp } from "../../lib/store";
import { Expense, PaymentLine } from "../../types";
import { generateId, formatDate } from "../../lib/utils";
import { toast } from "sonner";
import { Badge } from "../ui/badge";

interface QuickAddDialogProps {
  open: boolean;
  onClose: () => void;
}

// Indian merchant keywords for auto-categorization
const merchantKeywords: Record<string, { category: string; keywords: string[] }> = {
  groceries: {
    category: "groceries",
    keywords: ["dmart", "bigbasket", "grofers", "blinkit", "zepto", "instamart", "reliance fresh", "more", "nilgiris", "kirana", "grocery", "sabzi", "vegetables"]
  },
  food: {
    category: "food",
    keywords: ["swiggy", "zomato", "dominos", "mcdonalds", "kfc", "pizza", "burger", "restaurant", "cafe", "food", "biryani", "tiffin"]
  },
  transport: {
    category: "transport",
    keywords: ["uber", "ola", "rapido", "petrol", "diesel", "fuel", "metro", "bus", "auto", "rickshaw", "parking"]
  },
  shopping: {
    category: "shopping",
    keywords: ["amazon", "flipkart", "myntra", "ajio", "meesho", "shopping", "clothes", "fashion", "shoes"]
  },
  utilities: {
    category: "utilities",
    keywords: ["electricity", "water", "gas", "broadband", "wifi", "internet", "recharge", "bill", "paytm", "phonepe"]
  },
  entertainment: {
    category: "entertainment",
    keywords: ["netflix", "prime", "hotstar", "spotify", "movie", "cinema", "pvr", "inox", "book my show"]
  },
  health: {
    category: "health",
    keywords: ["pharmacy", "apollo", "medplus", "1mg", "netmeds", "hospital", "doctor", "clinic", "medicine", "medical"]
  },
  education: {
    category: "education",
    keywords: ["school", "college", "tuition", "course", "book", "study", "exam", "coaching"]
  }
};

function detectCategoryAndMerchant(input: string): { amount: number; merchant: string; category: string; paymentMethod: string; bank: string } | null {
  const lowerInput = input.toLowerCase();

  // Try to parse: "200 Uber" or "₹500 Zomato" or "Swiggy 350"
  const patterns = [
    /^₹?\s*(\d+(?:\.\d{2})?)\s+(.+)$/i,  // ₹200 Uber or 200 Uber
    /^(.+?)\s+₹?\s*(\d+(?:\.\d{2})?)$/i,  // Uber 200 or Uber ₹200
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) {
      const isAmountFirst = pattern.source.startsWith("^₹?");
      const amount = parseFloat(isAmountFirst ? match[1] : match[2]);
      const merchantText = (isAmountFirst ? match[2] : match[1]).trim();

      // Check for payment method patterns: "by upi", "via upi", "upi", "card", "cash"
      let paymentMethod = "cash"; // default
      let bank = "";
      let notes = merchantText;

      // Look for payment method keywords in the merchant text
      const paymentPatterns = [
        /\b(by|via|using|paid by)\s+(upi|card|cash|net banking)\b/i,
        /\b(upi|card|cash|net banking)\b/i,
        /\b(by|via|using|paid by)\s+(.+?)(?:\s+|$)/i, // for bank names too general
      ];

      let extractedPayment = false;
      for (const pattern of paymentPatterns) {
        const paymentMatch = input.match(pattern);
        if (paymentMatch) {
          const paymentText = paymentMatch[1] || paymentMatch[0];

          // Determine method and extract bank if present
          if (/\bupi\b/.test(paymentText.toLowerCase())) {
            paymentMethod = "upi";
            const bankMatch = paymentText.match(/\bupi\s+(\w+)/i);
            if (bankMatch) bank = bankMatch[1];
          } else if (/\bcard\b/.test(paymentText.toLowerCase())) {
            paymentMethod = "card";
            const bankMatch = paymentText.match(/\bcard\s+(\w+)/i);
            if (bankMatch) bank = bankMatch[1];
          } else if (/\bcash\b/.test(paymentText.toLowerCase())) {
            paymentMethod = "cash";
          }

          // Remove payment info from notes
          notes = merchantText.replace(paymentMatch[0], '').trim();
          extractedPayment = true;
          break;
        }
      }

      // If no specific payment found, look for bank name after "by"
      if (!extractedPayment) {
        const byMatch = input.match(/\b(by)\s+(.+)$/i);
        if (byMatch && byMatch[2]) {
          const afterBy = byMatch[2];
          // Check if it's a payment method or bank
          if (/\b(upi|card|cash|net banking)\b/.test(afterBy.toLowerCase())) {
            const methodMatch = afterBy.match(/(upi|card|cash|net banking)/i);
            if (methodMatch) {
              paymentMethod = methodMatch[1].toLowerCase();
              bank = afterBy.replace(methodMatch[0], '').trim();
            }
          } else {
            // Assume it's a bank name
            bank = afterBy;
            paymentMethod = "upi"; // default for bank names
          }
          notes = merchantText.replace(byMatch[0], '').trim();
        }
      }

      // Detect category from remaining notes
      let detectedCategory = "other";
      const lowerNotes = notes.toLowerCase();

      for (const [_, { category, keywords }] of Object.entries(merchantKeywords)) {
        if (keywords.some(keyword => lowerNotes.includes(keyword))) {
          detectedCategory = category;
          break;
        }
      }

      return {
        amount,
        merchant: notes,
        category: detectedCategory,
        paymentMethod,
        bank
      };
    }
  }

  return null;
}

export function QuickAddDialog({ open, onClose }: QuickAddDialogProps) {
  const { currentUser, users, addExpense } = useApp();
  const [quickInput, setQuickInput] = useState("");
  const [parsedData, setParsedData] = useState<{ amount: number; merchant: string; category: string; paymentMethod: string; bank: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (quickInput.trim()) {
      const detected = detectCategoryAndMerchant(quickInput);
      setParsedData(detected);
    } else {
      setParsedData(null);
    }
  }, [quickInput]);

  const handleQuickAdd = async () => {
    if (!currentUser || !parsedData) return;

    setIsProcessing(true);

    try {
      const accountId = parsedData.paymentMethod === "cash" ? "cash" :
        parsedData.paymentMethod === "upi" ? "upi" :
          parsedData.paymentMethod === "card" ? "card" : "cash";

      const paymentLine: PaymentLine = {
        id: generateId(),
        method: parsedData.paymentMethod as "cash" | "upi" | "card",
        amount: parsedData.amount,
        payer_user_id: currentUser.id,
        account_id: accountId,
      };

      const notes = parsedData.bank ?
        `${parsedData.merchant} (via ${parsedData.bank})` :
        parsedData.merchant;

      const newExpense: Expense = {
        id: generateId(),
        family_id: currentUser.family_id,
        created_by: currentUser.id,
        total_amount: parsedData.amount,
        currency: "INR",
        category: parsedData.category,
        date: new Date().toISOString(),
        notes: notes,
        payment_lines: [paymentLine],
        attachments: [],
        is_shared: true,
        sync_status: "synced",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await addExpense(newExpense);
      toast.success(`Added ₹${parsedData.amount} expense for ${parsedData.merchant}`);
      setQuickInput("");
      setParsedData(null);
      onClose();
    } catch (error) {
      console.error("Error adding quick expense:", error);
      toast.error("Failed to add expense");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setQuickInput("");
    setParsedData(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Quick Add Expense
          </DialogTitle>
          <DialogDescription>
            Type naturally like "200 Uber" or "₹500 Zomato" or "500 travel by upi kotak"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quick Input */}
          <div className="space-y-2">
            <Label htmlFor="quickInput">Quick Entry</Label>
            <Input
              id="quickInput"
              placeholder="e.g., 200 Uber by upi, ₹500 Zomato, 500 travel by kotak"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              className="text-lg"
              autoFocus
            />
          </div>

          {/* Preview */}
          {parsedData && (
            <div className="bg-primary-container/20 border-2 border-primary-container rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-success" />
                Auto-detected:
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="text-xl font-semibold text-destructive">₹{parsedData.amount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Merchant:</span>
                  <span className="font-medium">{parsedData.merchant}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Category:</span>
                  <Badge variant="secondary" className="capitalize">
                    {parsedData.category}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Payment:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm capitalize">{parsedData.paymentMethod}</span>
                    {parsedData.bank && (
                      <Badge variant="outline" className="text-xs">
                        {parsedData.bank}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Examples */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <p className="text-sm font-medium">Examples:</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex gap-2">
                <span className="font-mono bg-background px-2 py-1 rounded">200 Uber</span>
                <span>→ ₹200 Transport</span>
              </div>
              <div className="flex gap-2">
                <span className="font-mono bg-background px-2 py-1 rounded">500 travel by upi kotak</span>
                <span>→ ₹500 Travel (UPI Kotak)</span>
              </div>
              <div className="flex gap-2">
                <span className="font-mono bg-background px-2 py-1 rounded">₹600 BigBasket</span>
                <span>→ ₹600 Groceries (Cash)</span>
              </div>
              <div className="flex gap-2">
                <span className="font-mono bg-background px-2 py-1 rounded">300 movie by card</span>
                <span>→ ₹300 Entertainment (Card)</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleQuickAdd}
              disabled={!parsedData || isProcessing}
              className="flex-1 bg-success hover:bg-success/90 text-white gap-2"
            >
              <TrendingDown className="h-4 w-4" />
              Add Expense
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
