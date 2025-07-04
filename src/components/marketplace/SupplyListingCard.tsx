import { MapPin, Calendar, Package, AlertCircle, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SupplyListing } from "@/lib/types";

interface SupplyListingCardProps {
  listing: SupplyListing;
  onContactSupplier: (listing: SupplyListing) => void;
  currentUserId?: string;
}

const SupplyListingCard = ({ listing, onContactSupplier, currentUserId }: SupplyListingCardProps) => {
  // Determine if the current user is the supplier
  const isOwnListing = currentUserId && listing.supplier_id === currentUserId;

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
                  onClick={() => onContactSupplier(listing)}
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
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

export default SupplyListingCard; 