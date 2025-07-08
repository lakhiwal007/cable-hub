import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const RM_OPTIONS = [
  { value: "Cu", label: "Copper (Cu)" },
  { value: "Al", label: "Aluminum (Al)" },
  { value: "PVC", label: "PVC" },
  { value: "XLPE", label: "XLPE" },
];

const RawMaterialSellForm = () => {
  const [form, setForm] = useState({
    rm: "",
    type: "",
    dailyProduction: "",
    location: "",
    specification: "",
    otherOption1: "",
    otherOption2: "",
    otherOption3: "",
    otherOption4: "",
    whatsapp: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess("");
    setError("");
    // Simulate submit
    setTimeout(() => {
      setSubmitting(false);
      setSuccess("Your supply is now visible to buyers across India!");
      setForm({
        rm: "",
        type: "",
        dailyProduction: "",
        location: "",
        specification: "",
        otherOption1: "",
        otherOption2: "",
        otherOption3: "",
        otherOption4: "",
        whatsapp: "",
      });
      setImage(null);
      setImagePreview(null);
    }, 1000);
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Sell Raw Material</CardTitle>
        <CardDescription>Save to get FREE ENQUIRY from buyers</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Choose RM</label>
            <select name="rm" value={form.rm} onChange={handleChange} required className="w-full border rounded h-10 px-2">
              <option value="">Select</option>
              {RM_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Choose Type</label>
            <Input name="type" value={form.type} onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Available Daily Production</label>
            <Input name="dailyProduction" value={form.dailyProduction} onChange={handleChange} required type="number" min="0" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Manufacturing Location</label>
            <Input name="location" value={form.location} onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Material Specification / Data Picture / Data Sheet</label>
            <Input name="specification" value={form.specification} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Upload Self or Factory Production Image</label>
            <Input name="image" type="file" accept="image/*" onChange={handleImageChange} />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="mt-2 h-24 rounded border object-contain" />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Other Option</label>
            <Input name="otherOption1" value={form.otherOption1} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Option 2</label>
            <Input name="otherOption2" value={form.otherOption2} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">O3</label>
            <Input name="otherOption3" value={form.otherOption3} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">O4</label>
            <Input name="otherOption4" value={form.otherOption4} onChange={handleChange} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Enter your WhatsApp no for buyers to connect directly</label>
            <Input name="whatsapp" value={form.whatsapp} onChange={handleChange} required type="tel" pattern="[0-9]{10,15}" />
          </div>
          <div className="md:col-span-2 flex flex-col gap-2 mt-4">
            <Button type="submit" disabled={submitting} className="w-full md:w-auto">Save to get FREE ENQUIRY from buyers</Button>
            {success && <div className="text-green-600 text-sm">{success}</div>}
            {error && <div className="text-red-600 text-sm">{error}</div>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RawMaterialSellForm; 