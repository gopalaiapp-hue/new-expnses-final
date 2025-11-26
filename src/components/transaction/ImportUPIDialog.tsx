import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Upload, FileJson, FileText, ArrowLeft, AlertCircle, Check, Lock, File } from "lucide-react";
import { useApp } from "../../lib/store";
import { Expense, PaymentLine } from "../../types";
import { generateId, formatDate } from "../../lib/utils";
import { toast } from "sonner";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Input } from "../ui/input";
import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Set worker source correctly for Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

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
    // Try to parse: "250 Zomato" or "₹500 Uber" or "Uber 500"
    // Also handle "Paid to Zomato ₹250"
    // Also handle CSV-like: "200, shop, food, 2025-11-10"
    const cleanLine = line.replace(/paid to/i, '').trim();

    // Check if it's comma-separated (CSV-like)
    if (cleanLine.includes(',')) {
      const parts = cleanLine.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        // Try to find amount and merchant
        let amount: number | null = null;
        let merchant = '';
        let category = '';
        let date = '';

        for (let i = 0; i < parts.length; i++) {
          const part = parts[i].replace(/[₹,]/g, '');
          const num = parseFloat(part);

          if (!isNaN(num) && num > 0 && amount === null) {
            amount = num;
          } else if (part && !merchant && isNaN(parseFloat(part))) {
            merchant = part;
          } else if (part && !category && isNaN(parseFloat(part)) && merchant) {
            category = part;
          } else if (part && part.match(/\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}/)) {
            date = part;
          }
        }

        if (amount && merchant) {
          transactions.push({
            amount,
            merchant,
            category: category || detectCategory(merchant),
            date: date || undefined
          });
          continue;
        }
      }
    }

    // Try regular patterns
    const patterns = [
      /^₹?\s*(\d+(?:\.\d{2})?)\s+(.+)$/i, // 500 Uber
      /^(.+?)\s+₹?\s*(\d+(?:\.\d{2})?)$/i, // Uber 500
    ];

    for (const pattern of patterns) {
      const match = cleanLine.match(pattern);
      if (match) {
        const isAmountFirst = pattern.source.startsWith("^₹?");
        const amount = parseFloat(isAmountFirst ? match[1] : match[2]);
        const merchant = (isAmountFirst ? match[2] : match[1]).trim();

        if (!isNaN(amount)) {
          transactions.push({
            amount,
            merchant,
            category: detectCategory(merchant)
          });
          break;
        }
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
    const items = Array.isArray(data) ? data : [data];

    for (const item of items) {
      if ((item.amount || item.Amount) && (item.merchant || item.Merchant || item.description || item.Description)) {
        const amount = parseFloat(item.amount || item.Amount);
        const merchant = item.merchant || item.Merchant || item.description || item.Description;

        if (!isNaN(amount)) {
          transactions.push({
            amount,
            merchant,
            category: item.category || detectCategory(merchant),
            date: item.date || item.Date
          });
        }
      }
    }

    return transactions;
  } catch (error) {
    return [];
  }
}

function parseCSVData(text: string): ParsedTransaction[] {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length < 1) return [];

  const transactions: ParsedTransaction[] = [];

  // Check if first line looks like headers
  const firstLine = lines[0].toLowerCase();
  const hasHeaders = firstLine.includes('amount') || firstLine.includes('merchant') ||
    firstLine.includes('description') || firstLine.includes('category');

  if (hasHeaders && lines.length < 2) return [];

  const startIndex = hasHeaders ? 1 : 0;

  if (hasHeaders) {
    // Parse with headers
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/['"]/g, ''));

    const amountIndex = headers.findIndex(h => h.includes('amount') || h.includes('debit') || h.includes('withdrawal'));
    const merchantIndex = headers.findIndex(h => h.includes('merchant') || h.includes('description') || h.includes('narration') || h.includes('remarks') || h.includes('name'));
    const categoryIndex = headers.findIndex(h => h.includes('category'));
    const dateIndex = headers.findIndex(h => h.includes('date'));

    if (amountIndex === -1 || merchantIndex === -1) return [];

    for (let i = startIndex; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));

      if (values.length > Math.max(amountIndex, merchantIndex)) {
        const amountStr = values[amountIndex].replace(/[₹,]/g, '');
        const amount = parseFloat(amountStr);
        const merchant = values[merchantIndex];
        const category = categoryIndex !== -1 ? values[categoryIndex] : detectCategory(merchant);
        const date = dateIndex !== -1 ? values[dateIndex] : undefined;

        if (!isNaN(amount) && merchant && amount > 0) {
          transactions.push({ amount, merchant, category, date });
        }
      }
    }
  } else {
    // Parse without headers - assume format: amount, merchant, [category], [date]
    for (let i = startIndex; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/['"₹]/g, ''));

      if (values.length >= 2) {
        const amount = parseFloat(values[0]);
        const merchant = values[1];
        const category = values.length > 2 && values[2] ? values[2] : detectCategory(merchant);
        const date = values.length > 3 && values[3] ? values[3] : undefined;

        if (!isNaN(amount) && merchant && amount > 0) {
          transactions.push({ amount, merchant, category, date });
        }
      }
    }
  }

  return transactions;
}

export function ImportUPIDialog({ open, onClose }: ImportUPIDialogProps) {
  const { currentUser, addExpense } = useApp();
  const [activeTab, setActiveTab] = useState("pdf");
  const [inputText, setInputText] = useState("");
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // PDF State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPassword, setPdfPassword] = useState("");
  const [isReadingPdf, setIsReadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfFile(file);
      setPdfError(null);
    }
  };

  const extractTextFromPdf = async () => {
    if (!pdfFile) return;

    setIsReadingPdf(true);
    setPdfError(null);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        password: pdfPassword
      });

      const pdf = await loadingTask.promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        fullText += pageText + "\n";
      }

      // Simple parsing logic for PDF text
      // This is a heuristic approach and might need refinement for specific bank statements
      const transactions = parsePasteData(fullText);

      if (transactions.length === 0) {
        // Try to find patterns in the raw text if line-by-line failed
        // Regex for "Date Description Amount" or similar common patterns
        const rawPatterns = [
          /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+([0-9,]+\.\d{2})/g, // Date Desc Amount
          /([0-9,]+\.\d{2})\s+(.+?)\s+(\d{2}\/\d{2}\/\d{4})/g  // Amount Desc Date
        ];

        // Implementation of raw text regex parsing could go here
        // For now, we rely on the line-splitter in parsePasteData
      }

      if (transactions.length > 0) {
        setParsedTransactions(transactions);
        setShowPreview(true);
      } else {
        setPdfError("Could not extract valid transactions. Please check the file format.");
      }

    } catch (error: any) {
      console.error("PDF Error:", error);
      if (error.name === 'PasswordException') {
        setPdfError("Password required");
      } else {
        setPdfError("Failed to read PDF. " + error.message);
      }
    } finally {
      setIsReadingPdf(false);
    }
  };

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
    setPdfFile(null);
    setPdfPassword("");
    setPdfError(null);
    onClose();
  };

  const handleBack = () => {
    setShowPreview(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
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
                  : "Upload a PDF statement, JSON/CSV file, or paste transaction data."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {!showPreview ? (
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            {/* Info Alert */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                We'll automatically detect categories based on merchant names.
              </AlertDescription>
            </Alert>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="pdf">PDF</TabsTrigger>
                <TabsTrigger value="paste">Paste</TabsTrigger>
                <TabsTrigger value="json">JSON</TabsTrigger>
                <TabsTrigger value="csv">CSV</TabsTrigger>
              </TabsList>

              <TabsContent value="pdf" className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center space-y-4 hover:bg-muted/50 transition-colors">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <File className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {pdfFile ? pdfFile.name : "Upload Bank Statement PDF"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {pdfFile ? `${(pdfFile.size / 1024).toFixed(1)} KB` : "Click to browse or drag and drop"}
                    </p>
                  </div>
                  <Input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    id="pdf-upload"
                    onChange={handlePdfUpload}
                  />
                  <Button variant="outline" onClick={() => document.getElementById('pdf-upload')?.click()}>
                    Select PDF
                  </Button>
                </div>

                {pdfFile && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2">
                      <Label htmlFor="pdf-password">Password (if protected)</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="pdf-password"
                          type="password"
                          placeholder="Enter PDF password"
                          value={pdfPassword}
                          onChange={(e) => setPdfPassword(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>

                    {pdfError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{pdfError}</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      onClick={extractTextFromPdf}
                      disabled={isReadingPdf}
                      className="w-full"
                    >
                      {isReadingPdf ? "Reading PDF..." : "Process PDF"}
                    </Button>
                  </div>
                )}
              </TabsContent>

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
                <Button onClick={handlePreview} className="w-full" disabled={!inputText.trim()}>
                  Preview Transactions
                </Button>
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
                <Button onClick={handlePreview} className="w-full" disabled={!inputText.trim()}>
                  Preview Transactions
                </Button>
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
                <Button onClick={handlePreview} className="w-full" disabled={!inputText.trim()}>
                  Preview Transactions
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="space-y-4 flex-1 overflow-y-auto flex flex-col pr-1">
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

            {/* Category Breakdown */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {useMemo(() => {
                const totals: Record<string, number> = {};
                parsedTransactions.forEach(t => {
                  const cat = t.category || "other";
                  totals[cat] = (totals[cat] || 0) + t.amount;
                });
                return Object.entries(totals).sort((a, b) => b[1] - a[1]);
              }, [parsedTransactions]).map(([cat, amount]) => (
                <div key={cat} className="bg-muted/30 p-2 rounded-lg flex justify-between items-center text-sm">
                  <span className="capitalize text-muted-foreground">{cat}</span>
                  <span className="font-medium">{amount.toFixed(0)}</span>
                </div>
              ))}
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
