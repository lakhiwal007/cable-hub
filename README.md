# Cable Hub Connect

A modern web application for cable management and electrical calculations, built with React, TypeScript, and Supabase.

## Features

- **User Authentication**: Secure registration and login with Supabase Auth
- **Pricing Management**: Real-time cable and material pricing data
- **Marketplace**: Browse and list cable products and services
- **Electrical Calculators**: 
  - Raw material calculations
  - Pricing calculations
  - Electrical performance calculations
- **Admin Panel**: User management and system administration
- **Mobile Responsive**: Works seamlessly on all devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase Edge Functions (serverless)
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Hosting**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cable-hub-connect.git
cd cable-hub-connect
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new project at [Supabase](https://supabase.com)
   - Copy `env.example` to `.env`
   - Fill in your Supabase credentials

4. Deploy Edge Functions:
```bash
# Install Supabase CLI
npm install -g supabase

# Login and link project
supabase login
supabase link --project-ref your-project-id

# Deploy functions
supabase functions deploy auth
supabase functions deploy user-profile
supabase functions deploy pricing
supabase functions deploy marketplace
supabase functions deploy calculator
supabase functions deploy admin
```

5. Set up database tables (see `SUPABASE_MIGRATION.md` for SQL scripts)

6. Start the development server:
```bash
npm run dev
```

## Project Structure

```
cable-hub-connect/
├── src/
│   ├── components/          # React components
│   ├── pages/              # Page components
│   ├── lib/                # Utilities and API client
│   ├── hooks/              # Custom React hooks
│   └── ...
├── supabase/
│   ├── functions/          # Edge Functions
│   │   ├── auth/           # Authentication endpoints
│   │   ├── pricing/        # Pricing data endpoints
│   │   ├── marketplace/    # Marketplace endpoints
│   │   ├── calculator/     # Calculator endpoints
│   │   ├── admin/          # Admin endpoints
│   │   └── _shared/        # Shared utilities
│   └── config.toml         # Supabase configuration
├── public/                 # Static assets
└── ...
```

## API Endpoints

### Authentication
- `POST /functions/v1/auth/register` - User registration
- `POST /functions/v1/auth/login` - User login
- `POST /functions/v1/auth/logout` - User logout

### User Management
- `GET /functions/v1/user-profile` - Get user profile

### Pricing
- `GET /functions/v1/pricing` - Get pricing data
- `POST /functions/v1/pricing` - Create pricing entry (Admin)
- `PUT /functions/v1/pricing/:id` - Update pricing entry (Admin)
- `DELETE /functions/v1/pricing/:id` - Delete pricing entry (Admin)

### Marketplace
- `GET /functions/v1/marketplace` - Get marketplace listings

### Calculators
- `POST /functions/v1/calculator/raw-material` - Raw material calculations
- `POST /functions/v1/calculator/pricing` - Pricing calculations
- `POST /functions/v1/calculator/electrical` - Electrical calculations

### Admin
- `GET /functions/v1/admin/users` - Get all users (Admin)
- `PUT /functions/v1/admin/users/:id` - Update user (Admin)
- `DELETE /functions/v1/admin/users/:id` - Delete user (Admin)
- `POST /functions/v1/admin/promote/:email` - Promote user to admin

## Environment Variables

Create a `.env` file with the following variables:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Migration from Express Server

If you're migrating from the previous Express.js server setup, see `SUPABASE_MIGRATION.md` for detailed migration instructions.

## Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Edge Functions

Functions are deployed using the Supabase CLI:

```bash
supabase functions deploy
```

## Development

### Running Locally

```bash
# Start frontend
npm run dev

# Start Supabase functions locally (optional)
supabase functions serve
```

### Testing

```bash
# Run tests
npm test

# Run linting
npm run lint

# Type checking
npm run type-check
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.

## Support

For support and questions:
- Create an issue in this repository
- Check the `SUPABASE_MIGRATION.md` for common setup issues
- Review Supabase documentation at https://supabase.com/docs

## Changelog

### v2.0.0
- **BREAKING**: Migrated from Express.js server to Supabase Edge Functions
- Improved authentication with Supabase Auth
- Better scalability and cost efficiency
- Simplified deployment process

### v1.0.0
- Initial release with Express.js server
- Basic authentication and user management
- Calculator functions
- Admin panel
