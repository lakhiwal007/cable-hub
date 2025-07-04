import React, { useState } from "react";

interface CalculationSettingsFormProps {
  settings: any;
  onSave: (updatedSettings: any) => void;
  onCancel: () => void;
}

const CalculationSettingsForm: React.FC<CalculationSettingsFormProps> = ({ settings, onSave, onCancel }) => {
  const [form, setForm] = useState({ ...settings });

  const handleChange = (category: string, key: string, value: number) => {
    setForm((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="font-semibold">Material Densities</h3>
        {Object.entries(form.materialDensities || {}).map(([key, value]) => (
          <div key={key}>
            <label>{key}</label>
            <input
              type="number"
              value={value}
              onChange={e => handleChange('materialDensities', key, Number(e.target.value))}
              className="border rounded px-2 py-1 w-full"
            />
          </div>
        ))}
      </div>
      <div>
        <h3 className="font-semibold">Cost Factors</h3>
        {Object.entries(form.costFactors || {}).map(([key, value]) => (
          <div key={key}>
            <label>{key}</label>
            <input
              type="number"
              value={value}
              onChange={e => handleChange('costFactors', key, Number(e.target.value))}
              className="border rounded px-2 py-1 w-full"
            />
          </div>
        ))}
      </div>
      <div>
        <h3 className="font-semibold">Calculation Constants</h3>
        {Object.entries(form.calculationConstants || {}).map(([key, value]) => (
          <div key={key}>
            <label>{key}</label>
            <input
              type="number"
              value={value}
              onChange={e => handleChange('calculationConstants', key, Number(e.target.value))}
              className="border rounded px-2 py-1 w-full"
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">Save</button>
        <button type="button" onClick={onCancel} className="bg-gray-300 px-3 py-1 rounded">Cancel</button>
      </div>
    </form>
  );
};

export default CalculationSettingsForm; 