import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const LoginOtp: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!/^\d{10}$/.test(mobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: mobile, // Adjust country code as needed
        options: { shouldCreateUser: false },
      });
      if (error) {
        if (error.code === "otp_disabled" || 
            (error.message && error.message.toLowerCase().includes("not found")) ||
            (error.message && error.message.toLowerCase().includes("signups not allowed"))) {
          setError("This mobile number is not registered. Please check your number or sign up first.");
        } else {
          setError(error.message || "Failed to send OTP.");
        }
        setLoading(false);
        return;
      }
      setStep(2);
      setSuccess("OTP sent to your mobile number.");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and log in
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the 6-digit OTP sent to your mobile.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: mobile,
        token: otp,
        type: "sms",
      });
      if (error) throw error;
      // Store session token and user info
      if (data.session?.access_token) {
        localStorage.setItem("authToken", data.session.access_token);
        localStorage.setItem("userType", "user"); // Optionally fetch user type from your users table
        localStorage.setItem("userName", data.user?.user_metadata?.name || "");
        localStorage.setItem("userEmail", data.user?.email || "");
      }
      setSuccess("Login successful!");
      setTimeout(() => navigate("/"), 1000);
    } catch (err: any) {
      setError(err.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header title="Login via OTP" showBack={true} logoSrc="/cableCartLogo.png" />
      <main className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Login via OTP</CardTitle>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    value={mobile}
                    onChange={e => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="Enter your 10-digit mobile number"
                    required
                    maxLength={10}
                    autoFocus
                  />
                </div>
                {error && <div className="text-red-600 text-sm">{error}</div>}
                {success && <div className="text-green-600 text-sm">{success}</div>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send OTP"}
                </Button>
                <div className="text-center">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate("/login")}
                    className="w-full"
                  >
                    Back to Login
                  </Button>
                </div>
              </form>
            )}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                    autoFocus
                  >
                    <InputOTPGroup>
                      {[...Array(6)].map((_, i) => (
                        <InputOTPSlot key={i} index={i} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {error && <div className="text-red-600 text-sm">{error}</div>}
                {success && <div className="text-green-600 text-sm">{success}</div>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Verifying..." : "Verify OTP & Login"}
                </Button>
                <div className="text-center">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setStep(1)}
                    className="w-full"
                  >
                    Back to Step 1
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LoginOtp; 