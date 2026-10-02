import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === 'dark';
  return <button type="button" className={`theme-toggle ${className}`.trim()} onClick={toggleTheme}
    aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    aria-pressed={dark}>
    {dark ? <Sun size={23} strokeWidth={1.9} aria-hidden="true" /> : <Moon size={23} strokeWidth={1.9} aria-hidden="true" />}
  </button>;
}
