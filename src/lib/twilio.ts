// Twilio configuration
const accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
const fromNumber = import.meta.env.VITE_TWILIO_WHATSAPP_NUMBER; // Your Twilio WhatsApp number

export interface WhatsAppMessage {
  to: string;
  body: string;
  from?: string;
}

export class TwilioService {
  /**
   * Send a WhatsApp message using Twilio REST API
   * @param message - The message object containing to, body, and optional from
   * @returns Promise with the message result
   */
  static async sendWhatsAppMessage(message: WhatsAppMessage): Promise<any> {
    try {
      if (!accountSid || !authToken || !fromNumber) {
        throw new Error('Twilio credentials not configured');
      }

      // Format the phone number for WhatsApp
      const formattedTo = this.formatPhoneNumberForWhatsApp(message.to);
      const formattedFrom = `whatsapp:${fromNumber}`;

      // Create Basic Auth header
      const credentials = btoa(`${accountSid}:${authToken}`);
      
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          Body: message.body,
          From: formattedFrom,
          To: `whatsapp:${formattedTo}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Twilio API Error: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }

  /**
   * Format phone number for WhatsApp (remove + and add country code if needed)
   * @param phoneNumber - The phone number to format
   * @returns Formatted phone number
   */
  private static formatPhoneNumberForWhatsApp(phoneNumber: string): string {
    // Remove any non-digit characters except +
    let cleaned = phoneNumber.replace(/[^\d+]/g, '');
    
    // If no country code, assume India (+91)
    if (!cleaned.startsWith('+')) {
      if (cleaned.startsWith('91')) {
        cleaned = '+' + cleaned;
      } else if (cleaned.length === 10) {
        cleaned = '+91' + cleaned;
      } else {
        cleaned = '+91' + cleaned;
      }
    }
    
    return cleaned;
  }

  /**
   * Generate a WhatsApp contact message for marketplace listings
   * @param listingTitle - The title of the listing
   * @param listingType - Type of listing (supply/demand)
   * @param contactName - Name of the person contacting
   * @param contactEmail - Email of the person contacting
   * @param customMessage - Optional custom message
   * @returns Formatted message body
   */
  static generateMarketplaceMessage(
    listingTitle: string,
    listingType: 'supply' | 'demand',
    contactName: string,
    contactEmail: string,
    customMessage?: string
  ): string {
    const baseMessage = `Hi! I'm interested in your ${listingType} listing: "${listingTitle}"

My details:
- Name: ${contactName}${contactEmail ? `\n- Email: ${contactEmail}` : ''}

${customMessage || 'Please provide more details about your listing and availability.'}

Best regards,
${contactName}`;

    return baseMessage;
  }

  /**
   * Generate a WhatsApp contact message for specs marketplace
   * @param documentTitle - The title of the document
   * @param documentType - Type of document (spec/gtp/format)
   * @param contactName - Name of the person contacting
   * @param contactEmail - Email of the person contacting
   * @param customMessage - Optional custom message
   * @returns Formatted message body
   */
  static generateSpecsMessage(
    documentTitle: string,
    documentType: 'spec' | 'gtp' | 'format',
    contactName: string,
    contactEmail: string,
    customMessage?: string
  ): string {
    const baseMessage = `Hi! I'm interested in your ${documentType.toUpperCase()} document: "${documentTitle}"

My details:
- Name: ${contactName}${contactEmail ? `\n- Email: ${contactEmail}` : ''}

${customMessage || 'Please provide more information about this document and pricing.'}

Best regards,
${contactName}`;

    return baseMessage;
  }

  /**
   * Generate a WhatsApp contact message for consulting
   * @param consultantName - Name of the consultant
   * @param contactName - Name of the person contacting
   * @param contactEmail - Email of the person contacting
   * @param customMessage - Optional custom message
   * @returns Formatted message body
   */
  static generateConsultingMessage(
    consultantName: string,
    contactName: string,
    contactEmail: string,
    customMessage?: string
  ): string {
    const baseMessage = `Hi ${consultantName}! I'm interested in your consulting services.

My details:
- Name: ${contactName}${contactEmail ? `\n- Email: ${contactEmail}` : ''}

${customMessage || 'Please provide more information about your consulting services and availability.'}

Best regards,
${contactName}`;

    return baseMessage;
  }
}

export default TwilioService; 