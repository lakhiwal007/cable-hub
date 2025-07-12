import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/apiClient';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, User, DollarSign, Clock, MapPin, Phone } from 'lucide-react';
import { WhatsAppContact } from '@/components/ui/whatsapp-contact';

function ConsultantCard({ consultant }: { consultant: any }) {
  return (
    <Card className="mb-4 sm:mb-6 hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl mb-2 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              {consultant.isIncognito ? 'Anonymous Expert' : consultant.name}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {consultant.whatsapp_number}
              </div>
              {consultant.hourly_rate && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  ${consultant.hourly_rate}/hr
                </div>
              )}
              {consultant.experience_years && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {consultant.experience_years} years
                </div>
              )}
            </div>
          </div>
          {consultant.isVerified && (
            <Badge variant="default">Verified</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h4 className="font-medium mb-2">Areas of Expertise:</h4>
          <div className="flex flex-wrap gap-2">
            {consultant.expertiseAreas?.map((area: string, index: number) => (
              <Badge key={index} variant="secondary">{area}</Badge>
            ))}
          </div>
        </div>
        
        {consultant.cableProductTypes?.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium mb-2">Cable Product Types:</h4>
            <div className="flex flex-wrap gap-2">
              {consultant.cableProductTypes.map((product: string, index: number) => (
                <Badge key={index} variant="outline">{product}</Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="mb-4">
          <h4 className="font-medium mb-2">Description:</h4>
          <p className="text-sm text-gray-600">{consultant.description}</p>
        </div>
        
        <div className="flex gap-2">
          <WhatsAppContact
            phoneNumber={consultant.whatsapp_number}
            consultantName={consultant.name}
            size="sm"
            className="flex items-center"
          >
            
            Contact via WhatsApp
          </WhatsAppContact>
          {!consultant.isIncognito && (
            <Button size="sm" variant="outline">
              View Profile
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ConsultingRequestCard({ request }: { request: any }) {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-700';
      case 'accepted': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className="mb-4 sm:mb-6 hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl mb-2 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              Consulting Request
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {request.whatsappNumber}
              </div>
              {request.budgetMin && request.budgetMax && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  ${request.budgetMin} - ${request.budgetMax}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className={getUrgencyColor(request.urgency)}>
              {request.urgency} urgency
            </Badge>
            <Badge className={getStatusColor(request.status)}>
              {request.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h4 className="font-medium mb-2">Expertise Needed:</h4>
          <div className="flex flex-wrap gap-2">
            {request.expertiseNeeded?.map((area: string, index: number) => (
              <Badge key={index} variant="secondary">{area}</Badge>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="font-medium mb-2">Project Description:</h4>
          <p className="text-sm text-gray-600">{request.description}</p>
        </div>
        
        <div className="flex gap-2">
          <WhatsAppContact
            phoneNumber={request.whatsappNumber}
            consultantName="Requester"
            size="sm"
            className="flex items-center gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            Contact Requester
          </WhatsAppContact>
          <Button size="sm" variant="outline">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

const ConsultingListings: React.FC = () => {
  const [tab, setTab] = useState('consultants');
  const [consultants, setConsultants] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [consultantsData, requestsData] = await Promise.all([
        apiClient.getConsultants().catch(() => []),
        apiClient.getConsultingRequests().catch(() => [])
      ]);
      setConsultants(consultantsData || []);
      setRequests(requestsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Header 
        title="Consulting Services" 
        onBack={() => navigate("/")} 
        logoSrc='cableCartLogo.png'
        
      />
      <div className="container mx-auto py-4 sm:py-8 px-4 sm:px-6">
      <Button 
            onClick={() => navigate('/paid-expert-consulting')}
            className="bg-blue-600 hover:bg-blue-700 mb-2"
          >
            Post Consulting Request
          </Button>
      
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="consultants" className="flex items-center gap-2 py-3">
            <span className="text-[12px] sm:text-base">Available Consultants</span>
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2 py-3">
            <span className="text-[12px] sm:text-base">Consulting Requests</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="consultants" className="mt-6">
          {loading ? (
            <div>Loading consultants...</div>
          ) : consultants.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No consultants available</h3>
              <p className="text-gray-600">Be the first to register as a consultant!</p>
              <Button 
                className="mt-4"
                onClick={() => navigate('/paid-expert-consulting')}
              >
                Register as Consultant
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {consultants.map(consultant => (
                <ConsultantCard key={consultant.id} consultant={consultant} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="requests" className="mt-6">
          {loading ? (
            <div>Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No consulting requests</h3>
              <p className="text-gray-600">Be the first to submit a consulting request!</p>
              <Button 
                className="mt-4"
                onClick={() => navigate('/paid-expert-consulting')}
              >
                Submit Request
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {requests.map(request => (
                <ConsultingRequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </>
  );
};

export default ConsultingListings; 