import { useState, useEffect } from "react";
import { Plus, Search, Filter, MapPin, Calendar, Package, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMarketplaceListings } from "@/lib/supabaseApi";
import type { MarketplaceListing } from "@/lib/types";
import Loader from "@/components/ui/loader";
import apiClient from "@/lib/apiClient";

const Marketplace = () => {
  const [activeTab, setActiveTab] = useState("browse");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [supplierListings, setSupplierListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "copper", label: "Copper" },
    { value: "aluminum", label: "Aluminum" },
    { value: "pvc", label: "PVC" },
    { value: "steel", label: "Steel" },
    { value: "rubber", label: "Rubber" }
  ];

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.getMarketplaceListings();
        setSupplierListings(data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch listings");
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, []);

  const filteredListings = supplierListings.filter((listing: MarketplaceListing) => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (listing.supplier || listing.manufacturer || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || listing.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Raw Material Marketplace</h2>
        <p className="text-gray-600">Connect with suppliers and manufacturers across India</p>
      </div>

      {loading ? (
        <Loader className="py-12" />
      ) : error ? (
        <div className="text-red-500">Error: {error}</div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Browse Listings</TabsTrigger>
            <TabsTrigger value="post-supply">Post Supply</TabsTrigger>
            <TabsTrigger value="post-demand">Post Demand</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search materials, suppliers, or locations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full md:w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Listings */}
            <div className="grid gap-6">
              {filteredListings.map((listing) => (
                <Card key={listing.id} className={`transition-shadow hover:shadow-lg ${
                  listing.urgent ? 'border-orange-200 bg-orange-50/50' : ''
                }`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={listing.type === 'supply' ? 'default' : 'secondary'}>
                            {listing.type === 'supply' ? 'Supply Available' : 'Demand Posted'}
                          </Badge>
                          {listing.verified && (
                            <Badge variant="outline" className="text-green-600 border-green-300">
                              Verified
                            </Badge>
                          )}
                          {listing.urgent && (
                            <Badge variant="destructive" className="animate-pulse">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Urgent
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl">{listing.title}</CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          <span className="font-medium">
                            {listing.supplier || listing.manufacturer}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {listing.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {listing.posted}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          {listing.price || listing.budget}
                        </p>
                        {listing.minOrder && (
                          <p className="text-sm text-gray-500">Min: {listing.minOrder}</p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{listing.quantity}</span>
                        </div>
                        {listing.deadline && (
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-orange-400" />
                            <span className="text-sm">Deadline: {listing.deadline}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button size="sm">
                          {listing.type === 'supply' ? 'Contact Supplier' : 'Submit Quote'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="post-supply" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Post Your Supply</CardTitle>
                <CardDescription>List your raw materials for manufacturers to discover</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Material Type</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="copper">Copper</SelectItem>
                        <SelectItem value="aluminum">Aluminum</SelectItem>
                        <SelectItem value="pvc">PVC</SelectItem>
                        <SelectItem value="steel">Steel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Grade/Specification</label>
                    <Input placeholder="e.g., 99.9% Pure, Grade A" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Available Quantity</label>
                    <Input placeholder="e.g., 1000kg" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Price per Unit</label>
                    <Input placeholder="e.g., ₹485/kg" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Minimum Order</label>
                    <Input placeholder="e.g., 100kg" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    className="w-full p-3 border rounded-md resize-none"
                    rows={4}
                    placeholder="Provide detailed specifications, certifications, delivery terms..."
                  />
                </div>

                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Post Supply Listing
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="post-demand" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Post Your Requirements</CardTitle>
                <CardDescription>Let suppliers know what materials you need</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Required Material</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="copper">Copper</SelectItem>
                        <SelectItem value="aluminum">Aluminum</SelectItem>
                        <SelectItem value="pvc">PVC</SelectItem>
                        <SelectItem value="steel">Steel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Specifications</label>
                    <Input placeholder="e.g., 6mm diameter, Grade A" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Required Quantity</label>
                    <Input placeholder="e.g., 2000kg" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Budget Range</label>
                    <Input placeholder="e.g., ₹480-490/kg" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Delivery Deadline</label>
                    <Input placeholder="e.g., 15 days" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Additional Requirements</label>
                  <textarea
                    className="w-full p-3 border rounded-md resize-none"
                    rows={4}
                    placeholder="Specify quality requirements, certifications needed, delivery location..."
                  />
                </div>

                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Post Requirement
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Marketplace;
