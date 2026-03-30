import type { GigCategory } from '../../api/rankings';

const CATEGORIES: { key: GigCategory; label: string; icon: string; description: string }[] = [
  { key: 'rideshare', label: 'Rideshare', icon: '🚗', description: 'Uber, Lyft' },
  { key: 'food_delivery', label: 'Food Delivery', icon: '🍔', description: 'DoorDash, UberEats' },
  { key: 'grocery', label: 'Grocery', icon: '🛒', description: 'Instacart, Shipt' },
  { key: 'package', label: 'Package', icon: '📦', description: 'Amazon Flex' },
];

interface GigCategoryTabsProps {
  activeCategory: GigCategory;
  onChange: (category: GigCategory) => void;
}

export default function GigCategoryTabs({ activeCategory, onChange }: GigCategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onChange(cat.key)}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-left transition-all duration-300 whitespace-nowrap shrink-0 ${
            activeCategory === cat.key
              ? 'glass-card neon-border-cyan text-neon-cyan'
              : 'bg-noir-surface/50 text-noir-text-secondary hover:bg-noir-surface hover:text-noir-text border border-transparent'
          }`}
        >
          <span className="text-lg">{cat.icon}</span>
          <div>
            <div className="text-sm font-semibold">{cat.label}</div>
            <div className="text-[10px] text-noir-muted">{cat.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
