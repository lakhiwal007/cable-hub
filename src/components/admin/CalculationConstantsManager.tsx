import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/apiClient';

interface CalculationConstant {
  id: string;
  category: string;
  name: string;
  value: number;
  unit?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  { value: 'material_densities', label: 'Material Densities', unit: 'kg/m³' },
  { value: 'cost_factors', label: 'Cost Factors', unit: '%' },
  { value: 'calculation_constants', label: 'Calculation Constants', unit: 'factor' },
  { value: 'electrical_constants', label: 'Electrical Constants', unit: 'Ω·m' },
  { value: 'default_prices', label: 'Default Prices', unit: '₹/kg' },
];

export default function CalculationConstantsManager() {
  const [constants, setConstants] = useState<CalculationConstant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingConstant, setEditingConstant] = useState<CalculationConstant | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();

  // Form state for adding new constant
  const [newConstant, setNewConstant] = useState({
    category: '',
    name: '',
    value: '',
    unit: '',
    description: '',
  });

  useEffect(() => {
    loadConstants();
  }, []);

  const loadConstants = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getCalculationConstants();
      setConstants(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load calculation constants',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddConstant = async () => {
    try {
      if (!newConstant.category || !newConstant.name || !newConstant.value) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        return;
      }

      await apiClient.addCalculationConstant({
        category: newConstant.category,
        name: newConstant.name,
        value: parseFloat(newConstant.value),
        unit: newConstant.unit || undefined,
        description: newConstant.description || undefined,
      });

      toast({
        title: 'Success',
        description: 'Calculation constant added successfully',
      });

      setNewConstant({ category: '', name: '', value: '', unit: '', description: '' });
      setShowAddForm(false);
      loadConstants();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add calculation constant',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateConstant = async () => {
    if (!editingConstant) return;

    try {
      await apiClient.updateCalculationConstant(editingConstant.id, {
        value: editingConstant.value,
        unit: editingConstant.unit || undefined,
        description: editingConstant.description || undefined,
      });

      toast({
        title: 'Success',
        description: 'Calculation constant updated successfully',
      });

      setEditingConstant(null);
      loadConstants();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update calculation constant',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteConstant = async (constantId: string) => {
    if (!confirm('Are you sure you want to deactivate this constant?')) return;

    try {
      await apiClient.deleteCalculationConstant(constantId);
      toast({
        title: 'Success',
        description: 'Calculation constant deactivated successfully',
      });
      loadConstants();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to deactivate calculation constant',
        variant: 'destructive',
      });
    }
  };

  const filteredConstants = selectedCategory === 'all' 
    ? constants 
    : constants.filter(constant => constant.category === selectedCategory);

  const groupedConstants = filteredConstants.reduce((acc, constant) => {
    if (!acc[constant.category]) {
      acc[constant.category] = [];
    }
    acc[constant.category].push(constant);
    return acc;
  }, {} as Record<string, CalculationConstant[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 sm:p-8">
        <div className="text-base sm:text-lg">Loading calculation constants...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold">Calculation Constants</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage material densities, cost factors, and other calculation parameters
          </p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)} 
          className="w-full sm:w-auto"
          size="sm"
        >
          Add New Constant
        </Button>
      </div>

      {/* Add New Constant Form */}
      {showAddForm && (
        <Card className="border-2 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg sm:text-xl">Add New Calculation Constant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
                <Select value={newConstant.category} onValueChange={(value) => setNewConstant({ ...newConstant, category: value })}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Name *</Label>
                <Input
                  id="name"
                  value={newConstant.name}
                  onChange={(e) => setNewConstant({ ...newConstant, name: e.target.value })}
                  placeholder="e.g., copper, labor_cost"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="value" className="text-sm font-medium">Value *</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.0001"
                  value={newConstant.value}
                  onChange={(e) => setNewConstant({ ...newConstant, value: e.target.value })}
                  placeholder="Enter value"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit" className="text-sm font-medium">Unit</Label>
                <Input
                  id="unit"
                  value={newConstant.unit}
                  onChange={(e) => setNewConstant({ ...newConstant, unit: e.target.value })}
                  placeholder="e.g., kg/m³, %"
                  className="h-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="description"
                value={newConstant.description}
                onChange={(e) => setNewConstant({ ...newConstant, description: e.target.value })}
                placeholder="Optional description"
                className="min-h-[80px]"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button onClick={handleAddConstant} className="flex-1 sm:flex-none">
                Add Constant
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddForm(false)}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Label htmlFor="category-filter" className="text-sm font-medium whitespace-nowrap">
          Filter by Category:
        </Label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48 h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Constants List */}
      <div className="space-y-4 sm:space-y-6">
        {Object.entries(groupedConstants).map(([category, categoryConstants]) => (
          <Card key={category} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                {CATEGORIES.find(c => c.value === category)?.label || category}
                <Badge variant="secondary" className="text-xs">
                  {categoryConstants.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0">
                {categoryConstants.map((constant, index) => (
                  <div key={constant.id} className="border-b border-r last:border-b-0 last:border-r-0">
                    <div className="p-3 sm:p-4">
                      {editingConstant?.id === constant.id ? (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Value</Label>
                            <Input
                              type="number"
                              step="0.0001"
                              value={editingConstant.value}
                              onChange={(e) => setEditingConstant({ ...editingConstant, value: parseFloat(e.target.value) })}
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Unit</Label>
                            <Input
                              value={editingConstant.unit || ''}
                              onChange={(e) => setEditingConstant({ ...editingConstant, unit: e.target.value })}
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Description</Label>
                            <Input
                              value={editingConstant.description || ''}
                              onChange={(e) => setEditingConstant({ ...editingConstant, description: e.target.value })}
                              className="h-9"
                            />
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button onClick={handleUpdateConstant} size="sm" className="flex-1">
                              Save
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => setEditingConstant(null)}
                              size="sm"
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-semibold text-sm truncate">
                                {constant.name}
                              </h4>
                              {constant.unit && (
                                <Badge variant="outline" className="text-xs shrink-0">
                                  {constant.unit}
                                </Badge>
                              )}
                            </div>
                            <p className="text-lg sm:text-xl font-bold text-primary">
                              {constant.value.toFixed(4)}
                            </p>
                            {constant.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {constant.description}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingConstant(constant)}
                              className="flex-1"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteConstant(constant.id)}
                              className="flex-1"
                            >
                              Deactivate
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredConstants.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No calculation constants found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 