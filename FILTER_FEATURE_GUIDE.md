# Transaction Filter Feature - Quick Reference Guide

## 🎯 User Guide

### Accessing the Filter

1. Navigate to the **Transactions** tab in the bottom navigation
2. Click the **Filter** button (top right, next to "All Transactions")
3. The filter dialog will open

### Using the Filter Dialog

#### 1. Search Box 🔍
- **Type your search query** to find transactions
- Searches in:
  - Transaction category (e.g., "Food", "Transport")
  - Transaction notes
- **Case-insensitive** matching
- **Clear button (X)** appears when text is entered

#### 2. Time Range Selector
Choose one of these time ranges:
- **All** - Show all transactions (default)
- **Today** - Only today's expenses/income
- **Week** - Last 7 days
- **Month** - Last 30 days

#### 3. Category Dropdown 📁
- **Expense categories:**
  - Food & Dining
  - Transportation
  - Shopping
  - Bills & Utilities
  - Entertainment
  - Healthcare
  - Education
  - Personal Care
  - Home & Garden
  - Gifts & Donations
  - Travel
  - Other
- Select "All Categories" to see all (default)

#### 4. Payment Mode Dropdown 💳
Choose how the transaction was paid:
- **Cash** 💵
- **UPI** 📱
- **Card** 💳
- **Net Banking** 🏦
- **Other**
- Select "All Modes" to see all (default)

### Action Buttons

- **Reset** - Clear all filters and return to defaults
- **Apply Filters** - Apply selected filters to transaction list

### Filter Badges

- When filters are active, a blue badge appears on the Filter button showing **"On"**
- A "Clear Filters" button becomes visible to quickly reset

---

## 💡 Usage Examples

### Example 1: Find all Zomato Expenses
1. Type "Zomato" in search box
2. Click "Apply Filters"
✅ Result: Shows only expenses with "Zomato" in category or notes

### Example 2: View This Week's Food Expenses
1. Select "Week" time range
2. Select "Food & Dining" category
3. Click "Apply Filters"
✅ Result: Shows only food expenses from the last 7 days

### Example 3: Find UPI Payments for Transport
1. Select "Transportation" category
2. Select "UPI" payment mode
3. Click "Apply Filters"
✅ Result: Shows only transport expenses paid via UPI

### Example 4: Search for Recent Large Purchases
1. Type "shopping" in search box
2. Select "Month" time range
3. Select "Shopping" category
4. Click "Apply Filters"
✅ Result: Shows shopping transactions from last 30 days matching search

### Example 5: Clear Filters
- Click the "Clear Filters" button (appears when filters active)
- Or click "Reset" button in the filter dialog
✅ Result: Returns to showing all transactions

---

## 📱 Mobile Experience

- Filter dialog is optimized for mobile with large touch targets
- All buttons and dropdowns are easily tappable
- Search box has clear button for quick clearing
- Filter button is positioned top-right for easy access

---

## 🔧 Technical Details

### Filter State Structure

```typescript
interface FilterState {
  searchQuery: string;           // User's search text
  timeRange: "all" | "today" | "week" | "month"; // Time range
  category: string;               // Selected category
  mode: string;                   // Payment mode
}
```

### How Filters Are Applied

Filters use **AND logic** (all must match):
- Search query matches category OR notes
- AND time range check passes
- AND category matches (if not "All Categories")
- AND payment mode matches (if not "All Modes")

### Performance

- Filters are applied client-side (instant)
- No network requests needed
- Works smoothly with hundreds of transactions

---

## ⚠️ Notes

- **Search is case-insensitive** - "zomato" finds "Zomato"
- **Partial matches work** - "ub" finds both "Uber" and "Hub"
- **Empty results** - Shows helpful message if no transactions match
- **Filters are temporary** - Reset when app is refreshed

---

## 🆘 Troubleshooting

**"No expenses match your filters"**
- Try removing category filter (select "All Categories")
- Try extending time range (select "All")
- Try removing search query

**Filter button not highlighting**
- Ensure you've clicked "Apply Filters" (not just changed selections)
- Filter status appears when you apply, not just when you select

**Search not finding transaction**
- Check if typing exactly - search is flexible but must match some part
- Try searching in the transaction notes if category search fails
- Check the time range filter isn't excluding the transaction

---

## ✨ Coming Soon

- Save favorite filter combinations
- Export filtered results
- Advanced date range picker
- Multi-select categories and payment modes

---

*Last Updated: November 11, 2025*
