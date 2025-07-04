import React from "react";

interface AdminStatsPanelProps {
  stats: any;
}

const AdminStatsPanel: React.FC<AdminStatsPanelProps> = ({ stats }) => (
  <div className="p-4 bg-gray-100 rounded mb-4">
    <h2 className="text-lg font-semibold mb-2">Admin Dashboard</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded shadow">
        <div className="text-sm text-gray-500">Users</div>
        <div className="text-2xl font-bold">{stats.users}</div>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <div className="text-sm text-gray-500">Materials</div>
        <div className="text-2xl font-bold">{stats.materials}</div>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <div className="text-sm text-gray-500">Supply Listings</div>
        <div className="text-2xl font-bold">{stats.supplyListings}</div>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <div className="text-sm text-gray-500">Demand Listings</div>
        <div className="text-2xl font-bold">{stats.demandListings}</div>
      </div>
    </div>
  </div>
);

export default AdminStatsPanel; 