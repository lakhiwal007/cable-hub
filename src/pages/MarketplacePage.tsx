import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Menu, X, LogOut, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import Marketplace from "@/components/Marketplace";
import apiClient from "@/lib/apiClient";

const MarketplacePage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const storedUserType = localStorage.getItem('userType');
    if (storedUserType) {
      setUserType(storedUserType);
      fetchUserProfile();
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const profile = await apiClient.getProfile();
      setUserEmail(profile.email);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.logout();
      navigate("/login");
    } catch (error) {
      console.error('Logout error:', error);
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 top-0 sticky z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                
              </button>
              
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              <button
                onClick={() => navigate('/my-chats')}
                className="flex items-center px-4 py-2 rounded-xl text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 transition-all duration-200"
              >
                My Chats
              </button>
              <button
                onClick={() => navigate('/used-dead-stock-listings')}
                className="flex items-center px-4 py-2 rounded-xl text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 border border-green-200 transition-all duration-200"
              >
                Used/Dead Stock
              </button>
              {userType === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center px-4 py-2 rounded-xl text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 transition-all duration-200"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Admin Panel
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 pt-2 pb-3 space-y-1">
              <button
                onClick={() => {
                  navigate('/');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-3 py-2 rounded-lg text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-3" />
                
              </button>
              <button
                onClick={() => {
                  navigate('/my-chats');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-3 py-2 rounded-lg text-base font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 transition-colors"
              >
                My Chats
              </button>
              <button
                onClick={() => {
                  navigate('/used-dead-stock-listings');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-3 py-2 rounded-lg text-base font-medium text-green-600 hover:text-green-700 hover:bg-green-50 border border-green-200 transition-colors"
              >
                Used/Dead Stock
              </button>
              {userType === 'admin' && (
                <button
                  onClick={() => {
                    navigate('/admin');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 rounded-lg text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 transition-colors"
                >
                  <Settings className="h-5 w-5 mr-3" />
                  Admin Panel
                </button>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-3 py-2 rounded-lg text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Marketplace />
      </main>
    </div>
  );
};

export default MarketplacePage; 