import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export const CustomerList = ({ customers, selectedCustomer, onSelect }) => {
  const [search, setSearch] = React.useState('');

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(search.toLowerCase()) ||
    customer.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="border rounded-lg h-[600px] flex flex-col">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {filteredCustomers.map((customer) => (
            <Button
              key={customer.id}
              variant="ghost"
              className={cn(
                'w-full justify-start',
                selectedCustomer?.id === customer.id && 'bg-muted'
              )}
              onClick={() => onSelect(customer)}
            >
              <div className="text-left">
                <div className="font-medium">
                  {customer.firma ? customer.name : `${customer.title} ${customer.name}`}
                </div>
                <div className="text-sm text-muted-foreground">
                  {customer.city}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}; 