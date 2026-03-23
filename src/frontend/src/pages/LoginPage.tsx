import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useNavigate } from "@tanstack/react-router";
import { Apple, ArrowLeft, HelpCircle, Loader2, Phone, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

type Step = "idle" | "phone-entry" | "email-entry" | "otp-entry";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useInternetIdentity();

  const [step, setStep] = useState<Step>("idle");
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [inputError, setInputError] = useState("");

  // Show OTP sent toast when entering otp-entry step
  useEffect(() => {
    if (step === "otp-entry") {
      toast.info("OTP sent! Use 123456 for demo.");
    }
  }, [step]);

  const handleClose = () => {
    navigate({ to: "/" });
  };

  const handleSendOtp = () => {
    const value = phoneOrEmail.trim();
    if (step === "phone-entry") {
      if (value.length < 10) {
        setInputError("Please enter a valid 10-digit phone number.");
        return;
      }
    } else if (step === "email-entry") {
      if (!value.includes("@") || !value.includes(".")) {
        setInputError("Please enter a valid email address.");
        return;
      }
    }
    setInputError("");
    setOtp("");
    setStep("otp-entry");
  };

  const handleVerify = async () => {
    if (otp !== "123456") {
      toast.error("Incorrect OTP. Try again.");
      setOtp("");
      return;
    }
    setIsLoading(true);
    try {
      login();
      toast.success("Login successful! Welcome to 77mobiles.");
      navigate({ to: "/" });
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    setOtp("");
    toast.info("OTP resent! Use 123456 for demo.");
  };

  const handleBack = () => {
    setInputError("");
    setOtp("");
    if (step === "otp-entry") {
      setStep(phoneOrEmail.includes("@") ? "email-entry" : "phone-entry");
    } else {
      setStep("idle");
      setPhoneOrEmail("");
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[80] bg-white flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      data-ocid="login.page"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        {step !== "idle" ? (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Back"
            data-ocid="login.secondary_button"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleClose}
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
            data-ocid="login.close_button"
          >
            <X className="h-5 w-5 text-gray-700" />
          </button>
        )}
        <button
          type="button"
          className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-gray-100"
          onClick={() => toast.info("Help center coming soon!")}
          data-ocid="login.secondary_button"
        >
          <HelpCircle className="h-4 w-4" />
          Help
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center flex-1 px-6 pb-4">
        {/* Logo */}
        <div className="mb-6">
          <div className="flex items-baseline gap-0.5">
            <span className="text-4xl font-black text-primary tracking-tight">
              77
            </span>
            <span className="text-4xl font-black text-gray-900 tracking-tight">
              mobiles
            </span>
          </div>
          <div className="h-1 bg-primary rounded-full mt-1 mx-auto w-16" />
        </div>

        <AnimatePresence mode="wait">
          {step === "idle" && (
            <motion.div
              key="idle"
              className="w-full flex flex-col items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Welcome to 77mobiles
              </h1>
              <p className="text-sm text-gray-500 text-center leading-relaxed max-w-xs">
                The trusted marketplace for mobile auctions and electronics.
              </p>

              <div className="w-full max-w-sm mt-8 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep("phone-entry");
                    setPhoneOrEmail("");
                  }}
                  className="flex items-center gap-3 w-full h-12 px-5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors shadow-sm"
                  data-ocid="login.phone.button"
                >
                  <Phone className="h-5 w-5 text-gray-600 shrink-0" />
                  <span className="flex-1 text-center">
                    Continue with Phone
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => toast.info("Google login coming soon!")}
                  className="flex items-center gap-3 w-full h-12 px-5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors shadow-sm"
                  data-ocid="login.google.button"
                >
                  <GoogleIcon />
                  <span className="flex-1 text-center">
                    Continue with Google
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => toast.info("Apple Sign-In coming soon!")}
                  className="flex items-center gap-3 w-full h-12 px-5 bg-gray-900 rounded-lg text-sm font-medium text-white hover:bg-black transition-colors shadow-sm"
                  data-ocid="login.apple.button"
                >
                  <Apple className="h-5 w-5 text-white shrink-0" />
                  <span className="flex-1 text-center">Sign in with Apple</span>
                </button>
              </div>

              <div className="flex items-center gap-3 w-full max-w-sm mt-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">OR</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep("email-entry");
                  setPhoneOrEmail("");
                }}
                className="mt-3 text-sm text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
                data-ocid="login.email.link"
              >
                Login with Email
              </button>
            </motion.div>
          )}

          {(step === "phone-entry" || step === "email-entry") && (
            <motion.div
              key="entry"
              className="w-full flex flex-col items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-xl font-bold text-gray-900 text-center mb-1">
                {step === "phone-entry"
                  ? "Enter your phone number"
                  : "Enter your email"}
              </h1>
              <p className="text-sm text-gray-500 text-center mb-8">
                We'll send you a one-time verification code.
              </p>

              <div className="w-full max-w-sm">
                {step === "phone-entry" ? (
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
                    <span className="bg-gray-50 px-3 py-3 text-sm text-gray-600 font-medium border-r border-gray-300 select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={phoneOrEmail}
                      onChange={(e) => {
                        setPhoneOrEmail(e.target.value.replace(/\D/g, ""));
                        setInputError("");
                      }}
                      className="flex-1 px-3 py-3 text-sm outline-none bg-white"
                      data-ocid="login.input"
                    />
                  </div>
                ) : (
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={phoneOrEmail}
                    onChange={(e) => {
                      setPhoneOrEmail(e.target.value);
                      setInputError("");
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    data-ocid="login.input"
                  />
                )}
                {inputError && (
                  <p
                    className="text-xs text-red-500 mt-1.5"
                    data-ocid="login.error_state"
                  >
                    {inputError}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="mt-4 w-full h-12 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                  data-ocid="login.submit_button"
                >
                  Send OTP
                </button>
              </div>
            </motion.div>
          )}

          {step === "otp-entry" && (
            <motion.div
              key="otp"
              className="w-full flex flex-col items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-xl font-bold text-gray-900 text-center mb-1">
                Enter verification code
              </h1>
              <p className="text-sm text-gray-500 text-center mb-8">
                Sent to{" "}
                <span className="font-medium text-gray-700">
                  {step === "otp-entry" && phoneOrEmail.includes("@")
                    ? phoneOrEmail
                    : `+91 ${phoneOrEmail}`}
                </span>
              </p>

              <div className="flex justify-center mb-6">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(val) => setOtp(val)}
                  data-ocid="login.input"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="w-full max-w-sm">
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={otp.length < 6 || isLoading}
                  className="w-full h-12 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  data-ocid="login.submit_button"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Verify
                </button>

                <p className="text-center text-sm text-gray-500 mt-4">
                  Didn't receive it?{" "}
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
                    data-ocid="login.secondary_button"
                  >
                    Resend
                  </button>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer legal */}
      <div className="px-6 pb-8 text-center">
        <p className="text-[11px] text-gray-400 leading-relaxed max-w-xs mx-auto">
          If You Continue You Are Accepting 77mobiles{" "}
          <button
            type="button"
            onClick={() => toast.info("Terms & Conditions coming soon!")}
            className="text-primary underline underline-offset-1"
            data-ocid="login.terms.link"
          >
            Terms And Conditions
          </button>{" "}
          And{" "}
          <button
            type="button"
            onClick={() => toast.info("Privacy Policy coming soon!")}
            className="text-primary underline underline-offset-1"
            data-ocid="login.privacy.link"
          >
            Privacy Policy
          </button>
          .
        </p>
      </div>
    </motion.div>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      className="shrink-0"
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
