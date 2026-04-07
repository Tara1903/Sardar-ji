import { useEffect, useMemo, useState } from 'react';

const UNSPLASH_WIDTHS = [120, 240, 360, 480, 640, 768, 960, 1200, 1600];

const isUnsplashUrl = (src) => {
  try {
    const url = new URL(src);
    return url.hostname.includes('images.unsplash.com');
  } catch {
    return false;
  }
};

const buildUnsplashUrl = (src, width, quality = 82) => {
  try {
    const url = new URL(src);
    if (!url.hostname.includes('images.unsplash.com')) {
      return src;
    }

    url.searchParams.set('w', String(width));
    url.searchParams.set('q', String(quality));
    url.searchParams.set('auto', 'format');
    return url.toString();
  } catch {
    return src;
  }
};

export const getResponsiveImageProps = (
  src,
  sizes = '(max-width: 768px) 100vw, (max-width: 1180px) 50vw, 33vw',
) => {
  if (!isUnsplashUrl(src)) {
    return {};
  }

  return {
    sizes,
    srcSet: UNSPLASH_WIDTHS.map((width) => `${buildUnsplashUrl(src, width)} ${width}w`).join(', '),
  };
};

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
  sizes = '(max-width: 768px) 100vw, (max-width: 1180px) 50vw, 33vw',
  src,
  wrapperClassName = '',
}) => {
  const [activeSrc, setActiveSrc] = useState(src || fallbackSrc || '');
  const [loaded, setLoaded] = useState(false);
  const placeholderSrc = useMemo(
    () => buildPlaceholderSrc(activeSrc || fallbackSrc || src || ''),
    [activeSrc, fallbackSrc, src],
  );
  const responsiveImageProps = useMemo(
    () => getResponsiveImageProps(activeSrc || fallbackSrc || src || '', sizes),
    [activeSrc, fallbackSrc, sizes, src],
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
        {...responsiveImageProps}
      />
    </span>
  );
};
