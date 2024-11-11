import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';

export const InvoiceItemsTable = ({ items, onUpdate, onRemove, onAdd }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Invoice Items</h3>
        <Button onClick={onAdd} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead className="w-[150px]">Rate</TableHead>
            <TableHead className="w-[150px]">Quantity</TableHead>
            <TableHead className="w-[100px]">Date Range</TableHead>
            <TableHead className="w-[100px]">Amount</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={item.id}>
              <TableCell>
                <Input
                  value={item.description}
                  onChange={(e) => onUpdate({ ...item, description: e.target.value })}
                  placeholder="Item description"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={item.rate}
                  onChange={(e) => onUpdate({ ...item, rate: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => onUpdate({ ...item, quantity: e.target.value })}
                  placeholder="1"
                  step="0.5"
                />
              </TableCell>
              <TableCell className="text-center">
                <Checkbox
                  checked={item.hasDateRange}
                  onCheckedChange={(checked) => 
                    onUpdate({ ...item, hasDateRange: checked })
                  }
                />
              </TableCell>
              <TableCell className="text-right">
                {(parseFloat(item.rate) * parseFloat(item.quantity)).toFixed(2)}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(item.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}; 