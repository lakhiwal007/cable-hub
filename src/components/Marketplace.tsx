import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { Tabs as UITabs, TabsList as UITabsList, TabsTrigger as UITabsTrigger, TabsContent as UITabsContent } from "@/components/ui/tabs";
import Loader from "@/components/ui/loader";
import apiClient from "@/lib/apiClient";
import type { SupplyListing, DemandListing } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

// Import modular components
import SearchAndFilter from "@/components/marketplace/SearchAndFilter";
import SupplyListingCard from "@/components/marketplace/SupplyListingCard";
import DemandListingCard from "@/components/marketplace/DemandListingCard";
import SupplyForm from "@/components/marketplace/SupplyForm";
import DemandForm from "@/components/marketplace/DemandForm";
import SupplierDetailsDialog from "@/components/marketplace/SupplierDetailsDialog";
import ContactDialog from "@/components/marketplace/ContactDialog";

interface MaterialCategory {
  id: string;
  name: string;
  image_url?: string;
}

const Marketplace = () => {
  const [activeTab, setActiveTab] = useState("browse");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [supplyListings, setSupplyListings] = useState<SupplyListing[]>([]);
  const [demandListings, setDemandListings] = useState<DemandListing[]>([]);
  const [materialCategories, setMaterialCategories] = useState<MaterialCategory[]>([]);
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [browseTab, setBrowseTab] = useState<'supply' | 'demand'>('supply');

  // Create categories array from fetched material categories
  const categories = [
    { value: "all", label: "All Categories" },
    ...materialCategories.map(cat => ({ value: cat.name, label: cat.name }))
  ];

  const navigate = useNavigate();
  const userProfileRef = useRef<any>(null);

  useEffect(() => {
    fetchListings();
    fetchMaterialCategories();
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

  const fetchMaterialCategories = async () => {
    try {
      const categories = await apiClient.getMaterialCategories();
      setMaterialCategories(categories || []);
    } catch (err: any) {
      console.error('Failed to fetch material categories:', err);
      // Set empty array to prevent undefined errors
      setMaterialCategories([]);
    }
  };

  const filteredSupplyListings = supplyListings.filter((listing) => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (listing.supplier?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || listing.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredDemandListings = demandListings.filter((listing) => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const handleSupplySubmit = async (formData: any) => {
    await apiClient.createSupplyListing({
      ...formData,
      available_quantity: parseFloat(formData.available_quantity),
      minimum_order: parseFloat(formData.minimum_order),
      is_urgent: !!formData.is_urgent,
    });
    fetchListings();
  };

  const handleDemandSubmit = async (formData: any) => {
    await apiClient.createDemandListing({
      ...formData,
      required_quantity: parseFloat(formData.required_quantity),
      is_urgent: !!formData.is_urgent,
    });
    fetchListings();
  };

  return (
    <div className="space-y-4 sm:space-y-8">
      <div className="text-center">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Raw Material Marketplace</h2>
            <p className="text-sm sm:text-base text-gray-600">Connect with suppliers and manufacturers across India</p>
          </div>
         
        </div>
      </div>

      {loading ? (
        <Loader className="py-12" />
      ) : error ? (
        <div className="text-red-500 text-center py-8">
          <p>Error: {error}</p>
          <button onClick={fetchListings} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Try Again
          </button>
        </div>
      ) : (
        
        <UITabs value={activeTab} onValueChange={setActiveTab}>
          <UITabsList className="grid w-full grid-cols-3 gap-1 sm:gap-2 content-center h-12 sm:h-auto">
            <UITabsTrigger value="browse" className="text-xs sm:text-sm">Browse</UITabsTrigger>
            <UITabsTrigger value="post-supply" className="text-xs sm:text-sm text-balance">Sell Raw Materials</UITabsTrigger>
            <UITabsTrigger value="post-demand" className="text-xs sm:text-sm text-balance">Buy Raw Materials</UITabsTrigger>
          </UITabsList>

          <UITabsContent value="browse" className="space-y-4 sm:space-y-6">
            {/* Search and Filter */}
            <SearchAndFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filterCategory={filterCategory}
              onFilterChange={setFilterCategory}
              categories={categories}
            />

            {/* Sub-tabs for Supply/Demand */}
            <UITabs value={browseTab} onValueChange={v => setBrowseTab(v as 'supply' | 'demand')} className="w-full">
              <UITabsList className="w-full grid grid-cols-2 mb-4 gap-1 sm:gap-2">
                <UITabsTrigger value="supply" className="text-xs sm:text-sm">Sell Raw Materials</UITabsTrigger>
                <UITabsTrigger value="demand" className="text-xs sm:text-sm">Buy Raw Materials</UITabsTrigger>
              </UITabsList>
              <UITabsContent value="supply">
                <div className="space-y-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Supply Listings</h3>
                  {filteredSupplyListings.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
                      No supply listings found. Try adjusting your search or filters.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {filteredSupplyListings.map((listing) => (
                        <SupplyListingCard
                          key={listing.id}
                          listing={listing}
                          onContactSupplier={handleContactSupplier}
                          currentUserId={userProfileRef.current?.id}
                          materialCategories={materialCategories}
                          isAuthenticated={isAuthenticated}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </UITabsContent>
              <UITabsContent value="demand">
                <div className="space-y-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Demand Listings</h3>
                  {filteredDemandListings.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
                      No demand listings found. Try adjusting your search or filters.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {filteredDemandListings.map((listing) => (
                        <DemandListingCard 
                          key={listing.id} 
                          listing={listing} 
                          materialCategories={materialCategories}
                          currentUserId={userProfileRef.current?.id}
                          isAuthenticated={isAuthenticated}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </UITabsContent>
            </UITabs>
          </UITabsContent>

          <UITabsContent value="post-supply" className="space-y-4 sm:space-y-6">
            <SupplyForm
              onSubmit={handleSupplySubmit}
              categories={categories}
              materialCategories={materialCategories}
              isAuthenticated={isAuthenticated}
              onCategoryAdded={fetchMaterialCategories}
            />
          </UITabsContent>

          <UITabsContent value="post-demand" className="space-y-4 sm:space-y-6">
            <DemandForm
              onSubmit={handleDemandSubmit}
              categories={categories}
              materialCategories={materialCategories}
              isAuthenticated={isAuthenticated}
              onCategoryAdded={fetchMaterialCategories}
            />
          </UITabsContent>
        </UITabs>
      )}


      {/* Supplier Details Dialog */}
      <SupplierDetailsDialog
        open={supplierDetailsDialogOpen}
        onOpenChange={setSupplierDetailsDialogOpen}
        listing={selectedListing}
        onStartChat={handleStartChat}
      />

      {/* Contact Supplier Dialog */}
      <ContactDialog
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
        listing={selectedListing}
        contactForm={contactForm}
        onContactFormChange={setContactForm}
        onSubmit={handleContactSubmit}
        submitting={submittingContact}
      />
    </div>
  );
};

export default Marketplace;
