import React from "react";

interface UserListProps {
  users: any[];
  onEdit: (user: any) => void;
  onDelete: (userId: string) => void;
}

const UserList: React.FC<UserListProps> = ({ users, onEdit, onDelete }) => (
  <div>
    <h2 className="text-lg font-semibold mb-2">Users</h2>
    <table className="w-full">
      <thead>
        <tr>
          <th>Name</th><th>Email</th><th>Type</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.user_type}</td>
            <td>
              <button onClick={() => onEdit(user)} className="text-blue-600 mr-2">Edit</button>
              <button onClick={() => onDelete(user.id)} className="text-red-600">Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default UserList; 