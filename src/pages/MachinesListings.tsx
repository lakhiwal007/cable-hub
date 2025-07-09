import React, { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/apiClient';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Package, DollarSign, MapPin } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';

const MachinesListings: React.FC = () => {
  const [tab, setTab] = useState('sell');
  const [sellMachines, setSellMachines] = useState<any[]>([]);
  const [buyMachines, setBuyMachines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [machineTypes, setMachineTypes] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchListings();
    fetchMachineTypes();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const [sellData, buyData] = await Promise.all([
        apiClient.getSellMachines().catch(() => []),
        apiClient.getBuyMachines().catch(() => [])
      ]);
      setSellMachines(sellData || []);
      setBuyMachines(buyData || []);
    } catch (error) {
      console.error('Failed to fetch machine listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMachineTypes = async () => {
    try {
      const types = await apiClient.getMachineTypes();
      setMachineTypes(types || []);
    } catch (error) {
      console.error('Failed to fetch machine types:', error);
    }
  };

  const getMachineTypeName = (id: string) => {
    return machineTypes.find((type) => type.id === id)?.name || id;
  };

  return (
    <>
      <Header title="Machines Listings" onBack={() => navigate('/machines-marketplace')} logoSrc='cableCartLogo.png' />
      <div className="container mx-auto py-4 sm:py-8 px-4 sm:px-6">
        <div className="flex justify-end mb-4 sm:mb-6">
          <Button 
            onClick={() => navigate('/machines-marketplace')}
            className="bg-green-600 hover:bg-green-700 text-sm sm:text-base px-3 sm:px-4 py-2"
          >
            Post Machine Listing
          </Button>
        </div>
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 h-auto">
            <TabsTrigger value="sell" className="flex items-center gap-1 sm:gap-2 py-3">
              <Package className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-[12px] sm:text-base">Machines for Sale</span>
            </TabsTrigger>
            <TabsTrigger value="buy" className="flex items-center gap-1 sm:gap-2 py-3">
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-[12px] sm:text-base">Buy Requests</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sell">
            {loading ? (
              <div>Loading...</div>
            ) : sellMachines.length === 0 ? (
              <div className="text-center text-gray-500 py-12">No machines for sale yet.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {sellMachines.map(machine => {
                  const images = machine.production_image_urls || [];
                  const video = machine.video_url || "";
                  const hasMedia = images.length > 0 || video.length > 0;
                  return (
                    <div key={machine.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow border flex flex-col h-full">
                      <div className="relative w-full aspect-video bg-gray-100 rounded-t-xl overflow-hidden flex items-center justify-center">
                        {hasMedia ? (
                          <Carousel className="w-full h-full">
                            <CarouselContent>
                              {images.map((url: string, idx: number) => (
                                <CarouselItem key={url + idx} className="flex items-center justify-center w-full h-full">
                                  <img
                                    src={url}
                                    alt={machine.machine_name}
                                    className="object-cover w-full h-full max-h-56 rounded-t-xl"
                                  />
                                </CarouselItem>
                              ))}
                              {video && (
                                <CarouselItem key={video} className="flex items-center justify-center w-full h-full">
                                  <video
                                    src={video}
                                    controls
                                    className="object-cover w-full h-full max-h-56 rounded-t-xl"
                                  />
                                </CarouselItem>
                              )}
                            </CarouselContent>
                            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10" />
                            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10" />
                          </Carousel>
                        ) : (
                          <img
                            src={'/placeholder.svg'}
                            alt={machine.machine_name}
                            className="object-cover w-full h-full max-h-56 rounded-t-xl"
                          />
                        )}
                        {machine.is_urgent && (
                          <span className="absolute top-2 right-2 px-2 py-1 text-xs rounded font-semibold bg-red-100 text-red-700">Urgent</span>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col px-4 py-3">
                        <h2 className="font-bold text-lg mb-1 truncate" title={machine.machine_name}>{machine.machine_name}</h2>
                        <div className="text-gray-600 text-sm mb-2 flex flex-wrap gap-2">
                          <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{machine.manufacturing_location}</span>
                        </div>
                        <div className="mb-2 text-gray-700">Type: {getMachineTypeName(machine.machine_type_id)}</div>
                        {machine.price && (
                          <div className="mb-2 font-semibold text-green-700">
                            Price: {machine.currency} {machine.price.toLocaleString()}
                          </div>
                        )}
                        <div className="flex gap-2 mt-auto">
                          <Button size="sm" variant="outline" className="flex-1">View Details</Button>
                          <Button size="sm" className="flex-1">Contact Seller</Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="buy">
            {loading ? (
              <div>Loading...</div>
            ) : buyMachines.length === 0 ? (
              <div className="text-center text-gray-500 py-12">No buy requests yet.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {buyMachines.map(machine => {
                  const images = machine.production_image_urls || [];
                  const video = machine.video_url || "";
                  const hasMedia = images.length > 0 || video.length > 0;
                  return (
                    <div key={machine.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow border flex flex-col h-full">
                      <div className="relative w-full aspect-video bg-gray-100 rounded-t-xl overflow-hidden flex items-center justify-center">
                        {hasMedia ? (
                          <Carousel className="w-full h-full">
                            <CarouselContent>
                              {images.map((url: string, idx: number) => (
                                <CarouselItem key={url + idx} className="flex items-center justify-center w-full h-full">
                                  <img
                                    src={url}
                                    alt={machine.machine_name}
                                    className="object-cover w-full h-full max-h-56 rounded-t-xl"
                                  />
                                </CarouselItem>
                              ))}
                              {video && (
                                <CarouselItem key={video} className="flex items-center justify-center w-full h-full">
                                  <video
                                    src={video}
                                    controls
                                    className="object-cover w-full h-full max-h-56 rounded-t-xl"
                                  />
                                </CarouselItem>
                              )}
                            </CarouselContent>
                            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10" />
                            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10" />
                          </Carousel>
                        ) : (
                          <img
                            src={'/placeholder.svg'}
                            alt={machine.machine_name}
                            className="object-cover w-full h-full max-h-56 rounded-t-xl"
                          />
                        )}
                        {machine.is_urgent && (
                          <span className="absolute top-2 right-2 px-2 py-1 text-xs rounded font-semibold bg-red-100 text-red-700">Urgent</span>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col px-4 py-3">
                        <h2 className="font-bold text-lg mb-1 truncate" title={machine.machine_name}>{machine.machine_name}</h2>
                        <div className="text-gray-600 text-sm mb-2 flex flex-wrap gap-2">
                          <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{machine.manufacturing_location}</span>
                        </div>
                        <div className="mb-2 text-gray-700">Type: {getMachineTypeName(machine.machine_type_id)}</div>
                        {machine.budget_min && machine.budget_max && (
                          <div className="mb-2 font-semibold text-blue-700">
                            Budget: {machine.currency} {machine.budget_min.toLocaleString()} - {machine.budget_max.toLocaleString()}
                          </div>
                        )}
                        <div className="flex gap-2 mt-auto">
                          <Button size="sm" variant="outline" className="flex-1">View Details</Button>
                          <Button size="sm" className="flex-1">Contact Buyer</Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default MachinesListings; 