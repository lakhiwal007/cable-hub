import React, { useState } from 'react';
import { Button } from './button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './dialog';
import { Input } from './input';
import { Label } from './label';
import { Textarea } from './textarea';
import { MessageCircle, Phone, Loader2 } from 'lucide-react';
import TwilioService from '../../lib/twilio';
import { useToast } from '../../hooks/use-toast';

interface WhatsAppContactProps {
  phoneNumber: string;
  contactName?: string;
  listingTitle?: string;
  listingType?: 'supply' | 'demand';
  documentTitle?: string;
  documentType?: 'spec' | 'gtp' | 'format';
  consultantName?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

export const WhatsAppContact: React.FC<WhatsAppContactProps> = ({
  phoneNumber,
  contactName = '',
  listingTitle,
  listingType,
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

  const handleOpenDialog = () => {
    // Check if Twilio is configured
    const accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
    const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
    const fromNumber = import.meta.env.VITE_TWILIO_WHATSAPP_NUMBER;
    
    if (!accountSid || !authToken || !fromNumber) {
      // Fallback: Open WhatsApp directly
      const formattedNumber = phoneNumber.replace(/[^\d+]/g, '');
      const whatsappUrl = `https://wa.me/${formattedNumber}`;
      window.open(whatsappUrl, '_blank');
      return;
    }
    
    if (!contactName) {
      setIsOpen(true);
    } else {
      handleSendMessage();
    }
  };

  const handleSendMessage = async (customMessage?: string) => {
    setIsLoading(true);
    try {
      let messageBody = '';

      if (listingTitle && listingType) {
        messageBody = TwilioService.generateMarketplaceMessage(
          listingTitle,
          listingType,
          formData.name || contactName,
          '', // No email
          customMessage || formData.message
        );
      } else if (documentTitle && documentType) {
        messageBody = TwilioService.generateSpecsMessage(
          documentTitle,
          documentType,
          formData.name || contactName,
          '', // No email
          customMessage || formData.message
        );
      } else if (consultantName) {
        messageBody = TwilioService.generateConsultingMessage(
          consultantName,
          formData.name || contactName,
          '', // No email
          customMessage || formData.message
        );
      } else {
        messageBody = `Hi! I'm interested in your services.

My details:
- Name: ${formData.name || contactName}

${customMessage || formData.message || 'Please provide more information about your services.'}

Best regards,
${formData.name || contactName}`;
      }

      await TwilioService.sendWhatsAppMessage({
        to: phoneNumber,
        body: messageBody
      });

      toast({
        title: "Message sent!",
        description: "Your WhatsApp message has been sent successfully.",
      });

      setIsOpen(false);
      setFormData({ name: contactName, message: '' });
    } catch (error: any) {
      console.error('Error sending WhatsApp message:', error);
      
      // Check if it's a configuration error
      if (error.message?.includes('credentials not configured')) {
        toast({
          title: "Configuration Required",
          description: "WhatsApp messaging is not configured. Please contact the administrator.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to send WhatsApp message. Please try again.",
          variant: "destructive",
        });
      }
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
        {children || 'Contact via WhatsApp'}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Contact via WhatsApp</DialogTitle>
            <DialogDescription>
              Send a WhatsApp message to {phoneNumber}
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
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Add a custom message..."
                rows={4}
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
                disabled={isLoading || (!formData.name && !contactName)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Phone className="h-4 w-4 mr-2" />
                    Send WhatsApp
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