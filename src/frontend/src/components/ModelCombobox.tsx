import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, ChevronDown, Search } from "lucide-react";
import { useRef, useState } from "react";
import { ListingCategory } from "../hooks/useQueries";

interface BrandGroup {
  brand: string;
  models: string[];
}

const GROUPED_MODELS: Record<string, BrandGroup[]> = {
  [ListingCategory.phones]: [
    {
      brand: "Apple",
      models: [
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
        "iPhone SE (2nd Gen)",
      ],
    },
    {
      brand: "Samsung Galaxy (Flagship)",
      models: [
        "Galaxy S25 Ultra",
        "Galaxy S25+",
        "Galaxy S25",
        "Galaxy S24 FE",
        "Galaxy S24 Ultra",
        "Galaxy S24+",
        "Galaxy S24",
        "Galaxy Z Fold 6",
        "Galaxy Z Flip 6",
        "Galaxy Z Fold 5",
        "Galaxy Z Flip 5",
      ],
    },
    {
      brand: "Samsung Galaxy (Mid-Range)",
      models: [
        "Galaxy A56",
        "Galaxy A36",
        "Galaxy A16",
        "Galaxy A55",
        "Galaxy A35",
        "Galaxy A15",
        "Galaxy M55",
        "Galaxy M35",
        "Galaxy M15",
      ],
    },
    {
      brand: "OnePlus",
      models: [
        "OnePlus 13",
        "OnePlus 12",
        "OnePlus 12R",
        "OnePlus Open",
        "OnePlus Nord 4",
        "OnePlus Nord CE 4",
        "OnePlus Nord 3",
        "OnePlus Nord CE 3",
      ],
    },
    {
      brand: "Google Pixel",
      models: [
        "Pixel 9 Pro XL",
        "Pixel 9 Pro Fold",
        "Pixel 9 Pro",
        "Pixel 9",
        "Pixel 8a",
        "Pixel 8 Pro",
        "Pixel 8",
      ],
    },
    {
      brand: "Xiaomi",
      models: [
        "Xiaomi 15 Ultra",
        "Xiaomi 15 Pro",
        "Xiaomi 15",
        "Xiaomi 14 Ultra",
        "Xiaomi 14 CIVI",
        "Xiaomi 14",
      ],
    },
    {
      brand: "Redmi",
      models: [
        "Redmi Note 14 Pro+",
        "Redmi Note 14 Pro",
        "Redmi Note 14",
        "Redmi Note 13 Pro+",
        "Redmi Note 13 Pro",
        "Redmi Note 13",
        "Redmi 14C",
        "Redmi 13C",
        "Redmi A3",
      ],
    },
    {
      brand: "POCO",
      models: [
        "POCO X7 Pro",
        "POCO X7",
        "POCO F7 Pro",
        "POCO F7",
        "POCO M7 Pro",
        "POCO M7",
      ],
    },
    {
      brand: "iQOO",
      models: [
        "iQOO 13",
        "iQOO 12",
        "iQOO Neo 10R",
        "iQOO Neo 9 Pro",
        "iQOO Z9 Turbo+",
        "iQOO Z9s Pro",
      ],
    },
    {
      brand: "Realme",
      models: [
        "Realme GT 7 Pro",
        "Realme GT 6",
        "Realme 14 Pro+",
        "Realme 14 Pro",
        "Realme Narzo 70 Pro",
        "Realme Narzo 70",
        "Realme C75",
        "Realme C65",
      ],
    },
    {
      brand: "Vivo",
      models: [
        "Vivo X200 Pro",
        "Vivo X200",
        "Vivo V40 Pro",
        "Vivo V40",
        "Vivo T3 Ultra",
        "Vivo T3 Pro",
      ],
    },
    {
      brand: "OPPO",
      models: [
        "OPPO Find X8 Pro",
        "OPPO Find X8",
        "OPPO Reno 13 Pro",
        "OPPO Reno 13",
        "OPPO F27 Pro",
        "OPPO A3 Pro",
      ],
    },
    {
      brand: "Nothing",
      models: [
        "Nothing Phone (3)",
        "Nothing Phone (2)",
        "Nothing Phone (2a) Plus",
        "Nothing Phone (2a)",
      ],
    },
    {
      brand: "Motorola",
      models: [
        "Motorola Edge 50 Ultra",
        "Motorola Edge 50 Pro",
        "Motorola Edge 50 Fusion",
        "Motorola G85",
        "Motorola G75",
        "Motorola G64",
        "Motorola G54",
      ],
    },
    {
      brand: "Infinix",
      models: [
        "Infinix Zero 40",
        "Infinix Note 40 Pro",
        "Infinix Note 40",
        "Infinix Hot 50 Pro",
        "Infinix Hot 50",
        "Infinix Smart 9",
      ],
    },
    {
      brand: "Tecno",
      models: [
        "Tecno Phantom V Fold 2",
        "Tecno Camon 30 Premier",
        "Tecno Camon 30 Pro",
        "Tecno Spark 30 Pro",
        "Tecno Spark 30",
      ],
    },
    {
      brand: "Nokia",
      models: ["Nokia X30", "Nokia G42", "Nokia C32", "Nokia 105 (4G)"],
    },
    {
      brand: "Sony Xperia",
      models: ["Xperia 1 VI", "Xperia 5 VI", "Xperia 10 VI"],
    },
    {
      brand: "Honor",
      models: [
        "Honor 200 Pro",
        "Honor 200",
        "Honor X9b",
        "Honor X8b",
        "Honor 90",
      ],
    },
  ],

  [ListingCategory.macbooks]: [
    {
      brand: "Apple",
      models: [
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
    },
  ],

  [ListingCategory.watches]: [
    {
      brand: "Apple Watch",
      models: [
        "Apple Watch Series 10 (46mm)",
        "Apple Watch Series 10 (42mm)",
        "Apple Watch Ultra 2",
        "Apple Watch SE (2nd Gen)",
        "Apple Watch Series 9 (45mm)",
        "Apple Watch Series 9 (41mm)",
      ],
    },
    {
      brand: "Samsung Galaxy Watch",
      models: [
        "Galaxy Watch 7 (44mm)",
        "Galaxy Watch 7 (40mm)",
        "Galaxy Watch Ultra",
        "Galaxy Watch FE",
        "Galaxy Watch 6 Classic (47mm)",
        "Galaxy Watch 6 (44mm)",
      ],
    },
    {
      brand: "Garmin",
      models: [
        "Garmin Fenix 8 Sapphire",
        "Garmin Fenix 8",
        "Garmin Forerunner 965",
        "Garmin Venu 3",
        "Garmin Vivoactive 5",
        "Garmin Instinct 2X Solar",
      ],
    },
    {
      brand: "Amazfit",
      models: [
        "Amazfit GTR 4",
        "Amazfit GTS 4",
        "Amazfit T-Rex Ultra",
        "Amazfit Falcon",
        "Amazfit Bip 5",
        "Amazfit Pop 3R",
      ],
    },
    {
      brand: "Noise",
      models: [
        "Noise ColorFit Ultra 3",
        "Noise ColorFit Pro 5",
        "Noise ColorFit Brio",
        "Noise Icon Buzz",
        "Noise Twist Round",
      ],
    },
    {
      brand: "boAt",
      models: [
        "boAt Enigma X700",
        "boAt Lunar Connect Ace",
        "boAt Matrix Display",
        "boAt Storm Call 3",
        "boAt Xtend Pro",
      ],
    },
    {
      brand: "Fire-Boltt",
      models: [
        "Fire-Boltt Oracle",
        "Fire-Boltt Cobra",
        "Fire-Boltt Rage",
        "Fire-Boltt Dagger",
        "Fire-Boltt Phoenix R",
      ],
    },
    {
      brand: "Titan",
      models: ["Titan Smart 2", "Titan Talk 2", "Titan Connected Pro"],
    },
    {
      brand: "Fitbit",
      models: ["Fitbit Sense 2", "Fitbit Versa 4", "Fitbit Charge 6"],
    },
  ],

  [ListingCategory.earphones]: [
    {
      brand: "Apple",
      models: [
        "AirPods Pro (2nd Gen)",
        "AirPods (4th Gen)",
        "AirPods (3rd Gen)",
        "AirPods Max (USB-C)",
      ],
    },
    {
      brand: "Sony",
      models: [
        "Sony WH-1000XM5",
        "Sony WH-1000XM4",
        "Sony WF-1000XM5",
        "Sony WF-1000XM4",
        "Sony LinkBuds S",
        "Sony WI-SP510",
      ],
    },
    {
      brand: "Bose",
      models: [
        "Bose QuietComfort Ultra Headphones",
        "Bose QuietComfort 45",
        "Bose QuietComfort Earbuds II",
        "Bose Sport Earbuds",
      ],
    },
    {
      brand: "Samsung",
      models: [
        "Galaxy Buds3 Pro",
        "Galaxy Buds3",
        "Galaxy Buds2 Pro",
        "Galaxy Buds FE",
      ],
    },
    {
      brand: "Nothing",
      models: [
        "Nothing Ear (a)",
        "Nothing Ear (2)",
        "Nothing CMF Buds Pro 2",
        "Nothing CMF Buds",
      ],
    },
    {
      brand: "OnePlus",
      models: [
        "OnePlus Buds 3",
        "OnePlus Buds Pro 2",
        "OnePlus Nord Buds 3 Pro",
      ],
    },
    {
      brand: "JBL",
      models: [
        "JBL Tour Pro 2",
        "JBL Tune 770NC",
        "JBL Tune 720BT",
        "JBL Live 770NC",
      ],
    },
    {
      brand: "Jabra",
      models: ["Jabra Elite 10", "Jabra Elite 8 Active", "Jabra Evolve2 Buds"],
    },
    {
      brand: "Sennheiser",
      models: [
        "Sennheiser Momentum 4 Wireless",
        "Sennheiser Momentum True Wireless 3",
        "Sennheiser CX True Wireless",
      ],
    },
    {
      brand: "Anker Soundcore",
      models: [
        "Soundcore Liberty 4 NC",
        "Soundcore Q45",
        "Soundcore A3i",
        "Soundcore Life Q35",
        "Soundcore Space Q45",
      ],
    },
    {
      brand: "Beats",
      models: [
        "Beats Studio Pro",
        "Beats Studio Buds+",
        "Beats Fit Pro",
        "Beats Powerbeats Pro",
        "Beats Flex",
      ],
    },
    {
      brand: "boAt",
      models: [
        "boAt Airdopes 141 ANC",
        "boAt Airdopes 311 Pro",
        "boAt Rockerz 550 Pro",
        "boAt Rockerz 450 Pro",
        "boAt Bassheads 900",
      ],
    },
    {
      brand: "pTron",
      models: ["pTron Bassbuds Eon", "pTron Bassbuds Duo", "pTron Tangent Evo"],
    },
    {
      brand: "Mivi",
      models: ["Mivi DuoPods A350", "Mivi DuoPods M80", "Mivi Collar 2H"],
    },
    {
      brand: "Skullcandy",
      models: [
        "Skullcandy Crusher ANC 2",
        "Skullcandy Push Active",
        "Skullcandy Indy Fuel",
      ],
    },
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

  const groups: BrandGroup[] = GROUPED_MODELS[category] ?? [];

  const filteredGroups = search
    ? groups
        .map((g) => ({
          ...g,
          models: g.models.filter(
            (m) =>
              m.toLowerCase().includes(search.toLowerCase()) ||
              g.brand.toLowerCase().includes(search.toLowerCase()),
          ),
        }))
        .filter((g) => g.models.length > 0)
    : groups;

  const handleSelect = (brand: string, model: string) => {
    // For Apple models that already start with brand name
    const isBrandInModel = model
      .toLowerCase()
      .startsWith(brand.toLowerCase().split(" ")[0].toLowerCase());
    const fullValue = isBrandInModel ? model : `${brand} ${model}`;
    onChange(fullValue);
    setOpen(false);
    setSearch("");
  };

  const toggleOpen = () => {
    setOpen((o) => !o);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  if (groups.length === 0) return null;

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        className="w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-normal hover:border-primary/50 transition-colors"
        onClick={toggleOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") toggleOpen();
        }}
        data-ocid="post.select"
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {value || "Select brand & model"}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-popover shadow-card-glass">
          <div className="flex items-center gap-2 p-2 border-b border-border">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search brands or models..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
              data-ocid="post.search_input"
            />
          </div>
          <ScrollArea className="max-h-64">
            <div className="p-1">
              {filteredGroups.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No models found
                </p>
              )}
              {filteredGroups.map((group) => (
                <div key={group.brand}>
                  {/* Brand header */}
                  <div className="px-3 py-1.5 mt-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {group.brand}
                    </span>
                  </div>
                  {/* Models */}
                  {group.models.map((model) => {
                    const isBrandInModel = model
                      .toLowerCase()
                      .startsWith(
                        group.brand.toLowerCase().split(" ")[0].toLowerCase(),
                      );
                    const fullValue = isBrandInModel
                      ? model
                      : `${group.brand} ${model}`;
                    const isSelected = value === fullValue;
                    return (
                      <button
                        key={`${group.brand}-${model}`}
                        type="button"
                        onClick={() => handleSelect(group.brand, model)}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-left hover:bg-accent transition-colors ${
                          isSelected ? "bg-primary/10" : ""
                        }`}
                      >
                        <Check
                          className={`h-3.5 w-3.5 shrink-0 ${
                            isSelected ? "text-primary" : "opacity-0"
                          }`}
                        />
                        <span className="flex-1 truncate text-foreground">
                          {model}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 border-primary/30 text-primary/70 hidden sm:inline-flex shrink-0"
                        >
                          {group.brand.split(" ")[0]}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
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
