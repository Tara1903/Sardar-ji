import { Link } from 'react-router-dom';
import { useAppData } from '../../contexts/AppDataContext';

export const BrandLockup = ({
  className = '',
  compact = false,
  linkTo = '/',
  showTagline = true,
  title = 'Sardar Ji Food Corner',
  tagline = 'Swad Bhi, Budget Bhi',
}) => {
  const { settings } = useAppData();
  const Wrapper = linkTo ? Link : 'div';
  const accessibleLabel = showTagline ? `${title} - ${tagline}` : title;
  const logoSrc = settings?.storefront?.logoUrl || '/brand-logo.png';

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
