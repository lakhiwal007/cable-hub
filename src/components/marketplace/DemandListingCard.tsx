import { MapPin, Calendar, Package, AlertCircle, Building, Star, MessageCircle, Eye, Clock, User, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DemandListing } from "@/lib/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from "@/lib/apiClient";

interface MaterialCategory {
  id: string;
  name: string;
  image_url?: string;
}

interface DemandListingCardProps {
  listing: DemandListing;
  materialCategories?: MaterialCategory[];
}

const DemandListingCard = ({ listing, materialCategories = [] }: DemandListingCardProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleViewDetails = () => {
    navigate(`/listing/demand/${listing.id}`);
  };

  const handleContactConsumer = async () => {
    if (!apiClient.isAuthenticated()) {
      // Redirect to login or show login prompt
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      // Get current user (supplier)
      const currentUser = await apiClient.getProfile();
      
      // Use the new contactConsumerWithChat method
      const result = await apiClient.contactConsumerWithChat({
        listing_id: listing.id,
        listing_type: 'demand',
        buyer_id: listing.buyer_id,
        supplier_name: currentUser.user_metadata?.name || '',
        supplier_email: currentUser.email || '',
        supplier_phone: '',
        message: "Hi, I'm interested in your demand listing!",
      });

      setDialogOpen(false);
      navigate(`/chat/${result.chat_room.id}`);
    } catch (err: any) {
      console.error('Failed to create chat:', err);
      alert('Failed to create chat: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const consumer = listing.buyer;
  // Find the material category for this listing
  const materialCategory = materialCategories.find(cat => cat.name === listing.material_type);

  return (
    <>
      <Card className={`group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        listing.is_urgent ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-white' : 'border-gray-200'
      }`}>
        {/* Product Image Section */}
        <div className="relative overflow-hidden rounded-t-lg bg-gray-100 h-32 lg:h-48">
          {materialCategory?.image_url ? (
            <img 
              src={materialCategory.image_url} 
              alt={materialCategory.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
              onClick={handleViewDetails}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 cursor-pointer" onClick={handleViewDetails}>
              <Package className="h-16 w-16 text-gray-400" />
            </div>
          )}
          
          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex items-center justify-between gap-2">
            {listing.is_urgent && (
              <Badge variant="destructive" className="animate-pulse shadow-lg">
                <AlertCircle className="h-3 w-3 mr-1" />
                Urgent
              </Badge>
            )}
            
          </div>

          {/* Quick Actions Overlay */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button size="sm" variant="secondary" className="rounded-full shadow-lg" onClick={handleViewDetails}>
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Product Info Section */}
        <CardContent className="p-4">
          {/* Category & Buyer */}
          <div className="hidden md:flex items-center justify-between mb-2">
            <Badge variant="outline" className="text-xs">
              {listing.category}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Building className="h-3 w-3" />
              {listing.buyer?.name || 'Unknown Buyer'}
            </div>
          </div>

          {/* Product Title */}
          <CardTitle 
            className="text-md lg:text-lg font-semibold mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors cursor-pointer"
            onClick={handleViewDetails}
          >
            {listing.title}
          </CardTitle>

          {/* Material Type with Image */}
          <div className="flex items-center gap-2">
            {materialCategory?.image_url && (
              <img 
                src={materialCategory.image_url} 
                alt={materialCategory.name}
                className="w-6 h-6 rounded-full object-cover border-2 border-gray-200"
              />
            )}
            <Badge variant="secondary" className="text-sm hidden md:flex">
              {listing.material_type}
            </Badge>
          </div>


          {/* Budget Section */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-lg font-bold text-purple-600">
                ₹{listing.budget_min.toLocaleString()} - ₹{listing.budget_max.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Budget Range</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Required</p>
              <p className="font-semibold">{listing.required_quantity} {listing.unit}</p>
            </div>
          </div>

          {/* Location & Deadline */}
          <div className="hidden md:flex items-center justify-between mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{listing.location}</span>
            </div>
            {listing.delivery_deadline && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(listing.delivery_deadline).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Additional Requirements */}
          {listing.additional_requirements && (
            <div className="mb-4 p-2 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 line-clamp-2">
                <strong>Requirements:</strong> {listing.additional_requirements}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleViewDetails}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            <Button
              onClick={handleContactConsumer}
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 transition-colors"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              {loading ? 'Opening Chat...' : 'Contact'}
            </Button>
          </div>

          {/* Posted Date */}
          <div className="mt-3 text-xs text-gray-500 text-center">
            Posted {new Date(listing.created_at).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>

      {/* Consumer Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Consumer Details</DialogTitle>
            <DialogDescription>
              Contact information for this demand listing
            </DialogDescription>
          </DialogHeader>
          
          {consumer && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">{consumer.name}</p>
                  <p className="text-sm text-gray-600">Consumer</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{consumer.email}</span>
                </div>
                {consumer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{consumer.phone}</span>
                  </div>
                )}
                {consumer.company_name && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{consumer.company_name}</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleContactConsumer} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Start Chat
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DemandListingCard; 