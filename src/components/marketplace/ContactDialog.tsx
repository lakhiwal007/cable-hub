import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { SupplyListing } from "@/lib/types";

interface ContactForm {
  name: string;
  email: string;
  message: string;
}

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: SupplyListing | null;
  contactForm: ContactForm;
  onContactFormChange: (form: ContactForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
}

const ContactDialog = ({ 
  open, 
  onOpenChange, 
  listing, 
  contactForm, 
  onContactFormChange, 
  onSubmit, 
  submitting 
}: ContactDialogProps) => {
  const navigate = useNavigate();
  if (!listing) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Contact Supplier</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold">{listing.title}</h4>
            <p className="text-sm text-gray-600">{listing.supplier?.name}</p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                value={contactForm.name}
                onChange={(e) => onContactFormChange({...contactForm, name: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={contactForm.email}
                onChange={(e) => onContactFormChange({...contactForm, email: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={contactForm.message}
                onChange={(e) => onContactFormChange({...contactForm, message: e.target.value})}
                placeholder="I'm interested in your listing. Please provide more details..."
                rows={4}
                required
              />
            </div>
            <div className="flex justify-between items-center">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/login')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Login to Chat
              </Button>
              <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Sending...' : 'Send Message'}
              </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactDialog; 