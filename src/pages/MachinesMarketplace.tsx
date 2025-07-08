import React, { useState, useEffect } from 'react';
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
import { ArrowLeft, Upload, Video, Image, Package, DollarSign, MapPin, Settings, Zap } from 'lucide-react';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';

const MachinesMarketplace: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [machineTypes, setMachineTypes] = useState<any[]>([]);
  const [sellMachines, setSellMachines] = useState<any[]>([]);
  const [buyMachines, setBuyMachines] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('sell');

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
    price: '',
    currency: 'INR',
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
    budgetMin: '',
    budgetMax: '',
    currency: 'INR',
    whatsappNumber: '',
    notes: '',
    isUrgent: false,
    videoFile: null as File | null,
    productionImages: [] as File[],
  });

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

  const fetchMachines = async () => {
    try {
      const [sellData, buyData] = await Promise.all([
        apiClient.getSellMachines().catch(() => []),
        apiClient.getBuyMachines().catch(() => [])
      ]);
      setSellMachines(sellData || []);
      setBuyMachines(buyData || []);
    } catch (error) {
      console.error('Failed to fetch machines:', error);
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
        price: sellForm.price ? parseFloat(sellForm.price) : null,
        currency: sellForm.currency,
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
        budget_min: buyForm.budgetMin ? parseFloat(buyForm.budgetMin) : null,
        budget_max: buyForm.budgetMax ? parseFloat(buyForm.budgetMax) : null,
        currency: buyForm.currency,
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
      price: '',
      currency: 'INR',
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
      budgetMin: '',
      budgetMax: '',
      currency: 'INR',
      whatsappNumber: '',
      notes: '',
      isUrgent: false,
      videoFile: null,
      productionImages: [],
    });
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

  return (
    <>
      <Header title="Machines Marketplace" onBack={() => navigate('/')} logoSrc='cableCartLogo.png' />
      <div className="container mx-auto py-8">
        <div className="flex justify-end mb-6">
          <Button onClick={() => navigate('/machines-listings')} variant="outline" className="font-semibold">
            Browse All Machine Listings
          </Button>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sell" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Sell Machine
            </TabsTrigger>
            <TabsTrigger value="buy" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Buy Machine
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sell" className="mt-6">
            <div className="w-full">
              {/* Sell Form */}
              <Card className="mx-auto w-full">
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

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Price</label>
                        <Input
                          type="number"
                          value={sellForm.price}
                          onChange={e => setSellForm(prev => ({ ...prev, price: e.target.value }))}
                          placeholder="Enter price"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Currency</label>
                        <Select value={sellForm.currency} onValueChange={value => setSellForm(prev => ({ ...prev, currency: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="INR">INR</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
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
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <Video className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <input
                          type="file"
                          accept="video/*"
                          onChange={e => handleFileChange('videoFile', e.target.files)}
                          className="hidden"
                          id="video-upload"
                        />
                        <label htmlFor="video-upload" className="cursor-pointer text-blue-600 hover:text-blue-800">
                          Upload Video
                        </label>
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
            </div>
          </TabsContent>

          <TabsContent value="buy" className="mt-6">
            <div className="w-full">
              {/* Buy Form */}
              <Card className="mx-auto w-full">
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
                        <label className="block text-sm font-medium mb-2">Min Budget</label>
                        <Input
                          type="number"
                          value={buyForm.budgetMin}
                          onChange={e => setBuyForm(prev => ({ ...prev, budgetMin: e.target.value }))}
                          placeholder="Min amount"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Max Budget</label>
                        <Input
                          type="number"
                          value={buyForm.budgetMax}
                          onChange={e => setBuyForm(prev => ({ ...prev, budgetMax: e.target.value }))}
                          placeholder="Max amount"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Currency</label>
                        <Select value={buyForm.currency} onValueChange={value => setBuyForm(prev => ({ ...prev, currency: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="INR">INR</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                          </SelectContent>
                        </Select>
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

                    {/* <div>
                      <label className="block text-sm font-medium mb-2">Preview Images & Video</label>
                      <div className="w-full">
                        {buyForm.productionImages?.length > 0 || buyForm.videoFile ? (
                          <Carousel className="w-full h-48 mb-4">
                            <CarouselContent>
                              {buyForm.productionImages?.map((file, idx) => (
                                <CarouselItem key={file?.name + idx} className="flex items-center justify-center w-full h-full">
                                  <img
                                    src={file ? URL.createObjectURL(file) : '/placeholder.svg'}
                                    alt={file?.name || 'Image'}
                                    className="object-cover w-full h-full max-h-48 rounded"
                                  />
                                </CarouselItem>
                              ))}
                              {buyForm.videoFile && (
                                <CarouselItem key={buyForm.videoFile.name} className="flex items-center justify-center w-full h-full">
                                  <video
                                    src={URL.createObjectURL(buyForm.videoFile)}
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
                    </div> */}

                    <Button type="submit" className="w-full col-span-full" disabled={loading}>
                      {loading ? 'Submitting...' : 'Submit'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default MachinesMarketplace; 