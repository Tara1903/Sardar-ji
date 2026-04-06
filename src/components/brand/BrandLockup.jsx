import { Link } from 'react-router-dom';
import { useAppData } from '../../contexts/AppDataContext';
import { useTheme } from '../../contexts/ThemeContext';

export const BrandLockup = ({
  className = '',
  compact = false,
  linkTo = '/',
  showTagline = true,
  title = 'Sardar Ji Food Corner',
  tagline = 'Swad Bhi, Budget Bhi',
}) => {
  const { appConfig, settings } = useAppData();
  const { resolvedTheme } = useTheme();
  const Wrapper = linkTo ? Link : 'div';
  const accessibleLabel = showTagline ? `${title} - ${tagline}` : title;
  const logoSrc =
    resolvedTheme === 'dark'
      ? appConfig?.logoDarkUrl || settings?.storefront?.logoDarkUrl || settings?.storefront?.logoUrl || '/brand-logo-dark.png'
      : appConfig?.logoLightUrl || settings?.storefront?.logoLightUrl || settings?.storefront?.logoUrl || '/brand-logo-light.png';

  return (
    <Wrapper
      aria-label={accessibleLabel}
      className={`brand-mark ${compact ? 'compact' : ''} ${className}`.trim()}
      {...(linkTo ? { to: linkTo } : {})}
    >
      <img
        alt={`${title} logo`}
        className="brand-logo"
        height={compact ? 62 : 82}
        loading="eager"
        src={logoSrc}
        width={compact ? 182 : 238}
      />
      <span className="sr-only">{accessibleLabel}</span>
    </Wrapper>
  );
};
