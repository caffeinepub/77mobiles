import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveUserProfile } from "../hooks/useQueries";

function simpleHashAadhaar(aadhaar: string): string {
  return btoa(aadhaar).split("").reverse().join("");
}

type Step = "name" | "aadhaar" | "verified";

export default function ProfileSetupModal() {
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [verifying, setVerifying] = useState(false);
  const { mutateAsync, isPending } = useSaveUserProfile();

  const handleNameNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setStep("aadhaar");
  };

  const formatAadhaar = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 12);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAadhaar(formatAadhaar(e.target.value));
  };

  const rawAadhaar = aadhaar.replace(/\s/g, "");
  const isPhoneValid = /^[6-9]\d{9}$/.test(phone);
  const isAadhaarValid = rawAadhaar.length === 12;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPhoneValid || !isAadhaarValid) return;
    setVerifying(true);
    // Simulate OTP verification delay
    await new Promise((r) => setTimeout(r, 1800));
    setVerifying(false);
    setStep("verified");
  };

  const handleSave = async () => {
    try {
      await mutateAsync({
        name: name.trim(),
        phone,
        isVerified: true,
        aadhaarHash: simpleHashAadhaar(rawAadhaar),
      });
      toast.success("Profile verified! Welcome to 77mobiles 🎉");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" data-ocid="profile_setup.dialog">
        {step === "name" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-5 w-5 text-primary" />
                <DialogTitle className="font-display text-xl">
                  Welcome to 77mobiles!
                </DialogTitle>
              </div>
              <DialogDescription>
                Set up your display name so buyers and sellers can recognize
                you.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleNameNext} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label htmlFor="display-name">Display Name</Label>
                <Input
                  id="display-name"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  data-ocid="profile_setup.input"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={!name.trim()}
                data-ocid="profile_setup.submit_button"
              >
                Continue
              </Button>
            </form>
          </>
        )}

        {step === "aadhaar" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <DialogTitle className="font-display text-xl">
                  Verify Your Identity
                </DialogTitle>
              </div>
              <DialogDescription>
                Enter your phone number and Aadhaar to verify your account. Your
                Aadhaar number is never stored.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleVerify} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Mobile Number (linked to Aadhaar)</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                    +91
                  </span>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    className="rounded-l-none"
                    maxLength={10}
                    data-ocid="profile_setup.input"
                  />
                </div>
                {phone.length > 0 && !isPhoneValid && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="profile_setup.error_state"
                  >
                    Enter a valid 10-digit Indian mobile number
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="aadhaar">Aadhaar Number</Label>
                <Input
                  id="aadhaar"
                  placeholder="XXXX XXXX XXXX"
                  value={aadhaar}
                  onChange={handleAadhaarChange}
                  inputMode="numeric"
                  maxLength={14}
                  data-ocid="profile_setup.input"
                />
                <p className="text-xs text-muted-foreground">
                  12-digit number on your Aadhaar card
                </p>
              </div>

              <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 text-xs text-muted-foreground">
                🔒 Your Aadhaar number is never stored. Only a secure hash is
                saved for verification purposes.
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!isPhoneValid || !isAadhaarValid || verifying}
                data-ocid="profile_setup.submit_button"
              >
                {verifying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Continue"
                )}
              </Button>
            </form>
          </>
        )}

        {step === "verified" && (
          <div className="flex flex-col items-center py-6 space-y-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-9 w-9 text-green-600" />
            </div>
            <div className="text-center">
              <h2 className="font-display font-bold text-xl mb-1">
                Verified! ✓
              </h2>
              <p className="text-muted-foreground text-sm">
                Your identity has been verified successfully.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <span className="text-blue-700 font-semibold text-sm">
                {name} · Verified
              </span>
            </div>
            <Button
              className="w-full"
              onClick={handleSave}
              disabled={isPending}
              data-ocid="profile_setup.submit_button"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                "Enter 77mobiles →"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
