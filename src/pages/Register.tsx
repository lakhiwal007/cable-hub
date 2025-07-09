import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, UserPlus, Check, X, Phone } from "lucide-react";
import apiClient from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token && apiClient.isAuthenticated()) {
      navigate("/");
    }
  }, [navigate]);

  // Password validation
  useEffect(() => {
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  }, [password]);

  const validateForm = () => {
    if (!name.trim()) {
      setError("Full name is required");
      return false;
    }
    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters long");
      return false;
    }
    if (!email) {
      setError("Email is required");
      return false;
    }
    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!mobile) {
      setError("Mobile number is required");
      return false;
    }
    // Basic mobile number validation for Indian numbers
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile.replace(/\s/g, ''))) {
      setError("Please enter a valid 10-digit mobile number");
      return false;
    }
    if (!password) {
      setError("Password is required");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (!confirmPassword) {
      setError("Please confirm your password");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    
    // Check password strength
    const validationChecks = Object.values(passwordValidation);
    const passedChecks = validationChecks.filter(Boolean).length;
    if (passedChecks < 3) {
      setError("Password must meet at least 3 security requirements");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await apiClient.register({ 
        name: name.trim(), 
        email: email.toLowerCase().trim(), 
        mobile: mobile.trim(),
        password: password,
        userType: 'user'
      });
      
      console.log('Registration response:', response);
      
      // After successful registration, automatically log the user in
      try {
        const loginResponse = await apiClient.login({ 
          email: email.toLowerCase().trim(), 
          password: password 
        });
        
        // Store access token in localStorage
        if (loginResponse.session?.access_token) {
          localStorage.setItem('authToken', loginResponse.session.access_token);
          // Update apiClient internal token
          apiClient.setToken(loginResponse.session.access_token);
        }
        
        // Fetch the latest user profile from Supabase
        const user = await apiClient.getProfile();
        console.log('User object after registration:', user);
        const userType = user.user_metadata?.user_type || 'user';
        console.log('Extracted userType:', userType);
        const userName = user.user_metadata?.name || name.trim();
        const userEmail = user.email || email.toLowerCase().trim();
        
        // Store user type and additional info for navigation purposes
        localStorage.setItem('userType', userType);
        localStorage.setItem('userName', userName);
        localStorage.setItem('userEmail', userEmail);
        
        setSuccess("Registration successful! Welcome to Cable Hub Connect.");
        
        console.log('About to redirect after registration, userType:', userType);
        // Redirect based on user type
        setTimeout(() => {
          if (userType === 'admin') {
            console.log('Redirecting to admin panel');
            navigate("/admin");
          } else {
            console.log('Redirecting to home page');
            navigate("/");
          }
        }, 1500);
        
      } catch (loginErr: any) {
        console.error('Auto-login failed after registration:', loginErr);
        // If auto-login fails, just redirect to login page
        setSuccess("Registration successful! Please log in to continue.");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
      
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const validationChecks = Object.values(passwordValidation);
    const passedChecks = validationChecks.filter(Boolean).length;
    
    if (passedChecks === 0) return { strength: "none", color: "gray", text: "" };
    if (passedChecks <= 2) return { strength: "weak", color: "red", text: "Weak" };
    if (passedChecks <= 3) return { strength: "medium", color: "yellow", text: "Medium" };
    if (passedChecks <= 4) return { strength: "good", color: "blue", text: "Good" };
    return { strength: "strong", color: "green", text: "Strong" };
  };

  const passwordStrength = getPasswordStrength();

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50 py-12 px-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-6">
                <Check className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-4">
                Registration Successful!
              </CardTitle>
              <CardDescription className="text-gray-600 mb-6">
                {success}
              </CardDescription>
              <p className="text-sm text-gray-500">
                Redirecting you to the dashboard...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Create your account
            </CardTitle>
            <CardDescription className="text-gray-600">
              Join Cable Hub Connect today
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                    autoComplete="name"
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile" className="text-sm font-medium text-gray-700">
                  Mobile Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="Enter your mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Password strength:</span>
                      <span className={`text-xs font-medium ${
                        passwordStrength.color === 'red' ? 'text-red-600' :
                        passwordStrength.color === 'yellow' ? 'text-yellow-600' :
                        passwordStrength.color === 'blue' ? 'text-blue-600' :
                        passwordStrength.color === 'green' ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {passwordStrength.text}
                      </span>
                    </div>
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.color === 'red' ? 'bg-red-500' :
                          passwordStrength.color === 'yellow' ? 'bg-yellow-500' :
                          passwordStrength.color === 'blue' ? 'bg-blue-500' :
                          passwordStrength.color === 'green' ? 'bg-green-500' : 'bg-gray-500'
                        }`}
                        style={{ width: `${(Object.values(passwordValidation).filter(Boolean).length / 5) * 100}%` }}
                      ></div>
                    </div>
                    
                    {/* Password Requirements */}
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div className={`flex items-center ${passwordValidation.length ? 'text-green-600' : 'text-gray-400'}`}>
                        {passwordValidation.length ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                        8+ characters
                      </div>
                      <div className={`flex items-center ${passwordValidation.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                        {passwordValidation.uppercase ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                        Uppercase
                      </div>
                      <div className={`flex items-center ${passwordValidation.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                        {passwordValidation.lowercase ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                        Lowercase
                      </div>
                      <div className={`flex items-center ${passwordValidation.number ? 'text-green-600' : 'text-gray-400'}`}>
                        {passwordValidation.number ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                        Number
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-600">Passwords do not match</p>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Terms and Privacy */}
            <div className="text-xs text-gray-500 text-center">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register; 