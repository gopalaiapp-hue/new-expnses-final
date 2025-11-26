// Utility functions
import { v4 as uuidv4 } from "uuid";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return uuidv4();
}

export function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function formatCurrency(amount: number, currency: string = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;

  // Check if date is valid
  if (isNaN(d.getTime())) {
    return "Unknown Date";
  }

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) {
    return "Today";
  } else if (d.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  }
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getPaymentMethodIcon(method: string): string {
  switch (method) {
    case "cash":
      return "💵";
    case "upi":
      return "📱";
    case "card":
      return "💳";
    case "borrowed":
      return "🤝";
    default:
      return "💰";
  }
}

export function getPaymentMethodLabel(method: string): string {
  switch (method) {
    case "cash":
      return "Cash";
    case "upi":
      return "UPI";
    case "card":
      return "Card";
    case "borrowed":
      return "Borrowed";
    default:
      return method;
  }
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    "Groceries": "🛒",
    "Utilities": "💡",
    "Rent": "🏠",
    "Transportation": "🚗",
    "Healthcare": "🏥",
    "Education": "📚",
    "Entertainment": "🎬",
    "Food & Dining": "🍽️",
    "Shopping": "🛍️",
    "Household Items": "🏡",
    "Personal Care": "💆",
    "Gifts": "🎁",
    "Other": "📝",
  };
  return icons[category] || "📝";
}

export function validatePaymentLines(
  totalAmount: number,
  paymentLines: Array<{ amount: number }>
): { valid: boolean; error?: string } {
  if (paymentLines.length === 0) {
    return { valid: false, error: "At least one payment method is required" };
  }

  const sum = paymentLines.reduce((acc, line) => acc + line.amount, 0);
  const tolerance = 0.01;

  if (Math.abs(sum - totalAmount) > tolerance) {
    return {
      valid: false,
      error: `Split amounts (₹${sum.toFixed(2)}) must equal total (₹${totalAmount.toFixed(2)})`,
    };
  }

  for (const line of paymentLines) {
    if (line.amount <= 0) {
      return { valid: false, error: "Payment amounts must be greater than 0" };
    }
  }

  return { valid: true };
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}
