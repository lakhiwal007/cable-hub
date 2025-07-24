import React, { useState, useEffect } from "react";
import { Users, Package, Trash2, Edit, Plus, Save, X, LogOut, Settings, Tag, Calculator } from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Loader from "@/components/ui/loader";
import MaterialCategoryList from "@/components/admin/MaterialCategoryList";
import CalculationConstantsManager from "@/components/admin/CalculationConstantsManager";

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
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="users" className="flex items-center gap-2 py-3">
              <Users className="h-4 w-4 hidden md:block" />
              <span className="text-[12px] sm:text-base text-wrap">User Management</span>
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex items-center gap-2 py-3">
              <Package className="h-4 w-4 hidden md:block" />
              <span className="text-[12px] sm:text-base text-wrap">Material Pricing</span>
            </TabsTrigger>
            {/* <TabsTrigger value="categories" className="flex items-center gap-2 py-3">
              <Tag className="h-4 w-4 hidden md:block" />
              <span className="text-[12px] sm:text-base text-wrap">Material Categories</span>
            </TabsTrigger> */}
            <TabsTrigger value="constants" className="flex items-center gap-2 py-3">
              <Calculator className="h-4 w-4 hidden md:block" />
              <span className="text-[12px] sm:text-base text-wrap">Calculation Constants</span>
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
                  <Loader/>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {users.map((user) => (
                      <div key={user.id} className="border rounded-lg p-4 space-y-3">
                        {editingUser?.id === user.id ? (
                          <div className="space-y-3">
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
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleEditUser(editingUser)} className="flex-1">
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingUser(null)} className="flex-1">
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-sm truncate">{user.name}</p>
                                <Badge variant={user.user_type === 'admin' ? 'destructive' : 'secondary'} className="text-xs shrink-0">
                                  {user.user_type}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => setEditingUser(user)} className="flex-1">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(user.id)} className="flex-1">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {materials.map((material) => (
                      <div key={material.id} className="border rounded-lg p-4 space-y-3">
                        {editingMaterial?.id === material.id ? (
                          <div className="space-y-3">
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
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleEditMaterial(editingMaterial)} className="flex-1">
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingMaterial(null)} className="flex-1">
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-sm truncate">{material.material}</p>
                                <Badge variant={material.trend === 'up' ? 'default' : 'destructive'} className="text-xs shrink-0">
                                  {material.trend === 'up' ? '+' + material.change : '-' + material.change}
                                </Badge>
                              </div>
                              <p className="text-lg font-bold">₹{material.price}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => setEditingMaterial(material)} className="flex-1">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteMaterial(material.id)} className="flex-1">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Material Categories Tab */}
          <TabsContent value="categories">
            <MaterialCategoryList />
          </TabsContent>

          {/* Calculation Settings Tab */}
          <TabsContent value="constants">
            <CalculationConstantsManager />
          </TabsContent>

         
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel; 