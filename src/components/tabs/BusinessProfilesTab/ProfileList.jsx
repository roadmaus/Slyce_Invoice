import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Star, StarOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ProfileList = ({ profiles, selectedProfile, onSelect, defaultProfileId }) => {
  const [search, setSearch] = React.useState('');

  const filteredProfiles = profiles.filter(profile =>
    profile.company_name.toLowerCase().includes(search.toLowerCase()) ||
    profile.company_city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="border rounded-lg h-[600px] flex flex-col">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search profiles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {filteredProfiles.map((profile) => (
            <Button
              key={profile.company_name}
              variant="ghost"
              className={cn(
                'w-full justify-start',
                selectedProfile?.company_name === profile.company_name && 'bg-muted'
              )}
              onClick={() => onSelect(profile)}
            >
              <div className="flex items-center justify-between w-full">
                <div className="text-left">
                  <div className="font-medium">{profile.company_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {profile.company_city}
                  </div>
                </div>
                {profile.company_name === defaultProfileId && (
                  <Star className="h-4 w-4 text-yellow-500" />
                )}
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}; 