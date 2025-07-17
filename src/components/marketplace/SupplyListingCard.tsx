import { MapPin, Calendar, Package, AlertCircle, Building, Star, ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import type { SupplyListing } from "@/lib/types";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { WhatsAppContact } from "@/components/ui/whatsapp-contact";

interface MaterialCategory {
  id: string;
  name: string;
  image_url?: string;
}

interface SupplyListingCardProps {
  listing: SupplyListing;
  onContactSupplier: (listing: SupplyListing) => void;
  currentUserId?: string;
  materialCategories?: MaterialCategory[];
  isAuthenticated?: boolean;
}

const SupplyListingCard = ({ listing, onContactSupplier, currentUserId, materialCategories = [], isAuthenticated }: SupplyListingCardProps) => {
  const navigate = useNavigate();
  // Determine if the current user is the supplier
  const isOwnListing = currentUserId && listing.supplier_id === currentUserId;
  
  // Find the material category for this listing
  const materialCategory = materialCategories.find(cat => cat.name === listing.category);

  const handleViewDetails = () => {
    navigate(`/listing/supply/${listing.id}`);
  };

  return (
    <Card className={`group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
      listing.is_urgent ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-white' : 'border-gray-200'
    } h-full`}>
      {/* Product Image Section */}
      <div className="relative overflow-hidden rounded-t-lg bg-gray-100 h-40 sm:h-32 lg:h-48">
        {(() => {
          // Handle multiple images (array) or single image (string)
          const images = Array.isArray(listing.image_url) ? listing.image_url : (listing.image_url ? [listing.image_url] : []);
          
                      if (images.length > 0) {
              return (
                <div className="relative w-full h-full">
                  <Carousel className="w-full h-full" opts={{ loop: true }}>
                    <CarouselContent>
                      {images.map((imageUrl, index) => (
                        <CarouselItem key={index}>
                          <img 
                            src={imageUrl} 
                            alt={`${listing.title} - Image ${index + 1}`}
                            className="w-full h-full aspect-square group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                            onClick={handleViewDetails}
                          />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {images.length > 1 && (
                      <>
                        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </>
                    )}
                  </Carousel>
                  {/* Image counter */}
                  {images.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                      {images.length} images
                    </div>
                  )}
                </div>
              );
          } else if (materialCategory?.image_url) {
            return (
              <img 
                src={materialCategory.image_url} 
                alt={materialCategory.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                onClick={handleViewDetails}
              />
            );
          } else {
            return (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 cursor-pointer" onClick={handleViewDetails}>
                <Package className="h-16 w-16 text-gray-400" />
              </div>
            );
          }
        })()}
        
        {/* Badges Overlay */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1 sm:gap-2">
          {listing.is_urgent && (
            <Badge variant="destructive" className="animate-pulse shadow-lg text-xs px-2 py-1">
              <AlertCircle className="h-3 w-3 mr-1" />
              Urgent
            </Badge>
          )}
          {listing.is_verified && (
            <Badge className="bg-green-600 text-white shadow-lg text-xs px-2 py-1">
              <Star className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>

        {/* Quick Actions Overlay */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button size="sm" variant="secondary" className="rounded-full shadow-lg h-8 w-8 sm:h-9 sm:w-9" onClick={handleViewDetails}>
            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>

      {/* Product Info Section */}
      <CardContent className="p-3 sm:p-4">
        {/* Category & Supplier */}
        <div className="items-center justify-between mb-2 hidden md:flex">
          <Badge variant="outline" className="text-xs">
            {listing.category}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Building className="h-3 w-3" />
            {listing.supplier?.name || 'Unknown Supplier'}
          </div>
        </div>

        {/* Product Title */}
        <CardTitle 
          className="text-sm sm:text-md lg:text-lg font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer"
          onClick={handleViewDetails}
        >
          {listing.title}
        </CardTitle>

        {/* Material Type with Image */}
        <div className="flex items-center gap-2 mb-3">
          {materialCategory?.image_url && (
            <img 
              src={materialCategory.image_url} 
              alt={materialCategory.name}
              className="w-6 h-6 rounded-full object-cover border-2 border-gray-200"
            />
          )}
          
        </div>

        {/* Quantity Section */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex flex-col">
            <p className="text-xs sm:text-sm text-gray-600">Available</p>
            <p className="text-sm sm:text-base font-semibold">{listing.available_quantity} {listing.unit}</p>
          </div>
          <div className="text-right flex flex-col">
            <p className="text-xs sm:text-sm text-gray-600">Min Order</p>
            <p className="text-sm sm:text-base font-semibold">{listing.minimum_order} {listing.unit}</p>
          </div>
        </div>

        {/* Stock & Location */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 text-xs sm:text-sm text-gray-600 gap-1 sm:gap-0">
          
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="truncate">{listing.location}</span>
          </div>
        {/* Delivery Info */}
        {listing.delivery_terms ? (
          <div className="p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>Delivery:</strong> {listing.delivery_terms}
            </p>
          </div>
        ):(
          <div className="p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>Delivery:</strong> {"Not Available"}
            </p>
          </div>
        )}
        </div>


        {/* Action Buttons */}
        <div className="w-full flex gap-2">
          <Button
            variant="outline"
            onClick={handleViewDetails}
            className="w-full h-10 sm:h-9 text-sm"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          
          {!isOwnListing ? (
            isAuthenticated ? (
              <div className="w-full flex flex-col sm:flex-row gap-2">
                
                {listing.whatsapp_number && (
                  <WhatsAppContact
                    phoneNumber={listing.whatsapp_number}
                    listingTitle={listing.title}
                    listingType="supply"
                    listingId={listing.id}
                    supplierId={listing.supplier_id}
                    variant="default"
                    size="default"
                    className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 transition-colors h-10 sm:h-9 text-sm"
                    defaultMessage={`Hello, I'm interested in your supply listing: ${listing.title}. Please provide more details.`}
                  >
                    Contact
                  </WhatsAppContact>
                )}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 transition-colors h-10 sm:h-9 text-sm"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Login to Contact
                </Button>
                
              </div>
            )
          ) : (
            <Button variant="outline" className="w-full h-10 sm:h-9 text-sm" disabled>
              Your Listing
            </Button>
          )}
        </div>

        {/* Posted Date */}
        <div className="mt-2 sm:mt-3 text-xs text-gray-500 text-center">
          Posted {new Date(listing.created_at).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default SupplyListingCard; 