import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchableSelect } from "@/components/ui/searchable-select";
import apiClient from "@/lib/apiClient";

interface SupplyFormData {
  title: string;
  description: string;
  category: string;
  grade_specification: string;
  available_quantity: string;
  unit: string;
  price_per_unit: string;
  minimum_order: string;
  location: string;
  delivery_terms: string;
  certification: string;
  is_urgent: boolean;
  image_url?: string;
}

interface MaterialCategory {
  id: string;
  name: string;
  image_url?: string;
}

interface SupplyFormProps {
  onSubmit: (data: SupplyFormData) => Promise<void>;
  categories: Array<{ value: string; label: string }>;
  materialCategories: MaterialCategory[];
  isAuthenticated: boolean;
  onCategoryAdded?: () => void;
}

const SupplyForm = ({ onSubmit, categories, materialCategories, isAuthenticated, onCategoryAdded }: SupplyFormProps) => {
  const [formData, setFormData] = useState<SupplyFormData>({
    title: '',
    description: '',
    category: '',
    grade_specification: '',
    available_quantity: '',
    unit: 'kg',
    price_per_unit: '',
    minimum_order: '',
    location: '',
    delivery_terms: '',
    certification: '',
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
    if (!formData.title || !formData.category || !formData.available_quantity || !formData.price_per_unit || !formData.minimum_order || !formData.location) {
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
      setSuccess('Supply listing posted successfully!');
      setFormData({
        title: '', description: '', category: '', grade_specification: '', available_quantity: '', unit: 'kg', price_per_unit: '', minimum_order: '', location: '', delivery_terms: '', certification: '', is_urgent: false, image_url: '',
      });
      setImageFile(null);
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Image</label>
                <Input type="file" accept="image/*" onChange={handleImageChange} />
                {imageFile && <span className="text-xs text-gray-500">{imageFile.name}</span>}
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
              {loading ? 'Posting...' : 'Post Supply'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default SupplyForm; 