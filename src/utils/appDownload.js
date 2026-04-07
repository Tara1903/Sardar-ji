const APP_DOWNLOAD_HOST = 'https://www.sardarjifoodcorner.shop';

export const APP_RELEASE = Object.freeze({
  version: '1.3.0',
  build: 4,
  releaseDate: '8 Apr 2026',
  downloadPath: '/downloads/sardar-ji-food-corner.apk',
  downloadPagePath: '/download-app',
  fileName: 'sardar-ji-food-corner.apk',
  downloadLabel: 'Download App',
  updateLabel: 'Update App',
  supportNote: 'Android 8.0+ supported • Native-feel app shell • Fast install • Pure veg ordering app',
  releaseHighlights: [
    'Latest premium website design, menu, cart, checkout, and tracking inside the app',
    'Native splash, offline fallback, smooth safe-area layout, and faster startup flow',
    'Subscriptions, referrals, coupons, reorder, and Razorpay checkout included',
  ],
});

export const APP_RELEASE_MANIFEST_PATH = '/app-release.json';
export const APP_DOWNLOAD_PATH = APP_RELEASE.downloadPath;
export const APP_DOWNLOAD_PAGE_PATH = APP_RELEASE.downloadPagePath;
export const APP_DOWNLOAD_FILE_NAME = APP_RELEASE.fileName;
export const APP_DOWNLOAD_LABEL = APP_RELEASE.downloadLabel;
export const APP_UPDATE_LABEL = APP_RELEASE.updateLabel;
export const APP_LATEST_VERSION = APP_RELEASE.version;
export const APP_LATEST_BUILD = APP_RELEASE.build;
export const APP_RELEASE_DATE = APP_RELEASE.releaseDate;
export const APP_DOWNLOAD_BADGE = `Android APK • v${APP_LATEST_VERSION} • Signed release`;
export const APP_DOWNLOAD_SUPPORT_NOTE = APP_RELEASE.supportNote;
export const APP_RELEASE_HIGHLIGHTS = APP_RELEASE.releaseHighlights;

const canUseBrowser = () => typeof window !== 'undefined';

const isHttpLike = (protocol = '') => protocol === 'http:' || protocol === 'https:';

const isNativeLocalOrigin = () =>
  canUseBrowser() &&
  window.location.hostname === 'localhost' &&
  (!window.location.port || window.location.port === '80');

const normalizeAppRelease = (release = {}) => ({
  ...APP_RELEASE,
  ...release,
  version: String(release.version || APP_RELEASE.version),
  build: Number.parseInt(release.build ?? APP_RELEASE.build, 10) || APP_RELEASE.build,
  releaseDate: String(release.releaseDate || APP_RELEASE.releaseDate),
  downloadPath: String(release.downloadPath || APP_RELEASE.downloadPath),
  downloadPagePath: String(release.downloadPagePath || APP_RELEASE.downloadPagePath),
  fileName: String(release.fileName || APP_RELEASE.fileName),
  downloadLabel: String(release.downloadLabel || APP_RELEASE.downloadLabel),
  updateLabel: String(release.updateLabel || APP_RELEASE.updateLabel),
  supportNote: String(release.supportNote || APP_RELEASE.supportNote),
  releaseHighlights: Array.isArray(release.releaseHighlights) && release.releaseHighlights.length
    ? release.releaseHighlights.map((item) => String(item))
    : APP_RELEASE.releaseHighlights,
});

const getHostedUrl = (path) => {
  if (canUseBrowser()) {
    const { origin, protocol } = window.location;

    if (isHttpLike(protocol) && !isNativeLocalOrigin()) {
      return new URL(path, origin).toString();
    }
  }

  return new URL(path, APP_DOWNLOAD_HOST).toString();
};

export const getAppDownloadUrl = (release = APP_RELEASE) =>
  getHostedUrl(normalizeAppRelease(release).downloadPath);

export const getAppDownloadPageUrl = (release = APP_RELEASE) =>
  getHostedUrl(normalizeAppRelease(release).downloadPagePath);

export const getAppReleaseManifestUrl = () => getHostedUrl(APP_RELEASE_MANIFEST_PATH);

export const fetchLatestAppRelease = async ({ signal } = {}) => {
  const manifestUrl = new URL(getAppReleaseManifestUrl());
  manifestUrl.searchParams.set('ts', `${Date.now()}`);

  try {
    const response = await fetch(manifestUrl.toString(), {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
      signal,
    });

    if (!response.ok) {
      throw new Error(`Release manifest request failed with ${response.status}`);
    }

    const payload = await response.json();
    return normalizeAppRelease(payload);
  } catch {
    return APP_RELEASE;
  }
};

export const compareAppVersions = (currentVersion = '0.0.0', nextVersion = APP_LATEST_VERSION) => {
  const currentParts = String(currentVersion)
    .split('.')
    .map((part) => Number.parseInt(part, 10) || 0);
  const nextParts = String(nextVersion)
    .split('.')
    .map((part) => Number.parseInt(part, 10) || 0);
  const maxLength = Math.max(currentParts.length, nextParts.length);

  for (let index = 0; index < maxLength; index += 1) {
    const current = currentParts[index] ?? 0;
    const next = nextParts[index] ?? 0;

    if (current > next) {
      return 1;
    }

    if (current < next) {
      return -1;
    }
  }

  return 0;
};

export const isAppUpdateRequired = (
  currentVersion,
  currentBuild = 0,
  release = APP_RELEASE,
) => {
  const normalizedRelease = normalizeAppRelease(release);
  const versionComparison = compareAppVersions(currentVersion, normalizedRelease.version);

  if (versionComparison < 0) {
    return true;
  }

  if (versionComparison > 0) {
    return false;
  }

  return (Number.parseInt(currentBuild, 10) || 0) < normalizedRelease.build;
};

export { normalizeAppRelease };
