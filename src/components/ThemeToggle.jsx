import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      className="relative h-9 w-9 overflow-hidden rounded-full bg-background/50 backdrop-blur-sm border-[0.5px] border-border hover:border-border/80 transition-all duration-300 hover:scale-105 active:scale-95"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="absolute h-[1.2rem] w-[1.2rem] translate-y-0 opacity-100 transition-all duration-500 dark:-translate-y-8 dark:opacity-0 text-amber-500 hover:text-amber-400" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] translate-y-8 opacity-0 transition-all duration-500 dark:translate-y-0 dark:opacity-100 text-blue-500 hover:text-blue-400" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
} 