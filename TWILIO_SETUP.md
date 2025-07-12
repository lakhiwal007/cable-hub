# Twilio WhatsApp Integration Setup

This application now includes WhatsApp messaging functionality using Twilio. Follow these steps to set it up:

## 1. Twilio Account Setup

1. Sign up for a Twilio account at [https://www.twilio.com/](https://www.twilio.com/)
2. Get your Account SID and Auth Token from the Twilio Console
3. Enable WhatsApp in your Twilio console

## 2. Environment Variables

Create a `.env` file in your project root and add the following variables:

```env
# Twilio Configuration
VITE_TWILIO_ACCOUNT_SID=your_account_sid_here
VITE_TWILIO_AUTH_TOKEN=your_auth_token_here
VITE_TWILIO_WHATSAPP_NUMBER=your_twilio_whatsapp_number_here
```

### Getting Your Twilio Credentials:

1. **Account SID**: Found in your Twilio Console dashboard
2. **Auth Token**: Found in your Twilio Console dashboard (click "Show" to reveal)
3. **WhatsApp Number**: Your Twilio WhatsApp number (format: +14155238886)

## 3. WhatsApp Setup

1. In your Twilio Console, go to "Messaging" → "Try it out" → "Send a WhatsApp message"
2. Follow the instructions to enable WhatsApp for your account
3. Note your WhatsApp number (it will be different from your regular Twilio phone number)

## 4. Features

The WhatsApp integration is now available in:

- **Marketplace Listings**: Contact suppliers/buyers via WhatsApp
- **Specs Marketplace**: Contact document uploaders via WhatsApp
- **Consulting Services**: Contact consultants via WhatsApp

## 5. How It Works

When users click the "WhatsApp" button:
1. A dialog opens asking for their name and email (if not already provided)
2. They can add a custom message
3. The system sends a formatted WhatsApp message via Twilio
4. Users receive a success/error notification

## 6. Message Format

The system automatically formats messages with:
- User's name and email
- Listing/document details
- Custom message (optional)
- Professional signature

## 7. Security Notes

- Never commit your `.env` file to version control
- Keep your Auth Token secure
- Consider using environment-specific credentials for production

## 8. Troubleshooting

If messages aren't sending:
1. Check your Twilio credentials are correct
2. Ensure WhatsApp is enabled in your Twilio console
3. Verify your WhatsApp number is in the correct format
4. Check the browser console for error messages

## 9. Cost

- Twilio charges per message sent
- WhatsApp messages have different pricing than SMS
- Check Twilio's pricing page for current rates 