"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getTableDisplayName } from "@/lib/table-utils";

type AssignedTable = {
  xataId: string;
  tableName: string;
  customTableName: string | null;
  tableSchema: string;
  description: string | null;
  isActive: string;
  xataCreatedat: string;
};

interface TableSelectorProps {
  assignedTables: AssignedTable[];
  selectedTable: string | null;
  onTableChange: (value: string | null) => void;
}

export function TableSelector({ assignedTables, selectedTable, onTableChange }: TableSelectorProps) {
  // Convert null to "all" for the Select component
  const selectValue = selectedTable || "all";

  const handleTableChange = (value: string) => {
    if (value === "all") {
      onTableChange(null); // Pass null to indicate "all tables"
    } else {
      onTableChange(value); // Pass the selected table name
    }
  };

  return (
    <div className="flex justify-end mb-6">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">View stats for:</span>
        <Select 
          onValueChange={handleTableChange} 
          value={selectValue}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a table" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tables</SelectItem>
            {assignedTables.map(table => (
              <SelectItem key={table.tableName} value={table.tableName}>
                {getTableDisplayName(table.tableName, table.customTableName)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
