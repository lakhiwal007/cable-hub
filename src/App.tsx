import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams } from "react-router-dom";
import { useEffect } from "react";
import { App as CapacitorApp } from '@capacitor/app';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Footer from "@/components/Footer";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminPanel from "@/pages/AdminPanel";
import MarketplacePage from "@/pages/MarketplacePage";
import ProtectedRoute from "@/components/ProtectedRoute";
import ChatRoom from "@/components/ChatRoom";
import MyChats from "./pages/MyChats";
import Pricing from "./pages/Pricing";
import ListingDetails from "./pages/ListingDetails";

const queryClient = new QueryClient();

// Back button handler component
const BackButtonHandler = () => {
  
  useEffect(() => {
    const handler = CapacitorApp.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        // If web history allows back, go back
        window.history.back();
      } else {
        // If no history, exit the app
        CapacitorApp.exitApp();
      }
    });

    return () => {
      handler.then(handle => handle.remove());
    };
  }, []);

  return null;
};

function ChatRoomWrapper() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  if (!roomId) return <div>Invalid chat room</div>;
  return <ChatRoom roomId={roomId} onBack={() => navigate(-1)} />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <BackButtonHandler />
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/marketplace" element={
            <ProtectedRoute>
              <MarketplacePage />
            </ProtectedRoute>
          } />
          <Route path="/my-chats" element={
            <ProtectedRoute>
              <MyChats />
            </ProtectedRoute>
          } />
          <Route path="/pricing" element={
            <ProtectedRoute>
              <Pricing />
            </ProtectedRoute>
          } />
          <Route path="/listing/:listingType/:listingId" element={
            <ProtectedRoute>
              <ListingDetails />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute adminOnly={true}>
              <AdminPanel />
            </ProtectedRoute>
          } />
          <Route path="/chat/:roomId" element={<ChatRoomWrapper />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
