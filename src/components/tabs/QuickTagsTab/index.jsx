import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TagList } from './TagList';
import { TagCard } from './TagCard';
import { QuickTagDialog } from '@/components/dialogs/QuickTagDialog';
import { WarningDialog } from '@/components/dialogs/WarningDialog';

export const QuickTagsTab = ({
  quickTags,
  selectedTag,
  setSelectedTag,
  setShowNewTagDialog,
  showNewTagDialog,
  addQuickTag,
  onEdit,
  onDelete,
}) => {
  const [warningDialog, setWarningDialog] = React.useState({
    open: false,
    tagToDelete: null
  });

  const handleDeleteClick = (tag) => {
    setWarningDialog({
      open: true,
      tagToDelete: tag,
      title: 'Delete Quick Tag',
      description: `Are you sure you want to delete "${tag.name}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      onConfirm: () => {
        onDelete(tag.id);
        if (selectedTag?.id === tag.id) {
          setSelectedTag(null);
        }
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quick Tags</h2>
        <Button onClick={() => setShowNewTagDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Tag
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <TagList
            tags={quickTags}
            selectedTag={selectedTag}
            onSelect={setSelectedTag}
          />
        </div>
        <div className="md:col-span-2">
          {selectedTag ? (
            <TagCard
              tag={selectedTag}
              onEdit={onEdit}
              onDelete={handleDeleteClick}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Select a tag to view details
            </div>
          )}
        </div>
      </div>

      <QuickTagDialog
        open={showNewTagDialog}
        onOpenChange={setShowNewTagDialog}
        onSubmit={addQuickTag}
      />

      <WarningDialog
        open={warningDialog.open}
        onOpenChange={(open) => setWarningDialog(prev => ({ ...prev, open }))}
        title={warningDialog.title}
        description={warningDialog.description}
        confirmLabel={warningDialog.confirmLabel}
        onConfirm={warningDialog.onConfirm}
      />
    </div>
  );
}; 