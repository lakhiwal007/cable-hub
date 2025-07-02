import { useState, useEffect } from "react";
import { Calculator, TrendingUp, Users, Menu, X, Zap, Shield, Globe, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PricingSlideshow from "@/components/PricingSlideshow";
import RawMaterialCalculator from "@/components/RawMaterialCalculator";
import Marketplace from "@/components/Marketplace";
import HeroSection from "@/components/HeroSection";
import FeatureCards from "@/components/FeatureCards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import apiClient from "@/lib/apiClient";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user type from localStorage (set during login)
    const token = localStorage.getItem('token');
    const storedUserType = localStorage.getItem('userType');
    
    if (token && storedUserType) {
      setUserType(storedUserType);
      // Try to get user profile for email
      fetchUserProfile();
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const profile = await apiClient.getProfile();
      setUserEmail(profile.user.email);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const navigation = [
    { id: "dashboard", name: "Dashboard", icon: TrendingUp },
    { id: "calculator", name: "Calculator", icon: Calculator },
    { id: "marketplace", name: "Marketplace", icon: Users },
    ...(userType === 'admin' ? [{ id: "admin", name: "Admin Panel", icon: Settings }] : []),
  ];

  const handleNavigation = (tabId: string) => {
    if (tabId === "admin") {
      navigate("/admin");
    } else {
      setActiveTab(tabId);
    }
  };

  const handleLogout = () => {
    apiClient.logout();
    navigate("/login");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "calculator":
        return <RawMaterialCalculator />;
      case "marketplace":
        return <Marketplace />;
      default:
        return (
          <div className="space-y-12">
            <HeroSection onGetStarted={() => setActiveTab("calculator")} />
            <FeatureCards onNavigate={setActiveTab} />
            
            {/* Market Intelligence Section */}
            <section className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl p-8 md:p-12">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Real-Time Market Intelligence
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Stay ahead with live pricing data and market trends from across India's cable manufacturing industry
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      Live Price Tracking
                    </CardTitle>
                    <CardDescription>Real-time commodity prices updated every minute</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { material: "Copper Wire 99.9%", price: "₹485/kg", change: "+2.3%", positive: true },
                      { material: "Aluminum Rods", price: "₹162/kg", change: "-1.2%", positive: false },
                      { material: "PVC Granules", price: "₹89/kg", change: "+0.8%", positive: true },
                      { material: "XLPE Granules", price: "₹145/kg", change: "+3.2%", positive: true },
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900">{item.material}</p>
                          <p className="text-xl font-bold text-gray-900">{item.price}</p>
                        </div>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          item.positive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {item.change}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <Users className="h-5 w-5 text-green-600" />
                      Market Activity
                    </CardTitle>
                    <CardDescription>Latest supplier postings and requirements</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { type: "Supply", material: "Copper Wire 99.9%", quantity: "500kg", supplier: "MetalCorp Ltd" },
                      { type: "Demand", material: "PVC Granules", quantity: "2 Tons", manufacturer: "CableTech Industries" },
                      { type: "Supply", material: "Aluminum Rods", quantity: "1 Ton", supplier: "Prime Metals" },
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              item.type === 'Supply' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {item.type}
                            </span>
                          </div>
                          <p className="font-medium text-gray-900">{item.material}</p>
                          <p className="text-sm text-gray-600">{item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{item.supplier || item.manufacturer}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Trust Indicators */}
            <section className="text-center py-12">
              <div className="flex flex-wrap justify-center items-center gap-8 text-gray-400">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <span className="text-sm font-medium">Verified Suppliers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  <span className="text-sm font-medium">Real-time Data</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  <span className="text-sm font-medium">Pan-India Network</span>
                </div>
              </div>
            </section>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Pricing Slideshow */}
      <PricingSlideshow />
      
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Cable Hub
              </h1>
              <span className="ml-3 text-sm text-gray-500 font-medium">Manufacturing Solutions</span>
            </div>

            {/* User Info - Hidden on mobile */}
            {userEmail && (
              <div className="hidden lg:flex items-center text-sm text-gray-600">
                <span>Welcome, </span>
                <span className="font-medium ml-1">{userEmail}</span>
                {userType === 'admin' && (
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                    Admin
                  </span>
                )}
              </div>
            )}
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      activeTab === item.id
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </button>
                );
              })}
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleNavigation(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center w-full px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                      activeTab === item.id
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </button>
                );
              })}
              {/* Mobile Logout Button */}
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-3 py-2 rounded-lg text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
