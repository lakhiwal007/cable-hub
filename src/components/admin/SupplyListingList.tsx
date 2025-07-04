import React from "react";

interface SupplyListingListProps {
  listings: any[];
  onEdit: (listing: any) => void;
  onDelete: (listingId: string) => void;
}

const SupplyListingList: React.FC<SupplyListingListProps> = ({ listings, onEdit, onDelete }) => (
  <div>
    <h2 className="text-lg font-semibold mb-2">Supply Listings</h2>
    <table className="w-full">
      <thead>
        <tr>
          <th>Title</th><th>Category</th><th>Material</th><th>Quantity</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {listings.map(listing => (
          <tr key={listing.id}>
            <td>{listing.title}</td>
            <td>{listing.category}</td>
            <td>{listing.material_type}</td>
            <td>{listing.available_quantity}</td>
            <td>
              <button onClick={() => onEdit(listing)} className="text-blue-600 mr-2">Edit</button>
              <button onClick={() => onDelete(listing.id)} className="text-red-600">Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default SupplyListingList; 