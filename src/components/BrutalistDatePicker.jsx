import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format, parse, isValid } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

// value/onChange use ISO date strings ("YYYY-MM-DD")
const BrutalistDatePicker = ({ value, onChange, className = '', placeholder = '—' }) => {
  const { i18n } = useTranslation();
  const locale = i18n.language?.startsWith('de') ? de : enUS;

  const date = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined;
  const display = date && isValid(date) ? format(date, 'dd/MM/yyyy') : placeholder;

  const handleSelect = (d) => {
    if (!d) return;
    onChange(format(d, 'yyyy-MM-dd'));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`brutalist-input brutalist-date-trigger ${className}`}
        >
          <span className={!date ? 'opacity-50' : ''}>{display}</span>
          <CalendarIcon className="h-3.5 w-3.5 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="brutalist-calendar-popover w-auto p-0"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          locale={locale}
          weekStartsOn={1}
          showOutsideDays
          className="brutalist-calendar"
        />
      </PopoverContent>
    </Popover>
  );
};

export default BrutalistDatePicker;
