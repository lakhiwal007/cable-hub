import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import apiClient from "@/lib/apiClient";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Profile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    apiClient.getProfile().then(setUser).catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await apiClient.logout();
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span>Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header title="My Profile" showBack={true} logoSrc='/cableCartLogo.png' />
      <main className="max-w-md mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <span className="font-semibold">Name:</span> {user.user_metadata?.name || "-"}
              </div>
              <div>
                <span className="font-semibold">Email:</span> {user.email}
              </div>
              <div>
                <span className="font-semibold">User Type:</span> {user.user_metadata?.user_type || "User"}
              </div>
              <Button className="mt-6 w-full" onClick={handleLogout} variant="destructive">
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile; 