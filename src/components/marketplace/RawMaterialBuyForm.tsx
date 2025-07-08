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

const RawMaterialBuyForm = () => {
  const [form, setForm] = useState({
    rm: "",
    type: "",
    quantity: "",
    location: "",
    deliveryDays: "",
    paymentTerms: "",
    otherOption1: "",
    otherOption2: "",
    otherOption3: "",
    otherOption4: "",
    whatsapp: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess("");
    setError("");
    // Simulate submit
    setTimeout(() => {
      setSubmitting(false);
      setSuccess("Your requirement has been sent to suppliers across India!");
      setForm({
        rm: "",
        type: "",
        quantity: "",
        location: "",
        deliveryDays: "",
        paymentTerms: "",
        otherOption1: "",
        otherOption2: "",
        otherOption3: "",
        otherOption4: "",
        whatsapp: "",
      });
    }, 1000);
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Buy Raw Material</CardTitle>
        <CardDescription>Send your requirement to suppliers across India</CardDescription>
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
            <label className="block text-sm font-medium mb-1">Enter Quantity</label>
            <Input name="quantity" value={form.quantity} onChange={handleChange} required type="number" min="0" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Purchase Location</label>
            <Input name="location" value={form.location} onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Delivery Days</label>
            <Input name="deliveryDays" value={form.deliveryDays} onChange={handleChange} required type="number" min="0" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Payment Terms</label>
            <Input name="paymentTerms" value={form.paymentTerms} onChange={handleChange} required />
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
            <label className="block text-sm font-medium mb-1">Enter your WhatsApp no for suppliers to connect directly</label>
            <Input name="whatsapp" value={form.whatsapp} onChange={handleChange} required type="tel" pattern="[0-9]{10,15}" />
          </div>
          <div className="md:col-span-2 flex flex-col gap-2 mt-4">
            <Button type="submit" disabled={submitting} className="w-full md:w-auto">Send to suppliers across India</Button>
            {success && <div className="text-green-600 text-sm">{success}</div>}
            {error && <div className="text-red-600 text-sm">{error}</div>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RawMaterialBuyForm; 