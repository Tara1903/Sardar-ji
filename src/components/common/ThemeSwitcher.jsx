import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const themeOptions = [
  { value: 'light', label: '☀ Light', icon: Sun },
  { value: 'dark', label: '🌙 Dark', icon: Moon },
  { value: 'system', label: '💻 System', icon: Monitor },
];

export const ThemeSwitcher = ({ className = '', label = 'Theme' }) => {
  const { theme, setTheme } = useTheme();
  const activeOption = themeOptions.find((option) => option.value === theme) || themeOptions[2];
  const ActiveIcon = activeOption.icon;

  return (
    <label className={`theme-switcher ${className}`.trim()}>
      <span className="sr-only">{label}</span>
      <span className="theme-switcher-icon" aria-hidden="true">
        <ActiveIcon size={16} />
      </span>
      <select aria-label={label} onChange={(event) => setTheme(event.target.value)} value={theme}>
        {themeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
};
