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
    Image as ImageIcon,
    Settings,
    Zap,
    Video,
    IndianRupee
} from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { apiClient } from '@/lib/apiClient';
import { WhatsAppContact } from "@/components/ui/whatsapp-contact";
import Loader from '@/components/ui/loader';

interface UsedMachine {
    id: string;
    machine_name: string;
    size?: string;
    main_motor_hp?: string;
    year_of_make?: number;
    last_working_year?: number;
    location: string;
    price?: number;
    electrical_panel_ok?: boolean;
    image_urls?: string[];
    video_urls?: string[];
    whatsapp_number?: string;
    created_at: string;
    created_by?: string | null;
    supplier?: {
        id: string;
        name: string;
        email: string;
        user_type?: string;
    };
}

const UsedMachineDetails = () => {
    const { machineId } = useParams<{ machineId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [machine, setMachine] = useState<UsedMachine | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [contactDialogOpen, setContactDialogOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isBookmarked, setIsBookmarked] = useState(false);

    useEffect(() => {
        if (machineId) {
            fetchMachineDetails();
        }
    }, [machineId]);

    const fetchMachineDetails = async () => {
        try {
            setLoading(true);
            const data = await apiClient.getUsedMachineById(machineId!);
            setMachine(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch machine details');
        } finally {
            setLoading(false);
        }
    };

    const handleContact = async () => {
        if (!apiClient.isAuthenticated()) {
            navigate('/login');
            return;
        }

        if (!machine?.supplier) {
            console.error('No supplier information available');
            return;
        }

        try {
            const currentUser = await apiClient.getProfile();
            const result = await apiClient.contactSupplierWithChat({
                listing_id: machineId!,
                listing_type: 'supply',
                supplier_id: machine.supplier.id,
                requester_name: currentUser.user_metadata?.name || '',
                requester_email: currentUser.email || '',
                requester_phone: '',
                message: `Hi, I'm interested in your used machine: ${machine.machine_name}`,
            });
            setContactDialogOpen(false);
            navigate(`/chat/${result.chat_room.id}`);
        } catch (err: any) {
            console.error('Failed to create chat:', err);
            alert('Failed to create chat: ' + err.message);
        }
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

    const shareListing = () => {
        const url = window.location.origin + location.pathname;
        if (navigator.share) {
            navigator.share({
                title: machine?.machine_name || 'Cable Hub Used Machine',
                url: url
            });
        } else {
            navigator.clipboard.writeText(url);
            // You could add a toast notification here
        }
    };

    const downloadDetails = () => {
        if (!machine) return;

        const details = `
Used Machine Details - ${machine.machine_name}

${machine.size ? `Size: ${machine.size}` : ''}
${machine.main_motor_hp ? `Main Motor HP: ${machine.main_motor_hp}` : ''}
${machine.year_of_make ? `Year of Make: ${machine.year_of_make}` : ''}
${machine.last_working_year ? `Last Working Year: ${machine.last_working_year}` : ''}
${machine.price ? `Price: ${formatPrice(machine.price)}` : ''}
Electrical Panel: ${machine.electrical_panel_ok ? 'OK' : 'Issues'}

Location: ${machine.location}
Posted: ${formatDate(machine.created_at)}
`;

        const blob = new Blob([details], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${machine.machine_name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_details.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <Loader />
        );
    }

    if (error || !machine) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Machine Not Found</h2>
                    <p className="text-gray-600 mb-4">{error || 'The machine you are looking for does not exist.'}</p>
                    <Button onClick={() => navigate('/used-dead-stock-listings')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Listings
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Header
                title="Used Machine Details"
                onBack={() => navigate('/used-dead-stock-listings')}
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
                {/* Machine Header */}
                <div className="mb-4 md:mb-6">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
                                <Badge variant="default" className="text-xs">
                                    Used Machine
                                </Badge>
                                {machine.electrical_panel_ok !== undefined && (
                                    <Badge
                                        variant={machine.electrical_panel_ok ? "default" : "destructive"}
                                        className="text-xs"
                                    >
                                        {machine.electrical_panel_ok ? 'Panel OK' : 'Panel Issues'}
                                    </Badge>
                                )}
                            </div>
                            <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-2 break-words">{machine.machine_name}</h1>
                            <div className="flex items-center gap-4 text-gray-600">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    <span className="text-sm md:text-lg">{machine.location}</span>
                                </div>
                                
                            </div>
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
                        {/* Images/Video Section */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="aspect-video max-w-xs mx-auto bg-gray-100 rounded-lg overflow-hidden">
                                    {(() => {
                                        // Handle images and video for used machines
                                        if (machine.image_urls && machine.image_urls.length > 0) {
                                            const allMedia = [...machine.image_urls];
                                            if (machine.video_urls && machine.video_urls.length > 0) {
                                                allMedia.unshift(...machine.video_urls); // Add videos at the beginning
                                            }

                                            return (
                                                <div className="relative w-full h-full">
                                                    <Carousel className="w-full h-full" opts={{ loop: true }}>
                                                        <CarouselContent>
                                                            {allMedia.map((mediaUrl, index) => (
                                                                <CarouselItem key={index}>
                                                                    {machine.video_urls && machine.video_urls.includes(mediaUrl) ? (
                                                                        <video
                                                                            src={mediaUrl}
                                                                            controls
                                                                            className="w-full h-full aspect-video cursor-pointer"
                                                                            onClick={() => setSelectedImage(mediaUrl)}
                                                                        />
                                                                    ) : (
                                                                        <img
                                                                            src={mediaUrl}
                                                                            alt={`${machine.machine_name} - Image ${index + 1}`}
                                                                            className="w-full h-full aspect-video cursor-pointer hover:scale-105 transition-transform duration-300"
                                                                            onClick={() => setSelectedImage(mediaUrl)}
                                                                        />
                                                                    )}
                                                                </CarouselItem>
                                                            ))}
                                                        </CarouselContent>
                                                        {allMedia.length > 1 && (
                                                            <>
                                                                <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8" />
                                                                <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8" />
                                                            </>
                                                        )}
                                                    </Carousel>
                                                    {/* Media counter */}
                                                    {allMedia.length > 1 && (
                                                        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                                                            {allMedia.length} media
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 cursor-pointer hover:scale-105 transition-transform duration-300">
                                                    <Package className="h-16 w-16 text-gray-400 mb-2" />
                                                    <p className="text-sm text-gray-500 text-center px-4">
                                                        {machine.machine_name}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">No media available</p>
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
                            <CardTitle>Machine Details</CardTitle>
                        </CardHeader>
                        <CardContent className="p-2">
                            <Tabs defaultValue="overview" className="w-full">
                                <TabsList className="grid w-full grid-cols-3 h-auto p-1">
                                    <TabsTrigger value="overview" className="text-xs md:text-sm py-2">Overview</TabsTrigger>
                                    <TabsTrigger value="specifications" className="text-xs md:text-sm py-2">Specifications</TabsTrigger>
                                    <TabsTrigger value="condition" className="text-xs md:text-sm py-2">Condition</TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="space-y-4 mt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            {machine.size && (
                                                <div className="flex items-center gap-2">
                                                    <Scale className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                    <span className="font-medium text-sm md:text-base">Size:</span>
                                                    <span className="font-semibold text-sm md:text-base">{machine.size}</span>
                                                </div>
                                            )}

                                            {machine.main_motor_hp && (
                                                <div className="flex items-center gap-2">
                                                    <Zap className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                    <span className="font-medium text-sm md:text-base">Motor HP:</span>
                                                    <span className="font-semibold text-sm md:text-base">{machine.main_motor_hp}</span>
                                                </div>
                                            )}

                                            {machine.year_of_make && (
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                    <span className="font-medium text-sm md:text-base">Year of Make:</span>
                                                    <span className="font-semibold text-sm md:text-base">{machine.year_of_make}</span>
                                                </div>
                                            )}

                                            {machine.last_working_year && (
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                    <span className="font-medium text-sm md:text-base">Last Working Year:</span>
                                                    <span className="font-semibold text-sm md:text-base">{machine.last_working_year}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                <span className="font-medium text-sm md:text-base">Location:</span>
                                                <span className="text-sm md:text-base">{machine.location}</span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                <span className="font-medium text-sm md:text-base">Posted:</span>
                                                <span className="text-sm md:text-base">{formatDate(machine.created_at)}</span>
                                            </div>

                                            {machine.price && (
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                    <span className="font-medium text-sm md:text-base">Price:</span>
                                                    <span className="font-bold text-lg text-green-700">{formatPrice(machine.price)}</span>
                                                </div>
                                            )}

                                            {machine.electrical_panel_ok !== undefined && (
                                                <div className="flex items-center gap-2">
                                                    <Settings className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                    <span className="font-medium text-sm md:text-base">Electrical Panel:</span>
                                                    <Badge variant={machine.electrical_panel_ok ? "default" : "destructive"} className="text-xs">
                                                        {machine.electrical_panel_ok ? 'Working' : 'Issues'}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="specifications" className="space-y-4 mt-4">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {machine.size && (
                                                <div>
                                                    <h4 className="font-semibold mb-2 text-sm md:text-base">Machine Size</h4>
                                                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm md:text-base">
                                                        {machine.size}
                                                    </p>
                                                </div>
                                            )}

                                            {machine.main_motor_hp && (
                                                <div>
                                                    <h4 className="font-semibold mb-2 text-sm md:text-base">Motor Power</h4>
                                                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm md:text-base">
                                                        {machine.main_motor_hp} HP
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {(machine.year_of_make || machine.last_working_year) && (
                                            <div>
                                                <h4 className="font-semibold mb-2 text-sm md:text-base">Timeline</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {machine.year_of_make && (
                                                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm md:text-base">
                                                            <span className="font-medium">Manufactured:</span> {machine.year_of_make}
                                                        </p>
                                                    )}
                                                    {machine.last_working_year && (
                                                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm md:text-base">
                                                            <span className="font-medium">Last Working:</span> {machine.last_working_year}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="condition" className="space-y-4 mt-4">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-semibold mb-2 text-sm md:text-base">Machine Condition</h4>
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium text-sm md:text-base">Electrical Panel</span>
                                                        <Badge variant={machine.electrical_panel_ok ? "default" : "destructive"} className="text-xs">
                                                            {machine.electrical_panel_ok ? 'Working' : 'Needs Repair'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        {machine.electrical_panel_ok
                                                            ? 'Electrical panel is in good working condition'
                                                            : 'Electrical panel may require repairs or maintenance'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold mb-2 text-sm md:text-base">Age Information</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {machine.year_of_make && (
                                                    <div className="bg-gray-50 p-3 rounded-lg">
                                                        <p className="text-sm text-gray-600">Manufacturing Year</p>
                                                        <p className="font-medium text-sm md:text-base">{machine.year_of_make}</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {new Date().getFullYear() - machine.year_of_make} years old
                                                        </p>
                                                    </div>
                                                )}
                                                {machine.last_working_year && (
                                                    <div className="bg-gray-50 p-3 rounded-lg">
                                                        <p className="text-sm text-gray-600">Last Working Year</p>
                                                        <p className="font-medium text-sm md:text-base">{machine.last_working_year}</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {new Date().getFullYear() - machine.last_working_year} years since last use
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
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
                                    Seller Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 md:p-6 space-y-4">
                                <div className="text-center">
                                    <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Building className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
                                    </div>
                                    <h3 className="font-semibold text-base md:text-lg">
                                        {machine.supplier?.name || 'N/A'}
                                    </h3>
                                    {machine.supplier?.user_type && (
                                        <Badge variant="outline" className="mt-1 text-xs">
                                            {machine.supplier.user_type}
                                        </Badge>
                                    )}
                                </div>

                                <Separator />

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                        <span className="text-xs md:text-sm break-all">
                                            {machine.supplier?.email || 'N/A'}
                                        </span>
                                    </div>

                                    {machine.whatsapp_number && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-green-500 flex-shrink-0" />
                                            <span className="text-xs md:text-sm text-green-600 font-medium">
                                                WhatsApp: {machine.whatsapp_number}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                {apiClient.isAuthenticated() ? (
                                    <div className="space-y-3">
                                       

                                        {machine.whatsapp_number && (
                                            <WhatsAppContact
                                                phoneNumber={machine.whatsapp_number}
                                                listingTitle={machine.machine_name}
                                                listingType="supply"
                                                variant="default"
                                                size="default"
                                                className="w-full bg-green-600 hover:bg-green-700 transition-colors text-sm md:text-base"
                                                defaultMessage={`Hello, I'm interested in your used machine: ${machine.machine_name}. Please provide more details.`}
                                            >
                                                Contact via WhatsApp
                                            </WhatsAppContact>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="text-center text-sm text-gray-600">
                                            Login to contact seller
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

                </div>



                {/* Image/Video Modal */}
                <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                    <DialogContent className="max-w-4xl">
                        {selectedImage && (
                            selectedImage.includes('.mp4') || selectedImage.includes('video') ? (
                                <video
                                    src={selectedImage}
                                    controls
                                    className="w-full h-auto rounded-lg"
                                />
                            ) : (
                                <img
                                    src={selectedImage}
                                    alt="Used Machine"
                                    className="w-full h-auto rounded-lg"
                                />
                            )
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
};

export default UsedMachineDetails; 