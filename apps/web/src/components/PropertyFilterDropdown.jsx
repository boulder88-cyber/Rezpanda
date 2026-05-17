import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";

const PropertyFilterDropdown = ({ value = 'My Properties', onChange }) => {
  return (
    <Select value={value} onValueChange={onChange} defaultValue="My Properties">
      <SelectTrigger className="w-[180px] rounded-lg shadow-md transition-all duration-200 bg-white border-slate-200 hover:border-blue-300 focus:ring-blue-500">
        <SelectValue placeholder="Select filter" />
      </SelectTrigger>
      <SelectContent className="rounded-lg shadow-lg border-slate-200">
        <SelectItem value="My Properties" className="cursor-pointer hover:bg-slate-50">
          My Properties
        </SelectItem>
        <SelectItem value="Vacant" className="cursor-pointer hover:bg-slate-50">
          Vacant
        </SelectItem>
        <SelectItem value="Occupied" className="cursor-pointer hover:bg-slate-50">
          Occupied
        </SelectItem>
        <SelectItem value="Maintenance" className="cursor-pointer hover:bg-slate-50">
          Maintenance
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default PropertyFilterDropdown;