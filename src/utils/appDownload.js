export const APP_DOWNLOAD_PATH = '/downloads/sardar-ji-food-corner.apk';
export const APP_DOWNLOAD_PAGE_PATH = '/download-app';
export const APP_DOWNLOAD_FILE_NAME = 'sardar-ji-food-corner.apk';
export const APP_DOWNLOAD_LABEL = 'Download App';
export const APP_UPDATE_LABEL = 'Update App';
export const APP_LATEST_VERSION = '1.2.0';
export const APP_LATEST_BUILD = 3;
export const APP_RELEASE_DATE = '8 Apr 2026';
export const APP_DOWNLOAD_BADGE = `Android APK • v${APP_LATEST_VERSION} • Signed release`;
export const APP_DOWNLOAD_SUPPORT_NOTE =
  'Android 8.0+ supported • Native-feel app shell • Fast install • Pure veg ordering app';
export const APP_RELEASE_HIGHLIGHTS = [
  'Latest premium website design inside the app',
  'Smoother startup, native splash, and offline fallback',
  'Faster cart, reorder, subscription, and tracking flows',
];

const APP_DOWNLOAD_HOST = 'https://www.sardarjifoodcorner.shop';

const getHostedUrl = (path) => {
  if (typeof window !== 'undefined') {
    const { origin, protocol } = window.location;

    if (protocol === 'http:' || protocol === 'https:') {
      return new URL(path, origin).toString();
    }
  }

  return new URL(path, APP_DOWNLOAD_HOST).toString();
};

export const getAppDownloadUrl = () => getHostedUrl(APP_DOWNLOAD_PATH);

export const getAppDownloadPageUrl = () => getHostedUrl(APP_DOWNLOAD_PAGE_PATH);

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

export const isAppUpdateRequired = (currentVersion) =>
  compareAppVersions(currentVersion, APP_LATEST_VERSION) < 0;
