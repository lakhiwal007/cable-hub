import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useParams } from "react-router-dom";
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
import UsedAndDeadStockListings from "./pages/UsedAndDeadStockListings";
import PaidExpertConsulting from "./pages/PaidExpertConsulting";
import ConsultingListings from "./pages/ConsultingListings";
import MachinesMarketplace from "./pages/MachinesMarketplace";
import Team from "./pages/Team";
import SpecsMarketplace from "./pages/SpecsMarketplace";
import Features from "./pages/Features";
import ScrollToTop from "@/components/ScrollToTop";

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
        <ScrollToTop />
        <BackButtonHandler />
        <Routes>
          <Route path="/" element={
            
              <Index />
            
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/my-chats" element={
            <ProtectedRoute>
              <MyChats />
            </ProtectedRoute>
          } />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/team" element={<Team />} />
          <Route path="/listing/:listingType/:listingId" element={<ListingDetails />} />
          <Route path="/admin" element={
            <ProtectedRoute adminOnly={true}>
              <AdminPanel />
            </ProtectedRoute>
          } />
          <Route path="/chat/:roomId" element={<ChatRoomWrapper />} />
          <Route path="/used-dead-stock-listings" element={<UsedAndDeadStockListings />} />
          <Route path="/paid-expert-consulting" element={<PaidExpertConsulting />} />
          <Route path="/consulting-listings" element={<ConsultingListings />} />
          <Route path="/machines-marketplace" element={<MachinesMarketplace />} />
          
          <Route path="/specs-marketplace" element={<SpecsMarketplace />} />
          <Route path="/features" element={<Features />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
