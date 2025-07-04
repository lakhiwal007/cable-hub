import React, { useState } from "react";

interface AddMaterialFormProps {
  onAdd: (newMaterial: any) => void;
  onCancel: () => void;
}

const AddMaterialForm: React.FC<AddMaterialFormProps> = ({ onAdd, onCancel }) => {
  const [form, setForm] = useState({ material: '', price: '', change: '', trend: 'up' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div>
        <label>Material Name</label>
        <input name="material" value={form.material} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
      </div>
      <div>
        <label>Price</label>
        <input name="price" value={form.price} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
      </div>
      <div>
        <label>Change</label>
        <input name="change" value={form.change} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
      </div>
      <div>
        <label>Trend</label>
        <select name="trend" value={form.trend} onChange={handleChange} className="border rounded px-2 py-1 w-full">
          <option value="up">Up</option>
          <option value="down">Down</option>
        </select>
      </div>
      <div className="flex gap-2 mt-2">
        <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">Add</button>
        <button type="button" onClick={onCancel} className="bg-gray-300 px-3 py-1 rounded">Cancel</button>
      </div>
    </form>
  );
};

export default AddMaterialForm; 