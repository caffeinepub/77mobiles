import { PickupBookingStatus } from "@/backend";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  ArrowLeft,
  ArrowRight,
  CalendarIcon,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  PackageCheck,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useSubmitPickupBooking } from "../hooks/useQueries";

// ─── Data ──────────────────────────────────────────────────────────────────

const _BRAND_MODELS: Record<string, string[]> = {
  Apple: [
    "iPhone 16 Pro Max",
    "iPhone 16 Pro",
    "iPhone 16 Plus",
    "iPhone 16",
    "iPhone 15 Pro Max",
    "iPhone 15 Pro",
    "iPhone 15 Plus",
    "iPhone 15",
    "iPhone 14 Pro Max",
    "iPhone 14 Pro",
    "iPhone 14 Plus",
    "iPhone 14",
    "iPhone 13 Pro Max",
    "iPhone 13 Pro",
    "iPhone 13",
    "iPhone 13 mini",
    "iPhone 12 Pro Max",
    "iPhone 12 Pro",
    "iPhone 12",
    "iPhone SE (3rd Gen)",
  ],
  "Samsung Galaxy (Flagship)": [
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
  "Samsung Galaxy (Mid-Range)": [
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
  OnePlus: [
    "OnePlus 13",
    "OnePlus 12",
    "OnePlus 12R",
    "OnePlus Open",
    "OnePlus Nord 4",
    "OnePlus Nord CE 4",
    "OnePlus Nord 3",
    "OnePlus Nord CE 3",
  ],
  "Google Pixel": [
    "Pixel 9 Pro XL",
    "Pixel 9 Pro Fold",
    "Pixel 9 Pro",
    "Pixel 9",
    "Pixel 8a",
    "Pixel 8 Pro",
    "Pixel 8",
  ],
  Xiaomi: [
    "Xiaomi 15 Ultra",
    "Xiaomi 15 Pro",
    "Xiaomi 15",
    "Xiaomi 14 Ultra",
    "Xiaomi 14 CIVI",
    "Xiaomi 14",
  ],
  Redmi: [
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
  POCO: [
    "POCO X7 Pro",
    "POCO X7",
    "POCO F7 Pro",
    "POCO F7",
    "POCO M7 Pro",
    "POCO M7",
  ],
  iQOO: [
    "iQOO 13",
    "iQOO 12",
    "iQOO Neo 10R",
    "iQOO Neo 9 Pro",
    "iQOO Z9 Turbo+",
    "iQOO Z9s Pro",
  ],
  Realme: [
    "Realme GT 7 Pro",
    "Realme GT 6",
    "Realme 14 Pro+",
    "Realme 14 Pro",
    "Realme Narzo 70 Pro",
    "Realme Narzo 70",
    "Realme C75",
    "Realme C65",
  ],
  Vivo: [
    "Vivo X200 Pro",
    "Vivo X200",
    "Vivo V40 Pro",
    "Vivo V40",
    "Vivo T3 Ultra",
    "Vivo T3 Pro",
  ],
  OPPO: [
    "OPPO Find X8 Pro",
    "OPPO Find X8",
    "OPPO Reno 13 Pro",
    "OPPO Reno 13",
    "OPPO F27 Pro",
    "OPPO A3 Pro",
  ],
  Nothing: [
    "Nothing Phone (3)",
    "Nothing Phone (2)",
    "Nothing Phone (2a) Plus",
    "Nothing Phone (2a)",
  ],
  Motorola: [
    "Motorola Edge 50 Ultra",
    "Motorola Edge 50 Pro",
    "Motorola Edge 50 Fusion",
    "Motorola G85",
    "Motorola G75",
    "Motorola G64",
    "Motorola G54",
  ],
  Infinix: [
    "Infinix Zero 40 5G",
    "Infinix Note 40 Pro",
    "Infinix Note 40",
    "Infinix Hot 50 Pro",
    "Infinix Hot 50",
    "Infinix Smart 9",
  ],
  Tecno: [
    "Tecno Phantom V Fold 2",
    "Tecno Camon 30 Premier",
    "Tecno Camon 30 Pro",
    "Tecno Spark 30 Pro",
    "Tecno Spark 30",
  ],
  Nokia: ["Nokia X30", "Nokia G42", "Nokia C32", "Nokia 105 (4G)"],
  "Sony Xperia": ["Xperia 1 VI", "Xperia 5 VI", "Xperia 10 VI"],
  Honor: ["Honor 200 Pro", "Honor 200", "Honor X9b", "Honor X8b", "Honor 90"],
  MacBook: [
    'MacBook Air 13" M4',
    'MacBook Air 15" M4',
    'MacBook Air 13" M3',
    'MacBook Air 15" M3',
    'MacBook Air 13" M2',
    'MacBook Pro 14" M4 Pro',
    'MacBook Pro 16" M4 Pro',
    'MacBook Pro 14" M3 Pro',
    'MacBook Pro 16" M3 Pro',
    'MacBook Pro 13" M2',
  ],
  "Apple Watch": [
    "Apple Watch Series 10 (46mm)",
    "Apple Watch Series 10 (42mm)",
    "Apple Watch Ultra 2",
    "Apple Watch SE (2nd Gen)",
    "Apple Watch Series 9 (45mm)",
    "Apple Watch Series 9 (41mm)",
  ],
  "Samsung Galaxy Watch": [
    "Galaxy Watch 7 (44mm)",
    "Galaxy Watch 7 (40mm)",
    "Galaxy Watch Ultra",
    "Galaxy Watch FE",
    "Galaxy Watch 6 Classic (47mm)",
    "Galaxy Watch 6 (44mm)",
  ],
  Amazfit: [
    "Amazfit GTR 4",
    "Amazfit GTS 4",
    "Amazfit T-Rex Ultra",
    "Amazfit Falcon",
    "Amazfit Bip 5",
  ],
  boAt: [
    "boAt Airdopes 141 ANC",
    "boAt Airdopes 311 Pro",
    "boAt Rockerz 550 Pro",
    "boAt Rockerz 450 Pro",
  ],
  Sony: [
    "Sony WH-1000XM5",
    "Sony WH-1000XM4",
    "Sony WF-1000XM5",
    "Sony WF-1000XM4",
    "Sony LinkBuds S",
  ],
  Bose: [
    "Bose QuietComfort Ultra Headphones",
    "Bose QuietComfort 45",
    "Bose QuietComfort Earbuds II",
    "Bose Sport Earbuds",
  ],
  JBL: ["JBL Tour Pro 2", "JBL Tune 770NC", "JBL Tune 720BT", "JBL Live 770NC"],
  Beats: [
    "Beats Studio Pro",
    "Beats Studio Buds+",
    "Beats Fit Pro",
    "Beats Powerbeats Pro",
  ],
  "Anker Soundcore": [
    "Soundcore Liberty 4 NC",
    "Soundcore Q45",
    "Soundcore A3i",
    "Soundcore Space Q45",
  ],
  Skullcandy: [
    "Skullcandy Crusher ANC 2",
    "Skullcandy Push Active",
    "Skullcandy Indy Fuel",
  ],
};

const BASE_PRICES: Record<string, number> = {
  Apple: 35000,
  "Samsung Galaxy (Flagship)": 28000,
  "Samsung Galaxy (Mid-Range)": 16000,
  OnePlus: 18000,
  "Google Pixel": 25000,
  Xiaomi: 14000,
  Redmi: 10000,
  POCO: 12000,
  iQOO: 16000,
  Realme: 10000,
  Vivo: 11000,
  OPPO: 11000,
  Nothing: 18000,
  Motorola: 12000,
  Infinix: 8000,
  Tecno: 8000,
  Nokia: 7000,
  "Sony Xperia": 22000,
  Honor: 12000,
  MacBook: 55000,
  "Apple Watch": 22000,
  "Samsung Galaxy Watch": 15000,
  Amazfit: 8000,
  boAt: 3000,
  Sony: 12000,
  Bose: 15000,
  JBL: 5000,
  Beats: 8000,
  "Anker Soundcore": 4000,
  Skullcandy: 3000,
};

const PHYSICAL_CONDITIONS = [
  { id: "flawless", label: "Flawless", desc: "No marks at all", deduct: 0 },
  {
    id: "light",
    label: "Light Scratches",
    desc: "Minor surface scratches",
    deduct: 5,
  },
  {
    id: "moderate",
    label: "Moderate Scratches",
    desc: "Visible scratches/scuffs",
    deduct: 12,
  },
  {
    id: "heavy",
    label: "Heavy Dents",
    desc: "Cracks, major dents",
    deduct: 25,
  },
];

const HARDWARE_FAULTS = [
  { id: "camera", label: "Camera issues", amount: 1500 },
  { id: "buttons", label: "Button issues (home/power/volume)", amount: 1000 },
  { id: "speaker", label: "Speaker/microphone issues", amount: 800 },
  { id: "none", label: "None of the above", amount: 0 },
];

const TIME_SLOTS = [
  { value: "morning", label: "Morning 9am – 12pm" },
  { value: "afternoon", label: "Afternoon 12pm – 3pm" },
  { value: "evening", label: "Evening 3pm – 7pm" },
];

// ─── Types ─────────────────────────────────────────────────────────────────

interface DiagnosticState {
  powersOn: boolean | null;
  makeCalls: boolean | null;
  screenOk: boolean | null;
  physicalCondition: string;
  hardwareFaults: string[];
  subStep: 0 | 1 | 2;
}

interface PickupDetails {
  name: string;
  phone: string;
  address: string;
  date: Date | undefined;
  timeSlot: string;
}

// ─── Price Calculator ──────────────────────────────────────────────────────

function calculateQuote(
  brand: string,
  diag: DiagnosticState,
): { final: number; deductions: { label: string; amount: number }[] } {
  const base = BASE_PRICES[brand] ?? 15000;
  const deductions: { label: string; amount: number }[] = [];

  if (diag.powersOn === false) {
    deductions.push({
      label: "Device doesn't power on",
      amount: Math.round(base * 0.7),
    });
  }
  if (diag.makeCalls === false) {
    deductions.push({
      label: "Can't make/receive calls",
      amount: Math.round(base * 0.15),
    });
  }
  if (diag.screenOk === false) {
    deductions.push({
      label: "Screen not functional",
      amount: Math.round(base * 0.2),
    });
  }

  const cond = PHYSICAL_CONDITIONS.find((c) => c.id === diag.physicalCondition);
  if (cond && cond.deduct > 0) {
    deductions.push({
      label: `Physical: ${cond.label}`,
      amount: Math.round(base * (cond.deduct / 100)),
    });
  }

  for (const fid of diag.hardwareFaults.filter((f) => f !== "none")) {
    const fault = HARDWARE_FAULTS.find((f) => f.id === fid);
    if (fault) deductions.push({ label: fault.label, amount: fault.amount });
  }

  const totalDeduct = deductions.reduce((sum, d) => sum + d.amount, 0);
  const final = Math.max(500, base - totalDeduct);
  return { final, deductions };
}

function inr(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

// ─── Sub-components ────────────────────────────────────────────────────────

function StepBar({ step }: { step: number }) {
  const steps = ["Brand", "Model", "Diagnostics", "Quote", "Pickup"];
  return (
    <div className="flex items-center gap-0 mb-8" data-ocid="instant_buy.tab">
      {steps.map((label, i) => {
        const idx = i + 1;
        const active = step === idx;
        const done = step > idx;
        return (
          <div key={label} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  active
                    ? "bg-purple-500 text-white shadow-md shadow-purple-200"
                    : done
                      ? "bg-purple-100 text-purple-600 border-2 border-purple-300"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={`text-[10px] mt-1 font-medium hidden sm:block ${
                  active
                    ? "text-purple-600"
                    : done
                      ? "text-purple-400"
                      : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-1 rounded-full transition-colors ${
                  step > idx ? "bg-purple-300" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function YesNoToggle({
  value,
  onChange,
  ocid,
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
  ocid: string;
}) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onChange(true)}
        data-ocid={`${ocid}.yes`}
        className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
          value === true
            ? "bg-green-500 border-green-500 text-white"
            : "bg-white border-gray-200 text-gray-600 hover:border-green-300"
        }`}
      >
        ✓ Yes
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        data-ocid={`${ocid}.no`}
        className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
          value === false
            ? "bg-red-500 border-red-500 text-white"
            : "bg-white border-gray-200 text-gray-600 hover:border-red-300"
        }`}
      >
        ✗ No
      </button>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

const POPULAR_BRANDS = [
  "Apple",
  "Samsung Galaxy (Flagship)",
  "OnePlus",
  "Google Pixel",
  "Xiaomi",
];

export default function InstantBuyPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [diag, setDiag] = useState<DiagnosticState>({
    powersOn: null,
    makeCalls: null,
    screenOk: null,
    physicalCondition: "",
    hardwareFaults: [],
    subStep: 0,
  });
  const [pickup, setPickup] = useState<PickupDetails>({
    name: "",
    phone: "",
    address: "",
    date: undefined,
    timeSlot: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [showDeductions, setShowDeductions] = useState(false);

  const { mutate: submitBooking, isPending: isSubmitting } =
    useSubmitPickupBooking();

  const quote =
    step >= 4
      ? calculateQuote(selectedBrand || "Samsung Galaxy (Flagship)", diag)
      : null;

  const canAdvanceDiag = () => {
    if (diag.subStep === 0)
      return (
        diag.powersOn !== null &&
        diag.makeCalls !== null &&
        diag.screenOk !== null
      );
    if (diag.subStep === 1) return diag.physicalCondition !== "";
    if (diag.subStep === 2) return diag.hardwareFaults.length > 0;
    return false;
  };

  const toggleFault = (id: string) => {
    setDiag((prev) => {
      if (id === "none") {
        return {
          ...prev,
          hardwareFaults: prev.hardwareFaults.includes("none") ? [] : ["none"],
        };
      }
      const next = prev.hardwareFaults.filter((f) => f !== "none");
      if (next.includes(id))
        return { ...prev, hardwareFaults: next.filter((f) => f !== id) };
      return { ...prev, hardwareFaults: [...next, id] };
    });
  };

  const handleConfirmPickup = () => {
    if (!quote || !pickup.date) return;
    submitBooking(
      {
        id: "",
        status: PickupBookingStatus.pending,
        sellerName: pickup.name,
        phone: pickup.phone,
        address: pickup.address,
        date: format(pickup.date, "yyyy-MM-dd"),
        timeSlot: pickup.timeSlot,
        deviceModel:
          selectedModel || selectedBrand || "Samsung Galaxy (Flagship)",
        quotedPrice: BigInt(quote.final),
        timestamp: 0n,
      },
      {
        onSuccess: (id) => {
          setBookingId(id);
          setSubmitted(true);
        },
        onError: () => {
          toast.error("Failed to submit booking. Please try again.");
        },
      },
    );
  };

  const diagSubStepLabels = [
    "Functional Status",
    "Physical Condition",
    "Hardware Faults",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/60 to-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <AnimatePresence mode="wait">
          {/* ── Step 1: Brand Selection ───────────────────────────────── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <StepBar step={1} />
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-display font-bold text-2xl mb-1">
                  Select your brand
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Which brand is your device?
                </p>

                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-3">
                  Popular
                </p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {POPULAR_BRANDS.map((brand) => (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => {
                        setSelectedBrand(brand);
                        setStep(2);
                      }}
                      className="flex items-center gap-3 p-3 rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all text-left"
                      data-ocid="instant_buy.primary_button"
                    >
                      <div className="h-9 w-9 rounded-full bg-purple-100 flex items-center justify-center text-lg shrink-0">
                        {brand === "Apple"
                          ? "🍎"
                          : brand === "Samsung Galaxy (Flagship)"
                            ? "📱"
                            : brand === "OnePlus"
                              ? "🔴"
                              : brand === "Google Pixel"
                                ? "🔍"
                                : "📲"}
                      </div>
                      <span className="text-sm font-semibold leading-tight">
                        {brand}
                      </span>
                    </button>
                  ))}
                </div>

                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  All Brands
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(_BRAND_MODELS)
                    .filter((b) => !POPULAR_BRANDS.includes(b))
                    .map((brand) => (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => {
                          setSelectedBrand(brand);
                          setStep(2);
                        }}
                        className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all text-left text-sm font-medium"
                      >
                        📱 {brand}
                      </button>
                    ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Model Selection ────────────────────────────────── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <StepBar step={2} />
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 text-purple-600 text-sm font-medium mb-4 hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to brands
                </button>
                <h2 className="font-display font-bold text-2xl mb-1">
                  Select your model
                </h2>
                <p className="text-sm text-muted-foreground mb-5">
                  {selectedBrand} — choose your exact model
                </p>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {(_BRAND_MODELS[selectedBrand] ?? []).map((model) => (
                    <button
                      key={model}
                      type="button"
                      onClick={() => {
                        setSelectedModel(model);
                        setStep(3);
                      }}
                      className="w-full flex items-center justify-between p-3.5 rounded-xl border border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all text-left"
                      data-ocid="instant_buy.secondary_button"
                    >
                      <span className="text-sm font-medium">{model}</span>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Diagnostics ────────────────────────────────────── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <StepBar step={3} />

              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-1 text-purple-600 text-sm font-medium mb-4 hover:underline"
              >
                <ArrowLeft className="h-4 w-4" /> Back to model
              </button>

              <div className="flex gap-2 mb-6">
                {diagSubStepLabels.map((label, i) => (
                  <div key={label} className="flex-1">
                    <div
                      className={`h-1 rounded-full transition-all ${
                        diag.subStep > i
                          ? "bg-purple-500"
                          : diag.subStep === i
                            ? "bg-purple-400"
                            : "bg-gray-200"
                      }`}
                    />
                    <p
                      className={`text-[10px] mt-1 font-medium ${
                        diag.subStep === i ? "text-purple-600" : "text-gray-400"
                      }`}
                    >
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {diag.subStep === 0 && (
                  <motion.div
                    key="diag0"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.25 }}
                  >
                    <h2 className="font-display font-bold text-xl mb-4">
                      Functional Status
                    </h2>
                    <div className="space-y-4">
                      <div className="bg-white rounded-2xl border border-gray-100 p-4">
                        <p className="font-medium mb-2">
                          Does the device power on?
                        </p>
                        <YesNoToggle
                          value={diag.powersOn}
                          onChange={(v) =>
                            setDiag((d) => ({ ...d, powersOn: v }))
                          }
                          ocid="instant_buy.poweron"
                        />
                      </div>
                      <div className="bg-white rounded-2xl border border-gray-100 p-4">
                        <p className="font-medium mb-2">
                          Can it make/receive calls?
                        </p>
                        <YesNoToggle
                          value={diag.makeCalls}
                          onChange={(v) =>
                            setDiag((d) => ({ ...d, makeCalls: v }))
                          }
                          ocid="instant_buy.calls"
                        />
                      </div>
                      <div className="bg-white rounded-2xl border border-gray-100 p-4">
                        <p className="font-medium mb-2">
                          Is the screen fully functional?
                        </p>
                        <YesNoToggle
                          value={diag.screenOk}
                          onChange={(v) =>
                            setDiag((d) => ({ ...d, screenOk: v }))
                          }
                          ocid="instant_buy.screen"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {diag.subStep === 1 && (
                  <motion.div
                    key="diag1"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.25 }}
                  >
                    <h2 className="font-display font-bold text-xl mb-4">
                      Physical Condition
                    </h2>
                    <div className="space-y-2">
                      {PHYSICAL_CONDITIONS.map((cond, i) => (
                        <button
                          key={cond.id}
                          type="button"
                          onClick={() =>
                            setDiag((d) => ({
                              ...d,
                              physicalCondition: cond.id,
                            }))
                          }
                          data-ocid={`instant_buy.item.${i + 1}`}
                          className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 text-left transition-all ${
                            diag.physicalCondition === cond.id
                              ? "border-purple-500 bg-purple-50"
                              : "border-gray-200 bg-white hover:border-purple-200"
                          }`}
                        >
                          <div>
                            <p className="font-semibold text-sm">
                              {cond.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {cond.desc}
                            </p>
                          </div>
                          {cond.deduct > 0 ? (
                            <span className="text-xs text-red-500 font-semibold">
                              -{cond.deduct}%
                            </span>
                          ) : (
                            <span className="text-xs text-green-600 font-semibold">
                              No deduction
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {diag.subStep === 2 && (
                  <motion.div
                    key="diag2"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.25 }}
                  >
                    <h2 className="font-display font-bold text-xl mb-4">
                      Hardware Faults
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select all that apply
                    </p>
                    <div className="space-y-2">
                      {HARDWARE_FAULTS.map((fault, i) => (
                        <label
                          key={fault.id}
                          htmlFor={`fault-${fault.id}`}
                          data-ocid={`instant_buy.checkbox.${i + 1}`}
                          className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            diag.hardwareFaults.includes(fault.id)
                              ? "border-purple-500 bg-purple-50"
                              : "border-gray-200 bg-white hover:border-purple-200"
                          }`}
                        >
                          <Checkbox
                            id={`fault-${fault.id}`}
                            checked={diag.hardwareFaults.includes(fault.id)}
                            onCheckedChange={() => toggleFault(fault.id)}
                            className="data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                          />
                          <span className="flex-1 text-sm font-medium">
                            {fault.label}
                          </span>
                          {fault.amount > 0 && (
                            <span className="text-xs text-red-500 font-semibold">
                              -{inr(fault.amount)}
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between mt-6">
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (diag.subStep === 0) navigate({ to: "/" });
                    else
                      setDiag((d) => ({
                        ...d,
                        subStep: (d.subStep - 1) as 0 | 1 | 2,
                      }));
                  }}
                  className="rounded-2xl"
                  data-ocid="instant_buy.cancel_button"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <Button
                  onClick={() => {
                    if (diag.subStep < 2) {
                      setDiag((d) => ({
                        ...d,
                        subStep: (d.subStep + 1) as 0 | 1 | 2,
                      }));
                    } else {
                      setStep(4);
                    }
                  }}
                  disabled={!canAdvanceDiag()}
                  className="bg-purple-500 hover:bg-purple-600 text-white rounded-2xl px-8"
                  data-ocid="instant_buy.submit_button"
                >
                  {diag.subStep < 2 ? "Next" : "See My Quote"}{" "}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── Step 4: Quote ──────────────────────────────────────────── */}
          {step === 4 && quote && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35 }}
            >
              <StepBar step={4} />

              <div className="bg-white border-2 border-green-200 rounded-3xl p-7 text-center mb-5 shadow-sm shadow-green-50">
                <p className="text-sm text-muted-foreground mb-1">
                  Your Instant Offer
                </p>
                <p
                  className="font-display font-bold text-5xl text-green-600 mb-2"
                  data-ocid="instant_buy.success_state"
                >
                  {inr(quote.final)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Payment within 30 mins of pickup
                </p>
              </div>

              {quote.deductions.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 mb-5 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowDeductions((s) => !s)}
                    className="flex items-center justify-between w-full p-4 text-sm font-medium text-muted-foreground hover:text-foreground"
                    data-ocid="instant_buy.toggle"
                  >
                    Price breakdown
                    {showDeductions ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  {showDeductions && (
                    <div className="px-4 pb-4 space-y-2 border-t border-gray-100 pt-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Base price
                        </span>
                        <span className="font-medium">
                          {inr(BASE_PRICES[selectedBrand] ?? 15000)}
                        </span>
                      </div>
                      {quote.deductions.map((d) => (
                        <div
                          key={d.label}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-muted-foreground">
                            {d.label}
                          </span>
                          <span className="text-red-500 font-medium">
                            -{inr(d.amount)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-2">
                        <span>Final Offer</span>
                        <span className="text-green-600">
                          {inr(quote.final)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button
                  size="lg"
                  onClick={() => setStep(5)}
                  className="bg-purple-500 hover:bg-purple-600 text-white rounded-2xl gap-2 text-base font-semibold w-full"
                  data-ocid="instant_buy.primary_button"
                >
                  <PackageCheck className="h-5 w-5" />
                  Proceed to Pickup
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setStep(3);
                    setDiag({
                      powersOn: null,
                      makeCalls: null,
                      screenOk: null,
                      physicalCondition: "",
                      hardwareFaults: [],
                      subStep: 0,
                    });
                    setPickup({
                      name: "",
                      phone: "",
                      address: "",
                      date: undefined,
                      timeSlot: "",
                    });
                    setSubmitted(false);
                    setShowDeductions(false);
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground underline text-center"
                  data-ocid="instant_buy.secondary_button"
                >
                  Start Over
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 5: Pickup Details ─────────────────────────────────── */}
          {step === 5 && !submitted && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <StepBar step={5} />
              <h2 className="font-display font-bold text-2xl mb-1">
                Pickup Details
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                We'll come to you — just fill in the details
              </p>

              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="pickup-name">Full Name</Label>
                  <Input
                    id="pickup-name"
                    placeholder="Your full name"
                    value={pickup.name}
                    onChange={(e) =>
                      setPickup((p) => ({ ...p, name: e.target.value }))
                    }
                    className="rounded-xl"
                    data-ocid="instant_buy.input"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pickup-phone">Phone Number</Label>
                  <div className="flex gap-2">
                    <span className="flex items-center px-3 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl text-sm text-muted-foreground">
                      +91
                    </span>
                    <Input
                      id="pickup-phone"
                      type="tel"
                      placeholder="10-digit number"
                      value={pickup.phone}
                      onChange={(e) =>
                        setPickup((p) => ({ ...p, phone: e.target.value }))
                      }
                      className="rounded-l-none rounded-r-xl"
                      data-ocid="instant_buy.input"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pickup-address">Pickup Address</Label>
                  <Textarea
                    id="pickup-address"
                    placeholder="Full address with landmark"
                    value={pickup.address}
                    onChange={(e) =>
                      setPickup((p) => ({ ...p, address: e.target.value }))
                    }
                    className="rounded-xl resize-none"
                    rows={3}
                    data-ocid="instant_buy.textarea"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Pickup Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2 rounded-xl font-normal text-left"
                        data-ocid="instant_buy.open_modal_button"
                      >
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        {pickup.date
                          ? format(pickup.date, "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0"
                      align="start"
                      data-ocid="instant_buy.popover"
                    >
                      <Calendar
                        mode="single"
                        selected={pickup.date}
                        onSelect={(d) => setPickup((p) => ({ ...p, date: d }))}
                        disabled={(d) => d < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1.5">
                  <Label>Pickup Time Slot</Label>
                  <Select
                    value={pickup.timeSlot}
                    onValueChange={(v) =>
                      setPickup((p) => ({ ...p, timeSlot: v }))
                    }
                  >
                    <SelectTrigger
                      className="rounded-xl"
                      data-ocid="instant_buy.select"
                    >
                      <SelectValue placeholder="Choose a time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map((slot) => (
                        <SelectItem key={slot.value} value={slot.value}>
                          {slot.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between mt-5">
                <Button
                  variant="ghost"
                  onClick={() => setStep(4)}
                  className="rounded-2xl"
                  data-ocid="instant_buy.cancel_button"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <Button
                  onClick={handleConfirmPickup}
                  disabled={
                    isSubmitting ||
                    !pickup.name ||
                    !pickup.phone ||
                    !pickup.address ||
                    !pickup.date ||
                    !pickup.timeSlot
                  }
                  className="bg-purple-500 hover:bg-purple-600 text-white rounded-2xl px-8"
                  data-ocid="instant_buy.submit_button"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    "Confirm Pickup ✓"
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── Success State ──────────────────────────────────────────── */}
          {step === 5 && submitted && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
              className="text-center py-10"
              data-ocid="instant_buy.success_state"
            >
              <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <h2 className="font-display font-bold text-3xl mb-2">
                Booking Confirmed! 🎉
              </h2>
              {bookingId && (
                <p className="text-xs font-mono bg-purple-50 border border-purple-200 rounded-lg px-3 py-1.5 inline-block mb-3 text-purple-700">
                  Booking ID: #{bookingId}
                </p>
              )}
              <p className="text-muted-foreground mb-7">
                Our team will arrive at your location for pickup
              </p>

              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 text-left space-y-3 mb-7">
                {quote && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Your Price
                    </span>
                    <span className="text-sm font-bold text-green-600">
                      {inr(quote.final)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pickup</span>
                  <span className="text-sm font-semibold">
                    {pickup.date ? format(pickup.date, "PPP") : ""},{" "}
                    {TIME_SLOTS.find((s) => s.value === pickup.timeSlot)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Address</span>
                  <span className="text-sm font-medium text-right max-w-[180px]">
                    {pickup.address}
                  </span>
                </div>
              </div>

              <Link to="/">
                <Button
                  className="bg-purple-500 hover:bg-purple-600 text-white rounded-2xl px-10"
                  data-ocid="instant_buy.primary_button"
                >
                  Back to Home
                </Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
