import { useState, useEffect } from "react";
import {  TrendingUp, Users, Menu, X, Zap, Shield, Globe, Settings, LogOut,  LogIn,  MessageCircle, UserCheck, Star, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PricingSlideshow from "@/components/PricingSlideshow";
import RawMaterialCalculator from "@/components/RawMaterialCalculator";

import HeroSection from "@/components/HeroSection";
import FeatureCards from "@/components/FeatureCards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import apiClient from "@/lib/apiClient";
import Loader from "@/components/ui/loader";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  const [pricing, setPricing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);

  useEffect(() => {
    const storedUserType = localStorage.getItem('userType');
    if (storedUserType) {
      setUserType(storedUserType);
      fetchUserProfile();
    }
    // Check for logged-in user
    apiClient.getProfile().then(setUser).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    apiClient.getPricingData()
      .then(data => setPricing(data || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    Promise.all([
      apiClient.getSupplyListings({}),
      apiClient.getDemandListings({})
    ]).then(([supply, demand]) => {
      const supplyWithType = (supply || []).map(item => ({ ...item, type: "supply" }));
      const demandWithType = (demand || []).map(item => ({ ...item, type: "demand" }));
      const combined = [...supplyWithType, ...demandWithType]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setRecentListings(combined.slice(0, 3));
    }).finally(() => setLoadingListings(false));
  }, []);

  const fetchUserProfile = async () => {
    try {
      const profile = await apiClient.getProfile();
      setUserEmail(profile.email);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const navigation = [
    { id: "dashboard", name: "Dashboard", icon: TrendingUp },
    { id: "mentor", name: "Mentors", icon: UserCheck },
    { id: "features", name: "Features", icon: Star },
    ...(userType === 'admin' ? [{ id: "admin", name: "Admin Panel", icon: Settings }] : []),
  ];

  const handleNavigation = (tabId: string) => {
    if (tabId === "admin") {
      navigate("/admin");
    } else if (tabId === "features") {
      navigate("/features");
    } else if (tabId === "mentor") {
      navigate("/mentor");
    } else if (tabId === "marketplace") {
      navigate("/marketplace");
    } 
    else if (tabId === "calculator") {
      navigate("/calculator");
    }
    else if (tabId === "specs") {
      navigate("/specs-marketplace");
    } 
    else if (tabId === "pricing") {
      navigate("/pricing");
    } 
    else if (tabId === "consulting") {
      navigate("/consulting-listings");
    } 
    else if (tabId === "used-dead-stock") {
      navigate("/used-dead-stock-listings");
    } else if (tabId === "machines") {
      navigate("/machines-marketplace");
    } 
    else if (tabId === "team") {
      navigate("/team");
    } 
    else {
      setActiveTab("dashboard");
    }
  };


  const renderContent = () => {
    switch (activeTab) {
      case "calculator":
        return <RawMaterialCalculator />;
      default:
        return (
          <div className="space-y-12">
            <FeatureCards onNavigate={handleNavigation} />
            <HeroSection onGetStarted={() => navigate("/marketplace")} />
            
            {/* Market Intelligence Section */}
            <section className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl p-4 md:p-12">
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
                    <CardTitle className="flex items-center gap-2 text-gray-900 text-balance text-lg md:text-2xl">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      Live Price Tracking
                    </CardTitle>
                    <CardDescription>Real-time commodity prices updated every minute</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loading ? (
                      <Loader className="py-8" />
                    ) : pricing.length === 0 ? (
                      <div>No pricing data available.</div>
                    ) : (
                      [...pricing]
                        .sort(() => 0.5 - Math.random())
                        .slice(0, 4)
                        .map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900">{item.material}</p>
                              <p className="text-xl font-bold text-gray-900">{item.price}</p>
                            </div>
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                              parseFloat(item.change) >= 0
                                ? 'bg-green-300/70 text-green-700'
                                : 'bg-red-300/70 text-red-700'
                            }`}>
                              {item.change}
                            </span>
                          </div>
                        ))
                    )}
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
                    {loadingListings ? (
                      <Loader className="py-8" />
                    ) : recentListings.length === 0 ? (
                      <div>No recent listings available.</div>
                    ) : (
                      recentListings.map((item, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row justify-between items-start md:items-center p-3 bg-gray-50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900">
                              
                              {item.title || "Untitled"}
                            </p>
                            <p className="text-sm text-gray-600">{item.location || "No location"}</p>
                            {item.type==="supply" ? <p className="text-lg text-gray-400">{item.available_quantity}{" "}{item.unit}</p> : <p className="text-lg text-gray-400">{item.required_quantity}{" "}{item.unit}</p>}
                            
                          </div>
                          <span className={`mt-2 md:mt-0 px-3 py-1 text-sm font-medium rounded-full ${
                            item.type === "supply"
                              ? "bg-green-300/70 text-green-700"
                              : "bg-blue-300/70 text-blue-700"
                          }`}>
                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                          </span>
                        </div>
                      ))
                    )}
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
      <header className="bg-white/60 backdrop-blur-md border-b border-gray-200/50 sticky top-10 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
            <img src={"/cableCartLogo.png"} alt="Logo" className="h-auto w-28 mr-3 select-none" />
            </div>

            
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isAdminButton = item.id === "admin";
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      activeTab === item.id
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                        : isAdminButton
                        ? "text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </button>
                );
              })}
              {user && (
                <>
                  <button
                    onClick={() => navigate('/my-chats')}
                    className="flex items-center px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    My Chats
                  </button>
                  <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </button>
                </>
              )}
              {!user && (
                <button
                  onClick={() => {
                    localStorage.clear()
                    navigate('/login');
                  }}
                  className="flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 shadow-lg shadow-blue-600/25"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </button>
              )}
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
                const isAdminButton = item.id === "admin";
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
                        : isAdminButton
                        ? "text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </button>
                );
              })}
              {user && (
                <>
                  <button
                    onClick={() => {
                      navigate('/my-chats');
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full px-3 py-2 rounded-lg text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  >
                    <MessageCircle className="h-5 w-5 mr-3" />
                    My Chats
                  </button>
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full px-3 py-2 rounded-lg text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  >
                    <User className="h-5 w-5 mr-3" />
                    Profile
                  </button>
                </>
              )}
              {!user && (
                <button
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 rounded-lg text-base font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  <LogIn className="h-5 w-5 mr-3" />
                  Login
                </button>
              )}
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
