import React, { useState, useEffect } from "react";
import { Users, Package, Trash2, Edit, Plus, Save, X, LogOut } from "lucide-react";
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

  const handleLogout = () => {
    apiClient.logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600">Manage users and material pricing</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
            <button onClick={() => setError("")} className="float-right text-red-500 hover:text-red-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Material Pricing
            </TabsTrigger>
          </TabsList>

          {/* User Management Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Registered Users</CardTitle>
                <CardDescription>View and manage regular users (admins excluded)</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading users...</div>
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="border rounded-lg p-4 flex items-center justify-between">
                        {editingUser?.id === user.id ? (
                          <div className="flex-1 grid grid-cols-3 gap-4">
                            <Input
                              value={editingUser.name}
                              onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                              placeholder="Name"
                            />
                            <Input
                              value={editingUser.email}
                              onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                              placeholder="Email"
                            />
                            <select
                              value={editingUser.userType}
                              onChange={(e) => setEditingUser({...editingUser, userType: e.target.value})}
                              className="p-2 border rounded"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                        ) : (
                          <div className="flex-1">
                            <div className="flex items-center gap-4">
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                              </div>
                              <Badge variant={user.userType === 'admin' ? 'destructive' : 'secondary'}>
                                {user.userType}
                              </Badge>
                            </div>
                          </div>
                        )}
                        <div className="flex gap-2">
                          {editingUser?.id === user.id ? (
                            <>
                              <Button size="sm" onClick={() => handleEditUser(editingUser)}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingUser(null)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="outline" onClick={() => setEditingUser(user)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(user.id)}>
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
                  <CardTitle>Add New Material</CardTitle>
                  <CardDescription>Add a new material with pricing information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label>Material Name</Label>
                      <Input
                        value={newMaterial.material}
                        onChange={(e) => setNewMaterial({...newMaterial, material: e.target.value})}
                        placeholder="e.g., Copper Wire 99.9%"
                      />
                    </div>
                    <div>
                      <Label>Price</Label>
                      <Input
                        value={newMaterial.price}
                        onChange={(e) => setNewMaterial({...newMaterial, price: e.target.value})}
                        placeholder="e.g., ₹485/kg"
                      />
                    </div>
                    <div>
                      <Label>Change</Label>
                      <Input
                        value={newMaterial.change}
                        onChange={(e) => setNewMaterial({...newMaterial, change: e.target.value})}
                        placeholder="e.g., +2.3%"
                      />
                    </div>
                    <div>
                      <Label>Trend</Label>
                      <select
                        value={newMaterial.trend}
                        onChange={(e) => setNewMaterial({...newMaterial, trend: e.target.value})}
                        className="p-2 border rounded w-full"
                      >
                        <option value="up">Up</option>
                        <option value="down">Down</option>
                      </select>
                    </div>
                  </div>
                  <Button onClick={handleAddMaterial} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Material
                  </Button>
                </CardContent>
              </Card>

              {/* Material List */}
              <Card>
                <CardHeader>
                  <CardTitle>Material Pricing</CardTitle>
                  <CardDescription>Manage existing material prices</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {materials.map((material) => (
                      <div key={material.id} className="border rounded-lg p-4 flex items-center justify-between">
                        {editingMaterial?.id === material.id ? (
                          <div className="flex-1 grid grid-cols-4 gap-4">
                            <Input
                              value={editingMaterial.material}
                              onChange={(e) => setEditingMaterial({...editingMaterial, material: e.target.value})}
                              placeholder="Material"
                            />
                            <Input
                              value={editingMaterial.price}
                              onChange={(e) => setEditingMaterial({...editingMaterial, price: e.target.value})}
                              placeholder="Price"
                            />
                            <Input
                              value={editingMaterial.change}
                              onChange={(e) => setEditingMaterial({...editingMaterial, change: e.target.value})}
                              placeholder="Change"
                            />
                            <select
                              value={editingMaterial.trend}
                              onChange={(e) => setEditingMaterial({...editingMaterial, trend: e.target.value})}
                              className="p-2 border rounded"
                            >
                              <option value="up">Up</option>
                              <option value="down">Down</option>
                            </select>
                          </div>
                        ) : (
                          <div className="flex-1">
                            <div className="flex items-center gap-4">
                              <div>
                                <p className="font-medium">{material.material}</p>
                                <p className="text-lg font-bold">{material.price}</p>
                              </div>
                              <Badge variant={material.trend === 'up' ? 'default' : 'destructive'}>
                                {material.change}
                              </Badge>
                            </div>
                          </div>
                        )}
                        <div className="flex gap-2">
                          {editingMaterial?.id === material.id ? (
                            <>
                              <Button size="sm" onClick={() => handleEditMaterial(editingMaterial)}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingMaterial(null)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="outline" onClick={() => setEditingMaterial(material)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteMaterial(material.id)}>
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
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel; 