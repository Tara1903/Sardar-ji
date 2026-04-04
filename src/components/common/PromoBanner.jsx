export const PromoBanner = ({
  eyebrow,
  title,
  description,
  tone = 'accent',
  className = '',
  actions = null,
}) => (
  <section className={`promo-banner promo-banner-${tone} ${className}`.trim()}>
    <div className="promo-banner-copy">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
    </div>
    {actions ? <div className="promo-banner-actions">{actions}</div> : null}
  </section>
);
