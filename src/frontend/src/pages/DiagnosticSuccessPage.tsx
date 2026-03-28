import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface HardwareResult {
  value: number | string;
  pass: boolean;
  label: string;
}

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
    Battery: HardwareResult;
    Display: HardwareResult;
    Biometrics: HardwareResult;
    Buttons: HardwareResult;
    Cameras: HardwareResult;
  };
  overall_health_score: number;
}

const DEMO_REPORT: DiagnosticReport = {
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
    Battery: { value: 91, pass: true, label: "Battery Health" },
    Display: { value: 100, pass: true, label: "Display Coverage" },
    Biometrics: { value: "OS_TOKEN_VERIFIED", pass: true, label: "Biometrics" },
    Buttons: { value: "All Responsive", pass: true, label: "Physical Buttons" },
    Cameras: { value: "Front + Rear", pass: true, label: "Cameras" },
  },
  overall_health_score: 91,
};

export default function DiagnosticSuccessPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"loading" | "result">("loading");
  const [progressValue, setProgressValue] = useState(0);

  const reportRaw = localStorage.getItem("77m_diagnostic_report");
  const report: DiagnosticReport = reportRaw
    ? (JSON.parse(reportRaw) as DiagnosticReport)
    : DEMO_REPORT;

  useEffect(() => {
    let raf: number;
    let start: number | null = null;
    const duration = 2000;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgressValue(pct);
      if (elapsed < duration) {
        raf = requestAnimationFrame(animate);
      } else {
        setTimeout(() => setPhase("result"), 200);
      }
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleContinue = () => {
    sessionStorage.setItem("77m_listing_prefill", JSON.stringify(report));
    navigate({ to: "/post" });
  };

  const hwRows = Object.entries(report.hardware_results) as [
    string,
    HardwareResult,
  ][];

  function formatValue(key: string, val: number | string): string {
    if (key === "Battery") return `${val}%`;
    if (key === "Display") return `${val}% Coverage`;
    if (val === "OS_TOKEN_VERIFIED") return "OS Verified";
    return String(val);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-[#1A56DB] px-4 pt-12 pb-6 text-white text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-200 mb-1">
          77mobiles Diagnostics
        </p>
        <h1 className="text-xl font-black">
          {phase === "loading" ? "Analyzing Device…" : "Device Verified!"}
        </h1>
      </div>

      <div className="flex-1 px-5 py-6 flex flex-col gap-6">
        {/* Phase 1: Progress bar */}
        {phase === "loading" && (
          <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-teal-400 to-[#0E9F6E]"
                style={{ width: `${progressValue}%` }}
              />
            </div>
            <p className="text-sm font-semibold text-[#0E9F6E]">
              Analyzing device… {Math.round(progressValue)}%
            </p>
          </motion.div>
        )}

        {/* Phase 2: Results */}
        <AnimatePresence>
          {phase === "result" && (
            <motion.div
              className="flex flex-col gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Gold shield */}
              <div className="flex flex-col items-center gap-3">
                <motion.div
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <span
                    style={{
                      fontSize: 80,
                      filter: "drop-shadow(0 4px 12px #F59E0B88)",
                    }}
                  >
                    🛡️
                  </span>
                </motion.div>
                <h2 className="text-2xl font-black text-[#1A56DB]">
                  Device Verified!
                </h2>
              </div>

              {/* Health Score */}
              <div
                className="bg-blue-50 rounded-2xl px-6 py-5 text-center border border-blue-100"
                data-ocid="diagnostic_success.card"
              >
                <p className="text-sm text-gray-500 mb-1">
                  Overall Health Score
                </p>
                <p className="text-5xl font-black text-[#1A56DB]">
                  {report.overall_health_score}
                  <span className="text-2xl text-gray-400">/100</span>
                </p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <p className="text-xs text-gray-500">
                    {report.device_identity.brand}{" "}
                    {report.device_identity.model} ·{" "}
                    {report.device_identity.storage}
                  </p>
                </div>
              </div>

              {/* Verified Specs */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  Verified Hardware
                </p>
                <div className="space-y-2">
                  {hwRows.map(([key, result]) => (
                    <div
                      key={key}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${
                        result.pass
                          ? "bg-green-50 border-green-100"
                          : "bg-red-50 border-red-100"
                      }`}
                      data-ocid="diagnostic_success.item"
                    >
                      {result.pass ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                      )}
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-800">
                          {result.label}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatValue(key, result.value)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Locked fields notice */}
              <div
                className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3"
                data-ocid="diagnostic_success.panel"
              >
                <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  These verified specs will be <strong>locked</strong> in your
                  listing form and cannot be edited. This builds buyer trust and
                  reduces disputes.
                </p>
              </div>

              {/* Continue button */}
              <Button
                className="w-full bg-[#1A56DB] hover:bg-blue-700 text-white font-bold rounded-2xl h-14 text-base"
                onClick={handleContinue}
                data-ocid="diagnostic_success.primary_button"
              >
                Continue to Post Ad
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
