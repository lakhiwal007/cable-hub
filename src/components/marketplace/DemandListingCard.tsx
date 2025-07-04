import { MapPin, Calendar, Package, AlertCircle, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DemandListing } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Phone, User } from 'lucide-react';
import { useState } from 'react';

interface DemandListingCardProps {
  listing: DemandListing;
}

const DemandListingCard = ({ listing }: DemandListingCardProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const handleStartChat = () => {
    // TODO: Implement chat opening logic
    setDialogOpen(false);
  };
  const consumer = listing.buyer;
  return (
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
              <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
                Contact Consumer
              </Button>
            </div>
          </div>
        </div>
        {/* Consumer Details Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Consumer Details</DialogTitle>
            </DialogHeader>
            {consumer ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {consumer.name?.charAt(0) || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-lg">{consumer.name}</div>
                    <div className="text-sm text-gray-600">{consumer.company_name}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="break-all">{consumer.email}</span>
                  </div>
                  {consumer.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{consumer.phone}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Close
                  </Button>
                  <Button onClick={handleStartChat} className="bg-blue-600 hover:bg-blue-700">
                    <User className="h-4 w-4 mr-2" />
                    Open Chat
                  </Button>
                </div>
              </div>
            ) : (
              <div>No consumer details available.</div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default DemandListingCard; 