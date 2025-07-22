import React, { useState } from "react";
import { Calculator, Download, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import apiClient from "@/lib/apiClient";

const RawMaterialCalculator = () => {
  const [form, setForm] = useState({
    cableType: "",
    length: 100,
    conductorSize: 10,
    insulationThickness: 1.5,
    sheathThickness: 1.5,
    conductorMaterial: "copper",
    insulationMaterial: "pvc",
    sheathMaterial: "pvc"
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [calculationSettings, setCalculationSettings] = useState<any>({
    materialDensities: {
      copper: 8.96,
      aluminum: 2.70,
      pvc: 1.40,
      xlpe: 0.92,
      rubber: 1.50
    },
    costFactors: {
      laborCost: 0.15,
      overheadCost: 0.10,
      profitMargin: 0.20,
      wasteFactor: 0.05
    },
    calculationConstants: {
      conductorDensityFactor: 1.0,
      insulationThicknessFactor: 1.2,
      sheathThicknessFactor: 1.1,
      lengthSafetyFactor: 1.02
    }
  });
  const [showSettings, setShowSettings] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      // Convert numeric fields
      const payload = {
        ...form,
        length: Number(form.length),
        conductorSize: Number(form.conductorSize),
        insulationThickness: Number(form.insulationThickness),
        sheathThickness: Number(form.sheathThickness),
        calculationSettings: calculationSettings // Include settings in the payload
      };
      const res = await apiClient.calculateRawMaterial(payload);
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Calculation failed");
    } finally {
      setLoading(false);
    }
  };

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
              <Select onValueChange={(value) => handleChange({ target: { name: "cableType", value } } as any)}>
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
                <Label htmlFor="length">Cable Length (m) *</Label>
                <Input
                  id="length"
                  type="number"
                  placeholder="e.g., 100"
                  name="length"
                  value={form.length}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="conductorSize">Conductor Size (mm²) *</Label>
                <Input
                  id="conductorSize"
                  type="number"
                  placeholder="e.g., 10"
                  name="conductorSize"
                  value={form.conductorSize}
                  onChange={handleChange}
                />
              </div>
            </div>

            

            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="conductorMaterial">Conductor Material</Label>
                <select
                  name="conductorMaterial"
                  value={form.conductorMaterial}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border rounded"
                >
                  <option value="copper">Copper</option>
                  <option value="aluminum">Aluminum</option>
                </select>
              </div>
              <div className="flex-1">
                <Label htmlFor="insulationMaterial">Insulation Material</Label>
                <select
                  name="insulationMaterial"
                  value={form.insulationMaterial}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border rounded"
                >
                  <option value="pvc">PVC</option>
                  <option value="xlpe">XLPE</option>
                  <option value="rubber">Rubber</option>
                </select>
              </div>
              <div className="flex-1">
                <Label htmlFor="sheathMaterial">Sheath Material</Label>
                <select
                  name="sheathMaterial"
                  value={form.sheathMaterial}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border rounded"
                >
                  <option value="pvc">PVC</option>
                  <option value="xlpe">XLPE</option>
                  <option value="rubber">Rubber</option>
                </select>
              </div>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <Button onClick={handleSubmit} className="w-full" disabled={loading}>
              {loading ? "Calculating..." : "Calculate"}
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
            {result ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{result.weights.conductor} kg</p>
                    <p className="text-sm text-blue-800">Total Conductor</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{result.weights.insulation} kg</p>
                    <p className="text-sm text-green-800">Total Insulation</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Material Breakdown</h4>
                  <div className="space-y-3">
                    {Object.entries(result.materials).map(([key, value]: [string, any], index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium capitalize">{key}</p>
                          <p className="text-sm text-gray-600">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Estimated Cost:</span>
                    <span className="text-2xl font-bold text-green-600">₹{result.costs.total}</span>
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
