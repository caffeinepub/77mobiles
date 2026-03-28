import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Award,
  Camera,
  CheckCircle2,
  Clock,
  Gift,
  MapPin,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const POINTS_KEY = "77m_user_points";
const MONTH_START_KEY = "77m_month_start";
const DAILY_CAP = 100;

const EV_STATIONS = [
  { id: "1", name: "Tata Power EV — Banjara Hills" },
  { id: "2", name: "EESL Charging Hub — Hitech City" },
  { id: "3", name: "TSREDCO Charger — Jubilee Hills" },
  { id: "4", name: "Charge Zone — Gachibowli" },
  { id: "5", name: "Fortum EV — Kondapur" },
  { id: "6", name: "BPCL Plug-In — Kukatpally" },
  { id: "7", name: "MG Motor Hub — Secunderabad" },
  { id: "8", name: "GoCharge — Madhapur" },
  { id: "9", name: "Ather Grid — Begumpet" },
  { id: "10", name: "Exicom EV — Ameerpet" },
  { id: "11", name: "Statiq Hub — Miyapur" },
  { id: "12", name: "Volttic — Uppal" },
  { id: "13", name: "ChargeGrid — KPHB" },
  { id: "14", name: "Greaves EV — Dilsukhnagar" },
];

const REWARDS = [
  { id: "r1", name: "Phone Case", pts: 100, emoji: "📱" },
  { id: "r2", name: "Screen Protector", pts: 150, emoji: "🛡️" },
  { id: "r3", name: "Charging Cable", pts: 200, emoji: "🔌" },
  { id: "r4", name: "Car Mount", pts: 300, emoji: "🚗" },
  { id: "r5", name: "Earbuds", pts: 500, emoji: "🎧" },
  { id: "r6", name: "Power Bank", pts: 800, emoji: "🔋" },
];

interface StationReport {
  id: string;
  stationId: string;
  stationName: string;
  status: "working" | "broken" | "busy";
  timestamp: string;
  pointsEarned: number;
}

interface UserPoints {
  seventy_seven_points: number;
  monthly_points: number;
  daily_points_today: number;
  last_report_date: string;
  lifetime_points: number;
  reports: StationReport[];
  last_station_reports: Record<string, number>; // stationId -> timestamp ms
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadPoints(): UserPoints {
  const raw = localStorage.getItem(POINTS_KEY);
  if (raw) return JSON.parse(raw) as UserPoints;
  return {
    seventy_seven_points: 450,
    monthly_points: 120,
    daily_points_today: 40,
    last_report_date: today(),
    lifetime_points: 1240,
    reports: [],
    last_station_reports: {},
  };
}

function savePoints(p: UserPoints) {
  localStorage.setItem(POINTS_KEY, JSON.stringify(p));
}

function checkMonthReset(p: UserPoints): UserPoints {
  const raw = localStorage.getItem(MONTH_START_KEY);
  if (!raw) {
    localStorage.setItem(MONTH_START_KEY, new Date().toISOString());
    return p;
  }
  const start = new Date(raw).getTime();
  const now = Date.now();
  const days = (now - start) / (1000 * 60 * 60 * 24);
  if (days >= 30) {
    const updated = { ...p, monthly_points: 0 };
    localStorage.setItem(MONTH_START_KEY, new Date().toISOString());
    return updated;
  }
  return p;
}

function awardPoints(
  state: UserPoints,
  amount: number,
): { updated: UserPoints; blocked: boolean; reason: string } {
  const normalized =
    state.last_report_date !== today()
      ? { ...state, daily_points_today: 0, last_report_date: today() }
      : state;
  const remaining = DAILY_CAP - normalized.daily_points_today;
  if (remaining <= 0) {
    return {
      updated: normalized,
      blocked: true,
      reason: "Daily limit reached (100 pts)",
    };
  }
  const actual = Math.min(amount, remaining);
  const updated: UserPoints = {
    ...normalized,
    seventy_seven_points: normalized.seventy_seven_points + actual,
    monthly_points: normalized.monthly_points + actual,
    daily_points_today: normalized.daily_points_today + actual,
    lifetime_points: normalized.lifetime_points + actual,
  };
  return { updated, blocked: false, reason: "" };
}

function deductPoints(
  state: UserPoints,
  amount: number,
): { updated: UserPoints; blocked: boolean; reason: string } {
  if (state.seventy_seven_points < amount) {
    return {
      updated: state,
      blocked: true,
      reason: "Insufficient points",
    };
  }
  const updated: UserPoints = {
    ...state,
    seventy_seven_points: state.seventy_seven_points - amount,
  };
  return { updated, blocked: false, reason: "" };
}

export default function RewardsPage() {
  const navigate = useNavigate();
  const [pts, setPts] = useState<UserPoints>(() =>
    checkMonthReset(loadPoints()),
  );
  const [selectedStation, setSelectedStation] = useState("");
  const [status, setStatus] = useState<"working" | "broken" | "busy" | "">("");
  const [attachPhoto, setAttachPhoto] = useState(false);
  const [redeemModal, setRedeemModal] = useState<(typeof REWARDS)[0] | null>(
    null,
  );
  const [redeemCode, setRedeemCode] = useState("");

  useEffect(() => {
    savePoints(pts);
  }, [pts]);

  const handleSubmitReport = () => {
    if (!selectedStation || !status) {
      toast.error("Select a station and status");
      return;
    }

    // Anti-spam: check 60min cooldown per station
    const lastReport = pts.last_station_reports[selectedStation];
    if (lastReport && Date.now() - lastReport < 60 * 60 * 1000) {
      const minsAgo = Math.round((Date.now() - lastReport) / 60000);
      toast.error(
        `Wait ${60 - minsAgo} more minutes before re-reporting this station`,
      );
      return;
    }

    const basePoints = 10;
    const bonus = attachPhoto ? 15 : 0;
    const total = basePoints + bonus;

    const { updated, blocked, reason } = awardPoints(pts, total);
    if (blocked) {
      toast.error(reason);
      return;
    }

    const stationName =
      EV_STATIONS.find((s) => s.id === selectedStation)?.name ??
      selectedStation;

    const report: StationReport = {
      id: `rep_${Date.now()}`,
      stationId: selectedStation,
      stationName,
      status: status as "working" | "broken" | "busy",
      timestamp: new Date().toISOString(),
      pointsEarned: total,
    };

    const finalState: UserPoints = {
      ...updated,
      reports: [report, ...updated.reports].slice(0, 50),
      last_station_reports: {
        ...updated.last_station_reports,
        [selectedStation]: Date.now(),
      },
    };

    setPts(finalState);
    setSelectedStation("");
    setStatus("");
    setAttachPhoto(false);
    toast.success(
      `+${total} pts earned! ${attachPhoto ? "(+15 photo bonus)" : ""}`,
    );
  };

  const handleRedeem = (reward: (typeof REWARDS)[0]) => {
    const { updated, blocked, reason } = deductPoints(pts, reward.pts);
    if (blocked) {
      toast.error(reason);
      return;
    }
    setPts(updated);
    const code = `REDEEM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setRedeemCode(code);
    setRedeemModal(reward);
  };

  const dailyProgress = Math.min(
    (pts.daily_points_today / DAILY_CAP) * 100,
    100,
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-[#0E9F6E] text-white px-4 pt-12 pb-6">
        <button
          type="button"
          onClick={() => navigate({ to: "/profile" })}
          className="flex items-center gap-2 text-white/80 text-sm mb-4"
          data-ocid="rewards.link"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="flex items-center gap-3">
          <Award className="h-7 w-7 text-white" />
          <div>
            <h1 className="text-xl font-black">77 Scout Rewards</h1>
            <p className="text-green-100 text-xs">Earn points, redeem prizes</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 flex flex-col gap-6">
        {/* Points Card */}
        <motion.div
          className="rounded-2xl bg-gradient-to-br from-[#0E9F6E] to-[#1A56DB] p-5 text-white shadow-xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          data-ocid="rewards.card"
        >
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-5 w-5 text-yellow-300" />
            <span className="text-sm font-semibold text-white/80">
              Your Points
            </span>
          </div>
          <p className="text-4xl font-black">
            {pts.seventy_seven_points.toLocaleString("en-IN")} pts
          </p>
          <p className="text-green-200 text-sm mt-1">
            Monthly: {pts.monthly_points} pts
          </p>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-white/70 mb-1">
              <span>
                Today: {pts.daily_points_today}/{DAILY_CAP} pts
              </span>
              <span>{Math.round(dailyProgress)}% of daily cap</span>
            </div>
            <Progress value={dailyProgress} className="h-2 bg-white/20" />
          </div>
        </motion.div>

        {/* Report a Station */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-[#0E9F6E]" />
            <h2 className="font-bold text-gray-900">Report Station Status</h2>
          </div>

          {/* Station selector */}
          <div className="mb-3">
            <label
              className="text-xs font-semibold text-gray-500 block mb-1"
              htmlFor="station-select"
            >
              Select Station
            </label>
            <select
              id="station-select"
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-green-400"
              data-ocid="rewards.select"
            >
              <option value="">Choose a station…</option>
              {EV_STATIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status buttons */}
          <div className="flex gap-2 mb-3">
            {(["working", "broken", "busy"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                  status === s
                    ? s === "working"
                      ? "bg-green-500 text-white border-green-500"
                      : s === "broken"
                        ? "bg-red-500 text-white border-red-500"
                        : "bg-amber-500 text-white border-amber-500"
                    : "bg-gray-50 text-gray-600 border-gray-200"
                }`}
                data-ocid="rewards.toggle"
              >
                {s === "working"
                  ? "✓ Working"
                  : s === "broken"
                    ? "✗ Broken"
                    : "~ Busy"}
              </button>
            ))}
          </div>

          {/* Photo toggle */}
          <button
            type="button"
            onClick={() => setAttachPhoto((p) => !p)}
            className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold mb-3 transition-all ${
              attachPhoto
                ? "bg-blue-50 border-blue-300 text-blue-700"
                : "bg-gray-50 border-gray-200 text-gray-600"
            }`}
            data-ocid="rewards.toggle"
          >
            <Camera className="h-4 w-4" />📷 Attach Photo (+15 pts bonus)
          </button>

          {/* GPS notice */}
          <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2 mb-4">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            GPS confirms you're within 100m
          </div>

          <Button
            className="w-full bg-[#0E9F6E] hover:bg-green-700 text-white font-bold rounded-xl"
            onClick={handleSubmitReport}
            data-ocid="rewards.submit_button"
          >
            <Zap className="h-4 w-4 mr-1" /> Submit Report (+
            {10 + (attachPhoto ? 15 : 0)} pts)
          </Button>
        </div>

        {/* Redeem Rewards */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Gift className="h-5 w-5 text-[#1A56DB]" />
            <h2 className="font-bold text-gray-900">Redeem Points</h2>
            <span className="ml-auto text-sm font-bold text-[#1A56DB]">
              {pts.seventy_seven_points} pts
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {REWARDS.map((r) => {
              const canAfford = pts.seventy_seven_points >= r.pts;
              return (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col items-center gap-2"
                  data-ocid="rewards.card"
                >
                  <span className="text-3xl">{r.emoji}</span>
                  <p className="text-sm font-semibold text-gray-800 text-center">
                    {r.name}
                  </p>
                  <p className="text-xs font-bold text-[#1A56DB]">
                    {r.pts} pts
                  </p>
                  <Button
                    size="sm"
                    className={`w-full rounded-xl text-xs font-bold ${
                      canAfford
                        ? "bg-[#1A56DB] hover:bg-blue-700 text-white"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                    onClick={() => canAfford && handleRedeem(r)}
                    data-ocid="rewards.button"
                  >
                    {canAfford ? "Redeem" : "Need more pts"}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        {pts.reports.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-gray-400" />
              <h2 className="font-bold text-gray-700">Recent Activity</h2>
            </div>
            <div className="space-y-2">
              {pts.reports.slice(0, 10).map((r, i) => (
                <div
                  key={r.id}
                  className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center justify-between"
                  data-ocid={`rewards.item.${i + 1}`}
                >
                  <div className="flex items-center gap-3">
                    {r.status === "working" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : r.status === "broken" ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-500" />
                    )}
                    <div>
                      <p className="text-xs font-semibold text-gray-800">
                        {r.stationName}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(r.timestamp).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-green-600">
                    +{r.pointsEarned} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Redeem success modal */}
      {redeemModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setRedeemModal(null)}
          onKeyDown={(e) => e.key === "Escape" && setRedeemModal(null)}
          role="presentation"
          data-ocid="rewards.modal"
        >
          <div
            className="bg-white rounded-3xl p-6 w-full max-w-sm text-center"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <span className="text-5xl block mb-3">{redeemModal.emoji}</span>
            <h3 className="text-xl font-black text-gray-900 mb-1">
              Redemption Confirmed!
            </h3>
            <p className="text-sm text-gray-500 mb-5">{redeemModal.name}</p>
            <div
              className="border-2 border-dashed border-[#1A56DB] rounded-2xl px-6 py-5 mb-5 font-mono text-lg font-bold text-[#1A56DB] tracking-widest"
              data-ocid="rewards.panel"
            >
              {redeemCode}
            </div>
            <p className="text-xs text-gray-400 mb-5">
              Show this code at a 77mobiles partner store to collect your
              reward.
            </p>
            <Button
              className="w-full bg-[#1A56DB] text-white rounded-xl font-bold"
              onClick={() => setRedeemModal(null)}
              data-ocid="rewards.close_button"
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
