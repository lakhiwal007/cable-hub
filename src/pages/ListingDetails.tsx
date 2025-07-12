import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Header from '@/components/Header';
import {
    ArrowLeft,
    MapPin,
    Calendar,
    Package,
    Building,
    Phone,
    Mail,
    Globe,
    FileText,
    MessageCircle,
    Star,
    Clock,
    AlertCircle,
    CheckCircle,
    Truck,
    DollarSign,
    Scale,
    Shield,
    Eye,
    Share2,
    Bookmark,
    Download,
    TrendingUp,
    Minus,
    Image as ImageIcon
} from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { apiClient } from '@/lib/apiClient';
import { WhatsAppContact } from "@/components/ui/whatsapp-contact";

interface SupplyListing {
    id: string;
    title: string;
    description: string;
    category: string;
    grade_specification: string;
    available_quantity: number;
    unit: string;
    price_per_unit: number;
    currency: string;
    minimum_order: number;
    location: string;
    delivery_terms: string;
    certification?: string;
    image_url?: string | string[];
    is_urgent?: boolean;
    expires_at?: string;
    created_at: string;
    whatsapp_number?: string;
    supplier: {
        id: string;
        name: string;
        email: string;
        user_type?: string;
    };
}

interface DemandListing {
    id: string;
    title: string;
    description: string;
    category: string;
    specifications: string;
    required_quantity: number;
    unit: string;
    budget_min: number;
    budget_max: number;
    currency: string;
    location: string;
    delivery_deadline: string;
    additional_requirements?: string;
    image_url?: string | string[];
    is_urgent?: boolean;
    expires_at?: string;
    created_at: string;
    whatsapp_number?: string;
    buyer: {
        id: string;
        name: string;
        email: string;
        user_type?: string;
    };
}

interface MaterialCategory {
    id: string;
    name: string;
    image_url?: string;
}

const ListingDetails = () => {
    const { listingId, listingType } = useParams<{ listingId: string; listingType: 'supply' | 'demand' }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [listing, setListing] = useState<SupplyListing | DemandListing | null>(null);
    const [materialCategories, setMaterialCategories] = useState<MaterialCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [contactDialogOpen, setContactDialogOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isBookmarked, setIsBookmarked] = useState(false);

    useEffect(() => {
        if (listingId && listingType) {
            fetchListingDetails();
            fetchMaterialCategories();
        }
    }, [listingId, listingType]);

    const fetchListingDetails = async () => {
        try {
            setLoading(true);
            let data;

            if (listingType === 'supply') {
                data = await apiClient.getSupplyListingById(listingId!);
            } else {
                data = await apiClient.getDemandListingById(listingId!);
            }

            setListing(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch listing details');
        } finally {
            setLoading(false);
        }
    };

    const fetchMaterialCategories = async () => {
        try {
            const categories = await apiClient.getMaterialCategories();
            setMaterialCategories(categories);
        } catch (error) {
            console.error('Failed to fetch material categories:', error);
        }
    };

    const handleContact = async () => {
        if (!apiClient.isAuthenticated()) {
            navigate('/login');
            return;
        }

        if (listingType === 'supply') {
            const supplyListing = listing as SupplyListing;
            try {
                const currentUser = await apiClient.getProfile();
                const result = await apiClient.contactSupplierWithChat({
                    listing_id: listingId!,
                    listing_type: 'supply',
                    supplier_id: supplyListing.supplier.id,
                    requester_name: currentUser.user_metadata?.name || '',
                    requester_email: currentUser.email || '',
                    requester_phone: '',
                    message: `Hi, I'm interested in your supply listing: ${supplyListing.title}`,
                });
                setContactDialogOpen(false);
                navigate(`/chat/${result.chat_room.id}`);
            } catch (err: any) {
                console.error('Failed to create chat:', err);
                alert('Failed to create chat: ' + err.message);
            }
        } else {
            const demandListing = listing as DemandListing;
            try {
                const currentUser = await apiClient.getProfile();
                const result = await apiClient.contactConsumerWithChat({
                    listing_id: listingId!,
                    listing_type: 'demand',
                    buyer_id: demandListing.buyer.id,
                    supplier_name: currentUser.user_metadata?.name || '',
                    supplier_email: currentUser.email || '',
                    supplier_phone: '',
                    message: "Hi, I'm interested in your demand listing!",
                });
                setContactDialogOpen(false);
                navigate(`/chat/${result.chat_room.id}`);
            } catch (err: any) {
                console.error('Failed to create chat:', err);
                alert('Failed to create chat: ' + err.message);
            }
        }
    };

    const getMaterialImage = () => {
        if (!listing) return null;
        
        // First, try to use the listing's own image
        if (listing.image_url) {
            return listing.image_url;
        }
        
        // Fallback to category image
        const category = materialCategories.find(cat => cat.name === listing.category);
        return category?.image_url;
    };

    const formatPrice = (price: number) => {
        return `₹${price.toLocaleString()}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDaysRemaining = (expiryDate: string) => {
        const expiry = new Date(expiryDate);
        const now = new Date();
        const diffTime = expiry.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const shareListing = () => {
        const url = window.location.origin + location.pathname;
        if (navigator.share) {
            navigator.share({
                title: listing?.title || 'Cable Hub Listing',
                url: url
            });
        } else {
            navigator.clipboard.writeText(url);
            // You could add a toast notification here
        }
    };

    const downloadDetails = () => {
        if (!listing) return;

        const details = `
Listing Details - ${listing.title}

${listingType === 'supply' ? 'Supply' : 'Demand'} Listing
Category: ${listing.category}

Description:
${listing.description}

${listingType === 'supply' ? `
Available Quantity: ${(listing as SupplyListing).available_quantity} ${(listing as SupplyListing).unit}
Minimum Order: ${(listing as SupplyListing).minimum_order} ${(listing as SupplyListing).unit}
` : `
Required Quantity: ${(listing as DemandListing).required_quantity} ${(listing as DemandListing).unit}
`}

Location: ${listing.location}
Posted: ${formatDate(listing.created_at)}
${listing.expires_at ? `Expires: ${formatDate(listing.expires_at)}` : ''}
`;

        const blob = new Blob([details], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${listing.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_details.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
            </div>
        );
    }

    if (error || !listing) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Listing Not Found</h2>
                    <p className="text-gray-600 mb-4">{error || 'The listing you are looking for does not exist.'}</p>
                    <Button onClick={() => navigate('/marketplace')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Marketplace
                    </Button>
                </div>
            </div>
        );
    }

    const isSupply = listingType === 'supply';
    const supplyListing = listing as SupplyListing;
    const demandListing = listing as DemandListing;
    const materialImage = getMaterialImage();

    return (
        <>
            <Header 
                title={`${isSupply ? 'Supply' : 'Demand'} Listing`}
                onBack={() => navigate('/marketplace')}
                logoSrc='/cableCartLogo.png'
                rightContent={
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={shareListing} className="hidden sm:flex">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setIsBookmarked(!isBookmarked)} className="hidden sm:flex">
                            <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                            {isBookmarked ? 'Saved' : 'Save'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={downloadDetails} className="hidden sm:flex">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                }
            />
        <div className="container mx-auto px-4 py-4 md:py-8">
                {/* Listing Header */}
            <div className="mb-4 md:mb-6">
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
                            <Badge variant={isSupply ? "default" : "secondary"} className="text-xs">
                                {isSupply ? 'Supply' : 'Demand'}
                            </Badge>
                            {listing.is_urgent && (
                                <Badge variant="destructive" className="animate-pulse text-xs">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Urgent
                                </Badge>
                            )}
                            {listing.expires_at && getDaysRemaining(listing.expires_at) <= 7 && (
                                <Badge variant="outline" className="text-orange-600 border-orange-200 text-xs">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Expires Soon
                                </Badge>
                            )}
                        </div>
                        <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-2 break-words">{listing.title}</h1>
                        <p className="text-gray-600 text-sm md:text-lg">{listing.description}</p>
                    </div>

                        {/* Mobile action buttons */}
                        <div className="flex gap-1 sm:hidden">
                            <Button variant="outline" size="sm" onClick={shareListing}>
                                <Share2 className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setIsBookmarked(!isBookmarked)}>
                                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                            </Button>
                            <Button variant="outline" size="sm" onClick={downloadDetails}>
                                <Download className="h-4 w-4" />
                            </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
                {/* Main Content */}
                <div>
                    {/* Images Section */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="aspect-video max-w-xs mx-auto bg-gray-100 rounded-lg overflow-hidden">
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
                                                                    className="w-full h-full aspect-video cursor-pointer hover:scale-105 transition-transform duration-300"
                                                                    onClick={() => setSelectedImage(imageUrl)}
                                                                />
                                                            </CarouselItem>
                                                        ))}
                                                    </CarouselContent>
                                                    {images.length > 1 && (
                                                        <>
                                                            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8" />
                                                            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8" />
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
                                    } else if (materialImage && typeof materialImage === 'string') {
                                        return (
                                    <img 
                                        src={materialImage} 
                                        alt={listing.title}
                                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                                        onClick={() => setSelectedImage(materialImage)}
                                    />
                                        );
                                    } else {
                                        return (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 cursor-pointer hover:scale-105 transition-transform duration-300" onClick={() => setSelectedImage(null)}>
                                        <ImageIcon className="h-16 w-16 text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-500 text-center px-4">
                                            {listing.category}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">No image available</p>
                                    </div>
                                        );
                                    }
                                })()}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <Card className='col-span-2'>
                    <CardHeader className="px-4 py-2">
                        <CardTitle>Product Details</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 h-auto p-1">
                                <TabsTrigger value="overview" className="text-xs md:text-sm py-2">Overview</TabsTrigger>
                                <TabsTrigger value="specifications" className="text-xs md:text-sm py-2">Specifications</TabsTrigger>
                                <TabsTrigger value="delivery" className="text-xs md:text-sm py-2">Delivery & Terms</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-4 mt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Package className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                            <span className="font-medium text-sm md:text-base">Category:</span>
                                            <Badge variant="outline" className="text-xs">{listing.category}</Badge>
                                        </div>

                                        {isSupply ? (
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <Package className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                    <span className="font-medium text-sm md:text-base">Available Quantity:</span>
                                                    <span className="font-semibold text-sm md:text-base">
                                                        {supplyListing.available_quantity.toLocaleString()} {supplyListing.unit}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Package className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                    <span className="font-medium text-sm md:text-base">Minimum Order:</span>
                                                    <span className="font-semibold text-sm md:text-base">
                                                        {supplyListing.minimum_order.toLocaleString()} {supplyListing.unit}
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <Package className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                    <span className="font-medium text-sm md:text-base">Required Quantity:</span>
                                                    <span className="font-semibold text-sm md:text-base">
                                                        {demandListing.required_quantity.toLocaleString()} {demandListing.unit}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                    <span className="font-medium text-sm md:text-base">Delivery Deadline:</span>
                                                    <span className="text-sm md:text-base">{demandListing.delivery_deadline}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                            <span className="font-medium text-sm md:text-base">Location:</span>
                                            <span className="text-sm md:text-base">{listing.location}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                            <span className="font-medium text-sm md:text-base">Posted:</span>
                                            <span className="text-sm md:text-base">{formatDate(listing.created_at)}</span>
                                        </div>

                                        {listing.expires_at && (
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                <span className="font-medium text-sm md:text-base">Expires:</span>
                                                <span className={`text-sm md:text-base ${getDaysRemaining(listing.expires_at) <= 7 ? 'text-red-600 font-semibold' : ''}`}>
                                                    {formatDate(listing.expires_at)}
                                                    {getDaysRemaining(listing.expires_at) > 0 && (
                                                        <span className="text-xs text-gray-500 ml-2">
                                                            ({getDaysRemaining(listing.expires_at)} days left)
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        )}

                                        {isSupply && supplyListing.certification && (
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                <span className="font-medium text-sm md:text-base">Certification:</span>
                                                <Badge variant="outline" className="text-xs text-green-600">
                                                    {supplyListing.certification}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="specifications" className="space-y-4 mt-4">
                                {isSupply ? (
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-semibold mb-2 text-sm md:text-base">Grade Specification</h4>
                                            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm md:text-base">
                                                {supplyListing.grade_specification}
                                            </p>
                                        </div>
                                        {supplyListing.certification && (
                                            <div>
                                                <h4 className="font-semibold mb-2 text-sm md:text-base">Certifications</h4>
                                                <Badge variant="outline" className="text-green-600">
                                                    {supplyListing.certification}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-semibold mb-2 text-sm md:text-base">Specifications</h4>
                                            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm md:text-base">
                                                {demandListing.specifications}
                                            </p>
                                        </div>
                                        {demandListing.additional_requirements && (
                                            <div>
                                                <h4 className="font-semibold mb-2 text-sm md:text-base">Additional Requirements</h4>
                                                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm md:text-base">
                                                    {demandListing.additional_requirements}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="delivery" className="space-y-4 mt-4">
                                {isSupply ? (
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-semibold mb-2 text-sm md:text-base">Delivery Terms</h4>
                                            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm md:text-base">
                                                {supplyListing.delivery_terms}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <h4 className="font-semibold mb-2 text-sm md:text-base">Minimum Order</h4>
                                                <p className="text-base md:text-lg font-semibold text-blue-600">
                                                    {supplyListing.minimum_order.toLocaleString()} {supplyListing.unit}
                                                </p>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold mb-2 text-sm md:text-base">Available Quantity</h4>
                                                <p className="text-base md:text-lg font-semibold text-green-600">
                                                    {supplyListing.available_quantity.toLocaleString()} {supplyListing.unit}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-semibold mb-2 text-sm md:text-base">Delivery Deadline</h4>
                                            <p className="text-base md:text-lg font-semibold text-red-600">
                                                {demandListing.delivery_deadline}
                                            </p>
                                            {/* <p className="text-sm text-gray-600">
                                                {getDaysRemaining(demandListing.delivery_deadline)} days remaining
                                            </p> */}
                                        </div>
                                        {demandListing.additional_requirements && (
                                            <div>
                                                <h4 className="font-semibold mb-2 text-sm md:text-base">Special Requirements</h4>
                                                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm md:text-base">
                                                    {demandListing.additional_requirements}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8'>
                {/* Contact Information - Moved Below */}
                <div className="mt-6">
                    <Card>
                        <CardHeader className="p-4 md:p-6">
                            <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                                <Building className="h-4 w-5 md:h-5" />
                                {isSupply ? 'Supplier Information' : 'Buyer Information'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6 space-y-4">
                            <div className="text-center">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Building className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
                                </div>
                                <h3 className="font-semibold text-base md:text-lg">
                                    {isSupply ? supplyListing.supplier.name : demandListing.buyer.name}
                                </h3>
                                {(isSupply ? supplyListing.supplier.user_type : demandListing.buyer.user_type) && (
                                    <Badge variant="outline" className="mt-1 text-xs">
                                        {isSupply ? supplyListing.supplier.user_type : demandListing.buyer.user_type}
                                    </Badge>
                                )}
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                    <span className="text-xs md:text-sm break-all">
                                        {isSupply ? supplyListing.supplier.email : demandListing.buyer.email}
                                    </span>
                                </div>



                                {(isSupply ? supplyListing.whatsapp_number : demandListing.whatsapp_number) && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-green-500 flex-shrink-0" />
                                        <span className="text-xs md:text-sm text-green-600 font-medium">
                                            WhatsApp: {isSupply ? supplyListing.whatsapp_number : demandListing.whatsapp_number}
                                        </span>
                                    </div>
                                )}




                            </div>

                            <Separator />

                            {apiClient.isAuthenticated() ? (
                                <div className="space-y-3">
                                    
                                    
                                    {(isSupply ? supplyListing.whatsapp_number : demandListing.whatsapp_number) && (
                                        <WhatsAppContact
                                            phoneNumber={isSupply ? supplyListing.whatsapp_number! : demandListing.whatsapp_number!}
                                            listingTitle={listing.title}
                                            listingType={isSupply ? 'supply' : 'demand'}
                                            variant="default"
                                            size="default"
                                            className="w-full bg-green-600 hover:bg-green-700 transition-colors text-sm md:text-base"
                                        >
                                            Contact via WhatsApp
                                        </WhatsAppContact>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="text-center text-sm text-gray-600">
                                        Login to contact {isSupply ? 'supplier' : 'buyer'}
                                    </div>
                                    <Button
                                        onClick={() => navigate('/login')}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-sm md:text-base"
                                    >
                                        Login to Contact
                                    </Button>
                                    
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-4 md:space-y-6 mt-6">
                    {/* Market Insights */}
                    <Card>
                        <CardHeader className="p-4 md:p-6">
                            <CardTitle className="text-sm md:text-base">Market Insights</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6 space-y-3">
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div>
                                    <p className="text-xs md:text-sm font-medium text-green-800">Market Demand</p>
                                    <p className="text-xs text-green-600">High for this material</p>
                                </div>
                                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <div>
                                    <p className="text-xs md:text-sm font-medium text-blue-800">Price Trend</p>
                                    <p className="text-xs text-blue-600">Stable this week</p>
                                </div>
                                <Minus className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                <div>
                                    <p className="text-xs md:text-sm font-medium text-purple-800">Supplier Rating</p>
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star key={star} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                </div>
                                <span className="text-xs md:text-sm font-semibold text-purple-600">4.8/5</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Contact Dialog */}
            <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {isSupply ? 'Contact Supplier' : 'Contact Buyer'}
                        </DialogTitle>
                        <DialogDescription>
                            {isSupply
                                ? 'Start a conversation with the supplier about this listing.'
                                : 'Start a conversation with the buyer about their requirements.'
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-semibold mb-2">Listing Summary</h4>
                            <p className="text-sm text-gray-600">{listing.title}</p>
                            <p className="text-sm text-gray-500 mt-1">
                                {isSupply
                                    ? `${supplyListing.available_quantity.toLocaleString()} ${supplyListing.unit} available`
                                    : `${demandListing.required_quantity.toLocaleString()} ${demandListing.unit} required`
                                }
                            </p>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-semibold mb-2 text-blue-800">
                                {isSupply ? 'Supplier Details' : 'Buyer Details'}
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <Building className="h-4 w-4 text-blue-600" />
                                    <span className="font-medium">
                                        {isSupply ? supplyListing.supplier.name : demandListing.buyer.name}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-blue-600" />
                                    <span className="text-gray-600">
                                        {isSupply ? supplyListing.supplier.email : demandListing.buyer.email}
                                    </span>
                                </div>

                                {(isSupply ? supplyListing.whatsapp_number : demandListing.whatsapp_number) && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-green-600" />
                                        <span className="text-green-600 font-medium">
                                            WhatsApp: {isSupply ? supplyListing.whatsapp_number : demandListing.whatsapp_number}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setContactDialogOpen(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button onClick={handleContact} className="flex-1 bg-purple-600 hover:bg-purple-700">
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Start Chat
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Image Modal */}
            <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                <DialogContent className="max-w-4xl">
                    {selectedImage && (
                        <img
                            src={selectedImage}
                            alt="Material"
                            className="w-full h-auto rounded-lg"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
        </>
    );
};

export default ListingDetails; 