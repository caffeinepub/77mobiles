import { PickupBookingStatus } from "@/backend";
import type { PickupBooking } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Loader2,
  RefreshCw,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import {
  useGetAllPickupBookings,
  useGetCallerUserRole,
  useUpdateBookingStatus,
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

export default function AdminPage() {
  const { data: role, isLoading: roleLoading } = useGetCallerUserRole();
  const {
    data: bookings,
    isLoading: bookingsLoading,
    refetch,
    isFetching,
  } = useGetAllPickupBookings();
  const [statusFilter, setStatusFilter] = useState<PickupBookingStatus | "all">(
    "all",
  );

  const isAdmin = role === "admin";
  const isLoading = roleLoading || bookingsLoading;

  const filtered = !bookings
    ? []
    : statusFilter === "all"
      ? bookings
      : bookings.filter((b) => b.status === statusFilter);

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
        className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4"
        data-ocid="admin.error_state"
      >
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <ShieldAlert className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          You don't have permission to view this page. Admin access required.
        </p>
        <Link to="/">
          <Button variant="outline" className="gap-2">
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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Pickup Bookings</p>
          </div>
        </div>
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

      {/* Stats Row */}
      {bookings && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
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

      {/* Filter */}
      <div className="flex items-center gap-3 mb-4">
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
        {filtered.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {filtered.length} booking{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Table */}
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
                    <BookingActions booking={booking} index={i + 1} />
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
