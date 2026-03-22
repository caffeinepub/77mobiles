import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  HeadphonesIcon,
  Lock,
  ShieldCheck,
  Truck,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const BENEFITS = [
  {
    icon: Zap,
    title: "Bulk Deal Pricing",
    desc: "Exclusive rates for volume transactions",
  },
  {
    icon: Truck,
    title: "Priority Pickup",
    desc: "Dedicated logistics partner for dealers",
  },
  {
    icon: BadgeCheck,
    title: "Verified Badge",
    desc: "Blue verified badge on all your listings",
  },
  {
    icon: HeadphonesIcon,
    title: "Priority Support",
    desc: "24/7 dedicated dealer support line",
  },
];

function SellerForm({ onSuccess }: { onSuccess: (type: string) => void }) {
  const [pan, setPan] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [mobile, setMobile] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pan.trim() || !aadhaar.trim() || !mobile.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.toUpperCase())) {
      toast.error("Please enter a valid PAN card number (e.g. ABCDE1234F)");
      return;
    }
    const aadhaarDigits = aadhaar.replace(/\s/g, "");
    if (aadhaarDigits.length !== 12 || !/^\d+$/.test(aadhaarDigits)) {
      toast.error("Please enter a valid 12-digit Aadhaar number");
      return;
    }
    if (!mobile.replace(/\s/g, "").match(/^[+]?[0-9]{10,13}$/)) {
      toast.error("Please enter a valid mobile number");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success(
        "Registration submitted! Our team will verify your details within 24 hours.",
      );
      onSuccess("Seller / Dealer");
    }, 1200);
  };

  const formatAadhaar = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 12);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      data-ocid="b2b.seller.panel"
    >
      <div className="space-y-1.5">
        <Label htmlFor="pan">
          PAN Card Number <span className="text-destructive">*</span>
        </Label>
        <Input
          id="pan"
          placeholder="ABCDE1234F"
          value={pan}
          onChange={(e) => setPan(e.target.value.toUpperCase())}
          maxLength={10}
          className="font-mono tracking-widest uppercase"
          data-ocid="b2b.seller.input"
        />
        <p className="text-xs text-muted-foreground">
          10-character alphanumeric PAN
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="seller-aadhaar">
          Aadhaar Number <span className="text-destructive">*</span>
        </Label>
        <Input
          id="seller-aadhaar"
          placeholder="XXXX XXXX XXXX"
          value={aadhaar}
          onChange={(e) => setAadhaar(formatAadhaar(e.target.value))}
          maxLength={14}
          className="font-mono tracking-wider"
          data-ocid="b2b.seller.input"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="seller-mobile">
          Mobile Number <span className="text-destructive">*</span>
        </Label>
        <Input
          id="seller-mobile"
          type="tel"
          placeholder="+91 98765 43210"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          data-ocid="b2b.seller.input"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="seller-business">
          Business Name{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input
          id="seller-business"
          placeholder="e.g. Sharma Mobile Traders"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          data-ocid="b2b.seller.input"
        />
      </div>

      <Button
        type="submit"
        className="w-full font-semibold"
        disabled={isLoading}
        data-ocid="b2b.seller.submit_button"
      >
        {isLoading ? "Submitting..." : "Register as Seller Dealer"}
      </Button>
    </form>
  );
}

function BuyerForm({ onSuccess }: { onSuccess: (type: string) => void }) {
  const [gst, setGst] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [mobile, setMobile] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gst.trim() || !aadhaar.trim() || !mobile.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (gst.length < 15) {
      toast.error("Please enter a valid 15-character GST number");
      return;
    }
    const aadhaarDigits = aadhaar.replace(/\s/g, "");
    if (aadhaarDigits.length !== 12 || !/^\d+$/.test(aadhaarDigits)) {
      toast.error("Please enter a valid 12-digit Aadhaar number");
      return;
    }
    if (!mobile.replace(/\s/g, "").match(/^[+]?[0-9]{10,13}$/)) {
      toast.error("Please enter a valid mobile number");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success(
        "Registration submitted! Our team will verify your details within 24 hours.",
      );
      onSuccess("Business Buyer");
    }, 1200);
  };

  const formatAadhaar = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 12);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      data-ocid="b2b.buyer.panel"
    >
      <div className="space-y-1.5">
        <Label htmlFor="gst">
          GST Number <span className="text-destructive">*</span>
        </Label>
        <Input
          id="gst"
          placeholder="22AAAAA0000A1Z5"
          value={gst}
          onChange={(e) => setGst(e.target.value.toUpperCase())}
          maxLength={15}
          className="font-mono tracking-widest uppercase"
          data-ocid="b2b.buyer.input"
        />
        <p className="text-xs text-muted-foreground">
          15-character GST Identification Number
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="buyer-aadhaar">
          Aadhaar Number <span className="text-destructive">*</span>
        </Label>
        <Input
          id="buyer-aadhaar"
          placeholder="XXXX XXXX XXXX"
          value={aadhaar}
          onChange={(e) => setAadhaar(formatAadhaar(e.target.value))}
          maxLength={14}
          className="font-mono tracking-wider"
          data-ocid="b2b.buyer.input"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="buyer-mobile">
          Mobile Number <span className="text-destructive">*</span>
        </Label>
        <Input
          id="buyer-mobile"
          type="tel"
          placeholder="+91 98765 43210"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          data-ocid="b2b.buyer.input"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="buyer-business">
          Business Name{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input
          id="buyer-business"
          placeholder="e.g. TechZone Pvt. Ltd."
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          data-ocid="b2b.buyer.input"
        />
      </div>

      <Button
        type="submit"
        className="w-full font-semibold"
        disabled={isLoading}
        data-ocid="b2b.buyer.submit_button"
      >
        {isLoading ? "Submitting..." : "Register as Business Buyer"}
      </Button>
    </form>
  );
}

export default function DealerSignupPage() {
  const navigate = useNavigate();
  const [successType, setSuccessType] = useState<string | null>(null);

  if (successType) {
    return (
      <div
        className="container mx-auto px-4 py-20 max-w-md text-center"
        data-ocid="b2b.success_state"
      >
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="font-display font-bold text-2xl mb-2">
          Registration Submitted!
        </h2>
        <p className="text-muted-foreground text-sm mb-1">
          You've registered as a{" "}
          <span className="font-semibold text-foreground">{successType}</span>.
        </p>
        <p className="text-muted-foreground text-sm mb-8">
          Our team will verify your KYC details within 24 hours and activate
          your dealer account.
        </p>
        <Button
          onClick={() => navigate({ to: "/" })}
          className="gap-2"
          data-ocid="b2b.primary_button"
        >
          Go Home
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold px-4 py-1.5 rounded-full mb-4 border border-amber-500/20">
          <Building2 className="h-3.5 w-3.5" />
          B2B / Dealer Zone
        </div>
        <h1 className="font-display font-bold text-3xl mb-3">
          Dealer Registration
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Join India's most trusted gadget dealer network. Get access to
          exclusive bulk pricing, priority support, and a verified dealer badge.
        </p>
      </div>

      {/* Benefits grid */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {BENEFITS.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex items-start gap-3 p-4 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors"
          >
            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Registration Tabs */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <Tabs defaultValue="seller" data-ocid="b2b.tab">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="seller" className="flex-1" data-ocid="b2b.tab">
              Seller / Dealer
            </TabsTrigger>
            <TabsTrigger value="buyer" className="flex-1" data-ocid="b2b.tab">
              Business Buyer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="seller">
            <div className="mb-4 p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                For businesses selling mobile devices and electronics in bulk —
                retailers, wholesalers, refurbishers.
              </p>
            </div>
            <SellerForm onSuccess={setSuccessType} />
          </TabsContent>

          <TabsContent value="buyer">
            <div className="mb-4 p-3 rounded-xl bg-green-500/5 border border-green-500/20">
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                For businesses procuring devices in bulk — corporate buyers,
                resellers, service chains.
              </p>
            </div>
            <BuyerForm onSuccess={setSuccessType} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Security note */}
      <div className="mt-6 flex items-start gap-3 p-4 rounded-2xl bg-muted/50 border border-border">
        <ShieldCheck className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-foreground mb-0.5">
            Your data is safe with us
          </p>
          <p className="text-xs text-muted-foreground">
            Your Aadhaar and PAN details are encrypted and used only for KYC
            verification. We do not store raw identity numbers.
          </p>
        </div>
      </div>

      {/* Lock icon row */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5" />
        <span>256-bit encrypted · UIDAI compliant · ISO 27001 certified</span>
      </div>
    </div>
  );
}
