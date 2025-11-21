# KharchaPal - Google Stitch Design Redesign

## Overview
KharchaPal has been redesigned following Google's Stitch project design language and Material Design 3 principles.

## Design System Updates

### Color Palette
- **Primary**: `#6750A4` (Purple - Stitch signature color)
- **Secondary**: `#625B71` (Neutral Violet)
- **Tertiary**: `#7D5260` (Rose - for emphasis/FAB)
- **Surface**: `#FFFBFE` (Light mode) / `#1D1B20` (Dark mode)
- **Success**: `#006E26` (Income/positive states)
- **Error**: `#BA1A1A` (Expenses/destructive)

### Typography
- System fonts: -apple-system, Roboto, Segoe UI (Material-like)
- Font smoothing enabled for crisp text
- Medium weight (500) for headers and buttons
- Normal weight (400) for body text

### Spacing System
- 8dp grid system (Material 3 standard)
- Border radius: 16px default (1rem) for cards and containers
- Smaller radius: 12px for inputs, 8px for chips

### Elevation System
- 5 levels of Material 3 shadows
- `.elevation-1` through `.elevation-5` utility classes
- Cards use elevation-1 with hover:elevation-3
- FAB uses elevation-4 with hover:elevation-5

### Motion & Animation
- Standard easing: cubic-bezier(0.2, 0, 0, 1)
- Transition duration: 200-300ms
- Hover effects with scale transforms
- Active states with scale-95

## Component Updates

### Cards
- Rounded corners: 16px (rounded-2xl)
- Subtle borders with outline-variant
- Elevation shadows on hover
- Icon containers with colored backgrounds
- Improved visual hierarchy

### Buttons
- Rounded corners: 12px (rounded-xl)
- Elevation shadows for primary actions
- Active press animation (scale-95)
- Icon buttons: 40px × 40px (size-10)
- Extended FAB with text label on desktop

### Inputs
- Rounded corners: 12px (rounded-xl)
- Height: 44px (11 units) for better touch targets
- Border thickness: 2px
- Surface variant background
- Focus states with primary color ring
- Hover states with border color change

### Dashboard Stats Cards
- Color-coded backgrounds (error-container, success-container, etc.)
- Icon badges with rounded backgrounds
- Larger typography for amounts
- Net balance with color indication
- Smooth hover transitions

### Expense List
- Larger category icons with container backgrounds
- Payment method chips with surface-variant background
- User avatars with borders
- Date headers with uppercase tracking
- Improved spacing and grouping

### Welcome Screen
- Gradient background (primary/tertiary accents)
- Motion animations on mount
- Feature cards with icon badges
- Elevated main card
- Tagline at bottom

### Top App Bar
- Elevation shadow (elevation-2)
- Responsive layout with truncation
- Badge for admin users
- Icon buttons with hover states
- Smooth transitions

## Dark Mode
- Fully supported with Material 3 dark theme
- Elevated surfaces for hierarchy
- Reduced saturation for primary colors
- Proper contrast ratios maintained

## Responsive Design
- Mobile-first approach
- Grid layouts adapt from 2 to 6 columns
- FAB shows text label on desktop
- Header collapses invite button text on mobile
- Touch-friendly target sizes (44px minimum)

## Accessibility
- Proper color contrast ratios
- Focus visible states with ring
- Keyboard navigation support
- ARIA labels maintained
- Screen reader friendly

## Next Steps for Full Stitch Compliance

1. **Gestures**:
   - Add swipe-to-delete on expense items
   - Long-press for quick actions
   - Pull-to-refresh on lists

2. **Illustrations**:
   - Add Lottie animations for empty states
   - Loading animations with Material motion
   - Success/error feedback animations

3. **Advanced Motion**:
   - Shared element transitions between views
   - List item stagger animations
   - Page transition effects

4. **Micro-interactions**:
   - Ripple effects on touch
   - Haptic feedback (mobile)
   - Toast notification animations

5. **Typography Refinement**:
   - Variable font support (Roboto Flex)
   - Fluid typography scaling
   - Optical sizing adjustments

## Files Modified

- `/styles/globals.css` - Design tokens and Material 3 theme
- `/components/ui/button.tsx` - Stitch button styles
- `/components/ui/card.tsx` - Elevated card design
- `/components/ui/input.tsx` - Material 3 input fields
- `/App.tsx` - Loading screen redesign
- `/components/MainDashboard.tsx` - App bar and FAB updates
- `/components/dashboard/DashboardStats.tsx` - Stat cards redesign
- `/components/expense/ExpenseList.tsx` - List items redesign
- `/components/onboarding/Welcome.tsx` - Welcome screen with motion
- `/components/transaction/PaymentLineRow.tsx` - IOU label improvement

## Design Guidelines Followed

✅ Material 3 color system with dynamic theming
✅ 8dp spacing grid
✅ 16dp default border radius
✅ Elevated surfaces with proper shadows
✅ Smooth transitions (200-300ms)
✅ Touch-friendly targets (44px+)
✅ Proper contrast ratios
✅ Responsive layout system
✅ Dark mode support
✅ Accessibility features

---

*Design system inspired by Google Stitch project and Material Design 3 guidelines*
