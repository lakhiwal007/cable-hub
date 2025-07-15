import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/apiClient';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, UserPlus, Search } from 'lucide-react';
import Header from '@/components/Header';

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

const PaidExpertConsulting: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Seeking consulting state
  const [seekingConsulting, setSeekingConsulting] = useState({
    whatsappNumber: '',
    expertiseNeeded: [] as string[],
    description: '',
    budgetMin: '',
    budgetMax: '',
    urgency: 'medium' as 'low' | 'medium' | 'high'
  });

  // Register as consultant state
  const [consultantRegistration, setConsultantRegistration] = useState({
    name: '',
    whatsappNumber: '',
    isIncognito: false,
    expertiseAreas: [] as string[],
    cableProductTypes: [] as string[],
    hourlyRate: '',
    experienceYears: '',
    description: ''
  });

  const handleSeekingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.createConsultingRequest({
        whatsapp_number: seekingConsulting.whatsappNumber,
        expertise_needed: seekingConsulting.expertiseNeeded,
        description: seekingConsulting.description,
        budget_min: seekingConsulting.budgetMin ? Number(seekingConsulting.budgetMin) : undefined,
        budget_max: seekingConsulting.budgetMax ? Number(seekingConsulting.budgetMax) : undefined,
        urgency: seekingConsulting.urgency
      });
      toast({ title: 'Success', description: 'Consulting request submitted successfully!' });
      setSeekingConsulting({
        whatsappNumber: '',
        expertiseNeeded: [],
        description: '',
        budgetMin: '',
        budgetMax: '',
        urgency: 'medium'
      });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleConsultantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.registerConsultant({
        name: consultantRegistration.name,
        whatsapp_number: consultantRegistration.whatsappNumber,
        is_incognito: consultantRegistration.isIncognito,
        expertise_areas: consultantRegistration.expertiseAreas,
        cable_product_types: consultantRegistration.cableProductTypes,
        hourly_rate: consultantRegistration.hourlyRate ? Number(consultantRegistration.hourlyRate) : undefined,
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
        hourlyRate: '',
        experienceYears: '',
        description: ''
      });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
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
      <Header title="Paid Expert Consulting" onBack={() => navigate(-1)} logoSrc='cableCartLogo.png' />
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <span />
          <Button 
            onClick={() => navigate('/consulting-listings')}
            className="flex items-center gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            Browse Listings
          </Button>
        </div>
        
        <Tabs defaultValue="seeking" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="seeking" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              I want Consultant for
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              I want register as Paid Consultant
            </TabsTrigger>
          </TabsList>

          <TabsContent value="seeking" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Seek Consulting Services
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
                      onChange={e => setSeekingConsulting(prev => ({ ...prev, whatsappNumber: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                      required
                      maxLength={10}
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Budget Range (Min)</label>
                      <Input
                        type="number"
                        placeholder="1000"
                        value={seekingConsulting.budgetMin}
                        onChange={e => setSeekingConsulting(prev => ({ ...prev, budgetMin: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Budget Range (Max)</label>
                      <Input
                        type="number"
                        placeholder="5000"
                        value={seekingConsulting.budgetMax}
                        onChange={e => setSeekingConsulting(prev => ({ ...prev, budgetMax: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Urgency</label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={seekingConsulting.urgency}
                        onChange={e => setSeekingConsulting(prev => ({ ...prev, urgency: e.target.value as 'low' | 'medium' | 'high' }))}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Submitting...' : 'Submit Consulting Request'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Register as Paid Consultant
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
                        onChange={e => setConsultantRegistration(prev => ({ ...prev, whatsappNumber: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                        required
                        maxLength={10}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Hourly Rate (USD)</label>
                      <Input
                        type="number"
                        placeholder="50"
                        value={consultantRegistration.hourlyRate}
                        onChange={e => setConsultantRegistration(prev => ({ ...prev, hourlyRate: e.target.value }))}
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

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Submitting...' : 'Register as Consultant'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default PaidExpertConsulting; 