import { useRef } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const themeOptions = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export const ThemeToggle = ({ className = '', compact = false, label = 'Theme' }) => {
  const { theme, setTheme } = useTheme();
  const optionRefs = useRef([]);
  const activeIndex = Math.max(
    themeOptions.findIndex((option) => option.value === theme),
    0,
  );

  const moveToOption = (index) => {
    const nextIndex = (index + themeOptions.length) % themeOptions.length;
    setTheme(themeOptions[nextIndex].value);

    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        optionRefs.current[nextIndex]?.focus();
      });
    }
  };

  const handleKeyDown = (event) => {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        moveToOption(activeIndex + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        moveToOption(activeIndex - 1);
        break;
      case 'Home':
        event.preventDefault();
        moveToOption(0);
        break;
      case 'End':
        event.preventDefault();
        moveToOption(themeOptions.length - 1);
        break;
      default:
        break;
    }
  };

  return (
    <div
      aria-label={label}
      className={`theme-switcher${compact ? ' is-compact' : ''}${className ? ` ${className}` : ''}`}
      onKeyDown={handleKeyDown}
      role="radiogroup"
    >
      <span
        aria-hidden="true"
        className="theme-switcher-indicator"
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
      />
      {themeOptions.map((option, index) => {
        const Icon = option.icon;
        const isActive = option.value === theme;

        return (
          <button
            aria-checked={isActive}
            aria-label={`${option.label} theme`}
            className={`theme-switcher-option${isActive ? ' is-active' : ''}`}
            data-mode={option.value}
            key={option.value}
            onClick={() => setTheme(option.value)}
            ref={(element) => {
              optionRefs.current[index] = element;
            }}
            role="radio"
            tabIndex={isActive ? 0 : -1}
            title={option.label}
            type="button"
          >
            <span aria-hidden="true" className="theme-switcher-option-icon">
              <Icon size={compact ? 15 : 16} strokeWidth={2.2} />
            </span>
            {!compact ? <span className="theme-switcher-option-label">{option.label}</span> : null}
          </button>
        );
      })}
    </div>
  );
};
