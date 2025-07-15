import React, { useState } from 'react';
import { Button } from './button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './dialog';
import { Input } from './input';
import { Label } from './label';
import { Textarea } from './textarea';
import { MessageCircle, Loader2 } from 'lucide-react';
import TwilioService from '../../lib/twilio';
import { useToast } from '../../hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../lib/apiClient';

interface ContactDialogProps {
  phoneNumber: string;
  contactName?: string;
  listingTitle?: string;
  listingType?: 'supply' | 'demand';
  listingId?: string;
  supplierId?: string;
  buyerId?: string;
  documentTitle?: string;
  documentType?: 'spec' | 'gtp' | 'format';
  consultantName?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

export const WhatsAppContact: React.FC<ContactDialogProps> = ({
  phoneNumber,
  contactName = '',
  listingTitle,
  listingType,
  listingId,
  supplierId,
  buyerId,
  documentTitle,
  documentType,
  consultantName,
  variant = 'default',
  size = 'default',
  className = '',
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: contactName,
    message: ''
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleOpenDialog = () => {
    setIsOpen(true);
  };

  const handleSendMessage = async () => {
    setIsLoading(true);
    try {
      let messageBody = formData.message || '';
      let chatResult = null;
      // Send WhatsApp message (Twilio or fallback)
      const accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
      const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
      const fromNumber = import.meta.env.VITE_TWILIO_WHATSAPP_NUMBER;
      if (accountSid && authToken && fromNumber) {
        await TwilioService.sendWhatsAppMessage({
          to: phoneNumber,
          body: messageBody
        });
      } else {
        // Fallback: Open WhatsApp web with prefilled message
        const formattedNumber = phoneNumber.replace(/[^ 9+]/g, '');
        const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(messageBody)}`;
        window.open(whatsappUrl, '_blank');
      }
      // Create or open chat room
      if (listingType === 'supply' && listingId && supplierId) {
        const currentUser = await apiClient.getProfile();
        chatResult = await apiClient.contactSupplierWithChat({
          listing_id: listingId,
          listing_type: 'supply',
          supplier_id: supplierId,
          requester_name: currentUser.user_metadata?.name || '',
          requester_email: currentUser.email || '',
          requester_phone: '',
          message: messageBody
        });
      } else if (listingType === 'demand' && listingId && buyerId) {
        const currentUser = await apiClient.getProfile();
        chatResult = await apiClient.contactConsumerWithChat({
          listing_id: listingId,
          listing_type: 'demand',
          buyer_id: buyerId,
          supplier_name: currentUser.user_metadata?.name || '',
          supplier_email: currentUser.email || '',
          supplier_phone: '',
          message: messageBody
        });
      }
      toast({
        title: 'Message sent!',
        description: 'Your message has been sent successfully.',
      });
      setIsOpen(false);
      setFormData({ name: contactName, message: '' });
      // Always send the message to the chat room, even if it already existed
      if (chatResult && chatResult.chat_room) {
        await apiClient.sendMessage({
          chat_room_id: chatResult.chat_room.id,
          message_text: messageBody,
          message_type: 'text',
        });
        navigate(`/chat/${chatResult.chat_room.id}`);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={`${className} ${isLoading ? 'opacity-50' : ''}`}
        onClick={handleOpenDialog}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <MessageCircle className="h-4 w-4 mr-2" />
        )}
        {children || 'Contact'}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Contact</DialogTitle>
            <DialogDescription>
              Send a message to the contact {phoneNumber}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!contactName && (
              <div>
                <Label htmlFor="name">Your Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter your name"
                />
              </div>
            )}

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Type your message..."
                rows={4}
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || (!formData.name && !contactName) || !formData.message}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WhatsAppContact; 