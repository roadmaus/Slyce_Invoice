import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export const FileInput = ({ 
  accept, 
  onChange,
  value,
  className,
  label = "Upload file",
  description,
  error,
}) => {
  const inputRef = React.useRef(null);
  const [fileName, setFileName] = React.useState('');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onChange?.(file);
    }
  };

  const handleClear = () => {
    setFileName('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onChange?.(null);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      <div className="flex items-center gap-2">
        <Input
          type="file"
          ref={inputRef}
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => inputRef.current?.click()}
        >
          {fileName ? (
            <>
              <FileText className="w-4 h-4 mr-2" />
              {fileName}
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </>
          )}
        </Button>
        {fileName && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}; 