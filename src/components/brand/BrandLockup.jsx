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

  return (
    <Wrapper className={`brand-mark ${compact ? 'compact' : ''} ${className}`.trim()} {...(linkTo ? { to: linkTo } : {})}>
      <img
        alt={`${title} logo`}
        className="brand-logo"
        height={compact ? 40 : 48}
        loading="eager"
        src="/favicon.svg"
        width={compact ? 40 : 48}
      />
      <div className="brand-copy">
        <strong>{title}</strong>
        {showTagline ? <span>{tagline}</span> : null}
      </div>
    </Wrapper>
  );
};
