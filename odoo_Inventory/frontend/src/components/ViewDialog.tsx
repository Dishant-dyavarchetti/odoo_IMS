import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Eye } from 'lucide-react';

interface ViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  data: Record<string, any>;
  fields: Array<{
    label: string;
    key: string;
    format?: (value: any) => string;
  }>;
}

export function ViewDialog({ open, onOpenChange, title, data, fields }: ViewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl">{title}</DialogTitle>
              <DialogDescription>Detailed information</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          {fields.map((field) => {
            const value = data[field.key];
            const displayValue = field.format
              ? field.format(value)
              : value !== null && value !== undefined
              ? String(value)
              : '-';

            return (
              <div
                key={field.key}
                className="border-b border-gray-100 pb-3 last:border-0"
              >
                <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  {field.label}
                </dt>
                <dd className="text-sm text-gray-900 font-medium bg-gray-50 px-3 py-2 rounded-lg">
                  {displayValue}
                </dd>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
