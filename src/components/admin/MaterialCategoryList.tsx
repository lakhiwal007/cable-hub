import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, Image as ImageIcon } from "lucide-react";
import apiClient from "@/lib/apiClient";

interface MaterialCategory {
  id: string;
  name: string;
  image_url?: string;
  created_at: string;
}

const MaterialCategoryList = () => {
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', image_url: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', image_url: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getMaterialCategories();
      setCategories(data as MaterialCategory[]);
    } catch (err: any) {
      setError(err.message || "Failed to fetch material categories");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim()) return;
    
    try {
      await apiClient.addMaterialCategory(addForm);
      setAddForm({ name: '', image_url: '' });
      setShowAddForm(false);
      fetchCategories();
    } catch (err: any) {
      setError(err.message || "Failed to add material category");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editForm.name.trim()) return;
    
    try {
      await apiClient.updateMaterialCategory(editingId, editForm);
      setEditingId(null);
      setEditForm({ name: '', image_url: '' });
      fetchCategories();
    } catch (err: any) {
      setError(err.message || "Failed to update material category");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this material category?")) return;
    
    try {
      await apiClient.deleteMaterialCategory(id);
      fetchCategories();
    } catch (err: any) {
      setError(err.message || "Failed to delete material category");
    }
  };

  const startEdit = (category: MaterialCategory) => {
    setEditingId(category.id);
    setEditForm({ name: category.name, image_url: category.image_url || '' });
  };

  if (loading) return <div>Loading material categories...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div>
            <CardTitle>Material Categories</CardTitle>
            <CardDescription>Manage material categories and their images</CardDescription>
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Form */}
        {showAddForm && (
          <Card className="border-2 border-dashed">
            <CardContent className="pt-6">
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Name *</label>
                    <Input
                      value={addForm.name}
                      onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                      placeholder="e.g., Copper Wire"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Image URL</label>
                    <Input
                      value={addForm.image_url}
                      onChange={(e) => setAddForm({ ...addForm, image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Add Category</Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Categories List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((category) => (
            <div key={category.id} className="border rounded-lg p-4 space-y-3">
              {editingId === category.id ? (
                <form onSubmit={handleEdit} className="space-y-3">
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Category name"
                    required
                  />
                  <Input
                    value={editForm.image_url}
                    onChange={(e) => setEditForm({ ...editForm, image_url: e.target.value })}
                    placeholder="Image URL"
                  />
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" className="flex-1">
                      Save
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setEditingId(null)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      {category.image_url ? (
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{category.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(category.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(category)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No material categories found. Add your first category above.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MaterialCategoryList; 