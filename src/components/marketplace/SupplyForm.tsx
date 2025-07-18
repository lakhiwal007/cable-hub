import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { getRawMaterials, addRawMaterial } from '@/lib/apiClient';
import apiClient from '@/lib/apiClient';
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import CaptureOrUploadImage from "@/components/CaptureOrUploadImage";
import { X } from "lucide-react";
import CaptureOrUploadVideo from "@/components/CaptureOrUploadVideo";
import { sanitizeTextInput, sanitizeTextInputWithHyphens } from '@/lib/utils';

interface SupplyFormData {
  title: string;
  description: string;
  category: string;
  grade_specification: string;
  available_quantity: string;
  unit: string;
  minimum_order: string;
  location: string;
  delivery_terms: string;
  certification: string;
  is_urgent: boolean;
  image_url?: string[];
  spec_doc_url?: string;
  whatsapp_number?: string;
  video_url?: string;
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
  const [formData, setFormData] = useState<SupplyFormData & {
    rm?: string;
    type?: string;
    whatsapp_number?: string;
  }>({
    ...{
      title: '',
      description: '',
      category: '',
      grade_specification: '',
      available_quantity: '',
      unit: 'kg',
      minimum_order: '',
      location: '',
      delivery_terms: '',
      certification: '',
      is_urgent: false,
    },
    rm: '',
    type: '',
    whatsapp_number: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [addCategoryMode, setAddCategoryMode] = useState(false);
  const [newRM, setNewRM] = useState('');
  const [addRMMode, setAddRMMode] = useState(false);
  const [specFile, setSpecFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Fallback categories for testing if none are loaded
  const fallbackCategories = [
    { value: "Copper Wire", label: "Copper Wire" },
    { value: "Aluminum Wire", label: "Aluminum Wire" },
    { value: "PVC Insulation", label: "PVC Insulation" },
    { value: "XLPE Insulation", label: "XLPE Insulation" },
    { value: "Rubber Insulation", label: "Rubber Insulation" },
  ];

  const fallbackRMs = [
    { value: "Copper", label: "Copper" },
    { value: "Aluminium", label: "Aluminium" },
    { value: "PVC", label: "PVC" },
    { value: "XLPE", label: "XLPE" },
  ];

  

  const [rmOptions, setRmOptions] = useState<{ value: string, label: string }[]>([]);
  const [categoriesToUse, setCategoriesToUse] = useState<{ value: string, label: string }[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const rms = await getRawMaterials();
        setRmOptions(rms.map((rm: any) => ({ value: rm.value, label: rm.label })));
        setCategoriesToUse(categories.length > 0 ? categories : fallbackCategories);
      } catch (err) {
        // fallback or error handling
        setRmOptions(fallbackRMs);
      }
    })();
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };



  const handleSpecFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSpecFile(e.target.files[0]);
    }
  };



  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      setLoading(true);
      // TODO: Implement addMaterialCategory via API if needed
      const newCategoryObj = await apiClient.addMaterialCategory({ name: newCategory });
      setCategoriesToUse((prev) => [...prev, { value: newCategory, label: newCategory }]);
      setFormData((prev) => ({ ...prev, category: newCategory }));
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

  const handleRMChange = (value: string) => {
    if (value === "__add_new__") {
      setAddRMMode(true);
      setFormData((prev) => ({ ...prev, rm: "" }));
    } else {
      setFormData((prev) => ({ ...prev, rm: String(value) }));
      setAddRMMode(false);
    }
  };

  const handleAddRM = async () => {
    if (!newRM.trim()) return;
    try {
      setLoading(true);
      const newRMObj = await addRawMaterial({ value: newRM, label: newRM });

      setRmOptions((prev) => [...prev, { value: newRM, label: newRM }]);
      setFormData((prev) => ({ ...prev, rm: newRM }));
      setAddRMMode(false);
      setNewRM('');
    } catch (err: any) {
      setError(err.message || 'Failed to add RM');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!formData.title || !formData.category || !formData.rm || !formData.available_quantity || !formData.minimum_order || !formData.location) {
      setError('Please fill all required fields.');
      return;
    }
    setLoading(true);
    try {
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        try {
          imageUrls = await Promise.all(
            imageFiles.map(file => apiClient.uploadListingImage(file))
          );
        } catch (uploadErr: any) {
          setError('Failed to upload one or more images: ' + (uploadErr.message || uploadErr));
          setLoading(false);
          return;
        }
      }
      let specDocUrl = '';
      if (specFile) {
        try {
          specDocUrl = await apiClient.uploadFileToStorage(specFile, 'spec-docs');
        } catch (uploadErr: any) {
          setError('Failed to upload specification document: ' + (uploadErr.message || uploadErr));
          setLoading(false);
          return;
        }
      }
      let videoUrl = '';
      if (videoFile) {
        try {
          videoUrl = await apiClient.uploadListingVideo(videoFile);
        } catch (uploadErr: any) {
          setError('Failed to upload video: ' + (uploadErr.message || uploadErr));
          setLoading(false);
          return;
        }
      }
      await onSubmit({ ...formData, image_url: imageUrls, spec_doc_url: specDocUrl, video_url: videoUrl });
      setSuccess('Supply listing posted successfully!');
      setFormData({
        title: '', description: '', category: '', grade_specification: '', available_quantity: '', unit: 'kg', minimum_order: '', location: '', delivery_terms: '', certification: '', is_urgent: false,
        rm: '',
        type: '',
        whatsapp_number: '',
      });
      setImageFiles([]);
      setSpecFile(null);
      setVideoFile(null);
    } catch (err: any) {
      setError(err.message || 'Failed to post supply listing.');
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl">Post Your Supply</CardTitle>
        <CardDescription className="text-sm">List your raw materials for manufacturers to discover</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-3 sm:px-6">
        {!isAuthenticated ? (
          <div className="text-center space-y-4">
            <div className="text-gray-500">You must be logged in to post a supply listing.</div>
            <Button onClick={() => {
              navigate('/login');
            }} className="bg-blue-600 hover:bg-blue-700">
              Login to Post Supply
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Choose RM *</label>
                {rmOptions.length > 0 ? (
                  <SearchableSelect
                    key={"rmoptions"}
                    options={rmOptions}
                    value={formData.rm}
                    onValueChange={handleRMChange}
                    placeholder="Select RM"
                    searchPlaceholder="Search RM..."
                    emptyText="No RM found."
                    showAddNew={true}
                    onAddNew={() => setAddRMMode(true)}
                    disabled={loading}
                  />
                ) : (
                  <div className="text-sm text-gray-500">Loading RMs...</div>
                )}
                {addRMMode && (
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <Input value={newRM} onChange={e => setNewRM(sanitizeTextInput(e.target.value))} placeholder="New RM name" className="flex-1" maxLength={250} />
                    <div className="flex gap-2">
                      <Button type="button" onClick={handleAddRM} disabled={loading} className="flex-1 sm:flex-none">Add</Button>
                      <Button type="button" variant="outline" onClick={() => setAddRMMode(false)} className="flex-1 sm:flex-none">Cancel</Button>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input name="title" value={formData.title} onChange={e => setFormData(prev => ({ ...prev, title: sanitizeTextInput(e.target.value) }))} required maxLength={250} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                {categoriesToUse.length === 0 ? (
                  <div className="text-sm text-gray-500">Loading categories...</div>
                ) : (
                  <SearchableSelect
                    key={"categories"}
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
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <Input value={newCategory} onChange={e => setNewCategory(sanitizeTextInput(e.target.value))} placeholder="New category name" className="flex-1" maxLength={250} />
                    <div className="flex gap-2">
                      <Button type="button" onClick={handleAddCategory} disabled={loading} className="flex-1 sm:flex-none">Add</Button>
                      <Button type="button" variant="outline" onClick={() => setAddCategoryMode(false)} className="flex-1 sm:flex-none">Cancel</Button>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Input name="type" value={formData.type} onChange={e => setFormData(prev => ({ ...prev, type: sanitizeTextInput(e.target.value) }))} maxLength={250} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Available Daily Production *</label>
                <Input name="available_quantity" value={formData.available_quantity} onChange={handleInput} required type="number" min="0" step="any" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Manufacturing Location *</label>
                <Input name="location" value={formData.location} onChange={e => setFormData(prev => ({ ...prev, location: sanitizeTextInput(e.target.value) }))} required maxLength={250} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Material Specification / Data Picture / Data Sheet</label>
                <Input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,image/*" onChange={handleSpecFileChange} />
                {specFile && (
                  <div className="mt-2">
                    <span className="text-xs text-gray-500">{specFile.name}</span>
                    {specFile.type.startsWith('image/') && (
                      <img src={URL.createObjectURL(specFile)} alt="Spec Preview" className="mt-2 h-24 rounded border object-contain" />
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Grade/Specification</label>
                <Input name="grade_specification" value={formData.grade_specification} onChange={e => setFormData(prev => ({ ...prev, grade_specification: sanitizeTextInput(e.target.value) }))} maxLength={250} />
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
                <label className="text-sm font-medium">Minimum Order *</label>
                <Input name="minimum_order" value={formData.minimum_order} onChange={handleInput} required type="number" min="0" step="any" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Delivery Terms</label>
                <Input name="delivery_terms" value={formData.delivery_terms} onChange={e => setFormData(prev => ({ ...prev, delivery_terms: sanitizeTextInputWithHyphens(e.target.value) }))} maxLength={250} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Certification</label>
                <Input name="certification" value={formData.certification} onChange={e => setFormData(prev => ({ ...prev, certification: sanitizeTextInput(e.target.value) }))} maxLength={250} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Image(s)</label>
                <CaptureOrUploadImage
                  label="Product Image(s)"
                  multiple
                  onImageSelect={file => setImageFiles(prev => [...prev, file])}
                />
                {imageFiles.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {imageFiles.map((file, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${idx + 1}`}
                          className="h-24 rounded border object-contain"
                        />
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 shadow hover:bg-opacity-100 z-10"
                          onClick={() => setImageFiles(prev => prev.filter((_, i) => i !== idx))}
                          aria-label="Remove image"
                        >
                          <X className="h-4 w-4 text-gray-700" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {imageFiles.length > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    {imageFiles.map((file, idx) => file.name).join(', ')}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Video</label>
                <CaptureOrUploadVideo
                  label="Product Video"
                  onVideoSelect={file => setVideoFile(file)}
                />
                {videoFile && (
                  <div className="mt-2 relative w-fit">
                    <span className="text-xs text-gray-500">{videoFile.name}</span>
                    <video src={URL.createObjectURL(videoFile)} controls className="mt-2 h-24 rounded border object-contain" />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 shadow hover:bg-opacity-100 z-10"
                      onClick={() => setVideoFile(null)}
                      aria-label="Remove video"
                    >
                      <X className="h-4 w-4 text-gray-700" />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-6 col-span-1 sm:col-span-2 lg:col-span-3">
                <input type="checkbox" name="is_urgent" checked={formData.is_urgent} onChange={handleInput} />
                <label className="text-sm">Mark as urgent</label>
              </div>
              <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium mb-1">Enter your WhatsApp no</label>
                <Input
                  name="whatsapp_number"
                  value={formData.whatsapp_number}
                  onChange={e => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData(prev => ({ ...prev, whatsapp_number: value }));
                  }}
                  required
                  type="tel"
                  maxLength={10}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea name="description" value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: sanitizeTextInput(e.target.value) }))} rows={3} className="w-full border rounded p-2" />
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