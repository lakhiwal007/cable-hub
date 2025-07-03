import { useState, useEffect, useRef } from "react";
import { Plus, Search, Filter, MapPin, Calendar, Package, AlertCircle, Phone, Mail, Building, Star, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs as UITabs, TabsList as UITabsList, TabsTrigger as UITabsTrigger, TabsContent as UITabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from 'react-router-dom';

import type { SupplyListing, DemandListing } from "@/lib/types";
import Loader from "@/components/ui/loader";
import apiClient from "@/lib/apiClient";

const Marketplace = () => {
  const [activeTab, setActiveTab] = useState("browse");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [supplyListings, setSupplyListings] = useState<SupplyListing[]>([]);
  const [demandListings, setDemandListings] = useState<DemandListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [supplierDetailsDialogOpen, setSupplierDetailsDialogOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<SupplyListing | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submittingContact, setSubmittingContact] = useState(false);

  const [supplyForm, setSupplyForm] = useState({
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
  const [supplyFormLoading, setSupplyFormLoading] = useState(false);
  const [supplyFormSuccess, setSupplyFormSuccess] = useState('');
  const [supplyFormError, setSupplyFormError] = useState('');

  const [demandForm, setDemandForm] = useState({
    title: '',
    description: '',
    category: '',
    material_type: '',
    specifications: '',
    required_quantity: '',
    unit: 'kg',
    budget_min: '',
    budget_max: '',
    location: '',
    delivery_deadline: '',
    additional_requirements: '',
    is_urgent: false,
  });
  const [demandFormLoading, setDemandFormLoading] = useState(false);
  const [demandFormSuccess, setDemandFormSuccess] = useState('');
  const [demandFormError, setDemandFormError] = useState('');

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [browseTab, setBrowseTab] = useState<'supply' | 'demand'>('supply');

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "copper", label: "Copper" },
    { value: "aluminum", label: "Aluminum" },
    { value: "pvc", label: "PVC" },
    { value: "steel", label: "Steel" },
    { value: "rubber", label: "Rubber" },
    { value: "xlpe", label: "XLPE" }
  ];

  const navigate = useNavigate();
  const userProfileRef = useRef<any>(null);

  useEffect(() => {
    fetchListings();
    setIsAuthenticated(apiClient.isAuthenticated());
    // Pre-fetch user profile for contact form
    if (apiClient.isAuthenticated()) {
      apiClient.getProfile().then(user => {
        userProfileRef.current = user;
      });
    }
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const [supplies, demands] = await Promise.all([
        apiClient.getSupplyListings(),
        apiClient.getDemandListings()
      ]);
      setSupplyListings(supplies || []);
      setDemandListings(demands || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch listings");
    } finally {
      setLoading(false);
    }
  };

  const filteredSupplyListings = supplyListings.filter((listing) => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.material_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (listing.supplier?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || listing.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredDemandListings = demandListings.filter((listing) => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.material_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (listing.buyer?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || listing.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleContactSupplier = (listing: SupplyListing) => {
    setSelectedListing(listing);
    setSupplierDetailsDialogOpen(true);
  };

  const handleStartChat = async () => {
    if (!selectedListing) return;
    
    if (!apiClient.isAuthenticated()) {
      setSupplierDetailsDialogOpen(false);
      setContactDialogOpen(true);
      return;
    }

    try {
      let user = userProfileRef.current;
      if (!user) {
        user = await apiClient.getProfile();
        userProfileRef.current = user;
      }
      
      const name = user?.user_metadata?.name || user?.name || '';
      const email = user?.email || '';
      
      if (name && email) {
        // First, check if a chat room already exists
        const existingRoom = await apiClient.createChatRoom({
          listing_id: selectedListing.id,
          listing_type: 'supply',
          supplier_id: selectedListing.supplier_id,
          buyer_id: user.id,
        });

        // Check if this is a newly created room or existing room by checking if it has messages
        const messages = await apiClient.getChatMessages(existingRoom.id, 1);
        const hasMessages = messages && messages.length > 0;

        // Only send the default message if it's a new chat room with no messages
        if (!hasMessages) {
          await apiClient.sendMessage({
            chat_room_id: existingRoom.id,
            message_text: "Hi, I'm interested in your listing!",
            message_type: 'text',
          });

          // Also create traditional contact record for backwards compatibility
          await apiClient.contactSupplier({
            listing_id: selectedListing.id,
            listing_type: 'supply',
            requester_name: name,
            requester_email: email,
            requester_phone: "",
            message: "Hi, I'm interested in your listing!"
          });
        }

        setSupplierDetailsDialogOpen(false);
        navigate(`/chat/${existingRoom.id}`);
      } else {
        // Pre-fill form and show contact dialog
        setContactForm({
          name: name,
          email: email,
          message: ''
        });
        setSupplierDetailsDialogOpen(false);
        setContactDialogOpen(true);
      }
    } catch (err: any) {
      alert('Failed to start chat: ' + err.message);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing) return;
    setSubmittingContact(true);
    try {
      const result = await apiClient.contactSupplierWithChat({
        listing_id: selectedListing.id,
        listing_type: 'supply',
        supplier_id: selectedListing.supplier_id,
        requester_name: contactForm.name,
        requester_email: contactForm.email,
        requester_phone: "",
        message: contactForm.message
      });
      setContactDialogOpen(false);
      setContactForm({ name: '', email: '', message: '' });
      navigate(`/chat/${result.chat_room.id}`);
    } catch (err: any) {
      alert('Failed to send contact request: ' + err.message);
    } finally {
      setSubmittingContact(false);
    }
  };

  // Supply form handlers
  const handleSupplyInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setSupplyForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  const handleSupplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupplyFormError('');
    setSupplyFormSuccess('');
    // Basic validation
    if (!supplyForm.title || !supplyForm.category || !supplyForm.material_type || !supplyForm.available_quantity || !supplyForm.price_per_unit || !supplyForm.minimum_order || !supplyForm.location) {
      setSupplyFormError('Please fill all required fields.');
      return;
    }
    setSupplyFormLoading(true);
    try {
      await apiClient.createSupplyListing({
        ...supplyForm,
        available_quantity: parseFloat(supplyForm.available_quantity),
        price_per_unit: parseFloat(supplyForm.price_per_unit),
        minimum_order: parseFloat(supplyForm.minimum_order),
        is_urgent: !!supplyForm.is_urgent,
      });
      setSupplyFormSuccess('Supply listing posted successfully!');
      setSupplyForm({
        title: '', description: '', category: '', material_type: '', grade_specification: '', available_quantity: '', unit: 'kg', price_per_unit: '', minimum_order: '', location: '', delivery_terms: '', certification: '', is_urgent: false,
      });
      fetchListings();
    } catch (err: any) {
      setSupplyFormError(err.message || 'Failed to post supply listing.');
    } finally {
      setSupplyFormLoading(false);
    }
  };

  // Demand form handlers
  const handleDemandInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setDemandForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  const handleDemandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDemandFormError('');
    setDemandFormSuccess('');
    // Basic validation
    if (!demandForm.title || !demandForm.category || !demandForm.material_type || !demandForm.required_quantity || !demandForm.budget_min || !demandForm.budget_max || !demandForm.location) {
      setDemandFormError('Please fill all required fields.');
      return;
    }
    setDemandFormLoading(true);
    try {
      await apiClient.createDemandListing({
        ...demandForm,
        required_quantity: parseFloat(demandForm.required_quantity),
        budget_min: parseFloat(demandForm.budget_min),
        budget_max: parseFloat(demandForm.budget_max),
        is_urgent: !!demandForm.is_urgent,
      });
      setDemandFormSuccess('Demand listing posted successfully!');
      setDemandForm({
        title: '', description: '', category: '', material_type: '', specifications: '', required_quantity: '', unit: 'kg', budget_min: '', budget_max: '', location: '', delivery_deadline: '', additional_requirements: '', is_urgent: false,
      });
      fetchListings();
    } catch (err: any) {
      setDemandFormError(err.message || 'Failed to post demand listing.');
    } finally {
      setDemandFormLoading(false);
    }
  };

  const SupplyListingCard = ({ listing }: { listing: SupplyListing }) => {
    // Determine if the current user is the supplier
    const currentUser = userProfileRef.current;
    const isOwnListing = currentUser && listing.supplier_id === currentUser.id;
    return (
      <Card className={`transition-shadow hover:shadow-lg ${
        listing.is_urgent ? 'border-orange-200 bg-orange-50/50' : ''
      }`}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default">Supply Available</Badge>
                {listing.is_verified && (
                  <Badge variant="outline" className="text-green-600 border-green-300">
                    Verified
                  </Badge>
                )}
                {listing.is_urgent && (
                  <Badge variant="destructive" className="animate-pulse">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Urgent
                  </Badge>
                )}
              </div>
              <CardTitle className="text-xl">{listing.title}</CardTitle>
              <CardDescription className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  {listing.supplier?.name || 'Unknown Supplier'}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {listing.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(listing.created_at).toLocaleDateString()}
                </span>
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                ₹{listing.price_per_unit.toLocaleString()}/{listing.unit}
              </p>
              <p className="text-sm text-gray-500">Min: {listing.minimum_order} {listing.unit}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-gray-700">{listing.description}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{listing.material_type}</Badge>
              <Badge variant="outline">{listing.grade_specification}</Badge>
              {listing.certification && (
                <Badge variant="outline">✓ {listing.certification}</Badge>
              )}
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{listing.available_quantity} {listing.unit} available</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <p><strong>Delivery:</strong> {listing.delivery_terms}</p>
              </div>
              <div className="flex gap-2">
                {!isOwnListing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleContactSupplier(listing)}
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Contact Supplier
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const DemandListingCard = ({ listing }: { listing: DemandListing }) => (
    <Card className={`transition-shadow hover:shadow-lg ${
      listing.is_urgent ? 'border-orange-200 bg-orange-50/50' : ''
    }`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">Demand Posted</Badge>
              {listing.is_urgent && (
                <Badge variant="destructive" className="animate-pulse">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Urgent
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl">{listing.title}</CardTitle>
            <CardDescription className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                {listing.buyer?.name || 'Unknown Buyer'}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {listing.location}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(listing.created_at).toLocaleDateString()}
              </span>
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">
              ₹{listing.budget_min.toLocaleString()}-{listing.budget_max.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">per {listing.unit}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-gray-700">{listing.description}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{listing.material_type}</Badge>
            <Badge variant="outline">{listing.specifications}</Badge>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{listing.required_quantity} {listing.unit} required</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-400" />
              <span className="text-sm">Deadline: {listing.delivery_deadline}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {listing.additional_requirements && (
                <p><strong>Requirements:</strong> {listing.additional_requirements}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Submit Quote
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Raw Material Marketplace</h2>
        <p className="text-gray-600">Connect with suppliers and manufacturers across India</p>
      </div>

      {loading ? (
        <Loader className="py-12" />
      ) : error ? (
        <div className="text-red-500 text-center py-8">
          <p>Error: {error}</p>
          <Button onClick={fetchListings} className="mt-4">
            Try Again
          </Button>
        </div>
      ) : (
        <UITabs value={activeTab} onValueChange={setActiveTab}>
          <UITabsList className="grid w-full grid-cols-3">
            <UITabsTrigger value="browse">Browse Listings</UITabsTrigger>
            <UITabsTrigger value="post-supply">Post Supply</UITabsTrigger>
            <UITabsTrigger value="post-demand">Post Demand</UITabsTrigger>
          </UITabsList>

          <UITabsContent value="browse" className="space-y-6">
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

            {/* Sub-tabs for Supply/Demand */}
            <UITabs value={browseTab} onValueChange={v => setBrowseTab(v as 'supply' | 'demand')} className="w-full">
              <UITabsList className="w-full grid grid-cols-2 mb-4">
                <UITabsTrigger value="supply">Supply</UITabsTrigger>
                <UITabsTrigger value="demand">Demand</UITabsTrigger>
              </UITabsList>
              <UITabsContent value="supply">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">Supply Listings</h3>
                  {filteredSupplyListings.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No supply listings found. Try adjusting your search or filters.
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {filteredSupplyListings.map((listing) => (
                        <SupplyListingCard key={listing.id} listing={listing} />
                      ))}
                    </div>
                  )}
                </div>
              </UITabsContent>
              <UITabsContent value="demand">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">Demand Listings</h3>
                  {filteredDemandListings.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No demand listings found. Try adjusting your search or filters.
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {filteredDemandListings.map((listing) => (
                        <DemandListingCard key={listing.id} listing={listing} />
                      ))}
                    </div>
                  )}
                </div>
              </UITabsContent>
            </UITabs>
          </UITabsContent>

          <UITabsContent value="post-supply" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Post Your Supply</CardTitle>
                <CardDescription>List your raw materials for manufacturers to discover</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isAuthenticated ? (
                  <div className="text-center text-gray-500">You must be logged in to post a supply listing.</div>
                ) : (
                  <form onSubmit={handleSupplySubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Title *</label>
                        <Input name="title" value={supplyForm.title} onChange={handleSupplyInput} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Category *</label>
                        <select name="category" value={supplyForm.category} onChange={handleSupplyInput} required className="w-full border rounded h-10 px-2">
                          <option value="">Select category</option>
                          {categories.filter(c => c.value !== 'all').map(c => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Material Type *</label>
                        <Input name="material_type" value={supplyForm.material_type} onChange={handleSupplyInput} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Grade/Specification</label>
                        <Input name="grade_specification" value={supplyForm.grade_specification} onChange={handleSupplyInput} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Available Quantity *</label>
                        <Input name="available_quantity" value={supplyForm.available_quantity} onChange={handleSupplyInput} required type="number" min="0" step="any" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Unit</label>
                        <select name="unit" value={supplyForm.unit} onChange={handleSupplyInput} className="w-full border rounded h-10 px-2">
                          <option value="kg">kg</option>
                          <option value="mt">mt</option>
                          <option value="pieces">pieces</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Price per Unit *</label>
                        <Input name="price_per_unit" value={supplyForm.price_per_unit} onChange={handleSupplyInput} required type="number" min="0" step="any" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Minimum Order *</label>
                        <Input name="minimum_order" value={supplyForm.minimum_order} onChange={handleSupplyInput} required type="number" min="0" step="any" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Location *</label>
                        <Input name="location" value={supplyForm.location} onChange={handleSupplyInput} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Delivery Terms</label>
                        <Input name="delivery_terms" value={supplyForm.delivery_terms} onChange={handleSupplyInput} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Certification</label>
                        <Input name="certification" value={supplyForm.certification} onChange={handleSupplyInput} />
                      </div>
                      <div className="flex items-center gap-2 mt-6">
                        <input type="checkbox" name="is_urgent" checked={supplyForm.is_urgent} onChange={handleSupplyInput} />
                        <label className="text-sm">Mark as urgent</label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <textarea name="description" value={supplyForm.description} onChange={handleSupplyInput} rows={3} className="w-full border rounded p-2" />
                    </div>
                    {supplyFormError && <div className="text-red-500 text-sm">{supplyFormError}</div>}
                    {supplyFormSuccess && <div className="text-green-600 text-sm">{supplyFormSuccess}</div>}
                    <Button type="submit" className="w-full" disabled={supplyFormLoading}>{supplyFormLoading ? 'Posting...' : 'Post Supply Listing'}</Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </UITabsContent>

          <UITabsContent value="post-demand" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Post Your Requirements</CardTitle>
                <CardDescription>Let suppliers know what materials you need</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isAuthenticated ? (
                  <div className="text-center text-gray-500">You must be logged in to post a demand listing.</div>
                ) : (
                  <form onSubmit={handleDemandSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Title *</label>
                        <Input name="title" value={demandForm.title} onChange={handleDemandInput} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Category *</label>
                        <select name="category" value={demandForm.category} onChange={handleDemandInput} required className="w-full border rounded h-10 px-2">
                          <option value="">Select category</option>
                          {categories.filter(c => c.value !== 'all').map(c => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Material Type *</label>
                        <Input name="material_type" value={demandForm.material_type} onChange={handleDemandInput} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Specifications</label>
                        <Input name="specifications" value={demandForm.specifications} onChange={handleDemandInput} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Required Quantity *</label>
                        <Input name="required_quantity" value={demandForm.required_quantity} onChange={handleDemandInput} required type="number" min="0" step="any" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Unit</label>
                        <select name="unit" value={demandForm.unit} onChange={handleDemandInput} className="w-full border rounded h-10 px-2">
                          <option value="kg">kg</option>
                          <option value="mt">mt</option>
                          <option value="pieces">pieces</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Budget Min *</label>
                        <Input name="budget_min" value={demandForm.budget_min} onChange={handleDemandInput} required type="number" min="0" step="any" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Budget Max *</label>
                        <Input name="budget_max" value={demandForm.budget_max} onChange={handleDemandInput} required type="number" min="0" step="any" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Location *</label>
                        <Input name="location" value={demandForm.location} onChange={handleDemandInput} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Delivery Deadline</label>
                        <Input name="delivery_deadline" value={demandForm.delivery_deadline} onChange={handleDemandInput} />
                      </div>
                      <div className="flex items-center gap-2 mt-6">
                        <input type="checkbox" name="is_urgent" checked={demandForm.is_urgent} onChange={handleDemandInput} />
                        <label className="text-sm">Mark as urgent</label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Additional Requirements</label>
                      <textarea name="additional_requirements" value={demandForm.additional_requirements} onChange={handleDemandInput} rows={3} className="w-full border rounded p-2" />
                    </div>
                    {demandFormError && <div className="text-red-500 text-sm">{demandFormError}</div>}
                    {demandFormSuccess && <div className="text-green-600 text-sm">{demandFormSuccess}</div>}
                    <Button type="submit" className="w-full" disabled={demandFormLoading}>{demandFormLoading ? 'Posting...' : 'Post Demand Listing'}</Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </UITabsContent>
        </UITabs>
      )}

      {/* Supplier Details Dialog */}
      <Dialog open={supplierDetailsDialogOpen} onOpenChange={setSupplierDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Supplier Details</DialogTitle>
          </DialogHeader>
                  {selectedListing && (
          <div className="space-y-6">
            {/* Supplier Info */}
            <div className="space-y-4">
              <h5 className="font-semibold flex items-center gap-2">
                <Building className="h-4 w-4" />
                Supplier Information
              </h5>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{selectedListing.supplier?.name || 'Supplier Name'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{selectedListing.supplier?.email || 'Email not available'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{selectedListing.location}</span>
                </div>
              </div>
            </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setSupplierDetailsDialogOpen(false)}
                >
                  Close
                </Button>
                <Button 
                  onClick={handleStartChat}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Start Chat
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Contact Supplier Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Contact Supplier</DialogTitle>
          </DialogHeader>
          {selectedListing && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold">{selectedListing.title}</h4>
                <p className="text-sm text-gray-600">{selectedListing.supplier?.name}</p>
                <p className="text-sm text-gray-600">₹{selectedListing.price_per_unit}/{selectedListing.unit}</p>
              </div>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    placeholder="I'm interested in your listing. Please provide more details..."
                    rows={4}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setContactDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submittingContact}>
                    {submittingContact ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Marketplace;
