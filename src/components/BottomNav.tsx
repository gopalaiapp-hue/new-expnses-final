import { Home, Receipt, Target, Menu } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: Home },
  { id: "transactions", label: "Transactions", icon: Receipt },
  { id: "goals", label: "Goals", icon: Target },
  { id: "more", label: "More", icon: Menu },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-safe bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-lg border-t border-border elevation-4">
      <div className="max-w-4xl mx-auto flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl
                transition-all duration-200 min-w-0 flex-1 max-w-[80px]
                active:scale-95
                ${isActive
                  ? 'text-primary bg-primary-container/60 shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-variant/40 hover:text-foreground'
                }
              `}
            >
              <Icon className={`h-5 w-5 shrink-0 transition-all ${isActive ? 'fill-primary/20 scale-110' : ''}`} />
              <span className={`text-xs truncate w-full text-center transition-all ${isActive ? 'font-medium' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      {/* Active indicator */}
      <div
        className="absolute top-0 left-0 h-0.5 bg-primary transition-all duration-300 ease-out"
        style={{
          width: '25%',
          transform: `translateX(${NAV_ITEMS.findIndex(item => item.id === activeTab) * 100}%)`
        }}
      />
    </nav>
  );
}
