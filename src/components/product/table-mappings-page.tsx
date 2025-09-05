'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllTableMappingsAction, updateTableMappingAction, invalidateTableMappingCachesAction } from '@/lib/actions-table-mappings';
import { getTableDisplayName } from '@/lib/table-utils';
import { IconCalendar, IconDatabase, IconEdit, IconUser, IconPhoto, IconRefresh } from '@tabler/icons-react';
import Image from 'next/image';
import React, { useState } from 'react';
import { EditTableMappingDialog } from './edit-table-mapping-dialog';

interface TableMapping {
  xataId: string;
  clientId: string;
  tableName: string;
  customTableName: string | null;
  imageUrl: string | null;
  tableSchema: string;
  description: string | null;
  isActive: string;
  xataCreatedat: string;
  xataUpdatedat: string;
  client: {
    name: string;
    company: string;
  };
}

export function TableMappingsPage({ promiseData }: { promiseData: ReturnType<typeof getAllTableMappingsAction> }) {
  // React experimental use() hook to unwrap promises
  const initialData = React.use(promiseData);

  const [tableMappings, setTableMappings] = useState<TableMapping[]>((initialData?.mappings as TableMapping[]) || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingMapping, setEditingMapping] = useState<TableMapping | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const loadTableMappings = async () => {
    try {
      const result = await getAllTableMappingsAction();
      if (result.success) {
        setTableMappings((result.mappings as TableMapping[]) || []);
      }
    } catch (error) {
      console.error('Error loading table mappings:', error);
    }
  };

  const handleUpdateMapping = async (mappingId: string, updates: {
    customTableName?: string;
    description?: string;
    isActive?: string;
  }) => {
    try {
      const result = await updateTableMappingAction(mappingId, updates);
      if (result.success) {
        await loadTableMappings();
        setEditingMapping(null);
      }
    } catch (error) {
      console.error('Error updating table mapping:', error);
    }
  };

  const filteredMappings = tableMappings.filter(mapping => {
    const matchesSearch =
      mapping.tableName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mapping.customTableName && mapping.customTableName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      mapping.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mapping.client.company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || mapping.isActive === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getDisplayName = (mapping: TableMapping) => {
    return getTableDisplayName(mapping.tableName, mapping.customTableName);
  };

  const handleImageError = (mappingId: string) => {
    setImageErrors(prev => new Set(prev).add(mappingId));
  };

  const handleImageLoad = (mappingId: string) => {
    setImageErrors(prev => {
      const newSet = new Set(prev);
      newSet.delete(mappingId);
      return newSet;
    });
  };



  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search" className="sr-only">Search</Label>
          <Input
            id="search"
            placeholder="Search by table name, custom name, client, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Mappings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMappings.map((mapping) => (
          <Card key={mapping.xataId} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <IconDatabase className="h-5 w-5 text-blue-600" />
                    {getDisplayName(mapping)}
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {mapping.tableName}
                    </span>
                  </CardDescription>
                </div>
                <Badge variant={mapping.isActive === 'true' ? 'default' : 'secondary'}>
                  {mapping.isActive === 'true' ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>

            {/* Image Display */}
            {mapping.imageUrl && !imageErrors.has(mapping.xataId) && (
              <div className="px-6 pb-3">
                <div className="relative w-full h-32 bg-gray-50 rounded-md overflow-hidden">
                  <Image
                    src={mapping.imageUrl}
                    alt={`${getDisplayName(mapping)} preview`}
                    fill
                    className="object-cover"
                    onError={() => handleImageError(mapping.xataId)}
                    onLoad={() => handleImageLoad(mapping.xataId)}
                  />
                </div>
              </div>
            )}

            {/* Image Error State */}
            {mapping.imageUrl && imageErrors.has(mapping.xataId) && (
              <div className="px-6 pb-3">
                <div className="w-full h-32 bg-gray-100 rounded-md flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <IconPhoto className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-xs">Image failed to load</p>
                  </div>
                </div>
              </div>
            )}

            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <IconUser className="h-4 w-4" />
                <span className="font-medium">{mapping.client.name}</span>
                <span className="text-gray-400">•</span>
                <span>{mapping.client.company}</span>
              </div>

              {mapping.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {mapping.description}
                </p>
              )}

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <IconCalendar className="h-4 w-4" />
                <span>Updated: {new Date(mapping.xataUpdatedat).toLocaleDateString()}</span>
              </div>

              <div className="pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setEditingMapping(mapping)}
                >
                  <IconEdit className="h-4 w-4 mr-2" />
                  Edit Mapping
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMappings.length === 0 && (
        <div className="text-center py-12">
          <IconDatabase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No product mappings found</h3>
          <p className="text-gray-500">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'No table mappings have been created yet.'}
          </p>
        </div>
      )}

      {/* Edit Dialog */}
      {editingMapping && (
        <EditTableMappingDialog
          mapping={editingMapping}
          onClose={() => setEditingMapping(null)}
          onUpdate={handleUpdateMapping}
        />
      )}
    </div>
  );
}
