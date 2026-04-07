import { useEffect, useMemo, useState } from 'react';

const buildPlaceholderSrc = (src) => {
  try {
    const url = new URL(src);
    if (url.hostname.includes('images.unsplash.com')) {
      url.searchParams.set('w', '64');
      url.searchParams.set('q', '20');
      url.searchParams.set('blur', '80');
      url.searchParams.set('auto', 'format');
      return url.toString();
    }
  } catch {
    return src;
  }

  return src;
};

export const SmartImage = ({
  alt,
  className = '',
  fallbackSrc = '',
  loading = 'lazy',
  src,
  wrapperClassName = '',
}) => {
  const [activeSrc, setActiveSrc] = useState(src || fallbackSrc || '');
  const [loaded, setLoaded] = useState(false);
  const placeholderSrc = useMemo(
    () => buildPlaceholderSrc(activeSrc || fallbackSrc || src || ''),
    [activeSrc, fallbackSrc, src],
  );

  useEffect(() => {
    setActiveSrc(src || fallbackSrc || '');
    setLoaded(false);
  }, [fallbackSrc, src]);

  const handleError = () => {
    if (fallbackSrc && activeSrc !== fallbackSrc) {
      setActiveSrc(fallbackSrc);
      setLoaded(false);
      return;
    }

    setLoaded(true);
  };

  return (
    <span className={`smart-image-frame ${loaded ? 'is-loaded' : ''} ${wrapperClassName}`.trim()}>
      <img
        alt=""
        aria-hidden="true"
        className="smart-image-placeholder"
        src={placeholderSrc}
      />
      <img
        alt={alt}
        className={`smart-image-real ${className}`.trim()}
        decoding="async"
        loading={loading}
        onError={handleError}
        onLoad={() => setLoaded(true)}
        referrerPolicy="no-referrer"
        src={activeSrc || fallbackSrc}
      />
    </span>
  );
};
