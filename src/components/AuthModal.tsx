
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Google SVG
const GoogleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
    <g>
      <path d="M44.5 20H24V28.5H36.9C35.5 33.1 31.2 36.5 24 36.5C16.3 36.5 10 30.2 10 22.5C10 14.8 16.3 8.5 24 8.5C27.2 8.5 29.9 9.6 32 11.5L37.3 6.2C33.7 2.9 29.2 1 24 1C12.4 1 3 10.4 3 22C3 33.6 12.4 43 24 43C35.6 43 45 33.6 45 22C45 20.7 44.8 19.4 44.5 20Z" fill="#FFC107"/>
      <path d="M6.3 14.7L12.7 19.2C14.5 15.2 18.8 12.5 24 12.5C26.7 12.5 29.1 13.4 31 14.9L36.2 9.7C32.8 6.8 28.7 5 24 5C16.3 5 10 11.3 10 19C10 20.2 10.2 21.4 10.5 22.5L6.3 14.7Z" fill="#FF3D00"/>
      <path d="M24 43C29.2 43 33.7 41.1 37.3 37.8L32.2 33.1C30.3 34.6 27.7 35.5 24 35.5C16.8 35.5 12.5 32.1 11.1 27.5L6.3 33.3C10.2 38.2 16.3 43 24 43Z" fill="#4CAF50"/>
      <path d="M44.5 20H24V28.5H36.9C36.3 30.6 34.9 32.3 32.2 33.1L37.3 37.8C40.6 34.7 43 29.9 43 24C43 22.7 42.8 21.4 42.5 20Z" fill="#1976D2"/>
    </g>
  </svg>
);

const PhoneIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm0 12a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2zm12-12a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zm0 12a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  // Phone auth state
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  // Email/Password logic
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Account created! Please check your email to verify your account.");
        onOpenChange(false);
      }
    } catch (error) {
      toast.error("An error occurred during sign up");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Welcome back!");
        onOpenChange(false);
      }
    } catch (error) {
      toast.error("An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };

  // Google sign in
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) toast.error(error.message);
    } catch (error) {
      toast.error("Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  // Phone OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      toast.error("Please enter your phone number");
      return;
    }
    setPhoneLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) {
        toast.error(error.message);
      } else {
        setOtpSent(true);
        toast.success("OTP sent to your phone");
      }
    } catch (error) {
      toast.error("Failed to send OTP");
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !otp) {
      toast.error("Please enter phone and OTP");
      return;
    }
    setPhoneLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Phone login successful!");
        onOpenChange(false);
      }
    } catch (error) {
      toast.error("OTP verification failed");
    } finally {
      setPhoneLoading(false);
    }
  };

  // Flip card CSS
  const flipCardStyles = {
    perspective: '1200px',
    width: '100%',
    minHeight: '350px',
    position: 'relative' as React.CSSProperties['position'],
  };
  const flipInnerStyles = {
    transition: 'transform 0.7s cubic-bezier(.4,2,.3,1)',
    transformStyle: 'preserve-3d' as React.CSSProperties['transformStyle'],
    position: 'relative' as React.CSSProperties['position'],
    width: '100%',
    minHeight: '350px',
    transform: isSignIn ? 'rotateY(0deg)' : 'rotateY(180deg)',
  };
  const flipFaceStyles = {
    position: 'absolute' as React.CSSProperties['position'],
    width: '100%',
    backfaceVisibility: 'hidden' as React.CSSProperties['backfaceVisibility'],
    top: '0',
    left: '0',
  };
  const flipBackStyles = {
    ...flipFaceStyles,
    transform: 'rotateY(180deg)',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-green-950 dark:via-gray-900 dark:to-green-900 shadow-xl rounded-xl p-0 overflow-visible">
        <DialogHeader className="pb-3 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-4xl bg-green-100 dark:bg-green-900 shadow-inner mb-2 animate-bounce-slow">
            🔐
          </div>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-bold text-green-900 dark:text-green-200">
            {isSignIn ? 'Sign In to your account' : 'Create a new account'}
          </DialogTitle>
        </DialogHeader>
        <div style={flipCardStyles}>
          <div style={flipInnerStyles}>
            {/* Sign In Face */}
            <div style={flipFaceStyles} className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
              <div className="my-4 flex flex-col gap-2">
                <Button onClick={handleGoogleSignIn} className="w-full flex items-center justify-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold shadow-sm" disabled={loading}>
                  <GoogleLogo /> Sign in with Google
                </Button>
                <Button onClick={() => setShowPhone((v) => !v)} className="w-full flex items-center justify-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold shadow-sm" type="button">
                  <PhoneIcon /> Sign in with Phone
                </Button>
              </div>
              {showPhone && (
                <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4 mt-2">
                  <div>
                    <Label htmlFor="phone-number">Phone Number</Label>
                    <Input
                      id="phone-number"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91XXXXXXXXXX"
                      className="mt-1"
                      disabled={otpSent}
                    />
                  </div>
                  {otpSent && (
                    <div>
                      <Label htmlFor="otp">OTP</Label>
                      <Input
                        id="otp"
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter OTP"
                        className="mt-1"
                      />
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={phoneLoading}>
                    {phoneLoading ? (otpSent ? "Verifying..." : "Sending OTP...") : (otpSent ? "Verify OTP" : "Send OTP")}
                  </Button>
                  {otpSent && (
                    <Button type="button" variant="outline" className="w-full" onClick={() => { setOtpSent(false); setOtp(""); }}>
                      Change Phone Number
                    </Button>
                  )}
                </form>
              )}
              <div className="mt-6 text-center">
                <span className="text-sm text-gray-500">Don't have an account? </span>
                <button type="button" className="text-green-700 font-semibold hover:underline" onClick={() => setIsSignIn(false)}>
                  Sign Up
                </button>
              </div>
            </div>
            {/* Sign Up Face */}
            <div style={flipBackStyles} className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
              <div className="mt-6 text-center">
                <span className="text-sm text-gray-500">Already have an account? </span>
                <button type="button" className="text-green-700 font-semibold hover:underline" onClick={() => setIsSignIn(true)}>
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
