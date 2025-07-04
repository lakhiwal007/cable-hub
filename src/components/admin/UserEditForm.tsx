import React, { useState } from "react";

interface UserEditFormProps {
  user: any;
  onSave: (updatedUser: any) => void;
  onCancel: () => void;
}

const UserEditForm: React.FC<UserEditFormProps> = ({ user, onSave, onCancel }) => {
  const [form, setForm] = useState({ ...user });

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
        <label>Name</label>
        <input name="name" value={form.name} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
      </div>
      <div>
        <label>Email</label>
        <input name="email" value={form.email} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
      </div>
      <div>
        <label>User Type</label>
        <input name="user_type" value={form.user_type} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
      </div>
      <div className="flex gap-2 mt-2">
        <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">Save</button>
        <button type="button" onClick={onCancel} className="bg-gray-300 px-3 py-1 rounded">Cancel</button>
      </div>
    </form>
  );
};

export default UserEditForm; 