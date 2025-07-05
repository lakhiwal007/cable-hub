import { MapPin, Calendar, Package, AlertCircle, Building, Star, ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import type { SupplyListing } from "@/lib/types";

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
}

const SupplyListingCard = ({ listing, onContactSupplier, currentUserId, materialCategories = [] }: SupplyListingCardProps) => {
  const navigate = useNavigate();
  // Determine if the current user is the supplier
  const isOwnListing = currentUserId && listing.supplier_id === currentUserId;
  
  // Find the material category for this listing
  const materialCategory = materialCategories.find(cat => cat.name === listing.material_type);

  const handleViewDetails = () => {
    navigate(`/listing/supply/${listing.id}`);
  };

  return (
    <Card className={`group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
      listing.is_urgent ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-white' : 'border-gray-200'
    }`}>
      {/* Product Image Section */}
      <div className="relative overflow-hidden rounded-t-lg bg-gray-100 h-48">
        {materialCategory?.image_url ? (
          <img 
            src={materialCategory.image_url} 
            alt={materialCategory.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
            onClick={handleViewDetails}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 cursor-pointer" onClick={handleViewDetails}>
            <Package className="h-16 w-16 text-gray-400" />
          </div>
        )}
        
        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {listing.is_urgent && (
            <Badge variant="destructive" className="animate-pulse shadow-lg">
              <AlertCircle className="h-3 w-3 mr-1" />
              Urgent
            </Badge>
          )}
          {listing.is_verified && (
            <Badge className="bg-green-600 text-white shadow-lg">
              <Star className="h-3 w-3 mr-1" />
              Verified
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
        {/* Category & Supplier */}
        <div className="flex items-center justify-between mb-2">
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
          className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer"
          onClick={handleViewDetails}
        >
          {listing.title}
        </CardTitle>

        {/* Material Type with Image */}
        <div className="flex items-center mb-3">
          <Badge variant="secondary" className="text-sm">
            {listing.material_type}
          </Badge>
        </div>

        {/* Product Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {listing.description}
        </p>

        {/* Specifications */}
        <div className="flex flex-wrap gap-2 mb-4">
          {listing.grade_specification && (
            <Badge variant="outline" className="text-xs">
              {listing.grade_specification}
            </Badge>
          )}
          {listing.certification && (
            <Badge variant="outline" className="text-xs">
              ✓ {listing.certification}
            </Badge>
          )}
        </div>

        {/* Price Section */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-2xl font-bold text-green-600">
              ₹{listing.price_per_unit.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">per {listing.unit}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Min Order</p>
            <p className="font-semibold">{listing.minimum_order} {listing.unit}</p>
          </div>
        </div>

        {/* Stock & Location */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Package className="h-4 w-4" />
            <span>{listing.available_quantity} {listing.unit} available</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{listing.location}</span>
          </div>
        </div>

        {/* Delivery Info */}
        {listing.delivery_terms && (
          <div className="mb-4 p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>Delivery:</strong> {listing.delivery_terms}
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
          {!isOwnListing ? (
            <Button
              onClick={() => onContactSupplier(listing)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Contact
            </Button>
          ) : (
            <Button variant="outline" className="flex-1" disabled>
              Your Listing
            </Button>
          )}
        </div>

        {/* Posted Date */}
        <div className="mt-3 text-xs text-gray-500 text-center">
          Posted {new Date(listing.created_at).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default SupplyListingCard; 