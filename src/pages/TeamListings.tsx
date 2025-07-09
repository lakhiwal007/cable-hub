import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  User,
  FileText,
  Play,
  Star,
  Clock,
  Plus
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';

interface JobApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  location: string;
  experience: number;
  education: string;
  skills: string;
  experience_details: string;
  linkedin?: string;
  portfolio?: string;
  cover_letter: string;
  salary?: string;
  notice_period?: string;
  references?: string;
  resume_url: string;
  video_url: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  created_at: string;
}

const TeamListings = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const roles = [
    'General Manager',
    'Manager', 
    'Supervisor',
    'Operator',
    'Helper'
  ];

  const statuses = [
    'pending',
    'reviewed', 
    'shortlisted',
    'rejected',
    'hired'
  ];

  const navigate = useNavigate();

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockApplications: JobApplication[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+91 98765 43210',
        role: 'General Manager',
        location: 'Mumbai, Maharashtra',
        experience: 12,
        education: 'MBA, IIM Bangalore, 2010',
        skills: 'Leadership, Strategic Planning, Team Management, Operations',
        experience_details: '10+ years in manufacturing industry, led teams of 50+ people',
        linkedin: 'linkedin.com/in/johndoe',
        portfolio: 'johndoe.com',
        cover_letter: 'I am excited to apply for the General Manager position...',
        salary: '₹15-20 LPA',
        notice_period: '30 days',
        references: 'Available on request',
        resume_url: '/resumes/john-doe.pdf',
        video_url: '/videos/john-doe.mp4',
        status: 'shortlisted',
        created_at: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane.smith@email.com',
        phone: '+91 87654 32109',
        role: 'Manager',
        location: 'Delhi, NCR',
        experience: 8,
        education: 'B.Tech, Delhi University, 2015',
        skills: 'Project Management, Team Coordination, Process Improvement',
        experience_details: '8 years in cable manufacturing, managed multiple projects',
        cover_letter: 'I have extensive experience in cable manufacturing...',
        salary: '₹12-15 LPA',
        notice_period: '15 days',
        resume_url: '/resumes/jane-smith.pdf',
        video_url: '/videos/jane-smith.mp4',
        status: 'reviewed',
        created_at: '2024-01-14T14:20:00Z'
      },
      {
        id: '3',
        name: 'Mike Johnson',
        email: 'mike.johnson@email.com',
        phone: '+91 76543 21098',
        role: 'Supervisor',
        location: 'Chennai, Tamil Nadu',
        experience: 5,
        education: 'Diploma in Electrical Engineering, 2018',
        skills: 'Quality Control, Team Supervision, Technical Skills',
        experience_details: '5 years supervising production teams',
        cover_letter: 'I am passionate about quality control and team management...',
        salary: '₹8-10 LPA',
        notice_period: '7 days',
        resume_url: '/resumes/mike-johnson.pdf',
        video_url: '/videos/mike-johnson.mp4',
        status: 'pending',
        created_at: '2024-01-16T09:15:00Z'
      }
    ];

    setApplications(mockApplications);
    setFilteredApplications(mockApplications);
    setLoading(false);
  }, []);

  // Filter applications
  useEffect(() => {
    let filtered = applications;

    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRole !== 'all') {
      filtered = filtered.filter(app => app.role === selectedRole);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(app => app.status === selectedStatus);
    }

    setFilteredApplications(filtered);
  }, [applications, searchTerm, selectedRole, selectedStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'shortlisted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'hired': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewDetails = (application: JobApplication) => {
    setSelectedApplication(application);
    setDetailDialogOpen(true);
  };

  const handleStatusChange = (applicationId: string, newStatus: string) => {
    setApplications(prev => 
      prev.map(app => 
        app.id === applicationId 
          ? { ...app, status: newStatus as JobApplication['status'] }
          : app
      )
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <Header 
        title="Team Applications" 
        onBack={() => navigate("/")}
        logoSrc='/cableCartLogo.png'
        
      />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Applications</h1>
          <p className="text-gray-600">Manage and review job applications for team positions</p>
        </div>
        <Button onClick={() => navigate('/team')} className="flex items-center gap-2 my-2">
            <Plus className="h-4 w-4" />
            Post Application
          </Button>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="all">All Roles</option>
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="all">All Status</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedRole('all');
                    setSelectedStatus('all');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplications.map((application) => (
            <Card key={application.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg mb-1">{application.name}</CardTitle>
                    <Badge className={getStatusColor(application.status)}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{formatDate(application.created_at)}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{application.role}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{application.email}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{application.phone}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{application.location}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{application.experience} years experience</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => handleViewDetails(application)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  
                  <select
                    value={application.status}
                    onChange={(e) => handleStatusChange(application.id, e.target.value)}
                    className="text-xs border rounded px-2 py-1"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredApplications.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No applications found matching your criteria.</p>
          </div>
        )}

        {/* Application Details Dialog */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedApplication && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {selectedApplication.name} - {selectedApplication.role}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Contact Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{selectedApplication.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{selectedApplication.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{selectedApplication.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Application Details</h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>Experience:</strong> {selectedApplication.experience} years</div>
                        <div><strong>Education:</strong> {selectedApplication.education}</div>
                        <div><strong>Expected Salary:</strong> {selectedApplication.salary || 'Not specified'}</div>
                        <div><strong>Notice Period:</strong> {selectedApplication.notice_period || 'Not specified'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Skills & Experience */}
                  <div>
                    <h3 className="font-semibold mb-2">Skills</h3>
                    <p className="text-sm text-gray-600">{selectedApplication.skills}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Experience Details</h3>
                    <p className="text-sm text-gray-600">{selectedApplication.experience_details}</p>
                  </div>

                  {/* Cover Letter */}
                  <div>
                    <h3 className="font-semibold mb-2">Cover Letter</h3>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      {selectedApplication.cover_letter}
                    </div>
                  </div>

                  {/* Files */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Resume</h3>
                      <Button variant="outline" size="sm" className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        Download Resume
                      </Button>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Self-Interview Video</h3>
                      <Button variant="outline" size="sm" className="w-full">
                        <Play className="h-4 w-4 mr-2" />
                        Watch Video
                      </Button>
                    </div>
                  </div>

                  {/* References */}
                  {selectedApplication.references && (
                    <div>
                      <h3 className="font-semibold mb-2">References</h3>
                      <p className="text-sm text-gray-600">{selectedApplication.references}</p>
                    </div>
                  )}

                  {/* Status Update */}
                  <div>
                    <h3 className="font-semibold mb-2">Update Status</h3>
                    <select
                      value={selectedApplication.status}
                      onChange={(e) => handleStatusChange(selectedApplication.id, e.target.value)}
                      className="border rounded px-3 py-2"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
};

export default TeamListings; 