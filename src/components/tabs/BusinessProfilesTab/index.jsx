import React from 'react';
import { Plus, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileList } from './ProfileList';
import { ProfileCard } from './ProfileCard';
import { BusinessProfileDialog } from '@/components/dialogs/BusinessProfileDialog';

export const BusinessProfilesTab = ({
  businessProfiles,
  selectedProfile,
  setSelectedProfile,
  setShowNewProfileDialog,
  showNewProfileDialog,
  addBusinessProfile,
  onEdit,
  onDelete,
  onExport,
  onImport,
  defaultProfileId,
  setDefaultProfileId,
  isLoading,
}) => {
  const handleImport = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = async (event) => {
            try {
              const data = JSON.parse(event.target.result);
              await onImport(data);
            } catch (error) {
              console.error('Error parsing file:', error);
            }
          };
          reader.readAsText(file);
        }
      };
      
      input.click();
    } catch (error) {
      console.error('Error importing data:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Business Profiles</h2>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={onExport}
            disabled={isLoading.export || businessProfiles.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={handleImport}
            disabled={isLoading.import}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => setShowNewProfileDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <ProfileList
            profiles={businessProfiles}
            selectedProfile={selectedProfile}
            onSelect={setSelectedProfile}
            defaultProfileId={defaultProfileId}
          />
        </div>
        <div className="md:col-span-2">
          {selectedProfile ? (
            <ProfileCard
              profile={selectedProfile}
              onEdit={onEdit}
              onDelete={onDelete}
              isDefault={selectedProfile.company_name === defaultProfileId}
              onSetDefault={() => setDefaultProfileId(selectedProfile.company_name)}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Select a profile to view details
            </div>
          )}
        </div>
      </div>

      <NewProfileDialog
        open={showNewProfileDialog}
        onOpenChange={setShowNewProfileDialog}
        onSubmit={addBusinessProfile}
      />
    </div>
  );
}; 