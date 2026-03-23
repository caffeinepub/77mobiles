import {
  DealerKycStatus,
  DealerRegistrationType,
  PickupBookingStatus,
} from "@/backend";
import type { DealerRegistration, PickupBooking } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Loader2,
  RefreshCw,
  Settings,
  Shield,
  ShieldAlert,
  Users,
  XCircle,
} from "lucide-react";
import {
  ArrowDown,
  ArrowUp,
  Edit2,
  Image,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { BANNER_SLIDES } from "../data/bannerSlides";
import type { BannerSlide } from "../data/bannerSlides";
import {
  useGetAllDealerRegistrations,
  useGetAllPickupBookings,
  useGetCallerUserRole,
  useUpdateBookingStatus,
  useUpdateDealerKycStatus,
} from "../hooks/useQueries";

function formatInr(n: bigint | number) {
  const num = typeof n === "bigint" ? Number(n) : n;
  return `₹${num.toLocaleString("en-IN")}`;
}

function StatusBadge({ status }: { status: PickupBookingStatus }) {
  const config: Record<
    PickupBookingStatus,
    { label: string; className: string }
  > = {
    [PickupBookingStatus.pending]: {
      label: "Pending",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    [PickupBookingStatus.confirmed]: {
      label: "Confirmed",
      className: "bg-blue-100 text-blue-800 border-blue-200",
    },
    [PickupBookingStatus.completed]: {
      label: "Completed",
      className: "bg-green-100 text-green-800 border-green-200",
    },
    [PickupBookingStatus.cancelled]: {
      label: "Cancelled",
      className: "bg-red-100 text-red-800 border-red-200",
    },
  };
  const c = config[status];
  return (
    <Badge variant="outline" className={`font-medium text-xs ${c.className}`}>
      {c.label}
    </Badge>
  );
}

function KycBadge({ status }: { status: DealerKycStatus }) {
  const config: Record<DealerKycStatus, { label: string; className: string }> =
    {
      [DealerKycStatus.pending]: {
        label: "Pending",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
      [DealerKycStatus.approved]: {
        label: "Approved",
        className: "bg-green-100 text-green-800 border-green-200",
      },
      [DealerKycStatus.rejected]: {
        label: "Rejected",
        className: "bg-red-100 text-red-800 border-red-200",
      },
    };
  const c = config[status];
  return (
    <Badge variant="outline" className={`font-medium text-xs ${c.className}`}>
      {c.label}
    </Badge>
  );
}

function BookingActions({
  booking,
  index,
}: {
  booking: PickupBooking;
  index: number;
}) {
  const { mutate: updateStatus, isPending } = useUpdateBookingStatus();

  const actions: {
    label: string;
    status: PickupBookingStatus;
    icon: React.ReactNode;
  }[] = [
    {
      label: "Confirm",
      status: PickupBookingStatus.confirmed,
      icon: <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />,
    },
    {
      label: "Complete",
      status: PickupBookingStatus.completed,
      icon: <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />,
    },
    {
      label: "Cancel",
      status: PickupBookingStatus.cancelled,
      icon: <XCircle className="h-3.5 w-3.5 text-red-500" />,
    },
  ].filter((a) => a.status !== booking.status);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs gap-1 rounded-lg"
          disabled={isPending}
          data-ocid={`admin.dropdown_menu.${index}`}
        >
          {isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <>
              Actions <ChevronDown className="h-3 w-3" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.status}
            onClick={() =>
              updateStatus({ bookingId: booking.id, newStatus: action.status })
            }
            className="flex items-center gap-2 text-sm cursor-pointer"
            data-ocid={`admin.${action.label.toLowerCase()}_button.${index}`}
          >
            {action.icon}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DealerKycActions({
  registration,
  index,
}: {
  registration: DealerRegistration;
  index: number;
}) {
  const { mutate: updateKyc, isPending } = useUpdateDealerKycStatus();

  const actions: {
    label: string;
    status: DealerKycStatus;
    icon: React.ReactNode;
  }[] = [
    {
      label: "Approve",
      status: DealerKycStatus.approved,
      icon: <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />,
    },
    {
      label: "Reject",
      status: DealerKycStatus.rejected,
      icon: <XCircle className="h-3.5 w-3.5 text-red-500" />,
    },
  ].filter((a) => a.status !== registration.kycStatus);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs gap-1 rounded-lg"
          disabled={isPending}
          data-ocid={`admin.dropdown_menu.${index}`}
        >
          {isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <>
              Actions <ChevronDown className="h-3 w-3" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.status}
            onClick={() =>
              updateKyc({
                registrationId: registration.id,
                newStatus: action.status,
              })
            }
            className="flex items-center gap-2 text-sm cursor-pointer"
            data-ocid={`admin.${action.label.toLowerCase()}_button.${index}`}
          >
            {action.icon}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Demo bookings for admin preview
const DEMO_BOOKINGS: PickupBooking[] = [
  {
    id: "booking_demo_1",
    sellerName: "Rahul Sharma",
    phone: "9876543210",
    address: "42, MG Road, Bengaluru, Karnataka",
    date: "2026-03-25",
    timeSlot: "10:00 AM - 12:00 PM",
    deviceModel: "iPhone 14 Pro",
    quotedPrice: BigInt(72000),
    status: PickupBookingStatus.pending,
    timestamp: BigInt(Date.now()) * BigInt(1_000_000),
  },
  {
    id: "booking_demo_2",
    sellerName: "Priya Mehta",
    phone: "9845012345",
    address: "15, Banjara Hills, Hyderabad, Telangana",
    date: "2026-03-24",
    timeSlot: "2:00 PM - 4:00 PM",
    deviceModel: "Samsung Galaxy S23 Ultra",
    quotedPrice: BigInt(58000),
    status: PickupBookingStatus.confirmed,
    timestamp: BigInt(Date.now() - 86400000) * BigInt(1_000_000),
  },
  {
    id: "booking_demo_3",
    sellerName: "Arun Kumar",
    phone: "9700123456",
    address: "7, Anna Salai, Chennai, Tamil Nadu",
    date: "2026-03-22",
    timeSlot: "4:00 PM - 6:00 PM",
    deviceModel: "MacBook Pro 14",
    quotedPrice: BigInt(95000),
    status: PickupBookingStatus.completed,
    timestamp: BigInt(Date.now() - 172800000) * BigInt(1_000_000),
  },
];

const DEMO_REGISTRATIONS: DealerRegistration[] = [
  {
    id: "dealer_registration_demo_1",
    registrantPrincipal: "2vxsx-fae" as unknown as never,
    registrationType: DealerRegistrationType.seller,
    pan: "ABCDE1234F",
    gst: "",
    aadhaarHash: "hash_demo_1",
    mobile: "9812345678",
    businessName: "TechTrade India",
    kycStatus: DealerKycStatus.pending,
    timestamp: BigInt(Date.now()) * BigInt(1_000_000),
  },
  {
    id: "dealer_registration_demo_2",
    registrantPrincipal: "2vxsx-fae" as unknown as never,
    registrationType: DealerRegistrationType.buyer,
    pan: "",
    gst: "29ABCDE1234F1Z5",
    aadhaarHash: "hash_demo_2",
    mobile: "9898001234",
    businessName: "GadgetHub Pvt. Ltd.",
    kycStatus: DealerKycStatus.approved,
    timestamp: BigInt(Date.now() - 86400000) * BigInt(1_000_000),
  },
];

function PickupBookingsTab({ demoMode }: { demoMode: boolean }) {
  const {
    data: liveBookings,
    isLoading: bookingsLoading,
    refetch,
    isFetching,
  } = useGetAllPickupBookings();

  const bookings = demoMode ? DEMO_BOOKINGS : liveBookings;
  const isLoading = demoMode ? false : bookingsLoading;

  const [statusFilter, setStatusFilter] = useState<PickupBookingStatus | "all">(
    "all",
  );

  const filtered = !bookings
    ? []
    : statusFilter === "all"
      ? bookings
      : bookings.filter((b) => b.status === statusFilter);

  return (
    <div className="space-y-6">
      {bookings && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Total",
              count: bookings.length,
              color: "bg-muted text-foreground",
            },
            {
              label: "Pending",
              count: bookings.filter(
                (b) => b.status === PickupBookingStatus.pending,
              ).length,
              color:
                "bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
            },
            {
              label: "Confirmed",
              count: bookings.filter(
                (b) => b.status === PickupBookingStatus.confirmed,
              ).length,
              color:
                "bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
            },
            {
              label: "Completed",
              count: bookings.filter(
                (b) => b.status === PickupBookingStatus.completed,
              ).length,
              color:
                "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300",
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`rounded-xl p-4 ${s.color} border border-border`}
            >
              <div className="text-2xl font-bold">{s.count}</div>
              <div className="text-xs font-medium opacity-70">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Filter by status:</span>
        <Select
          value={statusFilter}
          onValueChange={(v) =>
            setStatusFilter(v as PickupBookingStatus | "all")
          }
        >
          <SelectTrigger
            className="w-40 h-8 text-sm rounded-lg"
            data-ocid="admin.select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value={PickupBookingStatus.pending}>Pending</SelectItem>
            <SelectItem value={PickupBookingStatus.confirmed}>
              Confirmed
            </SelectItem>
            <SelectItem value={PickupBookingStatus.completed}>
              Completed
            </SelectItem>
            <SelectItem value={PickupBookingStatus.cancelled}>
              Cancelled
            </SelectItem>
          </SelectContent>
        </Select>
        {!demoMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2 ml-auto"
            data-ocid="admin.secondary_button"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        )}
      </div>

      {isLoading ? (
        <div
          className="flex items-center justify-center py-20"
          data-ocid="admin.loading_state"
        >
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="text-center py-20 rounded-2xl border border-dashed border-border"
          data-ocid="admin.empty_state"
        >
          <ClipboardList className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">
            {statusFilter === "all"
              ? "No pickup bookings yet"
              : `No ${statusFilter} bookings`}
          </p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            Bookings will appear here once sellers submit them
          </p>
        </div>
      ) : (
        <div
          className="rounded-2xl border border-border overflow-hidden"
          data-ocid="admin.table"
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold">
                  Booking ID
                </TableHead>
                <TableHead className="text-xs font-semibold">Seller</TableHead>
                <TableHead className="text-xs font-semibold">Phone</TableHead>
                <TableHead className="text-xs font-semibold">Device</TableHead>
                <TableHead className="text-xs font-semibold hidden md:table-cell">
                  Address
                </TableHead>
                <TableHead className="text-xs font-semibold">Date</TableHead>
                <TableHead className="text-xs font-semibold hidden lg:table-cell">
                  Time Slot
                </TableHead>
                <TableHead className="text-xs font-semibold">Price</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-xs font-semibold text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((booking, i) => (
                <TableRow
                  key={booking.id}
                  className="hover:bg-muted/30 transition-colors"
                  data-ocid={`admin.row.${i + 1}`}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    #{booking.id.slice(0, 8)}
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {booking.sellerName}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {booking.phone}
                  </TableCell>
                  <TableCell className="text-sm">
                    {booking.deviceModel}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden md:table-cell max-w-[180px] truncate">
                    {booking.address}
                  </TableCell>
                  <TableCell className="text-sm">{booking.date}</TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                    {booking.timeSlot}
                  </TableCell>
                  <TableCell className="text-sm font-semibold text-green-600">
                    {formatInr(booking.quotedPrice)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={booking.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {demoMode ? (
                      <span className="text-xs text-muted-foreground italic">
                        Demo
                      </span>
                    ) : (
                      <BookingActions booking={booking} index={i + 1} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function DealerKycTab({ demoMode }: { demoMode: boolean }) {
  const {
    data: liveRegistrations,
    isLoading,
    refetch,
    isFetching,
  } = useGetAllDealerRegistrations();

  const registrations = demoMode ? DEMO_REGISTRATIONS : liveRegistrations;
  const loading = demoMode ? false : isLoading;

  return (
    <div className="space-y-6">
      {registrations && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Total",
              count: registrations.length,
              color: "bg-muted text-foreground",
            },
            {
              label: "Pending",
              count: registrations.filter(
                (r) => r.kycStatus === DealerKycStatus.pending,
              ).length,
              color:
                "bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
            },
            {
              label: "Approved",
              count: registrations.filter(
                (r) => r.kycStatus === DealerKycStatus.approved,
              ).length,
              color:
                "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300",
            },
            {
              label: "Rejected",
              count: registrations.filter(
                (r) => r.kycStatus === DealerKycStatus.rejected,
              ).length,
              color:
                "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300",
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`rounded-xl p-4 ${s.color} border border-border`}
            >
              <div className="text-2xl font-bold">{s.count}</div>
              <div className="text-xs font-medium opacity-70">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {!demoMode && (
        <div className="flex items-center justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
            data-ocid="admin.secondary_button"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      )}

      {loading ? (
        <div
          className="flex items-center justify-center py-20"
          data-ocid="admin.loading_state"
        >
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : !registrations || registrations.length === 0 ? (
        <div
          className="text-center py-20 rounded-2xl border border-dashed border-border"
          data-ocid="admin.empty_state"
        >
          <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">
            No dealer registrations yet
          </p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            Registrations will appear here once dealers sign up at /b2b
          </p>
        </div>
      ) : (
        <div
          className="rounded-2xl border border-border overflow-hidden"
          data-ocid="admin.table"
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold">ID</TableHead>
                <TableHead className="text-xs font-semibold">
                  Name / Business
                </TableHead>
                <TableHead className="text-xs font-semibold">Type</TableHead>
                <TableHead className="text-xs font-semibold">
                  PAN / GST
                </TableHead>
                <TableHead className="text-xs font-semibold">Mobile</TableHead>
                <TableHead className="text-xs font-semibold">
                  KYC Status
                </TableHead>
                <TableHead className="text-xs font-semibold text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.map((reg, i) => (
                <TableRow
                  key={reg.id}
                  className="hover:bg-muted/30 transition-colors"
                  data-ocid={`admin.row.${i + 1}`}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    #{reg.id.slice(0, 8)}
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {reg.businessName || (
                      <span className="text-muted-foreground italic">
                        No name
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        reg.registrationType === DealerRegistrationType.seller
                          ? "bg-blue-50 text-blue-700 border-blue-200 text-xs"
                          : "bg-purple-50 text-purple-700 border-purple-200 text-xs"
                      }
                    >
                      {reg.registrationType === DealerRegistrationType.seller
                        ? "Seller"
                        : "Buyer"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {reg.registrationType === DealerRegistrationType.seller
                      ? reg.pan || "—"
                      : reg.gst || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {reg.mobile}
                  </TableCell>
                  <TableCell>
                    <KycBadge status={reg.kycStatus} />
                  </TableCell>
                  <TableCell className="text-right">
                    {demoMode ? (
                      <span className="text-xs text-muted-foreground italic">
                        Demo
                      </span>
                    ) : (
                      <DealerKycActions registration={reg} index={i + 1} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function BannerSlidesTab() {
  const loadSlides = (): BannerSlide[] => {
    try {
      const stored = localStorage.getItem("adminBannerSlides");
      return stored ? JSON.parse(stored) : [...BANNER_SLIDES];
    } catch {
      return [...BANNER_SLIDES];
    }
  };

  const [slides, setSlides] = useState<BannerSlide[]>(loadSlides);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<Partial<BannerSlide>>({});

  const save = (updated: BannerSlide[]) => {
    setSlides(updated);
    localStorage.setItem("adminBannerSlides", JSON.stringify(updated));
  };

  const handleDelete = (id: string) => {
    save(slides.filter((s) => s.id !== id));
  };

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    const arr = [...slides];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    save(arr);
  };

  const handleMoveDown = (idx: number) => {
    if (idx === slides.length - 1) return;
    const arr = [...slides];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    save(arr);
  };

  const handleEdit = (slide: BannerSlide) => {
    setEditingId(slide.id);
    setForm({ ...slide });
    setIsAdding(false);
  };

  const handleAddNew = () => {
    setIsAdding(true);
    setEditingId(null);
    setForm({
      id: `slide-${Date.now()}`,
      title: "",
      subtitle: "",
      ctaText: "Shop Now",
      ctaUrl: "/",
      bgFrom: "#0ea5e9",
      bgTo: "#38bdf8",
      accentColor: "#0369a1",
      productImage: "",
    });
  };

  const handleSaveForm = () => {
    if (!form.title?.trim()) return;
    const slide: BannerSlide = {
      id: form.id ?? `slide-${Date.now()}`,
      title: form.title ?? "",
      subtitle: form.subtitle ?? "",
      ctaText: form.ctaText ?? "Shop Now",
      ctaUrl: form.ctaUrl ?? "/",
      bgFrom: form.bgFrom ?? "#0ea5e9",
      bgTo: form.bgTo ?? "#38bdf8",
      accentColor: form.accentColor ?? "#0369a1",
      productImage: form.productImage ?? "",
    };
    if (editingId) {
      save(slides.map((s) => (s.id === editingId ? slide : s)));
    } else {
      save([...slides, slide]);
    }
    setEditingId(null);
    setIsAdding(false);
    setForm({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setForm({});
  };

  const handleReset = () => {
    localStorage.removeItem("adminBannerSlides");
    setSlides([...BANNER_SLIDES]);
    setEditingId(null);
    setIsAdding(false);
    setForm({});
  };

  const showForm = isAdding || editingId !== null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Banner Carousel Slides</h2>
          <p className="text-sm text-muted-foreground">
            Manage the homepage promotional carousel slides.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-1.5 text-xs"
            data-ocid="admin.secondary_button"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to Defaults
          </Button>
          <Button
            size="sm"
            onClick={handleAddNew}
            className="gap-1.5"
            disabled={showForm}
            data-ocid="admin.primary_button"
          >
            <Plus className="h-4 w-4" />
            Add Slide
          </Button>
        </div>
      </div>

      {showForm && (
        <div
          className="border border-border rounded-2xl p-5 bg-muted/30 space-y-4"
          data-ocid="admin.panel"
        >
          <h3 className="font-semibold text-sm">
            {editingId ? "Edit Slide" : "New Slide"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Title *</Label>
              <Input
                value={form.title ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="e.g. Price Crash Zone"
                data-ocid="admin.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Subtitle</Label>
              <Input
                value={form.subtitle ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subtitle: e.target.value }))
                }
                placeholder="Short description"
                data-ocid="admin.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">CTA Button Text</Label>
              <Input
                value={form.ctaText ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ctaText: e.target.value }))
                }
                placeholder="e.g. Order Now"
                data-ocid="admin.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">CTA URL</Label>
              <Input
                value={form.ctaUrl ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ctaUrl: e.target.value }))
                }
                placeholder="e.g. /  or  /?category=phones"
                data-ocid="admin.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Background From Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.bgFrom ?? "#0ea5e9"}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, bgFrom: e.target.value }))
                  }
                  className="h-9 w-14 rounded border border-border cursor-pointer"
                  data-ocid="admin.input"
                />
                <span className="text-xs text-muted-foreground font-mono">
                  {form.bgFrom}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Background To Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.bgTo ?? "#38bdf8"}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, bgTo: e.target.value }))
                  }
                  className="h-9 w-14 rounded border border-border cursor-pointer"
                  data-ocid="admin.input"
                />
                <span className="text-xs text-muted-foreground font-mono">
                  {form.bgTo}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Accent Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.accentColor ?? "#0369a1"}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, accentColor: e.target.value }))
                  }
                  className="h-9 w-14 rounded border border-border cursor-pointer"
                  data-ocid="admin.input"
                />
                <span className="text-xs text-muted-foreground font-mono">
                  {form.accentColor}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Product Image URL</Label>
              <Input
                value={form.productImage ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, productImage: e.target.value }))
                }
                placeholder="https://... or /assets/..."
                data-ocid="admin.input"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              onClick={handleSaveForm}
              data-ocid="admin.save_button"
            >
              Save Slide
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              data-ocid="admin.cancel_button"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3" data-ocid="admin.list">
        {slides.length === 0 && (
          <div
            className="text-center py-10 text-muted-foreground"
            data-ocid="admin.empty_state"
          >
            No slides yet. Click "Add Slide" to create one.
          </div>
        )}
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className="flex items-center gap-3 p-4 border border-border rounded-2xl bg-card hover:shadow-sm transition-shadow"
            data-ocid={`admin.item.${idx + 1}`}
          >
            {/* Color swatch */}
            <div
              className="w-10 h-10 rounded-xl shrink-0 border border-border"
              style={{
                background: `linear-gradient(135deg, ${slide.bgFrom}, ${slide.bgTo})`,
              }}
            />
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{slide.title}</p>
              <p className="text-xs text-muted-foreground truncate">
                {slide.subtitle}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-mono">
                  {slide.ctaText}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {slide.ctaUrl}
                </span>
              </div>
            </div>
            {/* Image preview */}
            {slide.productImage ? (
              <img
                src={slide.productImage}
                alt=""
                className="w-12 h-12 rounded-lg object-cover border border-border shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Image className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            {/* Actions */}
            <div className="flex flex-col gap-1 shrink-0">
              <button
                type="button"
                onClick={() => handleMoveUp(idx)}
                disabled={idx === 0}
                className="p-1 rounded hover:bg-muted disabled:opacity-30"
                aria-label="Move up"
                data-ocid="admin.button"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleMoveDown(idx)}
                disabled={idx === slides.length - 1}
                className="p-1 rounded hover:bg-muted disabled:opacity-30"
                aria-label="Move down"
                data-ocid="admin.button"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEdit(slide)}
                className="h-8 px-2.5 gap-1"
                data-ocid="admin.edit_button"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(slide.id)}
                className="h-8 px-2.5 gap-1 text-red-600 border-red-200 hover:bg-red-50"
                data-ocid="admin.delete_button"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { data: role, isLoading: roleLoading } = useGetCallerUserRole();
  const [demoMode, setDemoMode] = useState(false);

  const isAdmin = role === "admin" || demoMode;

  if (roleLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-[60vh]"
        data-ocid="admin.loading_state"
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4"
        data-ocid="admin.error_state"
      >
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <ShieldAlert className="h-8 w-8 text-destructive" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Admin Panel
          </h2>
          <p className="text-muted-foreground max-w-sm">
            Login with your admin credentials or use demo mode to preview the
            panel.
          </p>
        </div>

        {/* Demo Admin Login Card */}
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">Demo Admin Access</span>
            <Badge
              variant="outline"
              className="ml-auto text-xs bg-green-50 text-green-700 border-green-200"
            >
              Testing Mode
            </Badge>
          </div>
          <div className="rounded-lg bg-muted/60 p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">URL</span>
              <span className="font-mono font-medium">/admin</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Username</span>
              <span className="font-mono font-medium">admin@77mobiles</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Password</span>
              <span className="font-mono font-medium">Admin@77#2026</span>
            </div>
          </div>
          <Button
            className="w-full gap-2"
            onClick={() => setDemoMode(true)}
            data-ocid="admin.primary_button"
          >
            <Settings className="h-4 w-4" />
            Enter Admin Panel
          </Button>
        </div>

        <Link to="/">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" data-ocid="admin.page">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <ClipboardList className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">
            Manage bookings and dealer registrations
          </p>
        </div>
        {demoMode && (
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="bg-amber-50 text-amber-700 border-amber-200 text-xs"
            >
              Demo Mode — Sample Data
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDemoMode(false)}
              className="text-xs gap-1"
            >
              <XCircle className="h-3.5 w-3.5" />
              Exit Demo
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="bookings" data-ocid="admin.tab">
        <TabsList className="mb-6">
          <TabsTrigger value="bookings" className="gap-2" data-ocid="admin.tab">
            <ClipboardList className="h-4 w-4" />
            Pickup Bookings
          </TabsTrigger>
          <TabsTrigger
            value="dealer-kyc"
            className="gap-2"
            data-ocid="admin.tab"
          >
            <Users className="h-4 w-4" />
            Dealer KYC
          </TabsTrigger>
          <TabsTrigger
            value="banner-slides"
            className="gap-2"
            data-ocid="admin.tab"
          >
            <Settings className="h-4 w-4" />
            Banner Slides
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <PickupBookingsTab demoMode={demoMode} />
        </TabsContent>

        <TabsContent value="dealer-kyc">
          <DealerKycTab demoMode={demoMode} />
        </TabsContent>

        <TabsContent value="banner-slides">
          <BannerSlidesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
