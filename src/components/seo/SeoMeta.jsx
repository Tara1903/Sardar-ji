import { Helmet } from 'react-helmet-async';
import { publicEnv } from '../../lib/env';
import {
  SITE_DEFAULT_DESCRIPTION,
  SITE_DEFAULT_KEYWORDS,
  SITE_DEFAULT_TITLE,
  SITE_LOCATION_LABEL,
  SITE_NAME,
  SITE_OG_IMAGE,
  createLocalBusinessSchema,
  createSeoTitle,
  createWebsiteSchema,
  getCanonicalUrl,
} from '../../seo/siteSeo';

const normalizeKeywords = (keywords) =>
  Array.isArray(keywords) ? keywords.filter(Boolean).join(', ') : keywords || SITE_DEFAULT_KEYWORDS;

export const SeoMeta = ({
  title = SITE_DEFAULT_TITLE,
  description = SITE_DEFAULT_DESCRIPTION,
  keywords = SITE_DEFAULT_KEYWORDS,
  path = '/',
  image = SITE_OG_IMAGE,
  noIndex = false,
  schema = [],
  includeLocalBusiness = false,
  includeWebsiteSchema = false,
  settings = null,
}) => {
  const pageTitle = createSeoTitle(title);
  const canonicalUrl = getCanonicalUrl(path);
  const robots = noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large';
  const resolvedLogoUrl =
    settings?.storefront?.logoLightUrl ||
    (settings?.storefront?.logoUrl && settings.storefront.logoUrl !== '/brand-logo.png'
      ? settings.storefront.logoUrl
      : '');
  const resolvedImage = resolvedLogoUrl ? new URL(resolvedLogoUrl, canonicalUrl).toString() : image;
  const normalizedSchema = [
    ...(includeWebsiteSchema ? [createWebsiteSchema()] : []),
    ...(includeLocalBusiness ? [createLocalBusinessSchema(settings || {})] : []),
    ...(Array.isArray(schema) ? schema : [schema]).filter(Boolean),
  ];

  return (
    <Helmet prioritizeSeoTags>
      <html lang="en-IN" />
      <title>{pageTitle}</title>
      <meta content={description} name="description" />
      <meta content={normalizeKeywords(keywords)} name="keywords" />
      <meta content={robots} name="robots" />
      <meta content={robots} name="googlebot" />
      <meta content={SITE_NAME} property="og:site_name" />
      <meta content={pageTitle} property="og:title" />
      <meta content={description} property="og:description" />
      <meta content={canonicalUrl} property="og:url" />
      <meta content="website" property="og:type" />
      <meta content={resolvedImage} property="og:image" />
      <meta content="summary_large_image" name="twitter:card" />
      <meta content={pageTitle} name="twitter:title" />
      <meta content={description} name="twitter:description" />
      <meta content={resolvedImage} name="twitter:image" />
      <meta content="India" name="geo.region" />
      <meta content="Indore" name="geo.placename" />
      <meta content="22.635280755003382;75.8351541995739" name="geo.position" />
      <meta content={SITE_LOCATION_LABEL} name="location" />
      <meta content="22.635280755003382, 75.8351541995739" name="ICBM" />
      {publicEnv.googleSiteVerification ? (
        <meta content={publicEnv.googleSiteVerification} name="google-site-verification" />
      ) : null}
      <link href={canonicalUrl} rel="canonical" />
      {normalizedSchema.map((entry, index) => (
        <script key={`seo-schema-${index}`} type="application/ld+json">
          {JSON.stringify(entry)}
        </script>
      ))}
    </Helmet>
  );
};
