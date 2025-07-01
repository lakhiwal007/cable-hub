
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, TrendingUp, Users, Zap, Shield, BarChart3 } from "lucide-react";

interface FeatureCardsProps {
  onNavigate: (tab: string) => void;
}

const FeatureCards = ({ onNavigate }: FeatureCardsProps) => {
  const features = [
    {
      icon: Calculator,
      title: "Smart Calculator",
      description: "Advanced cost calculations with real-time material pricing",
      action: "Start Calculating",
      tab: "calculator",
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-50 to-orange-100",
      borderColor: "border-orange-200",
    },
    {
      icon: Users,
      title: "Verified Marketplace",
      description: "Connect with trusted suppliers and manufacturers nationwide",
      action: "Explore Marketplace",
      tab: "marketplace",
      gradient: "from-green-500 to-green-600",
      bgGradient: "from-green-50 to-green-100",
      borderColor: "border-green-200",
    },
    {
      icon: TrendingUp,
      title: "Market Intelligence",
      description: "Real-time insights and pricing trends for informed decisions",
      action: "View Insights",
      tab: "dashboard",
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      borderColor: "border-blue-200",
    },
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Get instant price quotes and calculations in seconds",
    },
    {
      icon: Shield,
      title: "Fully Verified",
      description: "All suppliers undergo rigorous verification processes",
    },
    {
      icon: BarChart3,
      title: "Data Driven",
      description: "Make informed decisions with comprehensive market data",
    },
  ];

  return (
    <div className="space-y-16">
      {/* Main Features */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need in One Platform
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Streamline your cable manufacturing workflow with our comprehensive suite of tools
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className={`group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br ${feature.bgGradient} ${feature.borderColor} hover:scale-105`}>
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center shadow-lg`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <Button 
                    onClick={() => onNavigate(feature.tab)}
                    className={`w-full bg-gradient-to-r ${feature.gradient} hover:shadow-lg transition-all duration-200 text-white font-semibold py-2 px-4 rounded-xl`}
                  >
                    {feature.action}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gray-50 rounded-3xl p-8 md:p-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Cable Hub?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of manufacturers who trust Cable Hub for their business operations
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default FeatureCards;
