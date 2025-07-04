import React from "react";

interface MaterialListProps {
  materials: any[];
  onEdit: (material: any) => void;
  onDelete: (materialId: string) => void;
  onViewHistory: (materialId: string) => void;
}

const MaterialList: React.FC<MaterialListProps> = ({ materials, onEdit, onDelete, onViewHistory }) => (
  <div>
    <h2 className="text-lg font-semibold mb-2">Materials</h2>
    <table className="w-full">
      <thead>
        <tr>
          <th>Name</th><th>Price</th><th>Change</th><th>Trend</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {materials.map(material => (
          <tr key={material.id}>
            <td>{material.material}</td>
            <td>{material.price}</td>
            <td>{material.change}</td>
            <td>{material.trend}</td>
            <td>
              <button onClick={() => onEdit(material)} className="text-blue-600 mr-2">Edit</button>
              <button onClick={() => onDelete(material.id)} className="text-red-600 mr-2">Delete</button>
              <button onClick={() => onViewHistory(material.id)} className="text-green-600">View History</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default MaterialList; 