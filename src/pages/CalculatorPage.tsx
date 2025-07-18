import Header from "@/components/Header";
import RawMaterialCalculator from "@/components/RawMaterialCalculator";
import { useNavigate } from "react-router-dom";

const CalculatorPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Raw Material Calculator" onBack={() => navigate(-1)} logoSrc='/cableCartLogo.png' />
      <div className="py-8 px-2 sm:px-6">
        <RawMaterialCalculator />
      </div>
    </div>
  );
};

export default CalculatorPage; 