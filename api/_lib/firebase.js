import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { getEnv } from './server.js';

const FIREBASE_APP_NAME = 'sjfc-notifications';

const getModuleDir = () => path.dirname(fileURLToPath(import.meta.url));

const parseServiceAccount = () => {
  const inlineJson = getEnv('FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON');

  if (inlineJson) {
    return JSON.parse(inlineJson);
  }

  const explicitPath = getEnv('FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH');
  const fallbacks = [
    explicitPath,
    path.join(process.cwd(), 'secrets', 'firebase-admin.json'),
    path.join(getModuleDir(), '..', '..', 'secrets', 'firebase-admin.json'),
  ].filter(Boolean);

  for (const filePath of fallbacks) {
    if (!existsSync(filePath)) {
      continue;
    }

    return JSON.parse(readFileSync(filePath, 'utf8'));
  }

  return null;
};

const normalizeServiceAccount = (serviceAccount) => {
  if (!serviceAccount?.project_id || !serviceAccount?.client_email || !serviceAccount?.private_key) {
    return null;
  }

  return {
    projectId: serviceAccount.project_id,
    clientEmail: serviceAccount.client_email,
    privateKey: String(serviceAccount.private_key).replace(/\\n/g, '\n'),
  };
};

export const getFirebaseMessaging = () => {
  try {
    const serviceAccount = normalizeServiceAccount(parseServiceAccount());

    if (!serviceAccount) {
      return null;
    }

    const app =
      getApps().find((entry) => entry.name === FIREBASE_APP_NAME) ||
      initializeApp(
        {
          credential: cert(serviceAccount),
        },
        FIREBASE_APP_NAME,
      );

    return getMessaging(app);
  } catch {
    return null;
  }
};
