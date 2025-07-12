import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/lib/apiClient';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, User, DollarSign, Clock, MapPin, Phone, Search, Filter, Eye, UserPlus } from 'lucide-react';
import { WhatsAppContact } from '@/components/ui/whatsapp-contact';
import Loader from '@/components/ui/loader';
import { useToast } from '@/hooks/use-toast';

function ConsultantCard({ consultant }: { consultant: any }) {
  return (
    <div className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-gray-200 h-full bg-white rounded-lg overflow-hidden">
      {/* Header Section */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {consultant.isIncognito ? 'Anonymous Expert' : consultant.name}
            </h3>
          </div>
          {consultant.isVerified && (
            <Badge variant="default" className="bg-green-600">Verified</Badge>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Phone className="h-4 w-4" />
            <span className="truncate">{consultant.whatsapp_number}</span>
          </div>
          {consultant.experience_years && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{consultant.experience_years} years</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {consultant.expertiseAreas?.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium mb-2 text-sm text-gray-700">Areas of Expertise:</h4>
            <div className="flex flex-wrap gap-1">
              {consultant.expertiseAreas.slice(0, 3).map((area: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {area}
                </Badge>
              ))}
              {consultant.expertiseAreas.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{consultant.expertiseAreas.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {consultant.cableProductTypes?.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium mb-2 text-sm text-gray-700">Cable Product Types:</h4>
            <div className="flex flex-wrap gap-1">
              {consultant.cableProductTypes.slice(0, 2).map((product: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {product}
                </Badge>
              ))}
              {consultant.cableProductTypes.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{consultant.cableProductTypes.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 line-clamp-3">{consultant.description}</p>
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
          <WhatsAppContact
            phoneNumber={consultant.whatsapp_number}
            consultantName={consultant.name}
            variant="default"
            size="default"
            className="w-full bg-green-600 hover:bg-green-700 h-10 sm:h-9 text-sm"
          >
            WhatsApp
          </WhatsAppContact>
        </div>

        {/* Posted Date */}
        <div className="mt-3 text-xs text-gray-500 text-center">
          Registered {new Date(consultant.created_at || Date.now()).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

function ConsultingRequestCard({ request }: { request: any }) {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      case 'low': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-600 text-white';
      case 'accepted': return 'bg-green-600 text-white';
      case 'in_progress': return 'bg-yellow-600 text-white';
      case 'completed': return 'bg-gray-600 text-white';
      case 'cancelled': return 'bg-red-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-gray-200 h-full bg-white rounded-lg overflow-hidden">
      {/* Header Section */}
      <div className="p-4 border-b bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Consulting Request</h3>
          </div>
          <div className="flex gap-1">
            <Badge className={`text-xs ${getUrgencyColor(request.urgency)}`}>
              {request.urgency}
            </Badge>
            <Badge className={`text-xs ${getStatusColor(request.status)}`}>
              {request.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Phone className="h-4 w-4" />
            <span className="truncate">{request.whatsappNumber}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {request.expertiseNeeded?.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium mb-2 text-sm text-gray-700">Expertise Needed:</h4>
            <div className="flex flex-wrap gap-1">
              {request.expertiseNeeded.slice(0, 3).map((area: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {area}
                </Badge>
              ))}
              {request.expertiseNeeded.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{request.expertiseNeeded.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 line-clamp-3">{request.description}</p>
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
          <WhatsAppContact
            phoneNumber={request.whatsappNumber}
            consultantName="Requester"
            variant="default"
            size="default"
            className="w-full bg-green-600 hover:bg-green-700 h-10 sm:h-9 text-sm"
          >
            WhatsApp
          </WhatsAppContact>
        </div>

        {/* Posted Date */}
        <div className="mt-3 text-xs text-gray-500 text-center">
          Posted {new Date(request.created_at || Date.now()).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

const expertiseAreas = [
  'Machines',
  'Raw Material', 
  'Cable Design',
  'New Plant Set up',
  'Subsidy',
  'Loans',
  'Electricals',
  'Marketing',
  'Sales'
];

const ConsultingListings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const [browseTab, setBrowseTab] = useState<'consultants' | 'requests'>('consultants');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [consultants, setConsultants] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Seeking consulting state
  const [seekingConsulting, setSeekingConsulting] = useState({
    whatsappNumber: '',
    expertiseNeeded: [] as string[],
    description: '',
    urgency: 'medium' as 'low' | 'medium' | 'high'
  });

  // Register as consultant state
  const [consultantRegistration, setConsultantRegistration] = useState({
    name: '',
    whatsappNumber: '',
    isIncognito: false,
    expertiseAreas: [] as string[],
    cableProductTypes: [] as string[],
    experienceYears: '',
    description: ''
  });

  // Categories for filtering
  const categories = [
    { value: "all", label: "All Categories" },
    { value: "cable_design", label: "Cable Design" },
    { value: "manufacturing", label: "Manufacturing" },
    { value: "quality_control", label: "Quality Control" },
    { value: "testing", label: "Testing" },
    { value: "regulatory", label: "Regulatory" }
  ];

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [consultantsData, requestsData] = await Promise.all([
        apiClient.getConsultants().catch(() => []),
        apiClient.getConsultingRequests().catch(() => [])
      ]);
      setConsultants(consultantsData || []);
      setRequests(requestsData || []);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter listings based on search and category
  const filteredConsultants = consultants.filter((consultant) => {
    const matchesSearch = consultant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultant.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultant.expertiseAreas?.some((area: string) => area.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === "all" || consultant.expertiseAreas?.includes(filterCategory);
    return matchesSearch && matchesCategory;
  });

  const filteredRequests = requests.filter((request) => {
    const matchesSearch = request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.expertiseNeeded?.some((area: string) => area.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === "all" || request.expertiseNeeded?.includes(filterCategory);
    return matchesSearch && matchesCategory;
  });

  const handleSeekingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await apiClient.createConsultingRequest({
        whatsapp_number: seekingConsulting.whatsappNumber,
        expertise_needed: seekingConsulting.expertiseNeeded,
        description: seekingConsulting.description,
        urgency: seekingConsulting.urgency
      });
      toast({ title: 'Success', description: 'Consulting request submitted successfully!' });
      setSeekingConsulting({
        whatsappNumber: '',
        expertiseNeeded: [],
        description: '',
        urgency: 'medium'
      });
      // Refresh data and switch to browse tab
      await fetchData();
      setActiveTab('browse');
      setBrowseTab('requests');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleConsultantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await apiClient.registerConsultant({
        name: consultantRegistration.name,
        whatsapp_number: consultantRegistration.whatsappNumber,
        is_incognito: consultantRegistration.isIncognito,
        expertise_areas: consultantRegistration.expertiseAreas,
        cable_product_types: consultantRegistration.cableProductTypes,
        experience_years: consultantRegistration.experienceYears ? Number(consultantRegistration.experienceYears) : undefined,
        description: consultantRegistration.description
      });
      toast({ title: 'Success', description: 'Consultant registration submitted successfully!' });
      setConsultantRegistration({
        name: '',
        whatsappNumber: '',
        isIncognito: false,
        expertiseAreas: [],
        cableProductTypes: [],
        experienceYears: '',
        description: ''
      });
      // Refresh data and switch to browse tab
      await fetchData();
      setActiveTab('browse');
      setBrowseTab('consultants');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  };

  const toggleExpertiseArea = (area: string, type: 'seeking' | 'consultant') => {
    if (type === 'seeking') {
      setSeekingConsulting(prev => ({
        ...prev,
        expertiseNeeded: prev.expertiseNeeded.includes(area)
          ? prev.expertiseNeeded.filter(a => a !== area)
          : [...prev.expertiseNeeded, area]
      }));
    } else {
      setConsultantRegistration(prev => ({
        ...prev,
        expertiseAreas: prev.expertiseAreas.includes(area)
          ? prev.expertiseAreas.filter(a => a !== area)
          : [...prev.expertiseAreas, area]
      }));
    }
  };

  return (
    <>
      <Header title="Consulting Services" onBack={() => navigate('/')} logoSrc='cableCartLogo.png' />
      <div className="max-w-7xl mx-auto py-4 sm:py-8 px-1 sm:px-4 lg:px-8">
        <div className="space-y-4 sm:space-y-8">
          <div className="text-center">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Consulting Services</h2>
                <p className="text-sm sm:text-base text-gray-600">Connect with industry experts and find consulting opportunities</p>
              </div>
            </div>
          </div>

          {loading ? (
            <Loader className="py-12" />
          ) : error ? (
            <div className="text-red-500 text-center py-8">
              <p>Error: {error}</p>
              <button onClick={fetchData} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Try Again
              </button>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 gap-1 sm:gap-2">
                <TabsTrigger value="browse" className="text-xs sm:text-sm">Browse</TabsTrigger>
                <TabsTrigger value="post-request" className="text-xs sm:text-sm">Post Request</TabsTrigger>
                <TabsTrigger value="register" className="text-xs sm:text-sm">Register as Consultant</TabsTrigger>
              </TabsList>

              <TabsContent value="browse" className="space-y-4 sm:space-y-6">
                {/* Search and Filter */}
                <Card>
                  <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search consultants, expertise, or requests..."
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

                {/* Sub-tabs for Consultants/Requests */}
                <Tabs value={browseTab} onValueChange={v => setBrowseTab(v as 'consultants' | 'requests')} className="w-full">
                  <TabsList className="w-full grid grid-cols-2 mb-4 gap-1 sm:gap-2">
                    <TabsTrigger value="consultants" className="text-xs sm:text-sm">Available Consultants</TabsTrigger>
                    <TabsTrigger value="requests" className="text-xs sm:text-sm">Consulting Requests</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="consultants">
                    <div className="space-y-4">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Available Consultants</h3>
                      {filteredConsultants.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
                          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No consultants available</h3>
                          <p className="text-gray-600">Be the first to register as a consultant!</p>
                          <Button 
                            className="mt-4"
                            onClick={() => setActiveTab('register')}
                          >
                            Register as Consultant
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                          {filteredConsultants.map(consultant => (
                            <ConsultantCard key={consultant.id} consultant={consultant} />
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="requests">
                    <div className="space-y-4">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Consulting Requests</h3>
                      {filteredRequests.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
                          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No consulting requests</h3>
                          <p className="text-gray-600">Be the first to submit a consulting request!</p>
                          <Button 
                            className="mt-4"
                            onClick={() => setActiveTab('post-request')}
                          >
                            Submit Request
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                          {filteredRequests.map(request => (
                            <ConsultingRequestCard key={request.id} request={request} />
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="post-request" className="space-y-4 sm:space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-green-600" />
                      Post Consulting Request
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSeekingSubmit} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">My WhatsApp No.</label>
                        <Input
                          type="tel"
                          placeholder="+1234567890"
                          value={seekingConsulting.whatsappNumber}
                          onChange={e => setSeekingConsulting(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-3">I need consulting for:</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {expertiseAreas.map(area => (
                            <div key={area} className="flex items-center space-x-2">
                              <Checkbox
                                id={`seeking-${area}`}
                                checked={seekingConsulting.expertiseNeeded.includes(area)}
                                onCheckedChange={() => toggleExpertiseArea(area, 'seeking')}
                              />
                              <label htmlFor={`seeking-${area}`} className="text-sm">{area}</label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Project Description</label>
                        <Textarea
                          placeholder="Describe your project and what kind of consulting you need..."
                          value={seekingConsulting.description}
                          onChange={e => setSeekingConsulting(prev => ({ ...prev, description: e.target.value }))}
                          rows={4}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Urgency</label>
                        <Select value={seekingConsulting.urgency} onValueChange={(value: 'low' | 'medium' | 'high') => setSeekingConsulting(prev => ({ ...prev, urgency: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button type="submit" disabled={formLoading} className="w-full">
                        {formLoading ? 'Submitting...' : 'Submit Consulting Request'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="register" className="space-y-4 sm:space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      Register as Consultant
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleConsultantSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Name</label>
                          <Input
                            placeholder="Your Name"
                            value={consultantRegistration.name}
                            onChange={e => setConsultantRegistration(prev => ({ ...prev, name: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">My WhatsApp No.</label>
                          <Input
                            type="tel"
                            placeholder="+1234567890"
                            value={consultantRegistration.whatsappNumber}
                            onChange={e => setConsultantRegistration(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="incognito"
                          checked={consultantRegistration.isIncognito}
                          onCheckedChange={checked => setConsultantRegistration(prev => ({ ...prev, isIncognito: checked }))}
                        />
                        <label htmlFor="incognito" className="text-sm">I wish to remain incognito / hidden</label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-3">Areas of Expertise:</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {expertiseAreas.map(area => (
                            <div key={area} className="flex items-center space-x-2">
                              <Checkbox
                                id={`consultant-${area}`}
                                checked={consultantRegistration.expertiseAreas.includes(area)}
                                onCheckedChange={() => toggleExpertiseArea(area, 'consultant')}
                              />
                              <label htmlFor={`consultant-${area}`} className="text-sm">{area}</label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Cable Product Types (mention product names)</label>
                        <Textarea
                          placeholder="e.g., Power cables, Control cables, Instrumentation cables, etc."
                          value={consultantRegistration.cableProductTypes.join(', ')}
                          onChange={e => setConsultantRegistration(prev => ({ 
                            ...prev, 
                            cableProductTypes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                          }))}
                          rows={2}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Years of Experience</label>
                        <Input
                          type="number"
                          placeholder="5"
                          value={consultantRegistration.experienceYears}
                          onChange={e => setConsultantRegistration(prev => ({ ...prev, experienceYears: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Professional Description</label>
                        <Textarea
                          placeholder="Describe your experience, qualifications, and what makes you a good consultant..."
                          value={consultantRegistration.description}
                          onChange={e => setConsultantRegistration(prev => ({ ...prev, description: e.target.value }))}
                          rows={4}
                          required
                        />
                      </div>

                      <Button type="submit" disabled={formLoading} className="w-full">
                        {formLoading ? 'Submitting...' : 'Register as Consultant'}
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

export default ConsultingListings; 