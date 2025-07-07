import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchableSelect } from "@/components/ui/searchable-select";
import apiClient from "@/lib/apiClient";

interface DemandFormData {
  title: string;
  description: string;
  category: string;
  specifications: string;
  required_quantity: string;
  unit: string;
  budget_min: string;
  budget_max: string;
  location: string;
  delivery_deadline: string;
  additional_requirements: string;
  is_urgent: boolean;
  image_url?: string;
}

interface MaterialCategory {
  id: string;
  name: string;
  image_url?: string;
}

interface DemandFormProps {
  onSubmit: (data: DemandFormData) => Promise<void>;
  categories: Array<{ value: string; label: string }>;
  materialCategories: MaterialCategory[];
  isAuthenticated: boolean;
  onCategoryAdded?: () => void;
}

const DemandForm = ({ onSubmit, categories, materialCategories, isAuthenticated, onCategoryAdded }: DemandFormProps) => {
  const [formData, setFormData] = useState<DemandFormData>({
    title: '',
    description: '',
    category: '',
    specifications: '',
    required_quantity: '',
    unit: 'kg',
    budget_min: '',
    budget_max: '',
    location: '',
    delivery_deadline: '',
    additional_requirements: '',
    is_urgent: false,
    image_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [addCategoryMode, setAddCategoryMode] = useState(false);

  // Fallback categories for testing if none are loaded
  const fallbackCategories = [
    { value: "Copper Wire", label: "Copper Wire" },
    { value: "Aluminum Wire", label: "Aluminum Wire" },
    { value: "PVC Insulation", label: "PVC Insulation" },
    { value: "XLPE Insulation", label: "XLPE Insulation" },
    { value: "Rubber Insulation", label: "Rubber Insulation" },
  ];

  const categoriesToUse = categories.length > 0 ? categories : fallbackCategories;

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      setLoading(true);
      const cat = await apiClient.addMaterialCategory({ name: newCategory });
      setFormData((prev) => ({ ...prev, category: cat.name }));
      setAddCategoryMode(false);
      setNewCategory('');
      onCategoryAdded?.();
    } catch (err: any) {
      setError(err.message || 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (value: string) => {
    if (value === "__add_new__") {
      setAddCategoryMode(true);
      setFormData((prev) => ({ ...prev, category: "" }));
    } else {
      setFormData((prev) => ({ ...prev, category: value }));
      setAddCategoryMode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!formData.title || !formData.category || !formData.required_quantity || !formData.budget_min || !formData.budget_max || !formData.location) {
      setError('Please fill all required fields.');
      return;
    }
    
    setLoading(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await apiClient.uploadListingImage(imageFile);
      }
      await onSubmit({ ...formData, image_url: imageUrl });
      setSuccess('Demand posted successfully!');
      setFormData({
        title: '', description: '', category: '', specifications: '', required_quantity: '', unit: 'kg', budget_min: '', budget_max: '', location: '', delivery_deadline: '', additional_requirements: '', is_urgent: false, image_url: '',
      });
      setImageFile(null);
    } catch (err: any) {
      setError(err.message || 'Failed to post demand listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Post Your Requirements</CardTitle>
        <CardDescription>Let suppliers know what materials you need</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isAuthenticated ? (
          <div className="text-center text-gray-500">You must be logged in to post a demand listing.</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input name="title" value={formData.title} onChange={handleInput} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                {categoriesToUse.length === 0 ? (
                  <div className="text-sm text-gray-500">Loading categories...</div>
                ) : (
                  <SearchableSelect
                    options={categoriesToUse.filter(c => c.value !== 'all')}
                    value={formData.category}
                    onValueChange={handleCategoryChange}
                    placeholder="Select category"
                    searchPlaceholder="Search categories..."
                    emptyText="No categories found."
                    showAddNew={true}
                    onAddNew={() => setAddCategoryMode(true)}
                    disabled={loading}
                  />
                )}
                {addCategoryMode && (
                  <div className="flex gap-2 mt-2">
                    <Input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="New category name" />
                    <Button type="button" onClick={handleAddCategory} disabled={loading}>Add</Button>
                    <Button type="button" variant="outline" onClick={() => setAddCategoryMode(false)}>Cancel</Button>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Specifications</label>
                <Input name="specifications" value={formData.specifications} onChange={handleInput} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Required Quantity *</label>
                <Input name="required_quantity" value={formData.required_quantity} onChange={handleInput} required type="number" min="0" step="any" />
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
                <label className="text-sm font-medium">Budget Min *</label>
                <Input name="budget_min" value={formData.budget_min} onChange={handleInput} required type="number" min="0" step="any" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Budget Max *</label>
                <Input name="budget_max" value={formData.budget_max} onChange={handleInput} required type="number" min="0" step="any" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location *</label>
                <Input name="location" value={formData.location} onChange={handleInput} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Delivery Deadline</label>
                <Input name="delivery_deadline" value={formData.delivery_deadline} onChange={handleInput} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Reference Image</label>
                <Input type="file" accept="image/*" onChange={handleImageChange} />
                {imageFile && <span className="text-xs text-gray-500">{imageFile.name}</span>}
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input type="checkbox" name="is_urgent" checked={formData.is_urgent} onChange={handleInput} />
                <label className="text-sm">Mark as urgent</label>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Additional Requirements</label>
              <textarea name="additional_requirements" value={formData.additional_requirements} onChange={handleInput} rows={3} className="w-full border rounded p-2" />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Posting...' : 'Post Demand'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default DemandForm; 