import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, TrendingUp, Users } from "lucide-react";
import SelfInterviewForm from "@/components/SelfInterviewForm";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useNavigate } from "react-router-dom";

const roles = [
  { 
    title: "General Manager", 
    description: "Leads the team and oversees operations. Responsible for strategic planning and team management.",
    requirements: "10+ years experience, Leadership skills, Strategic thinking"
  },
  { 
    title: "Manager", 
    description: "Manages daily activities and staff. Coordinates team efforts and ensures project delivery.",
    requirements: "5+ years experience, Team management, Project coordination"
  },
  { 
    title: "Supervisor", 
    description: "Supervises work and ensures quality. Monitors team performance and maintains standards.",
    requirements: "3+ years experience, Quality control, Team supervision"
  },
  { 
    title: "Operator", 
    description: "Operates machinery and equipment. Handles technical operations and maintenance.",
    requirements: "2+ years experience, Technical skills, Equipment operation"
  },
  { 
    title: "Helper", 
    description: "Assists with various tasks. Supports team operations and general duties.",
    requirements: "1+ year experience, Team player, Willing to learn"
  },
];

const Team = () => {
  const navigate = useNavigate();

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Button
              onClick={() => navigate('/team-listings')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              View Applications
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Job Application</h1>
          <p className="text-lg text-gray-600 mb-6">
            Submit your application to join our team
          </p>
        </div>

        {/* Hiring Announcement */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Badge className="bg-green-600 text-white px-4 py-2 text-lg">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  We Are Hiring!
                </Badge>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Join Our Growing Team
              </h2>
              <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                We're looking for talented individuals to join our dynamic team. 
                Submit your application with a self-interview video to stand out!
              </p>
              
              {/* Available Positions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {roles.map((role, index) => (
                  <div key={role.title} className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="h-4 w-4 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">{role.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{role.description}</p>
                    <Badge variant="outline" className="text-xs">
                      {role.requirements}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Form Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Apply Now
          </h2>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Ready to join our team? Fill out the application form below and upload your self-interview video. 
            Make sure to watch the sample video for guidance on what we're looking for.
          </p>
          
          <SelfInterviewForm roles={roles.map(r => r.title)} />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Team; 