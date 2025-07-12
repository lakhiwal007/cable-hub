import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Upload, Download, FileText, Users, DollarSign, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Header from '@/components/Header';
import apiClient from "@/lib/apiClient";
import { WhatsAppContact } from "@/components/ui/whatsapp-contact";

interface DocumentItem {
  id: string;
  title: string;
  category: 'spec' | 'gtp' | 'format';
  description: string;
  file_url: string;
  file_name: string;
  file_size: string;
  price: number;
  uploaded_by: string;
  uploaded_at: string;
  downloads: number;
  tags: string[];
  is_paid: boolean;
}

interface UserInfo {
  id: string;
  name: string;
  company: string;
  contact: string;
  email: string;
  type: 'supplier' | 'buyer';
  description: string;
  created_at: string;
}

const SpecsMarketplace = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("find");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [userInfos, setUserInfos] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: '',
    description: '',
    price: '',
    tags: '',
    file: null as File | null
  });

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "spec", label: "Specifications" },
    { value: "gtp", label: "GTP" },
    { value: "format", label: "Formats" }
  ];

  useEffect(() => {
    setIsAuthenticated(apiClient.isAuthenticated());
    fetchDocuments();
    fetchUserInfos();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockDocuments: DocumentItem[] = [
        {
          id: '1',
          title: 'Copper Wire Specifications',
          category: 'spec',
          description: 'Complete specifications for copper wire manufacturing including dimensions, conductivity, and quality standards.',
          file_url: '#',
          file_name: 'copper_wire_specs.pdf',
          file_size: '2.5 MB',
          price: 500,
          uploaded_by: 'TechCorp Industries',
          uploaded_at: '2024-01-15',
          downloads: 45,
          tags: ['copper', 'wire', 'manufacturing'],
          is_paid: true
        },
        {
          id: '2',
          title: 'PVC Insulation GTP',
          category: 'gtp',
          description: 'Good Technical Practice guidelines for PVC insulation in cable manufacturing.',
          file_url: '#',
          file_name: 'pvc_insulation_gtp.pdf',
          file_size: '1.8 MB',
          price: 300,
          uploaded_by: 'CableTech Solutions',
          uploaded_at: '2024-01-10',
          downloads: 32,
          tags: ['pvc', 'insulation', 'cable'],
          is_paid: true
        },
        {
          id: '3',
          title: 'Quality Control Format',
          category: 'format',
          description: 'Standardized format for quality control documentation in cable manufacturing.',
          file_url: '#',
          file_name: 'qc_format.xlsx',
          file_size: '0.8 MB',
          price: 200,
          uploaded_by: 'QualityAssure Ltd',
          uploaded_at: '2024-01-08',
          downloads: 28,
          tags: ['quality', 'control', 'documentation'],
          is_paid: false
        }
      ];
      setDocuments(mockDocuments);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInfos = async () => {
    try {
      // Mock data - replace with actual API call
      const mockUserInfos: UserInfo[] = [
        {
          id: '1',
          name: 'Rajesh Kumar',
          company: 'MetalCorp Industries',
          contact: '+91 9205138358',
          email: 'rajesh@metalcorp.com',
          type: 'supplier',
          description: 'Leading supplier of copper and aluminum raw materials for cable manufacturing.',
          created_at: '2024-01-01'
        },
        {
          id: '2',
          name: 'Priya Sharma',
          company: 'CableTech Solutions',
          contact: '+91 90796 61628',
          email: 'priya@cabletech.com',
          type: 'buyer',
          description: 'Manufacturing company looking for high-quality raw materials and technical specifications.',
          created_at: '2024-01-05'
        }
      ];
      setUserInfos(mockUserInfos);
    } catch (error) {
      console.error('Failed to fetch user infos:', error);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === "all" || doc.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.file || !uploadForm.title || !uploadForm.category) {
      alert('Please fill all required fields and select a file.');
      return;
    }

    try {
      setLoading(true);
      // Mock upload - replace with actual API call
      console.log('Uploading document:', uploadForm);
      
      // Reset form
      setUploadForm({
        title: '',
        category: '',
        description: '',
        price: '',
        tags: '',
        file: null
      });
      setUploadDialogOpen(false);
      
      // Refresh documents
      await fetchDocuments();
    } catch (error) {
      console.error('Failed to upload document:', error);
      alert('Failed to upload document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (document: DocumentItem) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (document.is_paid) {
      // Handle payment flow
      alert('Payment required for this document. Redirecting to payment...');
      return;
    }

    // Handle free download
    try {
      // Mock download - replace with actual API call
      console.log('Downloading document:', document.title);
      alert('Download started!');
    } catch (error) {
      console.error('Failed to download document:', error);
      alert('Failed to download document. Please try again.');
    }
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `₹${price}`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'spec':
        return <FileText className="h-4 w-4" />;
      case 'gtp':
        return <FileText className="h-4 w-4" />;
      case 'format':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'spec':
        return 'bg-blue-100 text-blue-800';
      case 'gtp':
        return 'bg-green-100 text-green-800';
      case 'format':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        title="Specs, GTP & Formats"
        onBack={() => navigate('/')} 
        logoSrc='cableCartLogo.png'
        rightContent={
          <Button
            onClick={() => setUploadDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        }
      />

      <main className="max-w-7xl mx-auto py-4 sm:py-8 px-1 sm:px-4 lg:px-8">
        <div className="space-y-4 sm:space-y-8">
          {/* Header */}
          <div className="text-center px-2 sm:px-0">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Find Specs, GTP, Formats
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">
              Access technical documents, specifications, and industry standards
            </p>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex w-full justify-between gap-1 sm:gap-2 pb-1">
              <TabsTrigger value="find" className="w-full text-xs sm:text-sm px-2 sm:px-4 py-2">
                Get Information
              </TabsTrigger>
              <TabsTrigger value="share" className="w-full text-xs sm:text-sm px-2 sm:px-4 py-2">
                Share Information
              </TabsTrigger>
              <TabsTrigger value="users" className="w-full text-pretty text-xs sm:text-sm px-2 sm:px-4 py-2">
                RM Supplier / Buyer Info
              </TabsTrigger>
            </TabsList>

            {/* Get Information Tab */}
            <TabsContent value="find" className="space-y-3 sm:space-y-6">
              {/* Search and Filter */}
              <Card>
                <CardContent className="pt-4 sm:pt-6 px-2 sm:px-6">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search documents, specifications, or tags..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-10 sm:h-11 text-xs sm:text-base w-full"
                      />
                    </div>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-full sm:w-48 h-10 sm:h-11 text-xs sm:text-base">
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

              {/* Documents Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 px-1 sm:px-0">
                {filteredDocuments.map((doc) => (
                  <Card key={doc.id} className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xs sm:text-base font-semibold line-clamp-2">
                            {doc.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge className={`text-xs ${getCategoryColor(doc.category)}`}>
                              {getCategoryIcon(doc.category)}
                              <span className="ml-1 capitalize">{doc.category}</span>
                            </Badge>
                            {doc.is_paid && (
                              <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                <DollarSign className="h-3 w-3 mr-1" />
                                Paid
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0 px-2 sm:px-4">
                      <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-3">
                        {doc.description}
                      </p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 gap-1 sm:gap-0">
                          <span>File: {doc.file_name}</span>
                          <span>{doc.file_size}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 gap-1 sm:gap-0">
                          <span>By: {doc.uploaded_by}</span>
                          <span>{doc.downloads} downloads</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 gap-1 sm:gap-0">
                          <span>Price: {formatPrice(doc.price)}</span>
                          <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleDownload(doc)}
                          className="flex-1 w-full h-10 sm:h-9 text-xs sm:text-sm"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {doc.is_paid ? 'Buy' : 'Download'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredDocuments.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-xs sm:text-base">No documents found. Try adjusting your search or filters.</p>
                </div>
              )}
            </TabsContent>

            {/* Share Information Tab */}
            <TabsContent value="share" className="space-y-3 sm:space-y-6">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base sm:text-xl">Share Information (Get Paid)</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Upload your technical documents and earn money. Share your expertise with the industry.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-2 sm:px-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-6">
                    <Card className="text-center p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <h3 className="font-semibold text-xs sm:text-sm">Specifications</h3>
                      <p className="text-xs text-gray-600 mt-1">Technical specifications and standards</p>
                    </Card>
                    <Card className="text-center p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <h3 className="font-semibold text-xs sm:text-sm">GTP</h3>
                      <p className="text-xs text-gray-600 mt-1">Good Technical Practice guidelines</p>
                    </Card>
                    <Card className="text-center p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <h3 className="font-semibold text-xs sm:text-sm">Formats</h3>
                      <p className="text-xs text-gray-600 mt-1">Documentation formats and templates</p>
                    </Card>
                  </div>
                  
                  <div className="text-center">
                    <Button
                      onClick={() => setUploadDialogOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* RM Supplier/Buyer Info Tab */}
            <TabsContent value="users" className="space-y-3 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 px-1 sm:px-0">
                {userInfos.map((user) => (
                  <Card key={user.id} className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xs sm:text-base font-semibold">
                            {user.name}
                          </CardTitle>
                          <p className="text-xs text-gray-600 mt-1">{user.company}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={`text-xs ${user.type === 'supplier' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                              <Users className="h-3 w-3 mr-1" />
                              {user.type === 'supplier' ? 'Supplier' : 'Buyer'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0 px-2 sm:px-4">
                      <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-3">
                        {user.description}
                      </p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>📧 {user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>📞 {user.contact}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>📅 Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <WhatsAppContact
                          phoneNumber={user.contact}
                          consultantName={user.name}
                          variant="outline"
                          size="default"
                          className="flex-1 w-full h-10 sm:h-9 text-xs sm:text-sm"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Contact
                        </WhatsAppContact>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="w-full max-h-[90vh] overflow-y-scroll border-none outline-none p-3 sm:p-6">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Share your technical documents and earn money. Choose your category and set a price.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Document Title *</Label>
              <Input
                id="title"
                value={uploadForm.title}
                onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter document title"
                required
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={uploadForm.category} onValueChange={(value) => setUploadForm(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spec">Specifications</SelectItem>
                  <SelectItem value="gtp">GTP</SelectItem>
                  <SelectItem value="format">Formats</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={uploadForm.description}
                onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your document"
                rows={3}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                value={uploadForm.price}
                onChange={(e) => setUploadForm(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0 for free, or enter price"
                min="0"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={uploadForm.tags}
                onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="copper, wire, manufacturing"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="file">Document File *</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                onChange={(e) => setUploadForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                required
                className="w-full"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setUploadDialogOpen(false)}
                className="flex-1 w-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Uploading...' : 'Upload Document'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SpecsMarketplace; 