import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const ProfileSelector = ({ profiles, selectedProfile, onSelect }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="profile-select">Business Profile</Label>
      <Select
        value={selectedProfile?.company_name || ''}
        onValueChange={(value) => {
          const profile = profiles.find(p => p.company_name === value);
          onSelect(profile);
        }}
      >
        <SelectTrigger id="profile-select">
          <SelectValue placeholder="Select a business profile" />
        </SelectTrigger>
        <SelectContent>
          {profiles.map((profile) => (
            <SelectItem 
              key={profile.company_name} 
              value={profile.company_name}
            >
              {profile.company_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedProfile && (
        <div className="mt-4 text-sm text-muted-foreground">
          <p>{selectedProfile.company_street}</p>
          <p>{selectedProfile.company_postalcode} {selectedProfile.company_city}</p>
        </div>
      )}
    </div>
  );
}; 