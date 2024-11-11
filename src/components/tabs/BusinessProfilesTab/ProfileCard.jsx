import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Star } from 'lucide-react';

export const ProfileCard = ({ profile, onEdit, onDelete, isDefault, onSetDefault }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Business Profile Details</CardTitle>
        <div className="space-x-2">
          {!isDefault && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onSetDefault}
              title="Set as default"
            >
              <Star className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(profile)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(profile.company_name)}
            disabled={isDefault}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Company Name</h3>
            <p className="text-lg">{profile.company_name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
            <p className="text-lg">{profile.company_street}</p>
            <p className="text-lg">{profile.company_postalcode} {profile.company_city}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Tax Information</h3>
            {profile.tax_number && <p className="text-lg">Tax Number: {profile.tax_number}</p>}
            {profile.tax_id && <p className="text-lg">Tax ID: {profile.tax_id}</p>}
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Bank Details</h3>
            {profile.bank_institute && <p className="text-lg">Bank: {profile.bank_institute}</p>}
            {profile.bank_iban && <p className="text-lg">IBAN: {profile.bank_iban}</p>}
            {profile.bank_bic && <p className="text-lg">BIC: {profile.bank_bic}</p>}
          </div>
        </div>

        {profile.contact_details && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Contact Details</h3>
            <p className="text-lg whitespace-pre-wrap">{profile.contact_details}</p>
          </div>
        )}

        {profile.invoice_save_path && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Invoice Save Path</h3>
            <p className="text-lg font-mono">{profile.invoice_save_path}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 