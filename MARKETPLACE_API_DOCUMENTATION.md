# Marketplace API Documentation

## Overview

The Cable Hub Connect marketplace system provides a comprehensive platform for suppliers and buyers to connect, list materials, and manage business relationships. This system includes supply listings, demand listings, and supplier contact management.

## Database Schema

### Tables Structure

1. **suppliers** - Supplier/vendor profiles
2. **buyers** - Buyer/manufacturer profiles  
3. **supply_listings** - Materials available for sale
4. **demand_listings** - Material requirements from buyers
5. **marketplace_contacts** - Contact requests between parties

## API Endpoints

### Supply Listings Management

#### Get Supply Listings
```typescript
// Get all supply listings with optional filters
const listings = await apiClient.getSupplyListings({
  category: 'copper',
  location: 'Delhi',
  price_min: 400,
  price_max: 500,
  material_type: 'Copper Wire',
  verified_only: true,
  urgent_only: false,
  search: 'high grade'
});
```

#### Get Supply Listing by ID
```typescript
// Get detailed information about a specific supply listing
const listing = await apiClient.getSupplyListingById('listing-uuid');
```

#### Create Supply Listing
```typescript
// Create a new supply listing
const newListing = await apiClient.createSupplyListing({
  title: 'High Grade Copper Wire 99.9% Pure',
  description: 'Premium quality copper wire suitable for electrical applications',
  category: 'copper',
  material_type: 'Copper Wire',
  grade_specification: '99.9% Pure, EC Grade',
  available_quantity: 5000,
  unit: 'kg',
  price_per_unit: 485.50,
  currency: 'INR',
  minimum_order: 100,
  location: 'Delhi, India',
  delivery_terms: 'FOB Delhi, 7-10 days delivery',
  certification: 'IS 8130, IEC 60228',
  is_urgent: false,
  expires_at: '2024-12-31T23:59:59Z'
});
```

#### Update Supply Listing
```typescript
// Update an existing supply listing
const updatedListing = await apiClient.updateSupplyListing('listing-uuid', {
  price_per_unit: 490.00,
  available_quantity: 4500,
  is_urgent: true
});
```

#### Delete Supply Listing
```typescript
// Delete a supply listing
await apiClient.deleteSupplyListing('listing-uuid');
```

### Demand Listings Management

#### Get Demand Listings
```typescript
// Get all demand listings with optional filters
const demands = await apiClient.getDemandListings({
  category: 'aluminum',
  location: 'Mumbai',
  budget_min: 150,
  budget_max: 170,
  material_type: 'Aluminum Conductor',
  urgent_only: true,
  search: 'conductor'
});
```

#### Get Demand Listing by ID
```typescript
// Get detailed information about a specific demand listing
const demand = await apiClient.getDemandListingById('demand-uuid');
```

#### Create Demand Listing
```typescript
// Create a new demand listing
const newDemand = await apiClient.createDemandListing({
  title: 'Copper Wire for Power Cable Manufacturing',
  description: 'Require high purity copper wire for manufacturing 11kV power cables',
  category: 'copper',
  material_type: 'Copper Wire',
  specifications: '99.9% Pure, Soft Annealed, 2.5mm diameter',
  required_quantity: 3000,
  unit: 'kg',
  budget_min: 480.00,
  budget_max: 490.00,
  currency: 'INR',
  location: 'Chennai, India',
  delivery_deadline: '15 days from order',
  additional_requirements: 'Must have IS 8130 certification',
  is_urgent: true,
  expires_at: '2024-12-31T23:59:59Z'
});
```

#### Update Demand Listing
```typescript
// Update an existing demand listing
const updatedDemand = await apiClient.updateDemandListing('demand-uuid', {
  budget_max: 495.00,
  is_urgent: false,
  delivery_deadline: '20 days from order'
});
```

#### Delete Demand Listing
```typescript
// Delete a demand listing
await apiClient.deleteDemandListing('demand-uuid');
```

### Supplier Contact Management

#### Get Supplier Profile
```typescript
// Get supplier profile information
const supplier = await apiClient.getSupplierProfile('supplier-uuid');
```

#### Create Supplier Profile
```typescript
// Create a new supplier profile
const supplierProfile = await apiClient.createSupplierProfile({
  name: 'Rajesh Kumar',
  email: 'rajesh@metalcorp.com',
  phone: '+91-9876543210',
  company_name: 'MetalCorp Industries Ltd',
  company_address: '123 Industrial Area, Delhi-110001',
  gst_number: '07AABCM1234M1ZX',
  website: 'https://metalcorp.com',
  description: 'Leading supplier of copper and aluminum products'
});
```

#### Update Supplier Profile
```typescript
// Update supplier profile
const updatedProfile = await apiClient.updateSupplierProfile({
  phone: '+91-9876543211',
  website: 'https://newwebsite.com',
  description: 'Updated description'
});
```

### Contact Supplier System

#### Contact Supplier
```typescript
// Send a contact request to a supplier
const contactRequest = await apiClient.contactSupplier({
  listing_id: 'supply-listing-uuid',
  listing_type: 'supply',
  requester_name: 'Sunita Gupta',
  requester_email: 'sunita@induscables.com',
  requester_phone: '+91-9876543220',
  message: 'Interested in your copper wire. Can you provide samples and detailed specifications?'
});
```

#### Get Contact Requests
```typescript
// Get all contact requests made by the current user
const contacts = await apiClient.getContactRequests();
```

#### Update Contact Status
```typescript
// Update the status of a contact request
const updatedContact = await apiClient.updateContactStatus('contact-uuid', 'responded');
```

### Search and Statistics

#### Search Marketplace
```typescript
// Search across both supply and demand listings
const results = await apiClient.searchMarketplace('copper wire', 'supply');
// Results: { supply: [...], demand: [...] }

// Search both supply and demand
const allResults = await apiClient.searchMarketplace('aluminum');
```

#### Get Marketplace Stats
```typescript
// Get overall marketplace statistics
const stats = await apiClient.getMarketplaceStats();
// Returns: { total_supply_listings: 150, total_demand_listings: 75, active_suppliers: 45 }
```

## Usage Examples

### Complete Supply Posting Flow

```typescript
// 1. Create supplier profile (if not exists)
const supplierProfile = await apiClient.createSupplierProfile({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+91-9876543210',
  company_name: 'ABC Materials Ltd',
  company_address: 'Industrial Area, Mumbai',
  gst_number: 'GST123456789'
});

// 2. Create supply listing
const listing = await apiClient.createSupplyListing({
  title: 'Premium Copper Wire',
  description: 'High quality copper wire for industrial use',
  category: 'copper',
  material_type: 'Copper Wire',
  grade_specification: '99.9% Pure',
  available_quantity: 1000,
  unit: 'kg',
  price_per_unit: 485.50,
  minimum_order: 50,
  location: 'Mumbai, India',
  delivery_terms: 'FOB Mumbai',
  certification: 'IS 8130'
});

console.log('Supply listing created:', listing.id);
```

### Complete Demand Posting Flow

```typescript
// 1. Create buyer profile (if not exists)
const buyerProfile = await apiClient.createSupplierProfile({
  name: 'Jane Smith',
  email: 'jane@buyer.com',
  phone: '+91-9876543211',
  company_name: 'XYZ Cables Ltd',
  company_address: 'Tech Park, Bangalore'
});

// 2. Create demand listing
const demand = await apiClient.createDemandListing({
  title: 'Need Aluminum Conductor',
  description: 'Urgent requirement for aluminum conductor',
  category: 'aluminum',
  material_type: 'Aluminum Conductor',
  specifications: 'AAC Grade, 185 sq mm',
  required_quantity: 2000,
  unit: 'kg',
  budget_min: 160.00,
  budget_max: 170.00,
  location: 'Bangalore, India',
  delivery_deadline: '10 days',
  is_urgent: true
});

console.log('Demand listing created:', demand.id);
```

### Contact Supplier Flow

```typescript
// 1. Find suitable supply listings
const listings = await apiClient.getSupplyListings({
  category: 'copper',
  location: 'Delhi',
  price_max: 500
});

// 2. Contact a supplier
const contactRequest = await apiClient.contactSupplier({
  listing_id: listings[0].id,
  listing_type: 'supply',
  requester_name: 'Buyer Name',
  requester_email: 'buyer@example.com',
  requester_phone: '+91-9876543220',
  message: 'I am interested in your copper wire listing. Please provide more details about pricing and availability.'
});

// 3. Track contact requests
const myContacts = await apiClient.getContactRequests();
console.log('My contact requests:', myContacts);
```

## Filter Options

### Supply Listing Filters
- `category`: Material category (copper, aluminum, pvc, steel, rubber)
- `location`: Geographic location (supports partial matching)
- `price_min`: Minimum price per unit
- `price_max`: Maximum price per unit
- `material_type`: Specific material type
- `verified_only`: Show only verified suppliers
- `urgent_only`: Show only urgent listings
- `search`: Search in title, description, and material type

### Demand Listing Filters
- `category`: Material category
- `location`: Geographic location
- `budget_min`: Minimum budget
- `budget_max`: Maximum budget
- `material_type`: Specific material type
- `urgent_only`: Show only urgent requirements
- `search`: Search in title, description, and material type

## Error Handling

```typescript
try {
  const listing = await apiClient.createSupplyListing(listingData);
  console.log('Success:', listing);
} catch (error) {
  console.error('Error:', error.message);
  // Handle specific error cases
  if (error.message.includes('Authentication required')) {
    // Redirect to login
  } else if (error.message.includes('validation')) {
    // Show validation errors
  }
}
```

## Authentication

All API endpoints require user authentication. Users must be logged in to:
- Create/update/delete their own listings
- Contact suppliers
- Manage their profile
- View detailed contact information

## Data Types

### Material Categories
- `copper`: Copper-based materials
- `aluminum`: Aluminum-based materials
- `pvc`: PVC compounds and materials
- `steel`: Steel materials
- `rubber`: Rubber compounds
- `xlpe`: Cross-linked polyethylene

### Common Units
- `kg`: Kilograms
- `mt`: Metric tons
- `m`: Meters
- `km`: Kilometers
- `pieces`: Individual pieces

### Contact Status
- `pending`: Initial contact request
- `responded`: Supplier has responded
- `closed`: Contact request closed

## Integration with UI Components

### Updating Marketplace Component

```typescript
// In your React component
const [supplyListings, setSupplyListings] = useState([]);
const [demandListings, setDemandListings] = useState([]);

useEffect(() => {
  const fetchData = async () => {
    try {
      const [supplies, demands] = await Promise.all([
        apiClient.getSupplyListings(),
        apiClient.getDemandListings()
      ]);
      setSupplyListings(supplies);
      setDemandListings(demands);
    } catch (error) {
      console.error('Error fetching marketplace data:', error);
    }
  };
  
  fetchData();
}, []);
```

### Handling Form Submissions

```typescript
const handleSupplySubmit = async (formData) => {
  try {
    const newListing = await apiClient.createSupplyListing(formData);
    setSupplyListings(prev => [newListing, ...prev]);
    // Show success message
  } catch (error) {
    // Show error message
  }
};
```

## Best Practices

1. **Always validate user input** before making API calls
2. **Handle loading states** during API requests
3. **Implement proper error handling** for network issues
4. **Use optimistic updates** for better UX
5. **Cache frequently accessed data** to reduce API calls
6. **Implement pagination** for large result sets
7. **Add debouncing** for search functionality

## Database Migration

To set up the marketplace database schema:

1. Run the SQL migration file: `supabase/migrations/marketplace_schema.sql`
2. This will create all necessary tables, indexes, and sample data
3. The migration includes proper foreign key relationships and constraints

## Security

- Row Level Security (RLS) policies ensure users can only access appropriate data
- Authentication is required for all write operations
- Input validation prevents SQL injection and other attacks
- Rate limiting should be implemented for API endpoints

## Performance Considerations

- Database indexes are optimized for common query patterns
- Use appropriate filters to limit result sets
- Consider implementing caching for frequently accessed data
- Monitor query performance and optimize as needed

This marketplace API system provides a robust foundation for connecting suppliers and buyers in the cable and raw materials industry. 