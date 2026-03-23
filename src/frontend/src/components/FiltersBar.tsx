import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

interface FiltersBarProps {
  onBrandChange: (brand: string | null) => void;
  onConditionChange: (condition: string | null) => void;
  onBudgetChange: (budget: { min: number; max: number } | null) => void;
  onSortChange: (sort: "newest" | "price_asc" | "price_desc") => void;
  selectedBrand: string | null;
  selectedCondition: string | null;
  selectedBudget: { min: number; max: number } | null;
  selectedSort: "newest" | "price_asc" | "price_desc";
}

const BRANDS = [
  "All",
  "Apple",
  "Samsung",
  "OnePlus",
  "Xiaomi",
  "Realme",
  "Vivo",
  "Oppo",
  "Nothing",
  "Sony",
  "Google",
];

const CONDITIONS = [
  "All",
  "Brand New",
  "Like New",
  "Good",
  "Fair",
  "Refurbished",
];

const BUDGETS: { label: string; min: number; max: number }[] = [
  { label: "All", min: 0, max: Number.POSITIVE_INFINITY },
  { label: "Under ₹5,000", min: 0, max: 5000 },
  { label: "₹5k – ₹15k", min: 5000, max: 15000 },
  { label: "₹15k – ₹30k", min: 15000, max: 30000 },
  { label: "₹30k – ₹60k", min: 30000, max: 60000 },
  { label: "₹60k+", min: 60000, max: Number.POSITIVE_INFINITY },
];

const SORT_OPTIONS: {
  label: string;
  value: "newest" | "price_asc" | "price_desc";
}[] = [
  { label: "Newest First", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

export default function FiltersBar({
  onBrandChange,
  onConditionChange,
  onBudgetChange,
  onSortChange,
  selectedBrand,
  selectedCondition,
  selectedBudget,
  selectedSort,
}: FiltersBarProps) {
  const budgetLabel = selectedBudget
    ? (BUDGETS.find(
        (b) => b.min === selectedBudget.min && b.max === selectedBudget.max,
      )?.label ?? "Budget")
    : "Budget";

  const sortLabel =
    SORT_OPTIONS.find((s) => s.value === selectedSort)?.label ?? "Sort By";

  const hasActiveFilter =
    selectedBrand ||
    selectedCondition ||
    selectedBudget ||
    selectedSort !== "newest";

  return (
    <div
      className="flex items-center gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide"
      data-ocid="filters.panel"
    >
      <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />

      {/* Brand */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild data-ocid="filters.brand.select">
          <button
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all shrink-0 ${
              selectedBrand
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-gray-300"
            }`}
          >
            {selectedBrand ?? "Brand"}
            <ChevronDown className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[160px]">
          {BRANDS.map((brand) => (
            <DropdownMenuItem
              key={brand}
              onClick={() => onBrandChange(brand === "All" ? null : brand)}
              className={selectedBrand === brand ? "font-semibold" : ""}
            >
              {brand}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Condition / Refurbished */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild data-ocid="filters.condition.select">
          <button
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all shrink-0 ${
              selectedCondition
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-gray-300"
            }`}
          >
            {selectedCondition ?? "Condition"}
            <ChevronDown className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[160px]">
          {CONDITIONS.map((cond) => (
            <DropdownMenuItem
              key={cond}
              onClick={() => onConditionChange(cond === "All" ? null : cond)}
              className={selectedCondition === cond ? "font-semibold" : ""}
            >
              {cond}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Budget */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild data-ocid="filters.budget.select">
          <button
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all shrink-0 ${
              selectedBudget
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-gray-300"
            }`}
          >
            {budgetLabel}
            <ChevronDown className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[180px]">
          {BUDGETS.map((b) => (
            <DropdownMenuItem
              key={b.label}
              onClick={() =>
                onBudgetChange(
                  b.label === "All" ? null : { min: b.min, max: b.max },
                )
              }
              className={
                selectedBudget?.min === b.min && selectedBudget?.max === b.max
                  ? "font-semibold"
                  : ""
              }
            >
              {b.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sort By */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild data-ocid="filters.sort.select">
          <button
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all shrink-0 ${
              selectedSort !== "newest"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-gray-300"
            }`}
          >
            {sortLabel}
            <ChevronDown className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[200px]">
          {SORT_OPTIONS.map((opt) => (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => onSortChange(opt.value)}
              className={selectedSort === opt.value ? "font-semibold" : ""}
            >
              {opt.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear all filters */}
      {hasActiveFilter && (
        <button
          type="button"
          onClick={() => {
            onBrandChange(null);
            onConditionChange(null);
            onBudgetChange(null);
            onSortChange("newest");
          }}
          className="px-3 py-1.5 rounded-full text-xs font-medium border border-destructive/40 text-destructive hover:bg-destructive/5 transition-all shrink-0"
          data-ocid="filters.cancel_button"
        >
          Clear
        </button>
      )}
    </div>
  );
}
