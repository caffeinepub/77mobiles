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
  Store,
  Truck,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  DealerRegistrationType,
  useSubmitDealerRegistration,
} from "../hooks/useQueries";

const DEMO_KEY = "77mobiles_demo_dealer";

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
  const { identity } = useInternetIdentity();
  const { mutate: submitRegistration, isPending } =
    useSubmitDealerRegistration();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity) {
      toast.error(
        "Please login with Internet Identity to register as a dealer",
      );
      return;
    }
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
    submitRegistration(
      {
        pan: pan.toUpperCase(),
        gst: "",
        aadhaarHash: aadhaarDigits,
        mobile,
        businessName,
        registrationType: DealerRegistrationType.seller,
      },
      {
        onSuccess: () => {
          toast.success(
            "Registration submitted! Our team will verify your details within 24 hours.",
          );
          onSuccess("Seller / Dealer");
        },
        onError: () => {
          toast.error("Registration failed. Please try again.");
        },
      },
    );
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
      {!identity && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-xs text-amber-700 font-medium">
            ⚠ Please login with Internet Identity to register as a dealer. Use
            the Demo Testing section below to test without login.
          </p>
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="pan" className="text-gray-700 font-semibold text-sm">
          PAN Card Number <span className="text-red-500">*</span>
        </Label>
        <Input
          id="pan"
          placeholder="ABCDE1234F"
          value={pan}
          onChange={(e) => setPan(e.target.value.toUpperCase())}
          maxLength={10}
          className="font-mono tracking-widest uppercase border-gray-200 bg-gray-50 focus:border-blue-500"
          data-ocid="b2b.seller.input"
        />
        <p className="text-xs text-gray-400">10-character alphanumeric PAN</p>
      </div>
      <div className="space-y-1.5">
        <Label
          htmlFor="seller-aadhaar"
          className="text-gray-700 font-semibold text-sm"
        >
          Aadhaar Number <span className="text-red-500">*</span>
        </Label>
        <Input
          id="seller-aadhaar"
          placeholder="XXXX XXXX XXXX"
          value={aadhaar}
          onChange={(e) => setAadhaar(formatAadhaar(e.target.value))}
          maxLength={14}
          className="font-mono tracking-wider border-gray-200 bg-gray-50 focus:border-blue-500"
          data-ocid="b2b.seller.input"
        />
      </div>
      <div className="space-y-1.5">
        <Label
          htmlFor="seller-mobile"
          className="text-gray-700 font-semibold text-sm"
        >
          Mobile Number <span className="text-red-500">*</span>
        </Label>
        <Input
          id="seller-mobile"
          type="tel"
          placeholder="+91 98765 43210"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          className="border-gray-200 bg-gray-50 focus:border-blue-500"
          data-ocid="b2b.seller.input"
        />
      </div>
      <div className="space-y-1.5">
        <Label
          htmlFor="seller-business"
          className="text-gray-700 font-semibold text-sm"
        >
          Business Name{" "}
          <span className="text-gray-400 font-normal">(optional)</span>
        </Label>
        <Input
          id="seller-business"
          placeholder="e.g. Sharma Mobile Traders"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          className="border-gray-200 bg-gray-50 focus:border-blue-500"
          data-ocid="b2b.seller.input"
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-11"
        disabled={isPending}
        data-ocid="b2b.seller.submit_button"
      >
        {isPending ? "Submitting..." : "Register as Seller Dealer"}
      </Button>
    </form>
  );
}

function BuyerForm({ onSuccess }: { onSuccess: (type: string) => void }) {
  const [gst, setGst] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [mobile, setMobile] = useState("");
  const [businessName, setBusinessName] = useState("");
  const { identity } = useInternetIdentity();
  const { mutate: submitRegistration, isPending } =
    useSubmitDealerRegistration();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity) {
      toast.error(
        "Please login with Internet Identity to register as a dealer",
      );
      return;
    }
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
    submitRegistration(
      {
        pan: "",
        gst: gst.toUpperCase(),
        aadhaarHash: aadhaarDigits,
        mobile,
        businessName,
        registrationType: DealerRegistrationType.buyer,
      },
      {
        onSuccess: () => {
          toast.success(
            "Registration submitted! Our team will verify your details within 24 hours.",
          );
          onSuccess("Business Buyer");
        },
        onError: () => {
          toast.error("Registration failed. Please try again.");
        },
      },
    );
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
      {!identity && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-xs text-amber-700 font-medium">
            ⚠ Please login with Internet Identity to register as a dealer. Use
            the Demo Testing section below to test without login.
          </p>
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="gst" className="text-gray-700 font-semibold text-sm">
          GST Number <span className="text-red-500">*</span>
        </Label>
        <Input
          id="gst"
          placeholder="22AAAAA0000A1Z5"
          value={gst}
          onChange={(e) => setGst(e.target.value.toUpperCase())}
          maxLength={15}
          className="font-mono tracking-widest uppercase border-gray-200 bg-gray-50 focus:border-blue-500"
          data-ocid="b2b.buyer.input"
        />
        <p className="text-xs text-gray-400">
          15-character GST Identification Number
        </p>
      </div>
      <div className="space-y-1.5">
        <Label
          htmlFor="buyer-aadhaar"
          className="text-gray-700 font-semibold text-sm"
        >
          Aadhaar Number <span className="text-red-500">*</span>
        </Label>
        <Input
          id="buyer-aadhaar"
          placeholder="XXXX XXXX XXXX"
          value={aadhaar}
          onChange={(e) => setAadhaar(formatAadhaar(e.target.value))}
          maxLength={14}
          className="font-mono tracking-wider border-gray-200 bg-gray-50 focus:border-blue-500"
          data-ocid="b2b.buyer.input"
        />
      </div>
      <div className="space-y-1.5">
        <Label
          htmlFor="buyer-mobile"
          className="text-gray-700 font-semibold text-sm"
        >
          Mobile Number <span className="text-red-500">*</span>
        </Label>
        <Input
          id="buyer-mobile"
          type="tel"
          placeholder="+91 98765 43210"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          className="border-gray-200 bg-gray-50 focus:border-blue-500"
          data-ocid="b2b.buyer.input"
        />
      </div>
      <div className="space-y-1.5">
        <Label
          htmlFor="buyer-business"
          className="text-gray-700 font-semibold text-sm"
        >
          Business Name{" "}
          <span className="text-gray-400 font-normal">(optional)</span>
        </Label>
        <Input
          id="buyer-business"
          placeholder="e.g. TechZone Pvt. Ltd."
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          className="border-gray-200 bg-gray-50 focus:border-blue-500"
          data-ocid="b2b.buyer.input"
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-11"
        disabled={isPending}
        data-ocid="b2b.buyer.submit_button"
      >
        {isPending ? "Submitting..." : "Register as Business Buyer"}
      </Button>
    </form>
  );
}

export default function DealerSignupPage() {
  const navigate = useNavigate();
  const [successType, setSuccessType] = useState<string | null>(null);

  const handleDemoLogin = (type: "seller" | "buyer") => {
    const demoData =
      type === "seller"
        ? {
            type: "seller",
            name: "Test Seller Dealer",
            mobile: "+91 98765 00001",
            kycStatus: "approved",
            isDemoUser: true,
          }
        : {
            type: "buyer",
            name: "Test Business Buyer",
            mobile: "+91 98765 00002",
            kycStatus: "approved",
            isDemoUser: true,
          };
    localStorage.setItem(DEMO_KEY, JSON.stringify(demoData));
    navigate({ to: "/dealer" });
  };

  if (successType) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center px-4">
        <div
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 max-w-md w-full text-center"
          data-ocid="b2b.success_state"
        >
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="font-black text-gray-900 text-2xl mb-2">
            Registration Submitted!
          </h2>
          <p className="text-gray-500 text-sm mb-1">
            You've registered as a{" "}
            <span className="font-semibold text-gray-900">{successType}</span>.
          </p>
          <p className="text-gray-400 text-sm mb-8">
            Our team will verify your KYC details within 24 hours.
          </p>
          <Button
            onClick={() => navigate({ to: "/" })}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-8"
            data-ocid="b2b.primary_button"
          >
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            <Building2 className="h-3.5 w-3.5" />
            B2B / Dealer Zone
          </div>
          <h1 className="font-black text-4xl text-blue-600 mb-1">
            77mobiles.pro
          </h1>
          <p className="text-gray-500 text-base font-medium mb-1">
            Dealer Registration
          </p>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Join India's most trusted gadget dealer network. Get access to
            exclusive bulk pricing, priority support, and a verified dealer
            badge.
          </p>
        </div>

        {/* Benefits grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {BENEFITS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-start gap-3 p-4 rounded-2xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="h-8 w-8 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Registration Tabs */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <Tabs defaultValue="seller" data-ocid="b2b.tab">
            <TabsList className="w-full mb-6 bg-gray-100">
              <TabsTrigger
                value="seller"
                className="flex-1 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:font-bold"
                data-ocid="b2b.tab"
              >
                <Store className="h-3.5 w-3.5 mr-1.5" /> Seller / Dealer
              </TabsTrigger>
              <TabsTrigger
                value="buyer"
                className="flex-1 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:font-bold"
                data-ocid="b2b.tab"
              >
                Business Buyer
              </TabsTrigger>
            </TabsList>
            <TabsContent value="seller">
              <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-100">
                <p className="text-xs text-blue-700 font-medium">
                  For businesses selling mobile devices and electronics in bulk
                  — retailers, wholesalers, refurbishers.
                </p>
              </div>
              <SellerForm onSuccess={setSuccessType} />
            </TabsContent>
            <TabsContent value="buyer">
              <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-100">
                <p className="text-xs text-green-700 font-medium">
                  For businesses procuring devices in bulk — corporate buyers,
                  resellers, service chains.
                </p>
              </div>
              <BuyerForm onSuccess={setSuccessType} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Security note */}
        <div className="mt-6 flex items-start gap-3 p-4 rounded-2xl bg-white border border-gray-200">
          <ShieldCheck className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-gray-900 mb-0.5">
              Your data is safe with us
            </p>
            <p className="text-xs text-gray-500">
              Your Aadhaar and PAN details are encrypted and used only for KYC
              verification. We do not store raw identity numbers.
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
          <Lock className="h-3.5 w-3.5" />
          <span>256-bit encrypted · UIDAI compliant · ISO 27001 certified</span>
        </div>

        {/* Demo Testing Panel */}
        <div
          className="mt-8 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 p-6"
          data-ocid="b2b.panel"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-blue-200 flex items-center justify-center">
              <span className="text-sm">🧪</span>
            </div>
            <span className="text-sm font-bold text-blue-700">
              Demo Testing Mode
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Use these test accounts to preview the dealer dashboard without
            Internet Identity login.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1 border-blue-400 text-blue-700 hover:bg-blue-100 hover:border-blue-500 font-bold rounded-xl"
              onClick={() => handleDemoLogin("seller")}
              data-ocid="b2b.primary_button"
            >
              🧪 Login as Test Seller
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-green-400 text-green-700 hover:bg-green-50 hover:border-green-500 font-bold rounded-xl"
              onClick={() => handleDemoLogin("buyer")}
              data-ocid="b2b.secondary_button"
            >
              🧪 Login as Test Buyer
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-600"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
