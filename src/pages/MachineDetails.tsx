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
    Video
} from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { apiClient } from '@/lib/apiClient';
import { WhatsAppContact } from "@/components/ui/whatsapp-contact";

interface SellMachine {
    id: string;
    machine_name: string;
    machine_type_id: string;
    payoff_nos?: number;
    payoff_size?: string;
    main_motor_capacity?: string;
    line_speed_max_size?: string;
    expected_daily_production?: string;
    manufacturing_location: string;
    video_url?: string;
    material_specification_url?: string;
    production_image_urls?: string[];
    other_options?: {
        option1?: string;
        option2?: string;
        option3?: string;
        option4?: string;
    };
    whatsapp_number?: string;
    is_urgent?: boolean;
    created_at: string;
    user_id: string;
    supplier: {
        id: string;
        name: string;
        email: string;
        user_type?: string;
    };
}

interface BuyMachine {
    id: string;
    machine_name: string;
    machine_type_id: string;
    payoff_nos?: number;
    payoff_size?: string;
    main_motor_capacity?: string;
    line_speed_max_size?: string;
    expected_daily_production?: string;
    manufacturing_location: string;
    notes?: string;
    whatsapp_number?: string;
    is_urgent?: boolean;
    created_at: string;
    user_id: string;
    buyer: {
        id: string;
        name: string;
        email: string;
        user_type?: string;
    };
}

interface MachineType {
    id: string;
    name: string;
}

const MachineDetails = () => {
    const { machineId, machineType } = useParams<{ machineId: string; machineType: 'sell' | 'buy' }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [machine, setMachine] = useState<SellMachine | BuyMachine | null>(null);
    const [machineTypes, setMachineTypes] = useState<MachineType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [contactDialogOpen, setContactDialogOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isBookmarked, setIsBookmarked] = useState(false);

    useEffect(() => {
        if (machineId && machineType) {
            fetchMachineDetails();
            fetchMachineTypes();
        }
    }, [machineId, machineType]);

    const fetchMachineDetails = async () => {
        try {
            setLoading(true);
            let data;

            if (machineType === 'sell') {
                data = await apiClient.getSellMachineById(machineId!);
            } else {
                data = await apiClient.getBuyMachineById(machineId!);
            }

            setMachine(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch machine details');
        } finally {
            setLoading(false);
        }
    };

    const fetchMachineTypes = async () => {
        try {
            const types = await apiClient.getMachineTypes();
            setMachineTypes(types);
        } catch (error) {
            console.error('Failed to fetch machine types:', error);
        }
    };

    const handleContact = async () => {
        if (!apiClient.isAuthenticated()) {
            navigate('/login');
            return;
        }

        if (machineType === 'sell') {
            const sellMachine = machine as SellMachine;
            try {
                const currentUser = await apiClient.getProfile();
                const result = await apiClient.contactSupplierWithChat({
                    listing_id: machineId!,
                    listing_type: 'machine_sell',
                    supplier_id: sellMachine.supplier.id,
                    requester_name: currentUser.user_metadata?.name || '',
                    requester_email: currentUser.email || '',
                    requester_phone: '',
                    message: `Hi, I'm interested in your machine: ${sellMachine.machine_name}`,
                });
                setContactDialogOpen(false);
                navigate(`/chat/${result.chat_room.id}`);
            } catch (err: any) {
                console.error('Failed to create chat:', err);
                alert('Failed to create chat: ' + err.message);
            }
        } else {
            const buyMachine = machine as BuyMachine;
            try {
                const currentUser = await apiClient.getProfile();
                const result = await apiClient.contactConsumerWithChat({
                    listing_id: machineId!,
                    listing_type: 'machine_buy',
                    buyer_id: buyMachine.buyer.id,
                    supplier_name: currentUser.user_metadata?.name || '',
                    supplier_email: currentUser.email || '',
                    supplier_phone: '',
                    message: "Hi, I'm interested in your machine request!",
                });
                setContactDialogOpen(false);
                navigate(`/chat/${result.chat_room.id}`);
            } catch (err: any) {
                console.error('Failed to create chat:', err);
                alert('Failed to create chat: ' + err.message);
            }
        }
    };

    const getMachineTypeName = (id: string) => {
        return machineTypes.find((type) => type.id === id)?.name || id;
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
                title: machine?.machine_name || 'Cable Hub Machine',
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
Machine Details - ${machine.machine_name}

${machineType === 'sell' ? 'For Sale' : 'Wanted'} Machine
Type: ${getMachineTypeName(machine.machine_type_id)}

${machine.payoff_nos ? `Payoff Numbers: ${machine.payoff_nos}` : ''}
${machine.payoff_size ? `Payoff Size: ${machine.payoff_size}` : ''}
${machine.main_motor_capacity ? `Main Motor Capacity: ${machine.main_motor_capacity}` : ''}
${machine.line_speed_max_size ? `Line Speed Max Size: ${machine.line_speed_max_size}` : ''}
${machine.expected_daily_production ? `Expected Daily Production: ${machine.expected_daily_production}` : ''}

Location: ${machine.manufacturing_location}
Posted: ${formatDate(machine.created_at)}
${machineType === 'buy' && (machine as BuyMachine).notes ? `Notes: ${(machine as BuyMachine).notes}` : ''}
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
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
            </div>
        );
    }

    if (error || !machine) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Machine Not Found</h2>
                    <p className="text-gray-600 mb-4">{error || 'The machine you are looking for does not exist.'}</p>
                    <Button onClick={() => navigate('/machines-marketplace')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Machines
                    </Button>
                </div>
            </div>
        );
    }

    const isSell = machineType === 'sell';
    const sellMachine = machine as SellMachine;
    const buyMachine = machine as BuyMachine;

    return (
        <>
            <Header 
                title={`${isSell ? 'Machine for Sale' : 'Machine Wanted'}`}
                onBack={() => navigate('/machines-marketplace')}
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
                            <Badge variant={isSell ? "default" : "secondary"} className="text-xs">
                                {isSell ? 'For Sale' : 'Wanted'}
                            </Badge>
                            {machine.is_urgent && (
                                <Badge variant="destructive" className="animate-pulse text-xs">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Urgent
                                </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                                {getMachineTypeName(machine.machine_type_id)}
                            </Badge>
                        </div>
                        <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-2 break-words">{machine.machine_name}</h1>
                        <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm md:text-lg">{machine.manufacturing_location}</span>
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
                                    // Handle images and video for sell machines
                                    if (isSell && sellMachine.production_image_urls && sellMachine.production_image_urls.length > 0) {
                                        const allMedia = [...sellMachine.production_image_urls];
                                        if (sellMachine.video_url) {
                                            allMedia.unshift(sellMachine.video_url); // Add video at the beginning
                                        }
                                        
                                        return (
                                            <div className="relative w-full h-full">
                                                <Carousel className="w-full h-full" opts={{ loop: true }}>
                                                    <CarouselContent>
                                                        {allMedia.map((mediaUrl, index) => (
                                                            <CarouselItem key={index}>
                                                                {mediaUrl === sellMachine.video_url ? (
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
                                <TabsTrigger value="additional" className="text-xs md:text-sm py-2">Additional Info</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-4 mt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Settings className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                            <span className="font-medium text-sm md:text-base">Machine Type:</span>
                                            <Badge variant="outline" className="text-xs">{getMachineTypeName(machine.machine_type_id)}</Badge>
                                        </div>

                                        {machine.payoff_nos && (
                                            <div className="flex items-center gap-2">
                                                <Package className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                <span className="font-medium text-sm md:text-base">Payoff Numbers:</span>
                                                <span className="font-semibold text-sm md:text-base">{machine.payoff_nos}</span>
                                            </div>
                                        )}

                                        {machine.payoff_size && (
                                            <div className="flex items-center gap-2">
                                                <Scale className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                <span className="font-medium text-sm md:text-base">Payoff Size:</span>
                                                <span className="font-semibold text-sm md:text-base">{machine.payoff_size}</span>
                                            </div>
                                        )}

                                        {machine.main_motor_capacity && (
                                            <div className="flex items-center gap-2">
                                                <Zap className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                <span className="font-medium text-sm md:text-base">Motor Capacity:</span>
                                                <span className="font-semibold text-sm md:text-base">{machine.main_motor_capacity}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                            <span className="font-medium text-sm md:text-base">Location:</span>
                                            <span className="text-sm md:text-base">{machine.manufacturing_location}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                            <span className="font-medium text-sm md:text-base">Posted:</span>
                                            <span className="text-sm md:text-base">{formatDate(machine.created_at)}</span>
                                        </div>

                                        {machine.line_speed_max_size && (
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                <span className="font-medium text-sm md:text-base">Line Speed:</span>
                                                <span className="font-semibold text-sm md:text-base">{machine.line_speed_max_size}</span>
                                            </div>
                                        )}

                                        {machine.expected_daily_production && (
                                            <div className="flex items-center gap-2">
                                                <Package className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                <span className="font-medium text-sm md:text-base">Daily Production:</span>
                                                <span className="font-semibold text-sm md:text-base">{machine.expected_daily_production}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="specifications" className="space-y-4 mt-4">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {machine.payoff_nos && (
                                            <div>
                                                <h4 className="font-semibold mb-2 text-sm md:text-base">Payoff Configuration</h4>
                                                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm md:text-base">
                                                    {machine.payoff_nos} payoffs
                                                    {machine.payoff_size && ` - Size: ${machine.payoff_size}`}
                                                </p>
                                            </div>
                                        )}
                                        
                                        {machine.main_motor_capacity && (
                                            <div>
                                                <h4 className="font-semibold mb-2 text-sm md:text-base">Motor Specifications</h4>
                                                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm md:text-base">
                                                    {machine.main_motor_capacity}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {machine.line_speed_max_size && (
                                        <div>
                                            <h4 className="font-semibold mb-2 text-sm md:text-base">Performance</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm md:text-base">
                                                    <span className="font-medium">Line Speed:</span> {machine.line_speed_max_size}
                                                </p>
                                                {machine.expected_daily_production && (
                                                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm md:text-base">
                                                        <span className="font-medium">Daily Production:</span> {machine.expected_daily_production}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {isSell && sellMachine.other_options && Object.values(sellMachine.other_options).some(option => option) && (
                                        <div>
                                            <h4 className="font-semibold mb-2 text-sm md:text-base">Additional Options</h4>
                                            <div className="space-y-2">
                                                {Object.entries(sellMachine.other_options).map(([key, value], index) => 
                                                    value && (
                                                        <p key={key} className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm md:text-base">
                                                            <span className="font-medium">Option {index + 1}:</span> {value}
                                                        </p>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="additional" className="space-y-4 mt-4">
                                <div className="space-y-4">
                                    {!isSell && buyMachine.notes && (
                                        <div>
                                            <h4 className="font-semibold mb-2 text-sm md:text-base">Additional Requirements</h4>
                                            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm md:text-base">
                                                {buyMachine.notes}
                                            </p>
                                        </div>
                                    )}

                                    {isSell && sellMachine.material_specification_url && (
                                        <div>
                                            <h4 className="font-semibold mb-2 text-sm md:text-base">Material Specification</h4>
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <a 
                                                    href={sellMachine.material_specification_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm md:text-base"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                    View Specification Document
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <h4 className="font-semibold mb-2 text-sm md:text-base">Listing Information</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <p className="text-sm text-gray-600">Posted on</p>
                                                <p className="font-medium text-sm md:text-base">{formatDate(machine.created_at)}</p>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <p className="text-sm text-gray-600">Location</p>
                                                <p className="font-medium text-sm md:text-base">{machine.manufacturing_location}</p>
                                            </div>
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
                                {isSell ? 'Seller Information' : 'Buyer Information'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6 space-y-4">
                            <div className="text-center">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Building className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
                                </div>
                                <h3 className="font-semibold text-base md:text-lg">
                                    {isSell ? sellMachine.supplier.name : buyMachine.buyer.name}
                                </h3>
                                {(isSell ? sellMachine.supplier.user_type : buyMachine.buyer.user_type) && (
                                    <Badge variant="outline" className="mt-1 text-xs">
                                        {isSell ? sellMachine.supplier.user_type : buyMachine.buyer.user_type}
                                    </Badge>
                                )}
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                    <span className="text-xs md:text-sm break-all">
                                        {isSell ? sellMachine.supplier.email : buyMachine.buyer.email}
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
                                    <Button onClick={() => setContactDialogOpen(true)} className="w-full bg-purple-600 hover:bg-purple-700 text-sm md:text-base">
                                        <MessageCircle className="h-4 w-4 mr-2" />
                                        Start Chat
                                    </Button>
                                    
                                    {machine.whatsapp_number && (
                                        <WhatsAppContact
                                            phoneNumber={machine.whatsapp_number}
                                            listingTitle={machine.machine_name}
                                            listingType={isSell ? 'machine_sell' : 'machine_buy'}
                                            variant="default"
                                            size="default"
                                            className="w-full bg-green-600 hover:bg-green-700 transition-colors text-sm md:text-base"
                                            defaultMessage={`Hello, I'm interested in your machine: ${machine.machine_name}. Please provide more details.`}
                                        >
                                            Contact via WhatsApp
                                        </WhatsAppContact>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="text-center text-sm text-gray-600">
                                        Login to contact {isSell ? 'seller' : 'buyer'}
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
                                    <p className="text-xs text-green-600">High for this machine type</p>
                                </div>
                                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <div>
                                    <p className="text-xs md:text-sm font-medium text-blue-800">Price Trend</p>
                                    <p className="text-xs text-blue-600">Stable this month</p>
                                </div>
                                <Minus className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                <div>
                                    <p className="text-xs md:text-sm font-medium text-purple-800">Seller Rating</p>
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
                            {isSell ? 'Contact Seller' : 'Contact Buyer'}
                        </DialogTitle>
                        <DialogDescription>
                            {isSell
                                ? 'Start a conversation with the seller about this machine.'
                                : 'Start a conversation with the buyer about their requirements.'
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-semibold mb-2">Machine Summary</h4>
                            <p className="text-sm text-gray-600">{machine.machine_name}</p>
                            <p className="text-sm text-gray-500 mt-1">
                                {getMachineTypeName(machine.machine_type_id)} - {machine.manufacturing_location}
                            </p>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-semibold mb-2 text-blue-800">
                                {isSell ? 'Seller Details' : 'Buyer Details'}
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <Building className="h-4 w-4 text-blue-600" />
                                    <span className="font-medium">
                                        {isSell ? sellMachine.supplier.name : buyMachine.buyer.name}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-blue-600" />
                                    <span className="text-gray-600">
                                        {isSell ? sellMachine.supplier.email : buyMachine.buyer.email}
                                    </span>
                                </div>

                                {machine.whatsapp_number && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-green-600" />
                                        <span className="text-green-600 font-medium">
                                            WhatsApp: {machine.whatsapp_number}
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
                                alt="Machine"
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

export default MachineDetails; 