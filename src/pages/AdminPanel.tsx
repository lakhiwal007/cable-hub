import React, { useState, useEffect } from "react";
import { Users, Package, Trash2, Edit, Plus, Save, X, LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const AdminPanel = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [newMaterial, setNewMaterial] = useState({ material: "", price: "", change: "", trend: "up" });

  // Fetch users and materials on component mount
  useEffect(() => {
    fetchUsers();
    fetchMaterials();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getUsers();
      setUsers(response as any[]);
    } catch (err: any) {
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await apiClient.getPricingData();
      setMaterials(response || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch materials");
    }
  };

  const updateCalculationSetting = (category: string, key: string, value: number) => {
    setCalculationSettings((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await apiClient.deleteUser(userId);
      setUsers(users.filter(user => user.id !== userId));
    } catch (err: any) {
      setError(err.message || "Failed to delete user");
    }
  };

  const handleEditUser = async (userData: any) => {
    try {
      await apiClient.updateUser(userData.id, userData);
      setUsers(users.map(user => user.id === userData.id ? userData : user));
      setEditingUser(null);
    } catch (err: any) {
      setError(err.message || "Failed to update user");
    }
  };

  const handleAddMaterial = async () => {
    if (!newMaterial.material || !newMaterial.price) {
      setError("Material name and price are required");
      return;
    }
    try {
      const response = await apiClient.addPricingData(newMaterial);
      setMaterials([...materials, response]);
      setNewMaterial({ material: "", price: "", change: "", trend: "up" });
    } catch (err: any) {
      setError(err.message || "Failed to add material");
    }
  };

  const handleEditMaterial = async (materialData: any) => {
    try {
      await apiClient.updatePricingData(materialData.id, materialData);
      setMaterials(materials.map(material => material.id === materialData.id ? materialData : material));
      setEditingMaterial(null);
    } catch (err: any) {
      setError(err.message || "Failed to update material");
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm("Are you sure you want to delete this material?")) return;
    try {
      await apiClient.deletePricingData(materialId);
      setMaterials(materials.filter(material => material.id !== materialId));
    } catch (err: any) {
      setError(err.message || "Failed to delete material");
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Admin logging out...');
      await apiClient.logout();
      console.log('Logout completed, redirecting to login page...');
      navigate("/login");
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, redirect to login for security
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600">Manage users and material pricing</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 w-full sm:w-auto"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
            <button onClick={() => setError("")} className="float-right text-red-500 hover:text-red-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto">
            <TabsTrigger value="users" className="flex items-center gap-2 py-3">
              <Users className="h-4 w-4" />
              <span className="text-sm sm:text-base">User Management</span>
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex items-center gap-2 py-3">
              <Package className="h-4 w-4" />
              <span className="text-sm sm:text-base">Material Pricing</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 py-3">
              <Settings className="h-4 w-4" />
              <span className="text-sm sm:text-base">Calculation Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* User Management Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Registered Users</CardTitle>
                <CardDescription>View and manage users</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading users...</div>
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="border rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
                        {editingUser?.id === user.id ? (
                          <div className="flex-1 space-y-3 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                            <Input
                              value={editingUser.name}
                              onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                              placeholder="Name"
                              className="w-full"
                            />
                            <Input
                              value={editingUser.email}
                              onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                              placeholder="Email"
                              className="w-full"
                            />
                            <select
                              value={editingUser.userType}
                              onChange={(e) => setEditingUser({...editingUser, userType: e.target.value})}
                              className="p-2 border rounded w-full"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                        ) : (
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-row gap-2">
                                <p className="font-medium text-sm sm:text-base truncate">{user.name}</p>
                              <Badge variant={user.user_type === 'admin' ? 'destructive' : 'secondary'} className="self-start sm:self-auto">
                                {user.user_type}
                              </Badge>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-500 truncate">{user.email}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="flex gap-2 pt-2 sm:pt-0 justify-end sm:justify-start">
                          {editingUser?.id === user.id ? (
                            <>
                              <Button size="sm" onClick={() => handleEditUser(editingUser)} className="min-w-[36px]">
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingUser(null)} className="min-w-[36px]">
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="outline" onClick={() => setEditingUser(user)} className="min-w-[36px]">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(user.id)} className="min-w-[36px]">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Material Pricing Tab */}
          <TabsContent value="materials">
            <div className="space-y-6">
              {/* Add New Material */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Add New Material</CardTitle>
                  <CardDescription>Add a new material with pricing information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Material Name</Label>
                      <Input
                        value={newMaterial.material}
                        onChange={(e) => setNewMaterial({...newMaterial, material: e.target.value})}
                        placeholder="e.g., Copper Wire 99.9%"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Price</Label>
                      <Input
                        value={newMaterial.price}
                        onChange={(e) => setNewMaterial({...newMaterial, price: e.target.value})}
                        placeholder="e.g., ₹485/kg"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Change</Label>
                      <Input
                        value={newMaterial.change}
                        onChange={(e) => setNewMaterial({...newMaterial, change: e.target.value})}
                        placeholder="e.g., +2.3%"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Trend</Label>
                      <select
                        value={newMaterial.trend}
                        onChange={(e) => setNewMaterial({...newMaterial, trend: e.target.value})}
                        className="p-2 border rounded w-full mt-1"
                      >
                        <option value="up">Up</option>
                        <option value="down">Down</option>
                      </select>
                    </div>
                  </div>
                  <Button onClick={handleAddMaterial} className="mt-4 w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Material
                  </Button>
                </CardContent>
              </Card>

              {/* Material List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Material Pricing</CardTitle>
                  <CardDescription>Manage existing material prices</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {materials.map((material) => (
                      <div key={material.id} className="border rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
                        {editingMaterial?.id === material.id ? (
                          <div className="flex-1 space-y-3 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            <Input
                              value={editingMaterial.material}
                              onChange={(e) => setEditingMaterial({...editingMaterial, material: e.target.value})}
                              placeholder="Material"
                              className="w-full"
                            />
                            <Input
                              value={editingMaterial.price}
                              onChange={(e) => setEditingMaterial({...editingMaterial, price: e.target.value})}
                              placeholder="Price"
                              className="w-full"
                            />
                            <Input
                              value={editingMaterial.change}
                              onChange={(e) => setEditingMaterial({...editingMaterial, change: e.target.value})}
                              placeholder="Change"
                              className="w-full"
                            />
                            <select
                              value={editingMaterial.trend}
                              onChange={(e) => setEditingMaterial({...editingMaterial, trend: e.target.value})}
                              className="p-2 border rounded w-full"
                            >
                              <option value="up">Up</option>
                              <option value="down">Down</option>
                            </select>
                          </div>
                        ) : (
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-row gap-2">
                                <p className="font-medium text-sm sm:text-base truncate">{material.material}</p>
                                <Badge variant={material.trend === 'up' ? 'default' : 'destructive'} className="self-start sm:self-auto">
                                {material.trend === 'up' ? '+' + material.change : '-' + material.change}
                              </Badge>
                                </div>
                                <p className="text-lg font-bold">₹{material.price}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="flex gap-2 pt-2 sm:pt-0 justify-end sm:justify-start">
                          {editingMaterial?.id === material.id ? (
                            <>
                              <Button size="sm" onClick={() => handleEditMaterial(editingMaterial)} className="min-w-[36px]">
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingMaterial(null)} className="min-w-[36px]">
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="outline" onClick={() => setEditingMaterial(material)} className="min-w-[36px]">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteMaterial(material.id)} className="min-w-[36px]">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Calculation Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Calculation Settings</CardTitle>
                <CardDescription>Configure calculation parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Material Densities */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg">Material Densities</CardTitle>
                      <CardDescription>Density of different materials (g/cm³)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Copper</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={calculationSettings.materialDensities.copper}
                            onChange={(e) => updateCalculationSetting('materialDensities', 'copper', Number(e.target.value))}
                            placeholder="Density (g/cm³)"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Aluminum</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={calculationSettings.materialDensities.aluminum}
                            onChange={(e) => updateCalculationSetting('materialDensities', 'aluminum', Number(e.target.value))}
                            placeholder="Density (g/cm³)"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">PVC</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={calculationSettings.materialDensities.pvc}
                            onChange={(e) => updateCalculationSetting('materialDensities', 'pvc', Number(e.target.value))}
                            placeholder="Density (g/cm³)"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">XLPE</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={calculationSettings.materialDensities.xlpe}
                            onChange={(e) => updateCalculationSetting('materialDensities', 'xlpe', Number(e.target.value))}
                            placeholder="Density (g/cm³)"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Rubber</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={calculationSettings.materialDensities.rubber}
                            onChange={(e) => updateCalculationSetting('materialDensities', 'rubber', Number(e.target.value))}
                            placeholder="Density (g/cm³)"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Cost Factors */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg">Cost Factors</CardTitle>
                      <CardDescription>Factors affecting cost calculation</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Labor Cost</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={calculationSettings.costFactors.laborCost}
                            onChange={(e) => updateCalculationSetting('costFactors', 'laborCost', Number(e.target.value))}
                            placeholder="Factor"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Overhead Cost</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={calculationSettings.costFactors.overheadCost}
                            onChange={(e) => updateCalculationSetting('costFactors', 'overheadCost', Number(e.target.value))}
                            placeholder="Factor"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Profit Margin</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={calculationSettings.costFactors.profitMargin}
                            onChange={(e) => updateCalculationSetting('costFactors', 'profitMargin', Number(e.target.value))}
                            placeholder="Factor"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Waste Factor</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={calculationSettings.costFactors.wasteFactor}
                            onChange={(e) => updateCalculationSetting('costFactors', 'wasteFactor', Number(e.target.value))}
                            placeholder="Factor"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Calculation Constants */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg">Calculation Constants</CardTitle>
                      <CardDescription>Constants used in calculations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Conductor Density Factor</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={calculationSettings.calculationConstants.conductorDensityFactor}
                            onChange={(e) => updateCalculationSetting('calculationConstants', 'conductorDensityFactor', Number(e.target.value))}
                            placeholder="Factor"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Insulation Thickness Factor</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={calculationSettings.calculationConstants.insulationThicknessFactor}
                            onChange={(e) => updateCalculationSetting('calculationConstants', 'insulationThicknessFactor', Number(e.target.value))}
                            placeholder="Factor"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Sheath Thickness Factor</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={calculationSettings.calculationConstants.sheathThicknessFactor}
                            onChange={(e) => updateCalculationSetting('calculationConstants', 'sheathThicknessFactor', Number(e.target.value))}
                            placeholder="Factor"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Length Safety Factor</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={calculationSettings.calculationConstants.lengthSafetyFactor}
                            onChange={(e) => updateCalculationSetting('calculationConstants', 'lengthSafetyFactor', Number(e.target.value))}
                            placeholder="Factor"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel; 