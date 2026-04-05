import { Link } from 'react-router-dom';

export const BrandLockup = ({
  className = '',
  compact = false,
  linkTo = '/',
  showTagline = true,
  title = 'Sardar Ji Food Corner',
  tagline = 'Swad Bhi, Budget Bhi',
}) => {
  const Wrapper = linkTo ? Link : 'div';
  const accessibleLabel = showTagline ? `${title} - ${tagline}` : title;

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
        src="/brand-logo.svg"
        width={compact ? 182 : 238}
      />
      <span className="sr-only">{accessibleLabel}</span>
    </Wrapper>
  );
};
