import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import apiClient from "@/lib/apiClient";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const Profile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    company_name: "",
    company_address: "",
    location: "",
    pin: "",
    whatsapp: "",
    gst: "",
    years_experience: "",
    verified: false,
    factory_videos: [] as File[],
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    apiClient.getProfile().then(setUser).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (user) {
      setForm({
        company_name: user.user_metadata?.company_name || "",
        company_address: user.user_metadata?.company_address || "",
        location: user.user_metadata?.location || "",
        pin: user.user_metadata?.pin || "",
        whatsapp: user.user_metadata?.whatsapp || "",
        gst: user.user_metadata?.gst || "",
        years_experience: user.user_metadata?.years_experience || "",
        verified: user.user_metadata?.verified || false,
        factory_videos: [],
      });
    }
  }, [user]);

  const handleLogout = async () => {
    await apiClient.logout();
    navigate("/login");
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? target.checked : value,
    }));
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setForm((prev) => ({ ...prev, factory_videos: Array.from(e.target.files) }));
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let videoUrls: string[] = [];
      if (form.verified && form.factory_videos.length > 0) {
        videoUrls = await Promise.all(
          form.factory_videos.map((file) => apiClient.uploadListingVideo(file))
        );
      }
      const updateData: any = {
        company_name: form.company_name,
        company_address: form.company_address,
        location: form.location,
        pin: form.pin,
        whatsapp: form.whatsapp,
        gst: form.gst,
        years_experience: form.years_experience,
        verified: form.verified,
      };
      if (videoUrls.length > 0) {
        updateData.factory_videos = videoUrls;
      }
      await apiClient.updateUser(user.id, updateData);
      toast({ title: "Profile updated successfully" });
      setEditing(false);
      // Refresh user profile
      const updated = await apiClient.getProfile();
      setUser(updated);
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
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
              
              {user?.verified && (
                <div className="mt-6 border border-green-500 rounded-lg bg-green-50 p-2 shadow-sm">
                  <div className="flex items-center mb-4">
                    <span className="text-green-700 font-bold text-md lg:text-lg mr-2 text-balance">Verified Supplier Details</span>
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-semibold text-gray-700">Company Name:</div>
                    <div>{user?.company_name || "-"}</div>
                    <div className="font-semibold text-gray-700">Company Address:</div>
                    <div>{user?.company_address || "-"}</div>
                    <div className="font-semibold text-gray-700">Location:</div>
                    <div>{user?.location || "-"}</div>
                    <div className="font-semibold text-gray-700">Pin:</div>
                    <div>{user?.pin || "-"}</div>
                    <div className="font-semibold text-gray-700">WhatsApp No:</div>
                    <div>{user?.whatsapp || "-"}</div>
                    <div className="font-semibold text-gray-700">GST:</div>
                    <div>{user?.gst || "-"}</div>
                    <div className="font-semibold text-gray-700">Years Experience:</div>
                    <div>{user?.years_experience || "-"}</div>
                  </div>
                  {user?.factory_videos && Array.isArray(user.factory_videos) && (
                    <div className="mt-4">
                      <span className="font-semibold text-gray-700">Factory Videos:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {user.factory_videos.map((url: string, idx: number) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full border border-green-300 hover:bg-green-200 transition"
                          >
                            Video {idx + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <Button className="mt-6 w-full" onClick={handleLogout} variant="destructive">
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
        {user.user_metadata?.user_type === "user" && (
          !editing ? (
            <Button className="mt-6 w-full" onClick={() => setEditing(true)}>
              Edit Profile
            </Button>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleProfileUpdate}>
              <Card>
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    name="company_name"
                    placeholder="Company Name"
                    value={form.company_name}
                    onChange={handleEditChange}
                  />
                  <Input
                    name="company_address"
                    placeholder="Company Address"
                    value={form.company_address}
                    onChange={handleEditChange}
                  />
                  <Input
                    name="location"
                    placeholder="Location"
                    value={form.location}
                    onChange={handleEditChange}
                  />
                  <Input
                    name="pin"
                    placeholder="Pin Code"
                    value={form.pin}
                    onChange={handleEditChange}
                  />
                  <Input
                    name="whatsapp"
                    placeholder="WhatsApp Number"
                    value={form.whatsapp}
                    onChange={handleEditChange}
                  />
                  <Input
                    name="gst"
                    placeholder="GST Number"
                    value={form.gst}
                    onChange={handleEditChange}
                  />
                  <Input
                    name="years_experience"
                    placeholder="Years of Experience"
                    value={form.years_experience}
                    onChange={handleEditChange}
                    type="number"
                    min="0"
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="verified"
                      checked={form.verified}
                      onChange={handleEditChange}
                      id="verified"
                    />
                    <label htmlFor="verified">Become a Verified Supplier/Manufacturer</label>
                  </div>
                  {form.verified && (
                    <div>
                      <label className="block mb-1">Upload Factory Videos</label>
                      <input
                        type="file"
                        accept="video/*"
                        multiple
                        onChange={handleVideoChange}
                        disabled={uploading}
                      />
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <Button type="submit" className="w-full" disabled={uploading}>
                      {uploading ? "Saving..." : "Save"}
                    </Button>
                    <Button type="button" className="w-full" variant="secondary" onClick={() => setEditing(false)} disabled={uploading}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          )
        )}
      </main>
    </div>
  );
};

export default Profile; 