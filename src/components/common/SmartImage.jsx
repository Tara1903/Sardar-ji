import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const UNSPLASH_WIDTHS = [120, 240, 360, 480, 640, 768, 960, 1200, 1600];

const canUseBrowser = () => typeof window !== 'undefined';

const shouldDebugImageLoading = () => {
  if (!canUseBrowser()) {
    return false;
  }

  return (
    Boolean(window.__SJFC_IMAGE_DEBUG__) ||
    window.localStorage?.getItem('sjfc-image-debug') === '1'
  );
};

const logImageEvent = (phase, payload) => {
  if (!shouldDebugImageLoading()) {
    return;
  }

  console.debug('[SmartImage]', phase, payload);
};

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
    return '';
  }

  return '';
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
  const imageRef = useRef(null);
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

  useEffect(() => {
    logImageEvent('start', {
      src: activeSrc || fallbackSrc || src || '',
      placeholderSrc,
      sizes,
    });
  }, [activeSrc, fallbackSrc, placeholderSrc, sizes, src]);

  const markLoaded = useCallback(
    (eventSource = 'load') => {
      const image = imageRef.current;

      if (!image) {
        return;
      }

      const renderedWidth = image.getBoundingClientRect?.().width || 0;
      const renderedHeight = image.getBoundingClientRect?.().height || 0;
      const naturalWidth = Number(image.naturalWidth) || 0;
      const naturalHeight = Number(image.naturalHeight) || 0;
      const isReady = image.complete && naturalWidth > 0;

      logImageEvent(eventSource, {
        currentSrc: image.currentSrc,
        src: activeSrc || fallbackSrc || src || '',
        renderedWidth,
        renderedHeight,
        naturalWidth,
        naturalHeight,
        devicePixelRatio: canUseBrowser() ? window.devicePixelRatio || 1 : 1,
        loaded: isReady,
      });

      if (isReady) {
        setLoaded(true);
      }
    },
    [activeSrc, fallbackSrc, src],
  );

  useEffect(() => {
    if (imageRef.current?.complete && imageRef.current.naturalWidth > 0) {
      markLoaded('complete-check');
    }
  }, [activeSrc, markLoaded, responsiveImageProps.srcSet, responsiveImageProps.sizes]);

  const handleError = () => {
    logImageEvent('error', {
      src: activeSrc || fallbackSrc || src || '',
      fallbackSrc,
    });

    if (fallbackSrc && activeSrc !== fallbackSrc) {
      setActiveSrc(fallbackSrc);
      setLoaded(false);
      return;
    }

    setLoaded(true);
  };

  const showPlaceholder = Boolean(placeholderSrc) && !loaded;

  return (
    <span className={`smart-image-frame ${loaded ? 'is-loaded' : ''} ${wrapperClassName}`.trim()}>
      {showPlaceholder ? (
        <img
          alt=""
          aria-hidden="true"
          className="smart-image-placeholder"
          decoding="async"
          src={placeholderSrc}
        />
      ) : null}
      <img
        alt={alt}
        className={`smart-image-real ${className}`.trim()}
        decoding="async"
        data-loaded={loaded ? 'true' : 'false'}
        loading={loading}
        onError={handleError}
        onLoad={() => markLoaded('load')}
        referrerPolicy="no-referrer"
        ref={imageRef}
        src={activeSrc || fallbackSrc}
        {...responsiveImageProps}
      />
    </span>
  );
};
