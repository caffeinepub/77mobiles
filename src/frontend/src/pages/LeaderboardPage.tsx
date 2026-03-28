import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

const LB_KEY = "77m_leaderboard";

interface LeaderboardUser {
  id: string;
  name: string;
  initials: string;
  monthly_points: number;
  avatarColor: string;
}

const SEED_USERS: LeaderboardUser[] = [
  {
    id: "u1",
    name: "Rahul M.",
    initials: "RM",
    monthly_points: 500,
    avatarColor: "#1A56DB",
  },
  {
    id: "u2",
    name: "Priya K.",
    initials: "PK",
    monthly_points: 420,
    avatarColor: "#0E9F6E",
  },
  {
    id: "u3",
    name: "Arun S.",
    initials: "AS",
    monthly_points: 380,
    avatarColor: "#7C3AED",
  },
  {
    id: "u4",
    name: "Meena R.",
    initials: "MR",
    monthly_points: 310,
    avatarColor: "#DB2777",
  },
  {
    id: "u5",
    name: "Vikram T.",
    initials: "VT",
    monthly_points: 290,
    avatarColor: "#D97706",
  },
  {
    id: "u6",
    name: "Sneha N.",
    initials: "SN",
    monthly_points: 255,
    avatarColor: "#059669",
  },
  {
    id: "u7",
    name: "Kiran P.",
    initials: "KP",
    monthly_points: 210,
    avatarColor: "#DC2626",
  },
  {
    id: "u8",
    name: "You",
    initials: "YO",
    monthly_points: 120,
    avatarColor: "#1A56DB",
  },
  {
    id: "u9",
    name: "Anita J.",
    initials: "AJ",
    monthly_points: 195,
    avatarColor: "#7C3AED",
  },
  {
    id: "u10",
    name: "Suresh B.",
    initials: "SB",
    monthly_points: 170,
    avatarColor: "#0E9F6E",
  },
  {
    id: "u11",
    name: "Deepa M.",
    initials: "DM",
    monthly_points: 160,
    avatarColor: "#DB2777",
  },
  {
    id: "u12",
    name: "Ravi C.",
    initials: "RC",
    monthly_points: 145,
    avatarColor: "#D97706",
  },
  {
    id: "u13",
    name: "Pooja L.",
    initials: "PL",
    monthly_points: 130,
    avatarColor: "#059669",
  },
  {
    id: "u14",
    name: "Arjun V.",
    initials: "AV",
    monthly_points: 115,
    avatarColor: "#DC2626",
  },
  {
    id: "u15",
    name: "Nisha T.",
    initials: "NT",
    monthly_points: 110,
    avatarColor: "#1A56DB",
  },
  {
    id: "u16",
    name: "Mohan D.",
    initials: "MD",
    monthly_points: 95,
    avatarColor: "#7C3AED",
  },
  {
    id: "u17",
    name: "Kavya S.",
    initials: "KS",
    monthly_points: 80,
    avatarColor: "#0E9F6E",
  },
  {
    id: "u18",
    name: "Ganesh R.",
    initials: "GR",
    monthly_points: 65,
    avatarColor: "#DB2777",
  },
  {
    id: "u19",
    name: "Swati P.",
    initials: "SP",
    monthly_points: 50,
    avatarColor: "#D97706",
  },
  {
    id: "u20",
    name: "Rajesh K.",
    initials: "RK",
    monthly_points: 35,
    avatarColor: "#059669",
  },
];

function ProScoutBadge() {
  return (
    <img
      src="/assets/generated/pro-scout-badge-transparent.dim_120x120.png"
      alt="Pro Scout"
      className="w-5 h-5 inline-block ml-1"
      title="Pro Scout — 101+ monthly points"
    />
  );
}

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(LB_KEY);
    if (raw) {
      setUsers(JSON.parse(raw) as LeaderboardUser[]);
    } else {
      const sorted = [...SEED_USERS].sort(
        (a, b) => b.monthly_points - a.monthly_points,
      );
      localStorage.setItem(LB_KEY, JSON.stringify(sorted));
      setUsers(sorted);
    }
  }, []);

  const sorted = [...users].sort((a, b) => b.monthly_points - a.monthly_points);
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);
  const myRank = sorted.findIndex((u) => u.id === "u8") + 1;
  const me = sorted.find((u) => u.id === "u8");
  const topUser = sorted[0];

  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
  const podiumHeights = [80, 100, 60];
  const podiumMedals = ["🥈", "👑", "🥉"];

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1A56DB] to-[#0E9F6E] text-white px-4 pt-12 pb-8">
        <button
          type="button"
          onClick={() => navigate({ to: "/profile" })}
          className="flex items-center gap-2 text-white/80 text-sm mb-4"
          data-ocid="leaderboard.link"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="h-7 w-7 text-yellow-300" />
            <div>
              <h1 className="text-xl font-black">EV Scout Leaderboard</h1>
              <p className="text-white/70 text-xs">Resets in 14 days</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 flex flex-col gap-5">
        {/* Member of Month */}
        {topUser && (
          <motion.div
            className="bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-4 flex items-start gap-3"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            data-ocid="leaderboard.panel"
          >
            <span className="text-2xl">🏆</span>
            <div>
              <p className="text-sm font-bold text-yellow-800">
                Member of the Month
              </p>
              <p className="text-xs text-yellow-700 mt-0.5">
                {topUser.name} — Earned the Pro Scout badge + 500 bonus points!
              </p>
            </div>
          </motion.div>
        )}

        {/* Podium */}
        {sorted.length >= 3 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-6">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-6 text-center">
              Top 3 This Month
            </p>
            <div className="flex items-end justify-center gap-4">
              {podiumOrder.map((user, i) => {
                const isFirst = i === 1;
                return (
                  <motion.div
                    key={user.id}
                    className="flex flex-col items-center gap-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15 }}
                    data-ocid={`leaderboard.item.${i + 1}`}
                  >
                    <span className="text-2xl">{podiumMedals[i]}</span>
                    <div
                      className={`h-14 w-14 rounded-full flex items-center justify-center text-white font-black text-lg shadow-lg ${
                        isFirst
                          ? "ring-4 ring-yellow-400 shadow-yellow-200"
                          : ""
                      }`}
                      style={{ backgroundColor: user.avatarColor }}
                    >
                      {user.initials}
                    </div>
                    <p className="text-xs font-bold text-gray-800 max-w-[64px] text-center leading-tight">
                      {user.name}
                    </p>
                    <p className="text-[11px] font-black text-[#1A56DB]">
                      {user.monthly_points} pts
                    </p>
                    {user.monthly_points >= 101 && <ProScoutBadge />}
                    <div
                      className="w-20 rounded-t-xl flex items-center justify-center"
                      style={{
                        height: podiumHeights[i],
                        background: isFirst
                          ? "linear-gradient(135deg,#F59E0B,#FBBF24)"
                          : i === 0
                            ? "linear-gradient(135deg,#9CA3AF,#D1D5DB)"
                            : "linear-gradient(135deg,#B45309,#D97706)",
                      }}
                    >
                      <span className="text-white font-black text-lg">
                        #{i === 0 ? 2 : i === 1 ? 1 : 3}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Rest of leaderboard */}
        <div className="space-y-2">
          {rest.map((user, i) => {
            const rank = i + 4;
            const isMe = user.id === "u8";
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 border ${
                  isMe
                    ? "bg-blue-50 border-blue-200"
                    : "bg-white border-gray-100"
                }`}
                data-ocid={`leaderboard.item.${rank}`}
              >
                <span className="text-sm font-black text-gray-400 w-6 text-center">
                  #{rank}
                </span>
                <div
                  className="h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ backgroundColor: user.avatarColor }}
                >
                  {user.initials}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <p
                      className={`text-sm font-semibold ${isMe ? "text-[#1A56DB]" : "text-gray-800"}`}
                    >
                      {user.name} {isMe && "(You)"}
                    </p>
                    {user.monthly_points >= 101 && <ProScoutBadge />}
                  </div>
                </div>
                <p className="text-sm font-black text-[#1A56DB]">
                  {user.monthly_points} pts
                </p>
              </motion.div>
            );
          })}
        </div>

        <p className="text-xs text-center text-gray-400">
          Rankings reset every 30 days. Keep reporting stations to climb!
        </p>
      </div>

      {/* My Rank sticky footer */}
      {me && (
        <div
          className="fixed bottom-[60px] left-0 right-0 bg-[#1A56DB] text-white px-5 py-3 flex items-center justify-between shadow-lg"
          data-ocid="leaderboard.panel"
        >
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: me.avatarColor }}
            >
              {me.initials}
            </div>
            <div>
              <p className="text-sm font-bold">Your Rank: #{myRank}</p>
              <p className="text-xs text-blue-200">
                {me.monthly_points} pts this month
              </p>
            </div>
          </div>
          {me.monthly_points >= 101 ? (
            <div className="flex items-center gap-1">
              <ProScoutBadge />
              <span className="text-xs font-bold text-yellow-300">
                Pro Scout
              </span>
            </div>
          ) : (
            <p className="text-xs text-blue-200">
              {101 - me.monthly_points} pts to Pro Scout
            </p>
          )}
        </div>
      )}
    </div>
  );
}
