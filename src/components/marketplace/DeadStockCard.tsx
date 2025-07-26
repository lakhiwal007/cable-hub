import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, MapPin } from 'lucide-react';
import { WhatsAppContact } from '@/components/ui/whatsapp-contact';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/apiClient';

interface DeadStockCardProps {
  item: any;
  onMediaClick: (url: string, type: 'image' | 'video') => void;
}

const DeadStockCard: React.FC<DeadStockCardProps> = ({ item, onMediaClick }) => {
  const navigate = useNavigate();
  const mainImage = item.image_urls?.[0] || '/placeholder.svg';
  const thumbnails = item.image_urls?.slice(1, 4) || [];
  const isAuthenticated = apiClient.isAuthenticated();

  return (
    <div className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-gray-200 h-full bg-white rounded-lg overflow-hidden">
      {/* Product Image Section */}
      <div className="relative overflow-hidden rounded-t-lg bg-gray-100 h-40 sm:h-32 lg:h-48">
        <img
          src={mainImage}
          alt={item.stock_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
          onClick={() => onMediaClick(mainImage, 'image')}
        />
        {/* Badges Overlay */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex items-center justify-between gap-1 sm:gap-2">
          {item.year_of_purchase && (
            <Badge className="bg-yellow-600 text-white shadow-lg text-xs px-2 py-1">
              Purchased {item.year_of_purchase}
            </Badge>
          )}
        </div>
        {/* Quick Actions Overlay */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button size="sm" variant="secondary" className="rounded-full shadow-lg h-8 w-8 sm:h-9 sm:w-9" onClick={() => onMediaClick(mainImage, 'image')}>
            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
      {/* Thumbnails */}
      {thumbnails.length > 0 && (
        <div className="flex gap-2 px-3 sm:px-4 py-2">
          {thumbnails.map((url: string, i: number) => (
            <img
              key={i}
              src={url}
              alt="Thumb"
              className="w-12 h-12 object-cover rounded border cursor-pointer hover:ring-2 hover:ring-blue-400"
              onClick={() => onMediaClick(url, 'image')}
            />
          ))}
        </div>
      )}
      {/* Product Info Section */}
      <div className="p-3 sm:p-4">
        {/* Product Title */}
        <h2 className="text-sm sm:text-md lg:text-lg font-semibold mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors cursor-pointer" onClick={() => onMediaClick(mainImage, 'image')}>
          {item.stock_name}
        </h2>
        {/* Budget Range */}
        {(item.budget_min || item.budget_max) && (
          <div className="text-base font-bold text-blue-700 mb-1">
            Budget: ₹{item.budget_min || 0} - ₹{item.budget_max || 0}
          </div>
        )}
        {/* Location */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 text-xs sm:text-sm text-gray-600 gap-1 sm:gap-0">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="truncate">{item.location}</span>
          </div>
        </div>
        {/* Specifications */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm mb-4">
          <div><span className="font-medium">Cable/Material:</span> {item.cable_name || 'N/A'}</div>
          <div><span className="font-medium">Qty:</span> {item.qty || 'N/A'}</div>
          <div><span className="font-medium">Size:</span> {item.size || 'N/A'}</div>
        </div>
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/dead-stock/${item.id}`)}
            className="w-full h-10 sm:h-9 text-sm"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          {item.whatsapp_number ? (
            isAuthenticated ? (
              <WhatsAppContact
                phoneNumber={item.whatsapp_number}
                listingTitle={item.stock_name}
                listingType="supply"
                listingId={item.id}
                variant="default"
                size="default"
                className="w-full bg-blue-600 hover:bg-blue-700 transition-colors h-10 sm:h-9 text-sm"
                defaultMessage={`Hello, I'm interested in your dead stock listing: ${item.stock_name}. Please provide more details.`}
              >
                Contact
              </WhatsAppContact>
            ) : (
              <Button
                onClick={() => navigate('/login')}
                className="w-full h-10 sm:h-9 text-sm bg-blue-600 hover:bg-blue-700"
              >
                Login to Contact
              </Button>
            )
          ) : (
            <Button
              className="w-full h-10 sm:h-9 text-sm bg-gray-400 cursor-not-allowed"
              disabled
            >
              No Contact
            </Button>
          )}
        </div>
        {/* Posted Date */}
        <div className="mt-2 sm:mt-3 text-xs text-gray-500 text-center">
          Posted {new Date(item.created_at || Date.now()).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default DeadStockCard; 