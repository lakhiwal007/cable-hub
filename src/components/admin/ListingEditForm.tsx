import React, { useState } from "react";

interface ListingEditFormProps {
  listing: any;
  onSave: (updatedListing: any) => void;
  onCancel: () => void;
}

const ListingEditForm: React.FC<ListingEditFormProps> = ({ listing, onSave, onCancel }) => {
  const [form, setForm] = useState({ ...listing });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div>
        <label>Title</label>
        <input name="title" value={form.title} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
      </div>
      <div>
        <label>Category</label>
        <input name="category" value={form.category} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
      </div>
      <div>
        <label>Material</label>
        <input name="material_type" value={form.material_type} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
      </div>
      <div>
        <label>Quantity</label>
        <input name="available_quantity" value={form.available_quantity || form.required_quantity} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
      </div>
      <div className="flex gap-2 mt-2">
        <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">Save</button>
        <button type="button" onClick={onCancel} className="bg-gray-300 px-3 py-1 rounded">Cancel</button>
      </div>
    </form>
  );
};

export default ListingEditForm; 