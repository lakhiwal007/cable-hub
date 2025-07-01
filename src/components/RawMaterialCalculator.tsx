
import { useState } from "react";
import { Calculator, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RawMaterialCalculator = () => {
  const [formData, setFormData] = useState({
    cableType: "",
    coreCount: "",
    coreSize: "",
    insulationThickness: "",
    cableLength: "",
    quantity: ""
  });
  
  const [results, setResults] = useState(null);

  const cableTypes = [
    { value: "power", label: "Power Cable" },
    { value: "control", label: "Control Cable" },
    { value: "instrumentation", label: "Instrumentation Cable" },
    { value: "coaxial", label: "Coaxial Cable" },
    { value: "fiber", label: "Fiber Optic Cable" }
  ];

  const coreSizes = [
    "1.5", "2.5", "4", "6", "10", "16", "25", "35", "50", "70", "95", "120", "150", "185", "240", "300"
  ];

  const calculateMaterials = () => {
    if (!formData.cableType || !formData.coreCount || !formData.coreSize || !formData.cableLength || !formData.quantity) {
      alert("Please fill in all required fields");
      return;
    }

    // Simplified calculation logic
    const coreCount = parseInt(formData.coreCount);
    const coreSize = parseFloat(formData.coreSize);
    const length = parseFloat(formData.cableLength);
    const quantity = parseInt(formData.quantity);
    const insulationThickness = parseFloat(formData.insulationThickness) || 1;

    // Basic material calculations (simplified for demo)
    const copperVolume = (coreCount * coreSize * length * quantity * 0.001).toFixed(2);
    const copperWeight = (parseFloat(copperVolume) * 8.96).toFixed(2); // Copper density
    
    const pvcVolume = (coreCount * Math.PI * Math.pow(coreSize + insulationThickness, 2) * length * quantity * 0.0001).toFixed(2);
    const pvcWeight = (parseFloat(pvcVolume) * 1.4).toFixed(2); // PVC density
    
    const totalCost = (parseFloat(copperWeight) * 485 + parseFloat(pvcWeight) * 89).toFixed(2);

    setResults({
      copperVolume,
      copperWeight,
      pvcVolume,
      pvcWeight,
      totalCost,
      breakdown: [
        { material: "Copper", volume: copperVolume + " cm³", weight: copperWeight + " kg", cost: "₹" + (parseFloat(copperWeight) * 485).toFixed(2) },
        { material: "PVC Insulation", volume: pvcVolume + " cm³", weight: pvcWeight + " kg", cost: "₹" + (parseFloat(pvcWeight) * 89).toFixed(2) }
      ]
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Raw Material Calculator</h2>
        <p className="text-gray-600">Calculate exact raw material requirements for your cable production</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Cable Specifications
            </CardTitle>
            <CardDescription>Enter your cable requirements to calculate raw materials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="cableType">Cable Type *</Label>
              <Select onValueChange={(value) => handleInputChange("cableType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cable type" />
                </SelectTrigger>
                <SelectContent>
                  {cableTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coreCount">Core Count *</Label>
                <Input
                  id="coreCount"
                  type="number"
                  placeholder="e.g., 3"
                  value={formData.coreCount}
                  onChange={(e) => handleInputChange("coreCount", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coreSize">Core Size (mm²) *</Label>
                <Select onValueChange={(value) => handleInputChange("coreSize", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {coreSizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size} mm²
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="insulationThickness">Insulation Thickness (mm)</Label>
              <Input
                id="insulationThickness"
                type="number"
                step="0.1"
                placeholder="e.g., 1.5"
                value={formData.insulationThickness}
                onChange={(e) => handleInputChange("insulationThickness", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cableLength">Cable Length (m) *</Label>
                <Input
                  id="cableLength"
                  type="number"
                  placeholder="e.g., 100"
                  value={formData.cableLength}
                  onChange={(e) => handleInputChange("cableLength", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="e.g., 50"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange("quantity", e.target.value)}
                />
              </div>
            </div>

            <Button onClick={calculateMaterials} className="w-full">
              Calculate Materials
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Calculation Results</CardTitle>
            <CardDescription>Raw material requirements and estimated costs</CardDescription>
          </CardHeader>
          <CardContent>
            {results ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{results.copperWeight} kg</p>
                    <p className="text-sm text-blue-800">Total Copper</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{results.pvcWeight} kg</p>
                    <p className="text-sm text-green-800">Total PVC</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Material Breakdown</h4>
                  <div className="space-y-3">
                    {results.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{item.material}</p>
                          <p className="text-sm text-gray-600">{item.weight}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{item.cost}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Estimated Cost:</span>
                    <span className="text-2xl font-bold text-green-600">₹{results.totalCost}</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export Results
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Enter cable specifications to see material calculations</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RawMaterialCalculator;
