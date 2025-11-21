import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Upload, FileJson, FileText, ArrowLeft, AlertCircle, Check } from "lucide-react";
import { useApp } from "../../lib/store";
import { Expense, PaymentLine } from "../../types";
import { generateId, formatDate } from "../../lib/utils";
import { toast } from "sonner@2.0.3";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";

interface ImportUPIDialogProps {
  open: boolean;
  onClose: () => void;
}

interface ParsedTransaction {
  amount: number;
  merchant: string;
  category: string;
  date?: string;
}

// Reuse the same merchant detection logic
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

function detectCategory(merchantText: string): string {
  const lowerMerchant = merchantText.toLowerCase();
  for (const [_, { category, keywords }] of Object.entries(merchantKeywords)) {
    if (keywords.some(keyword => lowerMerchant.includes(keyword))) {
      return category;
    }
  }
  return "other";
}

function parsePasteData(text: string): ParsedTransaction[] {
  const lines = text.split('\n').filter(line => line.trim());
  const transactions: ParsedTransaction[] = [];

  for (const line of lines) {
    // Try to parse: "250 Zomato" or "₹500 Uber"
    const patterns = [
      /^₹?\s*(\d+(?:\.\d{2})?)\s+(.+)$/i,
      /^(.+?)\s+₹?\s*(\d+(?:\.\d{2})?)$/i,
    ];

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        const isAmountFirst = pattern.source.startsWith("^₹?");
        const amount = parseFloat(isAmountFirst ? match[1] : match[2]);
        const merchant = (isAmountFirst ? match[2] : match[1]).trim();
        
        transactions.push({
          amount,
          merchant,
          category: detectCategory(merchant)
        });
        break;
      }
    }
  }

  return transactions;
}

function parseJSONData(text: string): ParsedTransaction[] {
  try {
    const data = JSON.parse(text);
    const transactions: ParsedTransaction[] = [];

    // Handle array of transactions
    if (Array.isArray(data)) {
      for (const item of data) {
        if (item.amount && item.merchant) {
          transactions.push({
            amount: parseFloat(item.amount),
            merchant: item.merchant,
            category: item.category || detectCategory(item.merchant),
            date: item.date
          });
        }
      }
    } else if (data.amount && data.merchant) {
      // Single transaction
      transactions.push({
        amount: parseFloat(data.amount),
        merchant: data.merchant,
        category: data.category || detectCategory(data.merchant),
        date: data.date
      });
    }

    return transactions;
  } catch (error) {
    return [];
  }
}

function parseCSVData(text: string): ParsedTransaction[] {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const transactions: ParsedTransaction[] = [];
  const headers = lines[0].toLowerCase().split(',').map(h => h.trim());

  const amountIndex = headers.findIndex(h => h.includes('amount'));
  const merchantIndex = headers.findIndex(h => h.includes('merchant') || h.includes('description') || h.includes('name'));
  const categoryIndex = headers.findIndex(h => h.includes('category'));
  const dateIndex = headers.findIndex(h => h.includes('date'));

  if (amountIndex === -1 || merchantIndex === -1) return [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length > Math.max(amountIndex, merchantIndex)) {
      const amount = parseFloat(values[amountIndex].replace(/[₹,]/g, ''));
      const merchant = values[merchantIndex];
      const category = categoryIndex !== -1 ? values[categoryIndex] : detectCategory(merchant);
      const date = dateIndex !== -1 ? values[dateIndex] : undefined;

      if (!isNaN(amount) && merchant) {
        transactions.push({ amount, merchant, category, date });
      }
    }
  }

  return transactions;
}

export function ImportUPIDialog({ open, onClose }: ImportUPIDialogProps) {
  const { currentUser, addExpense } = useApp();
  const [activeTab, setActiveTab] = useState("paste");
  const [inputText, setInputText] = useState("");
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handlePreview = () => {
    let transactions: ParsedTransaction[] = [];

    switch (activeTab) {
      case "paste":
        transactions = parsePasteData(inputText);
        break;
      case "json":
        transactions = parseJSONData(inputText);
        break;
      case "csv":
        transactions = parseCSVData(inputText);
        break;
    }

    if (transactions.length === 0) {
      toast.error("No valid transactions found. Please check the format.");
      return;
    }

    setParsedTransactions(transactions);
    setShowPreview(true);
  };

  const handleImport = async () => {
    if (!currentUser || parsedTransactions.length === 0) return;

    setIsImporting(true);

    try {
      for (const transaction of parsedTransactions) {
        const paymentLine: PaymentLine = {
          id: generateId(),
          method: "upi",
          amount: transaction.amount,
          payer_user_id: currentUser.id,
          account_id: "upi",
        };

        const newExpense: Expense = {
          id: generateId(),
          family_id: currentUser.family_id,
          created_by: currentUser.id,
          total_amount: transaction.amount,
          currency: "INR",
          category: transaction.category,
          date: transaction.date || formatDate(new Date()),
          notes: transaction.merchant,
          payment_lines: [paymentLine],
          attachments: [],
          is_shared: true,
          sync_status: "synced",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        await addExpense(newExpense);
      }

      toast.success(`Successfully imported ${parsedTransactions.length} transactions`);
      handleClose();
    } catch (error) {
      console.error("Error importing transactions:", error);
      toast.error("Failed to import some transactions");
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setInputText("");
    setParsedTransactions([]);
    setShowPreview(false);
    onClose();
  };

  const handleBack = () => {
    setShowPreview(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {showPreview && (
              <Button variant="ghost" size="icon" onClick={handleBack} className="shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex-1 min-w-0">
              <DialogTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                {showPreview ? "Preview Transactions" : "Import UPI Transactions"}
              </DialogTitle>
              <DialogDescription>
                {showPreview 
                  ? `Review ${parsedTransactions.length} transactions before importing`
                  : "Upload a JSON/CSV file or paste transaction data. We'll auto-categorize using Indian merchant keywords."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {!showPreview ? (
          <div className="space-y-4 flex-1 overflow-y-auto">
            {/* Info Alert */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Upload or paste your UPI transaction data. We'll automatically detect categories based on merchant names.
              </AlertDescription>
            </Alert>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="paste">Paste</TabsTrigger>
                <TabsTrigger value="json">JSON</TabsTrigger>
                <TabsTrigger value="csv">CSV</TabsTrigger>
              </TabsList>

              <TabsContent value="paste" className="space-y-4">
                <div className="space-y-2">
                  <Label>Paste transaction data (one per line)</Label>
                  <Textarea
                    placeholder="250 Zomato&#10;500 Uber&#10;1200 BigBasket"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-sm">
                  <p className="font-medium mb-2">Format examples:</p>
                  <div className="space-y-1 text-muted-foreground font-mono text-xs">
                    <div>250 Zomato</div>
                    <div>₹500 Uber</div>
                    <div>BigBasket 1200</div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="json" className="space-y-4">
                <div className="space-y-2">
                  <Label>Paste JSON data</Label>
                  <Textarea
                    placeholder='[&#10;  {"amount": 250, "merchant": "Zomato"},&#10;  {"amount": 500, "merchant": "Uber", "category": "transport"}&#10;]'
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-sm">
                  <p className="font-medium mb-2">JSON format:</p>
                  <pre className="text-muted-foreground font-mono text-xs overflow-x-auto">
{`[
  {
    "amount": 250,
    "merchant": "Zomato",
    "category": "food",
    "date": "2025-11-04"
  }
]`}
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="csv" className="space-y-4">
                <div className="space-y-2">
                  <Label>Paste CSV data</Label>
                  <Textarea
                    placeholder="amount,merchant,category,date&#10;250,Zomato,food,2025-11-04&#10;500,Uber,transport,2025-11-04"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-sm">
                  <p className="font-medium mb-2">CSV format:</p>
                  <pre className="text-muted-foreground font-mono text-xs">
{`amount,merchant,category,date
250,Zomato,food,2025-11-04
500,Uber,transport,2025-11-04`}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>

            <Button onClick={handlePreview} className="w-full" disabled={!inputText.trim()}>
              Preview Transactions
            </Button>
          </div>
        ) : (
          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            {/* Summary */}
            <div className="bg-primary-container/20 border-2 border-primary-container rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                  <p className="text-2xl font-semibold">{parsedTransactions.length}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-semibold text-destructive">
                    ₹{parsedTransactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction List */}
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-2">
                {parsedTransactions.map((transaction, index) => (
                  <div
                    key={index}
                    className="bg-card border border-border rounded-lg p-3 flex items-center gap-3"
                  >
                    <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{transaction.merchant}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {transaction.category}
                        </Badge>
                        {transaction.date && (
                          <span className="text-xs text-muted-foreground">{transaction.date}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-destructive">₹{transaction.amount}</p>
                      <p className="text-xs text-muted-foreground">UPI</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleImport}
                disabled={isImporting}
                className="flex-1 bg-success hover:bg-success/90 text-white gap-2"
              >
                {isImporting ? (
                  "Importing..."
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Import {parsedTransactions.length} Transactions
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
