import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, ChevronDown, Search } from "lucide-react";
import { useRef, useState } from "react";
import { ListingCategory } from "../hooks/useQueries";

const MODELS: Record<string, string[]> = {
  [ListingCategory.phones]: [
    "iPhone 16 Pro Max",
    "iPhone 16 Pro",
    "iPhone 16 Plus",
    "iPhone 16",
    "iPhone 15 Pro Max",
    "iPhone 15 Pro",
    "iPhone 15",
    "iPhone 14 Pro Max",
    "iPhone 14 Pro",
    "iPhone 14",
    "iPhone 13 Pro Max",
    "iPhone 13 Pro",
    "iPhone 13",
    "iPhone 12 Pro Max",
    "iPhone 12 Pro",
    "iPhone 12",
    "iPhone SE (3rd Gen)",
    "Samsung Galaxy S25 Ultra",
    "Samsung Galaxy S25+",
    "Samsung Galaxy S25",
    "Samsung Galaxy S24 FE",
    "Samsung Galaxy S24 Ultra",
    "Samsung Galaxy S24+",
    "Samsung Galaxy S24",
    "Samsung Galaxy Z Fold 6",
    "Samsung Galaxy Z Flip 6",
    "OnePlus 13",
    "OnePlus 12",
    "OnePlus 12R",
    "OnePlus Nord 4",
    "OnePlus Nord CE 4",
    "Google Pixel 9 Pro XL",
    "Google Pixel 9 Pro",
    "Google Pixel 9",
    "Google Pixel 8a",
    "Xiaomi 15 Ultra",
    "Xiaomi 15 Pro",
    "Xiaomi 14 Ultra",
    "Xiaomi 14 CIVI",
    "POCO X7 Pro",
    "POCO F7 Pro",
    "POCO M7 Pro",
    "Realme GT 7 Pro",
    "Realme 14 Pro+",
    "Realme Narzo 70 Pro",
    "Vivo X200 Pro",
    "Vivo V40 Pro",
    "Vivo T3 Ultra",
    "OPPO Find X8 Pro",
    "OPPO Reno 13 Pro",
    "Nothing Phone (3)",
    "Nothing Phone (2a) Plus",
    "Motorola Edge 50 Ultra",
    "Motorola Edge 50 Pro",
    "Motorola G85",
  ],
  [ListingCategory.macbooks]: [
    'MacBook Air 13" M4',
    'MacBook Air 15" M4',
    'MacBook Air 13" M3',
    'MacBook Air 15" M3',
    'MacBook Air 13" M2',
    'MacBook Air 15" M2',
    'MacBook Pro 14" M4 Pro',
    'MacBook Pro 14" M4 Max',
    'MacBook Pro 16" M4 Pro',
    'MacBook Pro 16" M4 Max',
    'MacBook Pro 14" M3 Pro',
    'MacBook Pro 14" M3 Max',
    'MacBook Pro 16" M3 Pro',
    'MacBook Pro 16" M3 Max',
    'MacBook Pro 13" M2',
    'MacBook Pro 14" M2 Pro',
    'MacBook Pro 16" M2 Max',
    'MacBook Pro 13" M1',
    'MacBook Air 13" M1',
  ],
  [ListingCategory.watches]: [
    "Apple Watch Series 10 (46mm)",
    "Apple Watch Series 10 (42mm)",
    "Apple Watch Ultra 2",
    "Apple Watch SE (2nd Gen)",
    "Samsung Galaxy Watch 7 (44mm)",
    "Samsung Galaxy Watch 7 (40mm)",
    "Samsung Galaxy Watch Ultra",
    "Samsung Galaxy Watch FE",
    "Garmin Fenix 8 Sapphire",
    "Garmin Forerunner 965",
    "Garmin Venu 3",
    "Fitbit Sense 2",
    "Fitbit Versa 4",
    "Noise ColorFit Ultra 3",
    "Noise ColorFit Pro 5",
    "boAt Enigma X700",
    "boAt Lunar Connect Ace",
    "Fire-Boltt Oracle",
    "Fire-Boltt Cobra",
  ],
  [ListingCategory.earphones]: [
    "AirPods Pro (2nd Gen)",
    "AirPods (4th Gen)",
    "AirPods (3rd Gen)",
    "AirPods Max (USB-C)",
    "Sony WH-1000XM5",
    "Sony WH-1000XM4",
    "Sony WF-1000XM5",
    "Sony LinkBuds S",
    "Bose QuietComfort Ultra Headphones",
    "Bose QuietComfort Earbuds II",
    "Bose Sport Earbuds",
    "Samsung Galaxy Buds3 Pro",
    "Samsung Galaxy Buds3",
    "Samsung Galaxy Buds2 Pro",
    "Nothing Ear (a)",
    "Nothing Ear (2)",
    "Nothing CMF Buds Pro 2",
    "OnePlus Buds 3",
    "OnePlus Buds Pro 2",
    "boAt Airdopes 141 ANC",
    "boAt Rockerz 550 Pro",
    "JBL Tour Pro 2",
    "JBL Tune 720BT",
    "Jabra Elite 10",
    "Jabra Evolve2 Buds",
    "Sennheiser Momentum 4 Wireless",
    "Sennheiser CX True Wireless",
  ],
};

interface Props {
  category: string;
  value: string;
  onChange: (model: string) => void;
}

export default function ModelCombobox({ category, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const models = MODELS[category] ?? [];
  const filtered = search
    ? models.filter((m) => m.toLowerCase().includes(search.toLowerCase()))
    : models;

  const handleSelect = (model: string) => {
    onChange(model);
    setOpen(false);
    setSearch("");
  };

  const toggleOpen = () => {
    setOpen((o) => !o);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  if (models.length === 0) return null;

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        className="w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-normal"
        onClick={toggleOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") toggleOpen();
        }}
        data-ocid="post.select"
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {value || "Select model"}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-popover shadow-lg">
          <div className="flex items-center gap-2 p-2 border-b border-border">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search models..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
              data-ocid="post.search_input"
            />
          </div>
          <ScrollArea className="max-h-56">
            <div className="p-1">
              {filtered.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No models found
                </p>
              )}
              {filtered.map((model) => (
                <button
                  key={model}
                  type="button"
                  onClick={() => handleSelect(model)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left hover:bg-muted transition-colors"
                >
                  <Check
                    className={`h-4 w-4 shrink-0 ${
                      model === value ? "text-primary" : "opacity-0"
                    }`}
                  />
                  {model}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Backdrop */}
      {open && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop for closing dropdown
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
