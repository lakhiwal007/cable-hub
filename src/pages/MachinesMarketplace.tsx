import React, { useState, useEffect, useRef } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/apiClient';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Video, Image, Package, DollarSign, MapPin, Settings, Zap, Search, Filter, Eye, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import Loader from '@/components/ui/loader';
import { WhatsAppContact } from '@/components/ui/whatsapp-contact';

const MachinesMarketplace: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [machineTypes, setMachineTypes] = useState<any[]>([]);
  const [sellMachines, setSellMachines] = useState<any[]>([]);
  const [buyMachines, setBuyMachines] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('browse');
  const [browseTab, setBrowseTab] = useState<'sell' | 'buy'>('sell');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Sell Machine Form State
  const [sellForm, setSellForm] = useState({
    machineName: '',
    machineTypeId: '',
    payoffNos: '',
    payoffSize: '',
    mainMotorCapacity: '',
    lineSpeedMaxSize: '',
    expectedDailyProduction: '',
    manufacturingLocation: '',
    whatsappNumber: '',
    isUrgent: false,
    videoFile: null as File | null,
    materialSpecFile: null as File | null,
    productionImages: [] as File[],
    otherOptions: {
      option1: '',
      option2: '',
      option3: '',
      option4: ''
    }
  });

  // Buy Machine Form State
  const [buyForm, setBuyForm] = useState({
    machineName: '',
    machineTypeId: '',
    payoffNos: '',
    payoffSize: '',
    mainMotorCapacity: '',
    lineSpeedMaxSize: '',
    expectedDailyProduction: '',
    manufacturingLocation: '',
    whatsappNumber: '',
    notes: '',
    isUrgent: false,
    videoFile: null as File | null,
    productionImages: [] as File[],
  });

  const [showVideoModal, setShowVideoModal] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const openVideoModal = async () => {
    setShowVideoModal(true);
    try {
      // Try with preferred facingMode first
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: { ideal: facingMode } } 
      });
      setMediaStream(stream);
    } catch (err) {
      // Fallback to any available camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setMediaStream(stream);
      } catch (fallbackErr) {
        toast({ title: 'Error', description: 'Could not access camera. Please check camera permissions.' });
        setShowVideoModal(false);
      }
    }
  };
  const closeVideoModal = () => {
    setShowVideoModal(false);
    setRecording(false);
    setRecordedChunks([]);
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    if (liveVideoRef.current) {
      liveVideoRef.current.srcObject = null;
    }
  };
  const startRecording = () => {
    if (!mediaStream) return;
    const recorder = new MediaRecorder(mediaStream, { mimeType: 'video/webm' });
    setMediaRecorder(recorder);
    setRecordedChunks([]);
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) setRecordedChunks((prev) => [...prev, e.data]);
    };
    recorder.onstop = () => {
      setRecording(false);
    };
    recorder.start();
    setRecording(true);
  };
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    setRecording(false);
    if (liveVideoRef.current) {
      liveVideoRef.current.srcObject = null;
    }
  };
  const useRecordedVideo = () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const file = new File([blob], `recorded-${Date.now()}.webm`, { type: 'video/webm' });
    setSellForm(prev => ({ ...prev, videoFile: file }));
    closeVideoModal();
  };
  useEffect(() => {
    if (showVideoModal && liveVideoRef.current && mediaStream) {
      liveVideoRef.current.srcObject = mediaStream;
    }
  }, [showVideoModal, mediaStream, recording]);

  useEffect(() => {
    fetchMachineTypes();
    fetchMachines();
  }, []);

  const fetchMachineTypes = async () => {
    try {
      const types = await apiClient.getMachineTypes();
      setMachineTypes(types || []);
    } catch (error) {
      console.error('Failed to fetch machine types:', error);
    }
  };

  // Categories for filtering
  const categories = [
    { value: "all", label: "All Categories" },
    { value: "extruder", label: "Extruder" },
    { value: "wire_drawing", label: "Wire Drawing" },
    { value: "cable_making", label: "Cable Making" },
    { value: "testing", label: "Testing Equipment" },
    { value: "packaging", label: "Packaging" }
  ];

  const fetchMachines = async () => {
    setListingsLoading(true);
    setError(null);
    try {
      const [sellData, buyData] = await Promise.all([
        apiClient.getSellMachines().catch(() => []),
        apiClient.getBuyMachines().catch(() => [])
      ]);
      setSellMachines(sellData || []);
      setBuyMachines(buyData || []);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch machines');
    } finally {
      setListingsLoading(false);
    }
  };

  const handleSellSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Upload files
      let videoUrl = '';
      let materialSpecUrl = '';
      let productionImageUrls: string[] = [];

      if (sellForm.videoFile) {
        videoUrl = await apiClient.uploadFileToStorage(sellForm.videoFile, 'machines/videos');
      }
      if (sellForm.materialSpecFile) {
        materialSpecUrl = await apiClient.uploadFileToStorage(sellForm.materialSpecFile, 'machines/specs');
      }
      if (sellForm.productionImages.length > 0) {
        productionImageUrls = await Promise.all(
          sellForm.productionImages.map(file => apiClient.uploadFileToStorage(file, 'machines/images'))
        );
      }

      // Get current user ID
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user?.id) throw new Error('Could not get user ID');
      const userId = userData.user.id;

      await apiClient.createSellMachine({
        user_id: userId,
        machine_name: sellForm.machineName,
        machine_type_id: sellForm.machineTypeId,
        payoff_nos: sellForm.payoffNos ? parseInt(sellForm.payoffNos) : null,
        payoff_size: sellForm.payoffSize,
        main_motor_capacity: sellForm.mainMotorCapacity,
        line_speed_max_size: sellForm.lineSpeedMaxSize,
        video_url: videoUrl,
        expected_daily_production: sellForm.expectedDailyProduction,
        manufacturing_location: sellForm.manufacturingLocation,
        material_specification_url: materialSpecUrl,
        production_image_urls: productionImageUrls,
        other_options: sellForm.otherOptions,
        whatsapp_number: sellForm.whatsappNumber,
        is_urgent: sellForm.isUrgent
      });

      toast({ title: 'Success', description: 'Machine listing created successfully!' });
      resetSellForm();
      fetchMachines();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleBuySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Get current user ID
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user?.id) throw new Error('Could not get user ID');
      const userId = userData.user.id;

      await apiClient.createBuyMachine({
        user_id: userId,
        machine_name: buyForm.machineName,
        machine_type_id: buyForm.machineTypeId,
        payoff_nos: buyForm.payoffNos ? parseInt(buyForm.payoffNos) : null,
        payoff_size: buyForm.payoffSize,
        main_motor_capacity: buyForm.mainMotorCapacity,
        line_speed_max_size: buyForm.lineSpeedMaxSize,
        expected_daily_production: buyForm.expectedDailyProduction,
        manufacturing_location: buyForm.manufacturingLocation,
        notes: buyForm.notes,
        whatsapp_number: buyForm.whatsappNumber,
        is_urgent: buyForm.isUrgent
      });

      toast({ title: 'Success', description: 'Buy request created successfully!' });
      resetBuyForm();
      fetchMachines();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const resetSellForm = () => {
    setSellForm({
      machineName: '',
      machineTypeId: '',
      payoffNos: '',
      payoffSize: '',
      mainMotorCapacity: '',
      lineSpeedMaxSize: '',
      expectedDailyProduction: '',
      manufacturingLocation: '',
      whatsappNumber: '',
      isUrgent: false,
      videoFile: null,
      materialSpecFile: null,
      productionImages: [],
      otherOptions: { option1: '', option2: '', option3: '', option4: '' }
    });
  };

  const resetBuyForm = () => {
    setBuyForm({
      machineName: '',
      machineTypeId: '',
      payoffNos: '',
      payoffSize: '',
      mainMotorCapacity: '',
      lineSpeedMaxSize: '',
      expectedDailyProduction: '',
      manufacturingLocation: '',
      whatsappNumber: '',
      notes: '',
      isUrgent: false,
      videoFile: null,
      productionImages: [],
    });
  };

  // Filter listings based on search and category
  const filteredSellMachines = sellMachines.filter((machine) => {
    const matchesSearch = machine.machine_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.manufacturing_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.machine_type_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || machine.machine_type_id === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredBuyMachines = buyMachines.filter((machine) => {
    const matchesSearch = machine.machine_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.manufacturing_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.machine_type_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || machine.machine_type_id === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getMachineTypeName = (id: string) => {
    return machineTypes.find((type) => type.id === id)?.name || id;
  };

  const handleFileChange = (field: string, files: FileList | null, formType?: 'sell' | 'buy') => {
    if (!files) return;
    if (formType === 'buy') {
      if (field === 'videoFile') {
        setBuyForm(prev => ({ ...prev, videoFile: files[0] }));
      } else if (field === 'productionImages') {
        setBuyForm(prev => ({ ...prev, productionImages: Array.from(files) }));
      }
    } else {
      if (field === 'videoFile') {
        setSellForm(prev => ({ ...prev, videoFile: files[0] }));
      } else if (field === 'materialSpecFile') {
        setSellForm(prev => ({ ...prev, materialSpecFile: files[0] }));
      } else if (field === 'productionImages') {
        setSellForm(prev => ({ ...prev, productionImages: Array.from(files) }));
      }
    }
  };

  const switchCamera = async () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    try {
      // Try with new facingMode
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: { ideal: newMode } } 
      });
      setMediaStream(stream);
    } catch (err) {
      // Fallback to any available camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setMediaStream(stream);
      } catch (fallbackErr) {
        toast({ title: 'Error', description: 'Could not switch camera. Using current camera.' });
      }
    }
  };

  return (
    <>
      <Header title="Machines Marketplace" onBack={() => navigate('/')} logoSrc='cableCartLogo.png' />
      <div className="max-w-7xl mx-auto py-4 sm:py-8 px-1 sm:px-4 lg:px-8">
        <div className="space-y-4 sm:space-y-8">
          <div className="text-center">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Machines Marketplace</h2>
                <p className="text-sm sm:text-base text-gray-600">Buy and sell industrial machines and equipment</p>
              </div>
            </div>
          </div>

          {listingsLoading ? (
            <Loader className="py-12" />
          ) : error ? (
            <div className="text-red-500 text-center py-8">
              <p>Error: {error}</p>
              <button onClick={fetchMachines} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Try Again
              </button>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 gap-1 sm:gap-2">
                <TabsTrigger value="browse" className="text-xs sm:text-sm">Browse</TabsTrigger>
                <TabsTrigger value="sell" className="text-xs sm:text-sm">Sell Machine</TabsTrigger>
                <TabsTrigger value="buy" className="text-xs sm:text-sm">Buy Machine</TabsTrigger>
              </TabsList>

              <TabsContent value="browse" className="space-y-4 sm:space-y-6">
                {/* Search and Filter */}
                <Card>
                  <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search machines, locations, or types..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 h-10 sm:h-11 text-sm sm:text-base"
                        />
                      </div>
                      <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="w-full sm:w-48 h-10 sm:h-11 text-sm sm:text-base">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Sub-tabs for Sell/Buy */}
                <Tabs value={browseTab} onValueChange={v => setBrowseTab(v as 'sell' | 'buy')} className="w-full">
                  <TabsList className="w-full grid grid-cols-2 mb-4 gap-1 sm:gap-2">
                    <TabsTrigger value="sell" className="text-xs sm:text-sm">Machines for Sale</TabsTrigger>
                    <TabsTrigger value="buy" className="text-xs sm:text-sm">Buy Requests</TabsTrigger>
                  </TabsList>
                  <TabsContent value="sell">
                    <div className="space-y-4">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Machines for Sale</h3>
                      {filteredSellMachines.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
                          No machines for sale found. Try adjusting your search or filters.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                          {filteredSellMachines.map((machine) => {
                            const images = machine.production_image_urls || [];
                            const video = machine.video_url || "";
                            const hasMedia = images.length > 0 || video.length > 0;
                            return (
                              <div key={machine.id} className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-gray-200 h-full bg-white rounded-lg overflow-hidden">
                                {/* Product Image Section */}
                                <div className="relative overflow-hidden rounded-t-lg bg-gray-100 h-40 sm:h-32 lg:h-48">
                                  {hasMedia ? (
                                    <Carousel className="w-full h-full" opts={{ loop: true }}>
                                      <CarouselContent>
                                        {images.map((url: string, idx: number) => (
                                          <CarouselItem key={url + idx} className="flex items-center justify-center w-full h-full">
                                            <img
                                              src={url}
                                              alt={machine.machine_name}
                                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                                            />
                                          </CarouselItem>
                                        ))}
                                        {video && (
                                          <CarouselItem key={video} className="flex items-center justify-center w-full h-full">
                                            <video
                                              src={video}
                                              controls
                                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                                            />
                                          </CarouselItem>
                                        )}
                                      </CarouselContent>
                                      {(images.length > 1 || video) && (
                                        <>
                                          <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" />
                                          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </>
                                      )}
                                    </Carousel>
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 cursor-pointer">
                                      <Package className="h-16 w-16 text-gray-400" />
                                    </div>
                                  )}

                                  {/* Badges Overlay */}
                                  <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex items-center justify-between gap-1 sm:gap-2">
                                    {machine.is_urgent && (
                                      <Badge variant="destructive" className="animate-pulse shadow-lg text-xs px-2 py-1">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        Urgent
                                      </Badge>
                                    )}
                                  </div>

                                  {/* Quick Actions Overlay */}
                                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <Button size="sm" variant="secondary" className="rounded-full shadow-lg h-8 w-8 sm:h-9 sm:w-9">
                                      <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Product Info Section */}
                                <div className="p-3 sm:p-4">
                                  {/* Product Title */}
                                  <h2 className="text-sm sm:text-md lg:text-lg font-semibold mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors cursor-pointer">
                                    {machine.machine_name}
                                  </h2>

                                  {/* Location */}
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 text-xs sm:text-sm text-gray-600 gap-1 sm:gap-0">
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                                      <span className="truncate">{machine.manufacturing_location}</span>
                                    </div>
                                  </div>

                                  {/* Machine Type */}
                                  <div className="mb-3">
                                    <Badge variant="outline" className="text-xs">
                                      {getMachineTypeName(machine.machine_type_id)}
                                    </Badge>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      className="w-full h-10 sm:h-9 text-sm"
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </Button>
                                    {machine.whatsapp_number ? (
                                      <WhatsAppContact
                                        phoneNumber={machine.whatsapp_number}
                                        listingTitle={machine.machine_name}
                                        listingType="supply"
                                        variant="default"
                                        size="default"
                                        className="w-full bg-green-600 hover:bg-green-700 transition-colors h-10 sm:h-9 text-sm"
                                      >
                                        WhatsApp
                                      </WhatsAppContact>
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
                                    Posted {new Date(machine.created_at || Date.now()).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="buy">
                    <div className="space-y-4">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Buy Requests</h3>
                      {filteredBuyMachines.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
                          No buy requests found. Try adjusting your search or filters.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                          {filteredBuyMachines.map((machine) => {
                            const images = machine.production_image_urls || [];
                            const video = machine.video_url || "";
                            const hasMedia = images.length > 0 || video.length > 0;
                            return (
                              <div key={machine.id} className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-gray-200 h-full bg-white rounded-lg overflow-hidden">
                                {/* Product Image Section */}
                                <div className="relative overflow-hidden rounded-t-lg bg-gray-100 h-40 sm:h-32 lg:h-48">
                                  {hasMedia ? (
                                    <Carousel className="w-full h-full" opts={{ loop: true }}>
                                      <CarouselContent>
                                        {images.map((url: string, idx: number) => (
                                          <CarouselItem key={url + idx} className="flex items-center justify-center w-full h-full">
                                            <img
                                              src={url}
                                              alt={machine.machine_name}
                                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                                            />
                                          </CarouselItem>
                                        ))}
                                        {video && (
                                          <CarouselItem key={video} className="flex items-center justify-center w-full h-full">
                                            <video
                                              src={video}
                                              controls
                                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                                            />
                                          </CarouselItem>
                                        )}
                                      </CarouselContent>
                                      {(images.length > 1 || video) && (
                                        <>
                                          <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" />
                                          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </>
                                      )}
                                    </Carousel>
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 cursor-pointer">
                                      <Package className="h-16 w-16 text-gray-400" />
                                    </div>
                                  )}

                                  {/* Badges Overlay */}
                                  <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex items-center justify-between gap-1 sm:gap-2">
                                    {machine.is_urgent && (
                                      <Badge variant="destructive" className="animate-pulse shadow-lg text-xs px-2 py-1">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        Urgent
                                      </Badge>
                                    )}
                                  </div>

                                  {/* Quick Actions Overlay */}
                                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <Button size="sm" variant="secondary" className="rounded-full shadow-lg h-8 w-8 sm:h-9 sm:w-9">
                                      <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Product Info Section */}
                                <div className="p-3 sm:p-4">
                                  {/* Product Title */}
                                  <h2 className="text-sm sm:text-md lg:text-lg font-semibold mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer">
                                    {machine.machine_name}
                                  </h2>

                                  {/* Location */}
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 text-xs sm:text-sm text-gray-600 gap-1 sm:gap-0">
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                                      <span className="truncate">{machine.manufacturing_location}</span>
                                    </div>
                                  </div>

                                  {/* Machine Type */}
                                  <div className="mb-3">
                                    <Badge variant="outline" className="text-xs">
                                      {getMachineTypeName(machine.machine_type_id)}
                                    </Badge>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      className="w-full h-10 sm:h-9 text-sm"
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </Button>
                                    {machine.whatsapp_number ? (
                                      <WhatsAppContact
                                        phoneNumber={machine.whatsapp_number}
                                        listingTitle={machine.machine_name}
                                        listingType="demand"
                                        variant="default"
                                        size="default"
                                        className="w-full bg-green-600 hover:bg-green-700 transition-colors h-10 sm:h-9 text-sm"
                                      >
                                        WhatsApp
                                      </WhatsAppContact>
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
                                    Posted {new Date(machine.created_at || Date.now()).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="sell" className="space-y-4 sm:space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-green-600" />
                      Sell Your Machine
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSellSubmit} className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium mb-2">Machine Name</label>
                        <Input
                          value={sellForm.machineName}
                          onChange={e => setSellForm(prev => ({ ...prev, machineName: e.target.value }))}
                          placeholder="Enter machine name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Machine Type</label>
                        <Select value={sellForm.machineTypeId} onValueChange={value => setSellForm(prev => ({ ...prev, machineTypeId: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose machine type" />
                          </SelectTrigger>
                          <SelectContent>
                            {machineTypes.map(type => (
                              <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Payoff Nos</label>
                          <Input
                            type="number"
                            value={sellForm.payoffNos}
                            onChange={e => setSellForm(prev => ({ ...prev, payoffNos: e.target.value }))}
                            placeholder="Number of payoffs"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Payoff Size</label>
                          <Input
                            value={sellForm.payoffSize}
                            onChange={e => setSellForm(prev => ({ ...prev, payoffSize: e.target.value }))}
                            placeholder="Size specification"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Main Motor Capacity</label>
                          <Input
                            value={sellForm.mainMotorCapacity}
                            onChange={e => setSellForm(prev => ({ ...prev, mainMotorCapacity: e.target.value }))}
                            placeholder="HP/KW"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Line Speed (Max Size)</label>
                          <Input
                            value={sellForm.lineSpeedMaxSize}
                            onChange={e => setSellForm(prev => ({ ...prev, lineSpeedMaxSize: e.target.value }))}
                            placeholder="Meters per minute"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Expected Daily Production</label>
                        <Input
                          value={sellForm.expectedDailyProduction}
                          onChange={e => setSellForm(prev => ({ ...prev, expectedDailyProduction: e.target.value }))}
                          placeholder="Production capacity"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Manufacturing Location</label>
                        <Input
                          value={sellForm.manufacturingLocation}
                          onChange={e => setSellForm(prev => ({ ...prev, manufacturingLocation: e.target.value }))}
                          placeholder="City, State"
                          required
                        />
                      </div>



                      <div>
                        <label className="block text-sm font-medium mb-2">WhatsApp Number</label>
                        <Input
                          value={sellForm.whatsappNumber}
                          onChange={e => setSellForm(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                          placeholder="+91 98765 43210"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Machine Video</label>
                        <div className="flex flex-col gap-1 items-start">
                          <div className="flex items-start gap-2">
                            <input
                              type="file"
                              accept="video/*"
                              style={{ display: 'none' }}
                              id="video-upload"
                              onChange={e => handleFileChange('videoFile', e.target.files)}
                            />
                            <button
                              type="button"
                              className="px-3 py-2 rounded bg-gray-200 text-gray-800 flex items-center gap-1"
                              onClick={() => document.getElementById('video-upload').click()}
                            >
                              <span>Upload Video</span>
                            </button>
                            <button type="button" className="px-3 py-2 rounded bg-blue-600 text-white" onClick={openVideoModal}>Record Video</button>
                            {sellForm.videoFile && (
                              <>
                                <span className="text-xs text-gray-600">{sellForm.videoFile.name}</span>
                                <button
                                  type="button"
                                  className="ml-2 text-red-500"
                                  onClick={() => setSellForm(prev => ({ ...prev, videoFile: null }))}
                                  title="Remove video"
                                >
                                  &#128465;
                                </button>
                              </>
                            )}
                          </div>
                          {sellForm.videoFile && (
                            <video controls className="mb-2 h-32 rounded border object-contain">
                              <source src={URL.createObjectURL(sellForm.videoFile)} type={sellForm.videoFile.type} />
                              Your browser does not support the video tag.
                            </video>
                          )}
                          {/* Modal for recording */}
                          {showVideoModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                                <button className="absolute top-2 right-2 text-gray-500" onClick={closeVideoModal}>&times;</button>
                                <h3 className="text-lg font-semibold mb-2">Record Video</h3>
                                <button className="mb-2 px-3 py-1 rounded bg-gray-300 text-gray-800" onClick={switchCamera} type="button">
                                  Switch Camera
                                </button>
                                {!recording && recordedChunks.length === 0 && (
                                  <video ref={liveVideoRef} autoPlay playsInline className="w-full h-48 bg-black rounded mb-2" />
                                )}
                                {recording && (
                                  <video ref={liveVideoRef} autoPlay playsInline className="w-full h-48 bg-black rounded mb-2 border-2 border-red-500" />
                                )}
                                {!recording && recordedChunks.length > 0 && (
                                  <video
                                    ref={videoPreviewRef}
                                    controls
                                    className="w-full h-48 bg-black rounded mb-2"
                                    src={URL.createObjectURL(new Blob(recordedChunks, { type: 'video/webm' }))}
                                  />
                                )}
                                <div className="flex gap-2 justify-center">
                                  {!recording && recordedChunks.length === 0 && (
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={startRecording}>Start Recording</button>
                                  )}
                                  {recording && (
                                    <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={stopRecording}>Stop Recording</button>
                                  )}
                                  {!recording && recordedChunks.length > 0 && (
                                    <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={useRecordedVideo}>Use This Video</button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Material Specification/Data Sheet</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={e => handleFileChange('materialSpecFile', e.target.files)}
                            className="hidden"
                            id="spec-upload"
                          />
                          <label htmlFor="spec-upload" className="cursor-pointer text-blue-600 hover:text-blue-800">
                            Upload File
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Production Images</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          <Image className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={e => handleFileChange('productionImages', e.target.files)}
                            className="hidden"
                            id="images-upload"
                          />
                          <label htmlFor="images-upload" className="cursor-pointer text-blue-600 hover:text-blue-800">
                            Upload Images
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Preview Images & Video</label>
                        <div className="w-full">
                          {sellForm.productionImages.length > 0 || sellForm.videoFile ? (
                            <Carousel className="w-full h-48 mb-4">
                              <CarouselContent>
                                {sellForm.productionImages.map((file, idx) => (
                                  <CarouselItem key={file?.name + idx} className="flex items-center justify-center w-full h-full">
                                    <img
                                      src={file ? URL.createObjectURL(file) : '/placeholder.svg'}
                                      alt={file?.name || 'Image'}
                                      className="object-cover w-full h-full max-h-48 rounded"
                                    />
                                  </CarouselItem>
                                ))}
                                {sellForm.videoFile && (
                                  <CarouselItem key={sellForm.videoFile.name} className="flex items-center justify-center w-full h-full">
                                    <video
                                      src={URL.createObjectURL(sellForm.videoFile)}
                                      controls
                                      className="object-cover w-full h-full max-h-48 rounded"
                                    />
                                  </CarouselItem>
                                )}
                              </CarouselContent>
                              <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10" />
                              <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10" />
                            </Carousel>
                          ) : (
                            <img src="/placeholder.svg" alt="Preview" className="object-cover w-full h-48 rounded" />
                          )}
                        </div>
                      </div>

                      <Button type="submit" className="w-full col-span-full" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="buy" className="space-y-4 sm:space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                      Buy Machine Request
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleBuySubmit} className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <label className="block text-sm font-medium mb-2">Machine Name</label>
                        <Input
                          value={buyForm.machineName}
                          onChange={e => setBuyForm(prev => ({ ...prev, machineName: e.target.value }))}
                          placeholder="Enter machine name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Machine Type</label>
                        <Select value={buyForm.machineTypeId} onValueChange={value => setBuyForm(prev => ({ ...prev, machineTypeId: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose machine type" />
                          </SelectTrigger>
                          <SelectContent>
                            {machineTypes.map(type => (
                              <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Payoff Nos</label>
                        <Input
                          type="number"
                          value={buyForm.payoffNos}
                          onChange={e => setBuyForm(prev => ({ ...prev, payoffNos: e.target.value }))}
                          placeholder="Number of payoffs"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Payoff Size</label>
                        <Input
                          value={buyForm.payoffSize}
                          onChange={e => setBuyForm(prev => ({ ...prev, payoffSize: e.target.value }))}
                          placeholder="Size specification"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Main Motor Capacity</label>
                        <Input
                          value={buyForm.mainMotorCapacity}
                          onChange={e => setBuyForm(prev => ({ ...prev, mainMotorCapacity: e.target.value }))}
                          placeholder="HP/KW"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Line Speed (Max Size)</label>
                        <Input
                          value={buyForm.lineSpeedMaxSize}
                          onChange={e => setBuyForm(prev => ({ ...prev, lineSpeedMaxSize: e.target.value }))}
                          placeholder="Meters per minute"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Expected Daily Production</label>
                        <Input
                          value={buyForm.expectedDailyProduction}
                          onChange={e => setBuyForm(prev => ({ ...prev, expectedDailyProduction: e.target.value }))}
                          placeholder="Production capacity"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Manufacturing Location</label>
                        <Input
                          value={buyForm.manufacturingLocation}
                          onChange={e => setBuyForm(prev => ({ ...prev, manufacturingLocation: e.target.value }))}
                          placeholder="City, State"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">WhatsApp Number</label>
                        <Input
                          value={buyForm.whatsappNumber}
                          onChange={e => setBuyForm(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                          placeholder="+91 98765 43210"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Notes</label>
                        <Textarea
                          value={buyForm.notes}
                          onChange={e => setBuyForm(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Additional requirements or specifications"
                          rows={3}
                        />
                      </div>

                      <Button type="submit" className="w-full col-span-full" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </>
  );
};

export default MachinesMarketplace; 