import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  ChevronRight,
  FileText,
  Shield,
  Usb,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Step = 0 | 1 | 2 | 3 | 4;
type EntryMode = null | "usb" | "manual";

const CHECKLIST = [
  { text: "Battery cycles read (247 cycles)", warn: false },
  { text: "IMEI 1 extracted: 35****1234567", warn: false },
  { text: "IMEI 2 extracted: 35****7654321", warn: false },
  { text: "CPU/RAM verified: Snapdragon 8 Gen 2 / 12GB", warn: false },
  { text: "Storage: 256GB (231GB available)", warn: false },
  { text: "NFC: Active", warn: false },
  { text: "GPS: Signal Strong", warn: false },
  { text: "Root Status: NOT ROOTED \u2713", warn: true },
];

const PHOTOS = [
  { label: "Front (LCD On)", emoji: "\ud83d\udcf1" },
  { label: "Back (Camera Module)", emoji: "\ud83d\udd19" },
  { label: "Top", emoji: "\u2b06" },
  { label: "Bottom (Port)", emoji: "\u2b07" },
  { label: "Side", emoji: "\u27a1" },
  { label: "Physical IMEI", emoji: "\ud83d\udd22" },
];

const BRANDS = ["Apple", "Samsung", "OnePlus", "Xiaomi", "Google"];
const MODELS = ["iPhone 15 Pro", "Galaxy S23", "OnePlus 12", "Redmi Note 13"];
const STORAGES = ["64GB", "128GB", "256GB", "512GB"];
const CONDITIONS = ["Like New", "Good", "Fair", "For Parts"];
interface DiagnosticReport {
  id: string;
  timestamp: string;
  device_identity: {
    brand: string;
    model: string;
    imei: string;
    storage: string;
    os_version: string;
  };
  hardware_results: {
    Battery: { value: number; pass: boolean; label: string };
    Display: { value: number; pass: boolean; label: string };
    Biometrics: { value: string; pass: boolean; label: string };
    Buttons: { value: string; pass: boolean; label: string };
    Cameras: { value: string; pass: boolean; label: string };
  };
  overall_health_score: number;
}

function buildDiagnosticReport(): DiagnosticReport {
  const batteryVal = 91;
  const displayVal = 100;
  const report: DiagnosticReport = {
    id: `report_${Date.now()}`,
    timestamp: new Date().toISOString(),
    device_identity: {
      brand: "Samsung",
      model: "Galaxy S23 Ultra",
      imei: "352****234567",
      storage: "256GB",
      os_version: "Android 14",
    },
    hardware_results: {
      Battery: {
        value: batteryVal,
        pass: batteryVal >= 80,
        label: "Battery Health",
      },
      Display: {
        value: displayVal,
        pass: displayVal === 100,
        label: "Display Coverage",
      },
      Biometrics: {
        value: "OS_TOKEN_VERIFIED",
        pass: true,
        label: "Biometrics",
      },
      Buttons: {
        value: "All Responsive",
        pass: true,
        label: "Physical Buttons",
      },
      Cameras: { value: "Front + Rear", pass: true, label: "Cameras" },
    },
    overall_health_score: Math.round(
      (batteryVal + displayVal + 95 + 98 + 97) / 5,
    ),
  };
  return report;
}

export default function DiagnosticBridgePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(0);
  const [entryMode, setEntryMode] = useState<EntryMode>(null);
  const [deviceDetected, setDeviceDetected] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [checklistVisible, setChecklistVisible] = useState<number>(0);
  const [progress, setProgress] = useState(0);
  const [allDone, setAllDone] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<Set<number>>(new Set());
  const [condition, setCondition] = useState("Like New");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (step !== 1) return;
    const t1 = setTimeout(() => setDeviceDetected(true), 2000);
    const t2 = setTimeout(() => setExtracting(true), 2500);
    const t3 = setTimeout(() => setStep(2), 5500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [step]);

  useEffect(() => {
    if (step !== 2) return;
    setChecklistVisible(0);
    setProgress(0);
    setAllDone(false);
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setChecklistVisible(count);
      setProgress(Math.round((count / CHECKLIST.length) * 100));
      if (count >= CHECKLIST.length) {
        clearInterval(interval);
        setTimeout(() => setAllDone(true), 300);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [step]);

  const allPhotos = capturedPhotos.size === PHOTOS.length;

  const handleBack = () => {
    if (step === 0 && entryMode === null) {
      navigate({ to: "/dealer" });
    } else if (step === 0 && entryMode === "manual") {
      setEntryMode(null);
    } else {
      setStep((step - 1) as Step);
      if (step === 1) {
        setDeviceDetected(false);
        setExtracting(false);
        setEntryMode(null);
        setStep(0);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[75] bg-[#001A3D] flex flex-col"
      data-ocid="diagnostic.panel"
    >
      {/* Header */}
      <div className="bg-[#001A3D] px-4 py-4 flex items-center gap-3 shrink-0 border-b border-white/10">
        <button
          type="button"
          onClick={handleBack}
          className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
          data-ocid="diagnostic.close_button"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <div className="flex-1">
          <p className="font-black text-white text-base leading-tight">
            77mobiles.pro
          </p>
          <p className="text-[11px] text-blue-300">
            Master Phone Diagnostic Bridge
          </p>
        </div>
        <span className="text-xs font-bold text-blue-300 bg-blue-900/40 border border-blue-700 rounded-full px-2 py-0.5">
          Step {step + 1}/5
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {/* ===== Step 0: Entry Switcher ===== */}
        {step === 0 && entryMode === null && (
          <div className="px-4 py-6 flex flex-col gap-6">
            <div className="text-center">
              <h1 className="text-2xl font-black text-white mb-2">Add Stock</h1>
              <p className="text-blue-300 text-sm">Choose your intake method</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setEntryMode("usb");
                  setStep(1);
                }}
                className="bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-400 rounded-2xl p-5 flex flex-col items-center gap-3 hover:from-blue-500 hover:to-blue-700 transition-all group"
                data-ocid="diagnostic.primary_button"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-colors">
                  <Usb className="h-7 w-7 text-white" />
                </div>
                <div className="text-center">
                  <p className="font-black text-white text-sm">
                    USB Smart-Scan
                  </p>
                  <p className="text-[11px] text-blue-200 mt-0.5">
                    Auto-fill all fields
                  </p>
                </div>
                <span className="text-[10px] font-bold bg-yellow-400 text-yellow-900 rounded-full px-2 py-0.5">
                  RECOMMENDED
                </span>
              </button>

              <button
                type="button"
                onClick={() => setEntryMode("manual")}
                className="bg-white/5 border-2 border-white/20 rounded-2xl p-5 flex flex-col items-center gap-3 hover:bg-white/10 hover:border-white/40 transition-all"
                data-ocid="diagnostic.secondary_button"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                  <FileText className="h-7 w-7 text-blue-300" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-white text-sm">Manual Entry</p>
                  <p className="text-[11px] text-blue-300 mt-0.5">
                    For dead/damaged units
                  </p>
                </div>
              </button>
            </div>

            <div className="bg-blue-900/30 border border-blue-800 rounded-xl p-4">
              <p className="text-xs text-blue-300">
                <span className="text-blue-100 font-semibold">
                  \ud83d\udca1 Pro tip:
                </span>{" "}
                USB Smart-Scan extracts IMEI, battery health, storage, and RAM
                in under 90 seconds \u2014 zero typing required.
              </p>
            </div>
          </div>
        )}

        {/* ===== Step 0 Manual Form ===== */}
        {step === 0 && entryMode === "manual" && (
          <div className="px-4 py-6 flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setEntryMode(null)}
              className="flex items-center gap-2 text-blue-300 text-sm"
            >
              <ArrowLeft className="h-4 w-4" /> Back to entry selection
            </button>
            <h2 className="text-xl font-black text-white">Manual Entry Form</h2>

            <div>
              <label
                className="text-xs font-semibold text-blue-300 mb-1 block"
                htmlFor="m-brand"
              >
                Brand
              </label>
              <select
                id="m-brand"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-blue-400"
              >
                {BRANDS.map((o) => (
                  <option key={o} value={o} className="bg-[#001A3D]">
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="text-xs font-semibold text-blue-300 mb-1 block"
                htmlFor="m-model"
              >
                Model
              </label>
              <select
                id="m-model"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-blue-400"
              >
                {MODELS.map((o) => (
                  <option key={o} value={o} className="bg-[#001A3D]">
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="text-xs font-semibold text-blue-300 mb-1 block"
                htmlFor="m-storage"
              >
                Storage
              </label>
              <select
                id="m-storage"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-blue-400"
              >
                {STORAGES.map((o) => (
                  <option key={o} value={o} className="bg-[#001A3D]">
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="text-xs font-semibold text-blue-300 mb-1 block"
                htmlFor="m-condition"
              >
                Condition
              </label>
              <select
                id="m-condition"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-blue-400"
              >
                {CONDITIONS.map((o) => (
                  <option key={o} value={o} className="bg-[#001A3D]">
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="text-xs font-semibold text-blue-300 mb-1 block"
                htmlFor="m-imei"
              >
                IMEI
              </label>
              <input
                id="m-imei"
                type="text"
                placeholder="Enter IMEI number"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm placeholder-blue-400 outline-none focus:border-blue-400"
                data-ocid="diagnostic.input"
              />
            </div>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mt-2"
              onClick={() => {
                toast.success("Listing saved!");
                navigate({ to: "/dealer" });
              }}
              data-ocid="diagnostic.submit_button"
            >
              Save & Post
            </Button>
          </div>
        )}

        {/* ===== Step 1: USB Connection ===== */}
        {step === 1 && (
          <div className="px-4 py-8 flex flex-col items-center gap-6 text-center">
            <div className="text-6xl mt-4">
              {deviceDetected ? "\u2705" : "\ud83d\udd0c"}
            </div>
            <div>
              <h2 className="text-xl font-black text-white mb-2">
                {deviceDetected
                  ? "Device Detected!"
                  : "Connect Target Device via USB/OTG"}
              </h2>
              <p className="text-blue-300 text-sm">
                {extracting
                  ? "Extracting hardware data\u2026"
                  : "Follow the steps below"}
              </p>
            </div>

            {!deviceDetected && (
              <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-left space-y-3">
                {[
                  "Enable USB Debugging on target device",
                  "Connect OTG cable between devices",
                  "Wait for handshake confirmation\u2026",
                ].map((s, i) => (
                  <div key={s} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-800 border border-blue-600 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-blue-200">
                        {i + 1}
                      </span>
                    </div>
                    <p className="text-sm text-blue-100">{s}</p>
                  </div>
                ))}
              </div>
            )}

            {deviceDetected && (
              <div className="w-full">
                <div className="flex items-center justify-center gap-3 bg-green-900/30 border border-green-600 rounded-2xl p-4">
                  <CheckCircle2 className="h-6 w-6 text-green-400" />
                  <p className="text-green-300 font-semibold">
                    Samsung Galaxy S23 Ultra detected
                  </p>
                </div>
                {extracting && (
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <div className="h-5 w-5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                    <p className="text-blue-300 text-sm">
                      Extracting hardware data\u2026
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===== Step 2: 55-Point Health Check ===== */}
        {step === 2 && (
          <div className="px-4 py-6 flex flex-col gap-5">
            <div className="text-center">
              <h2 className="text-xl font-black text-white mb-1">
                55-Point Health Check
              </h2>
              <p className="text-blue-300 text-sm">Running diagnostics\u2026</p>
            </div>

            <div className="bg-white/5 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-blue-300">Progress</span>
                <span className="text-xs font-bold text-blue-200">
                  {progress}%
                </span>
              </div>
              <Progress value={progress} className="h-2 bg-blue-900" />
            </div>

            <div className="space-y-2">
              {CHECKLIST.slice(0, checklistVisible).map((item, i) => (
                <div
                  key={item.text}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
                    item.warn
                      ? "bg-amber-900/20 border border-amber-700/30"
                      : "bg-white/5 border border-white/10"
                  }`}
                  data-ocid={`diagnostic.item.${i + 1}`}
                >
                  {item.warn ? (
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                  )}
                  <span className="text-sm text-white">{item.text}</span>
                </div>
              ))}
            </div>

            {allDone && (
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 bg-green-900/30 border border-green-600 rounded-2xl px-6 py-3">
                  <Shield className="h-5 w-5 text-green-400" />
                  <span className="font-black text-green-300">
                    55/55 Checks Passed
                  </span>
                </div>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                  onClick={() => {
                    const report = buildDiagnosticReport();
                    localStorage.setItem(
                      "77m_diagnostic_report",
                      JSON.stringify(report),
                    );
                    navigate({ to: "/diagnostic-success" });
                  }}
                  data-ocid="diagnostic.primary_button"
                >
                  View Full Report <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ===== Step 3: Auto-Populated Form ===== */}
        {step === 3 && (
          <div className="px-4 py-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 bg-green-600 rounded-xl px-4 py-3">
              <CheckCircle2 className="h-5 w-5 text-white shrink-0" />
              <span className="font-bold text-white text-sm">
                Auto-filled from USB scan
              </span>
            </div>

            <div className="bg-white rounded-2xl p-4 space-y-3">
              <h3 className="font-bold text-gray-700 text-sm mb-2">
                Device Information (Locked)
              </h3>
              {(
                [
                  ["Brand", "Samsung"],
                  ["Model", "Galaxy S23 Ultra"],
                  ["Storage", "256GB"],
                  ["RAM", "12GB"],
                  ["IMEI 1", "352****234567"],
                  ["IMEI 2", "352****654321"],
                  ["Battery Health", "91%"],
                  ["Root Status", "Clean \u2705"],
                ] as [string, string][]
              ).map(([label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{label}</span>
                  <span className="text-sm font-semibold text-gray-800 bg-gray-100 rounded-lg px-3 py-1">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-4 space-y-3">
              <h3 className="font-bold text-gray-700 text-sm mb-2">
                Listing Details
              </h3>
              <div>
                <label
                  className="text-xs font-semibold text-gray-500 block mb-1"
                  htmlFor="s3-price"
                >
                  Price (\u20b9)
                </label>
                <input
                  id="s3-price"
                  type="number"
                  placeholder="e.g. 75000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 text-sm outline-none focus:border-blue-400"
                  data-ocid="diagnostic.input"
                />
              </div>
              <div>
                <label
                  className="text-xs font-semibold text-gray-500 block mb-1"
                  htmlFor="s3-condition"
                >
                  Condition
                </label>
                <select
                  id="s3-condition"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 text-sm outline-none focus:border-blue-400"
                  data-ocid="diagnostic.select"
                >
                  {CONDITIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className="text-xs font-semibold text-gray-500 block mb-1"
                  htmlFor="s3-desc"
                >
                  Description
                </label>
                <textarea
                  id="s3-desc"
                  rows={3}
                  placeholder="Add any additional notes\u2026"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 text-sm outline-none focus:border-blue-400 resize-none"
                  data-ocid="diagnostic.textarea"
                />
              </div>
            </div>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-2"
              onClick={() => setStep(4)}
              data-ocid="diagnostic.primary_button"
            >
              <Camera className="h-4 w-4" /> AI Cosmetic Inspection
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-xl border-blue-700 text-blue-300 hover:bg-white/10 bg-transparent"
              onClick={() => {
                toast.success("Listing posted! Review in 24h.");
                navigate({ to: "/dealer" });
              }}
              data-ocid="diagnostic.secondary_button"
            >
              Skip & Post
            </Button>
          </div>
        )}

        {/* ===== Step 4: Cosmetic Inspection ===== */}
        {step === 4 && (
          <div className="px-4 py-6 flex flex-col gap-5">
            <div className="text-center">
              <h2 className="text-xl font-black text-white mb-1">
                6-Shot Photo Verification
              </h2>
              <p className="text-blue-300 text-sm">
                Capture all 6 angles to verify cosmetic condition
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {PHOTOS.map((photo, i) => {
                const captured = capturedPhotos.has(i);
                return (
                  <button
                    key={photo.label}
                    type="button"
                    onClick={() => {
                      setCapturedPhotos((prev) => {
                        const next = new Set(prev);
                        next.add(i);
                        return next;
                      });
                    }}
                    className={`relative rounded-2xl border-2 overflow-hidden aspect-square flex flex-col items-center justify-center gap-2 transition-all ${
                      captured
                        ? "border-green-500 bg-green-900/30"
                        : "border-white/20 bg-white/5 hover:border-blue-400"
                    }`}
                    data-ocid={`diagnostic.item.${i + 1}`}
                  >
                    {captured ? (
                      <>
                        <CheckCircle2 className="h-8 w-8 text-green-400" />
                        <p className="text-[11px] font-bold text-green-300">
                          Captured \u2713
                        </p>
                      </>
                    ) : (
                      <>
                        <span className="text-3xl">{photo.emoji}</span>
                        <p className="text-[11px] text-blue-200 text-center px-1">
                          {photo.label}
                        </p>
                        <Camera className="h-4 w-4 text-blue-400" />
                      </>
                    )}
                  </button>
                );
              })}
            </div>

            {allPhotos && (
              <div className="flex items-center gap-2 bg-green-900/30 border border-green-600 rounded-2xl px-4 py-3">
                <Shield className="h-5 w-5 text-green-400 shrink-0" />
                <p className="text-sm font-bold text-green-300">
                  \ud83d\udee1 IMEI Match Verified \u2014 No Fraud Detected
                </p>
              </div>
            )}

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
              disabled={!allPhotos}
              onClick={() => {
                toast.success("Listing posted! Review in 24h.");
                navigate({ to: "/dealer" });
              }}
              data-ocid="diagnostic.submit_button"
            >
              {allPhotos
                ? "Submit Listing"
                : `Capture ${PHOTOS.length - capturedPhotos.size} more photos`}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
