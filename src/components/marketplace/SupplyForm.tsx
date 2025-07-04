import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SupplyFormData {
  title: string;
  description: string;
  category: string;
  material_type: string;
  grade_specification: string;
  available_quantity: string;
  unit: string;
  price_per_unit: string;
  minimum_order: string;
  location: string;
  delivery_terms: string;
  certification: string;
  is_urgent: boolean;
}

interface SupplyFormProps {
  onSubmit: (data: SupplyFormData) => Promise<void>;
  categories: Array<{ value: string; label: string }>;
  isAuthenticated: boolean;
}

const SupplyForm = ({ onSubmit, categories, isAuthenticated }: SupplyFormProps) => {
  const [formData, setFormData] = useState<SupplyFormData>({
    title: '',
    description: '',
    category: '',
    material_type: '',
    grade_specification: '',
    available_quantity: '',
    unit: 'kg',
    price_per_unit: '',
    minimum_order: '',
    location: '',
    delivery_terms: '',
    certification: '',
    is_urgent: false,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Basic validation
    if (!formData.title || !formData.category || !formData.material_type || !formData.available_quantity || !formData.price_per_unit || !formData.minimum_order || !formData.location) {
      setError('Please fill all required fields.');
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit(formData);
      setSuccess('Supply listing posted successfully!');
      setFormData({
        title: '', description: '', category: '', material_type: '', grade_specification: '', available_quantity: '', unit: 'kg', price_per_unit: '', minimum_order: '', location: '', delivery_terms: '', certification: '', is_urgent: false,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to post supply listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Post Your Supply</CardTitle>
        <CardDescription>List your raw materials for manufacturers to discover</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isAuthenticated ? (
          <div className="text-center text-gray-500">You must be logged in to post a supply listing.</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input name="title" value={formData.title} onChange={handleInput} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <select name="category" value={formData.category} onChange={handleInput} required className="w-full border rounded h-10 px-2">
                  <option value="">Select category</option>
                  {categories.filter(c => c.value !== 'all').map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Material Type *</label>
                <Input name="material_type" value={formData.material_type} onChange={handleInput} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Grade/Specification</label>
                <Input name="grade_specification" value={formData.grade_specification} onChange={handleInput} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Available Quantity *</label>
                <Input name="available_quantity" value={formData.available_quantity} onChange={handleInput} required type="number" min="0" step="any" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Unit</label>
                <select name="unit" value={formData.unit} onChange={handleInput} className="w-full border rounded h-10 px-2">
                  <option value="kg">kg</option>
                  <option value="mt">mt</option>
                  <option value="pieces">pieces</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price per Unit *</label>
                <Input name="price_per_unit" value={formData.price_per_unit} onChange={handleInput} required type="number" min="0" step="any" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum Order *</label>
                <Input name="minimum_order" value={formData.minimum_order} onChange={handleInput} required type="number" min="0" step="any" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location *</label>
                <Input name="location" value={formData.location} onChange={handleInput} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Delivery Terms</label>
                <Input name="delivery_terms" value={formData.delivery_terms} onChange={handleInput} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Certification</label>
                <Input name="certification" value={formData.certification} onChange={handleInput} />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input type="checkbox" name="is_urgent" checked={formData.is_urgent} onChange={handleInput} />
                <label className="text-sm">Mark as urgent</label>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea name="description" value={formData.description} onChange={handleInput} rows={3} className="w-full border rounded p-2" />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Posting...' : 'Post Supply Listing'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default SupplyForm; 