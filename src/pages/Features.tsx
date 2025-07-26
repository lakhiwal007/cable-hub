import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import FeatureCards from "@/components/FeatureCards";
import Header from "@/components/Header";

const Features = () => {
  const navigate = useNavigate();

  const handleNavigation = (tabId: string) => {
    if (tabId === "admin") {
      navigate("/admin");
    } else if (tabId === "marketplace") {
      navigate("/marketplace");
    } 
    else if (tabId === "pricing") {
      navigate("/pricing");
    } 
    // else if (tabId === "specs") {
    //   navigate("/specs-marketplace");
    // }
    // else if (tabId === "consulting") {
    //   navigate("/consulting-listings");
    // } 
    else if (tabId === "used-dead-stock") {
      navigate("/used-dead-stock-listings");
    } else if (tabId === "machines") {
      navigate("/machines-marketplace");
    } 
    // else if (tabId === "team") {
    //   navigate("/team");
    // } 
    else if (tabId === "calculator") {
      navigate("/calculator");
    } else {
      // Handle other navigation
      console.log("Navigate to:", tabId);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header 
        title="Features" 
        onBack={() => navigate("/")}
        logoSrc='/cableCartLogo.png'
      />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-4 sm:py-8 px-1 sm:px-4 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            All Features
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Discover all the powerful tools and features available in Cable Hub to streamline your cable manufacturing business
          </p>
        </div>

        {/* Features Content */}
        <FeatureCards onNavigate={handleNavigation} />
      </main>
    </div>
  );
};

export default Features; 