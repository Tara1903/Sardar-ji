import nodemailer from 'nodemailer';
import webpush from 'web-push';
import { getEnv, getBearerToken, readJsonBody, requireAuthenticatedUser, sendJson } from './_lib/server.js';
import { getFirebaseMessaging } from './_lib/firebase.js';
import { getSupabaseRows, mutateSupabaseRows } from './_lib/supabase.js';
import {
  buildAdminNewOrderAlert,
  buildOrderStatusNotification,
  normalizeOrderStatusNotificationStatus,
} from '../src/utils/orderNotifications.js';

const APP_BASE_URL = 'https://www.sardarjifoodcorner.shop';
const PUSH_META_TYPE = 'push-subscription';
const NATIVE_PUSH_META_TYPE = 'native-push-token';
const SUBSCRIPTION_META_TYPE = 'subscription-meta';
const NOTIFICATION_CHANNELS = Object.freeze({
  realtime: 'realtime',
  browserPush: 'browserPush',
  androidPush: 'androidPush',
  email: 'email',
});
const DEFAULT_CHANNELS = Object.values(NOTIFICATION_CHANNELS);
const INVALID_WEB_PUSH_STATUS_CODES = new Set([404, 410]);
const INVALID_FCM_ERROR_CODES = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
  'messaging/invalid-argument',
]);

const createHttpError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const cloneSerializable = (value) => JSON.parse(JSON.stringify(value));

const normalizeDeepLink = (value = '') => {
  const candidate = String(value || '').trim();

  if (!candidate) {
    return '/profile';
  }

  if (candidate.startsWith('/')) {
    return candidate;
  }

  if (candidate.startsWith('sjfc://')) {
    return `/${candidate.replace(/^sjfc:\/\//, '').replace(/^\/+/, '')}`;
  }

  if (candidate.startsWith(APP_BASE_URL)) {
    return candidate.slice(APP_BASE_URL.length) || '/profile';
  }

  if (/^https?:\/\//i.test(candidate)) {
    return '/profile';
  }

  return `/${candidate.replace(/^\/+/, '')}`;
};

const toAbsoluteDeepLink = (value = '') => `${APP_BASE_URL}${normalizeDeepLink(value)}`;

const buildNotificationKey = ({ type = '', orderId = '', status = '', message = '' } = {}) =>
  [String(type || '').trim(), String(orderId || '').trim(), String(status || '').trim(), String(message || '').trim()]
    .filter(Boolean)
    .join(':')
    .slice(0, 180);

const normalizeRequestedChannels = (channels) => {
  if (!Array.isArray(channels) || !channels.length) {
    return DEFAULT_CHANNELS;
  }

  const allowed = new Set(DEFAULT_CHANNELS);
  const normalized = channels.map((entry) => String(entry || '').trim()).filter((entry) => allowed.has(entry));
  return normalized.length ? Array.from(new Set(normalized)) : DEFAULT_CHANNELS;
};

const logNotificationAttempt = (scope, payload) => {
  try {
    console.info(`[notifications] ${scope}`, JSON.stringify(payload));
  } catch {
    console.info(`[notifications] ${scope}`);
  }
};

const getPushConfig = () => {
  const publicKey = getEnv('WEB_PUSH_PUBLIC_KEY', 'VITE_WEB_PUSH_PUBLIC_KEY');
  const privateKey = getEnv('WEB_PUSH_PRIVATE_KEY');

  if (!publicKey || !privateKey) {
    return null;
  }

  return {
    publicKey,
    privateKey,
    subject: getEnv('WEB_PUSH_SUBJECT') || 'mailto:sardarjifoodcorner78@gmail.com',
  };
};

const getMailerConfig = () => {
  const host = getEnv('SMTP_HOST');
  const user = getEnv('SMTP_USER');
  const password = getEnv('SMTP_PASSWORD', 'SMTP_PASS');

  if (!host || !user || !password) {
    return null;
  }

  const port = Number(getEnv('SMTP_PORT') || 587);

  return {
    host,
    port,
    secure:
      getEnv('SMTP_SECURE')
        ? /^(1|true|yes)$/i.test(getEnv('SMTP_SECURE'))
        : port === 465,
    auth: {
      user,
      pass: password,
    },
    fromEmail: getEnv('SMTP_FROM_EMAIL', 'NOTIFICATION_FROM_EMAIL') || user,
    fromName: getEnv('SMTP_FROM_NAME', 'NOTIFICATION_FROM_NAME') || 'Sardar Ji Food Corner',
  };
};

const normalizePushSubscription = (subscription = {}) => ({
  endpoint: subscription.endpoint || '',
  expirationTime: subscription.expirationTime ?? null,
  keys: {
    auth: subscription.keys?.auth || '',
    p256dh: subscription.keys?.p256dh || '',
  },
  userAgent: subscription.userAgent || '',
  platform: subscription.platform || '',
  createdAt: subscription.createdAt || '',
  updatedAt: subscription.updatedAt || '',
});

const normalizeNativePushToken = (entry = {}) => ({
  token: entry.token || '',
  platform: entry.platform || 'android',
  provider: entry.provider || 'fcm',
  createdAt: entry.createdAt || '',
  updatedAt: entry.updatedAt || '',
});

const partitionUserAddresses = (addresses = []) => {
  const plainAddresses = [];
  let subscriptionMetaEntry = null;
  const pushSubscriptions = [];
  const nativePushEntries = [];

  for (const entry of addresses || []) {
    if (!entry || typeof entry !== 'object') {
      continue;
    }

    switch (entry._type) {
      case SUBSCRIPTION_META_TYPE:
        subscriptionMetaEntry = cloneSerializable(entry);
        break;
      case PUSH_META_TYPE:
        pushSubscriptions.push(normalizePushSubscription(entry.payload || {}));
        break;
      case NATIVE_PUSH_META_TYPE:
        nativePushEntries.push(normalizeNativePushToken(entry.payload || {}));
        break;
      default:
        plainAddresses.push(cloneSerializable(entry));
        break;
    }
  }

  return {
    plainAddresses,
    subscriptionMetaEntry,
    pushSubscriptions: pushSubscriptions.filter(
      (subscription) => subscription.endpoint && subscription.keys?.auth && subscription.keys?.p256dh,
    ),
    nativePushEntries: nativePushEntries.filter((entry) => entry.token),
  };
};

const serializeUserAddresses = ({
  plainAddresses = [],
  subscriptionMetaEntry = null,
  pushSubscriptions = [],
  nativePushEntries = [],
}) => [
  ...plainAddresses.map(cloneSerializable),
  ...(subscriptionMetaEntry ? [cloneSerializable(subscriptionMetaEntry)] : []),
  ...pushSubscriptions.map((subscription, index) => ({
    id: `__push_subscription__${index}`,
    _type: PUSH_META_TYPE,
    payload: normalizePushSubscription(subscription),
  })),
  ...nativePushEntries.map((entry, index) => ({
    id: `__native_push_token__${index}`,
    _type: NATIVE_PUSH_META_TYPE,
    payload: normalizeNativePushToken(entry),
  })),
];

const safeInsertNotification = async ({ token, userId, orderId, message }) => {
  try {
    await mutateSupabaseRows({
      path: '/notifications',
      method: 'POST',
      token,
      body: [
        {
          user_id: userId,
          order_id: orderId || null,
          message,
        },
      ],
      headers: {
        Prefer: 'return=minimal',
      },
    });

    return { stored: true, error: '' };
  } catch (error) {
    if (/Could not find the table|schema cache|notifications/i.test(error.message || '')) {
      return { stored: false, error: 'notifications_table_unavailable' };
    }

    return { stored: false, error: error.message || 'Unable to store the realtime notification.' };
  }
};

const getActorProfile = async (token, actorUserId) => {
  const rows = await getSupabaseRows({
    path: `/users?id=eq.${encodeURIComponent(actorUserId)}&select=id,role,name,email&limit=1`,
    token,
  });

  return rows?.[0] || null;
};

const getOrderRecipient = async (token, orderId, fallbackUserId = '') => {
  if (orderId) {
    const orderRows = await getSupabaseRows({
      path:
        `/orders?id=eq.${encodeURIComponent(orderId)}` +
        '&select=id,order_number,status,user_id,customer_name,users!orders_user_id_fkey(email,addresses)' +
        '&limit=1',
      token,
    });

    const order = orderRows?.[0];

    if (order?.users) {
      return {
        orderId: order.id,
        orderNumber: order.order_number || '',
        userId: order.user_id || fallbackUserId,
        customerName: order.customer_name || '',
        email: order.users.email || '',
        addresses: order.users.addresses || [],
      };
    }
  }

  if (!fallbackUserId) {
    return null;
  }

  const userRows = await getSupabaseRows({
    path: `/users?id=eq.${encodeURIComponent(fallbackUserId)}&select=id,name,email,addresses&limit=1`,
    token,
  });

  const user = userRows?.[0];

  if (!user) {
    return null;
  }

  return {
    orderId: orderId || '',
    orderNumber: '',
    userId: user.id,
    customerName: user.name || '',
    email: user.email || '',
    addresses: user.addresses || [],
  };
};

const buildNotificationContract = ({ body = {}, recipient = {} }) => {
  const normalizedStatus = normalizeOrderStatusNotificationStatus(body.status || '');
  const generatedStatusNotification =
    buildOrderStatusNotification({
      orderId: recipient.orderId || body.orderId || '',
      orderNumber: recipient.orderNumber || body.orderNumber || '',
      status: normalizedStatus,
    }) || null;

  const generatedAdminAlert =
    body.type === 'admin_new_order'
      ? buildAdminNewOrderAlert({
          orderId: recipient.orderId || body.orderId || '',
          orderNumber: recipient.orderNumber || body.orderNumber || '',
          customerName: recipient.customerName || body.customerName || 'A customer',
        })
      : null;

  const generatedNotification = generatedStatusNotification || generatedAdminAlert;
  const message = String(body.message || generatedNotification?.message || '').trim();

  return {
    type: String(body.type || (normalizedStatus ? 'order_status' : 'generic')).trim() || 'generic',
    title: String(body.title || generatedNotification?.title || 'Order Update').trim(),
    message,
    orderId: recipient.orderId || body.orderId || '',
    orderNumber: recipient.orderNumber || body.orderNumber || '',
    userId: recipient.userId || body.userId || '',
    status: normalizedStatus || generatedNotification?.status || '',
    deepLink: normalizeDeepLink(body.deepLink || generatedNotification?.url || ''),
    channels: normalizeRequestedChannels(body.channels),
    notificationKey: buildNotificationKey({
      type: body.type || (normalizedStatus ? 'order_status' : 'generic'),
      orderId: recipient.orderId || body.orderId || '',
      status: normalizedStatus,
      message,
    }),
  };
};

const isStaleWebPushError = (error) =>
  INVALID_WEB_PUSH_STATUS_CODES.has(Number(error?.statusCode || 0)) ||
  /unsubscribe|expired|not\s+subscribed/i.test(String(error?.message || ''));

const updateRecipientNotificationTargets = async ({
  token,
  userId,
  addresses,
  removeBrowserEndpoints = [],
  removeNativeTokens = [],
}) => {
  if (!userId || (!removeBrowserEndpoints.length && !removeNativeTokens.length)) {
    return { removedBrowserSubscriptions: 0, removedNativeTokens: 0 };
  }

  const existing = partitionUserAddresses(addresses);
  const nextPushSubscriptions = existing.pushSubscriptions.filter(
    (entry) => !removeBrowserEndpoints.includes(entry.endpoint),
  );
  const nextNativePushEntries = existing.nativePushEntries.filter(
    (entry) => !removeNativeTokens.includes(entry.token),
  );

  if (
    nextPushSubscriptions.length === existing.pushSubscriptions.length &&
    nextNativePushEntries.length === existing.nativePushEntries.length
  ) {
    return { removedBrowserSubscriptions: 0, removedNativeTokens: 0 };
  }

  await mutateSupabaseRows({
    path: `/users?id=eq.${encodeURIComponent(userId)}&select=id`,
    method: 'PATCH',
    token,
    body: {
      addresses: serializeUserAddresses({
        plainAddresses: existing.plainAddresses,
        subscriptionMetaEntry: existing.subscriptionMetaEntry,
        pushSubscriptions: nextPushSubscriptions,
        nativePushEntries: nextNativePushEntries,
      }),
    },
    headers: {
      Prefer: 'return=minimal',
    },
  });

  return {
    removedBrowserSubscriptions: existing.pushSubscriptions.length - nextPushSubscriptions.length,
    removedNativeTokens: existing.nativePushEntries.length - nextNativePushEntries.length,
  };
};

const sendEmailNotification = async ({ recipientEmail, orderNumber, message }) => {
  const mailerConfig = getMailerConfig();

  if (!mailerConfig) {
    return { attempted: true, configured: false, sent: 0, error: 'smtp_not_configured' };
  }

  if (!recipientEmail) {
    return { attempted: true, configured: true, sent: 0, error: 'missing_recipient_email' };
  }

  const transporter = nodemailer.createTransport({
    host: mailerConfig.host,
    port: mailerConfig.port,
    secure: mailerConfig.secure,
    auth: mailerConfig.auth,
  });

  await transporter.sendMail({
    from: `"${mailerConfig.fromName}" <${mailerConfig.fromEmail}>`,
    to: recipientEmail,
    subject: `Order Update${orderNumber ? ` • ${orderNumber}` : ''}`,
    text: message,
    html: `
      <div style="font-family: Inter, Arial, sans-serif; color: #111827; line-height: 1.6;">
        <p style="font-size: 18px; font-weight: 700; margin: 0 0 12px;">Sardar Ji Food Corner</p>
        <p style="margin: 0 0 10px;">${message}</p>
        ${
          orderNumber
            ? `<p style="margin: 0 0 18px; color: #6b7280;">Order number: <strong>${orderNumber}</strong></p>`
            : ''
        }
        <p style="margin: 0; color: #6b7280;">
          Track your order anytime on
          <a href="${APP_BASE_URL}" style="color: #e23744; text-decoration: none;">Sardar Ji Food Corner</a>.
        </p>
      </div>
    `,
  });

  return {
    attempted: true,
    configured: true,
    sent: 1,
    error: '',
  };
};

const sendPushNotifications = async ({ subscriptions, title, message, deepLink, notificationKey }) => {
  const pushConfig = getPushConfig();

  if (!pushConfig) {
    return {
      attempted: subscriptions.length > 0,
      configured: false,
      sent: 0,
      failed: 0,
      invalidEndpoints: [],
      error: 'web_push_not_configured',
    };
  }

  if (!subscriptions.length) {
    return {
      attempted: false,
      configured: true,
      sent: 0,
      failed: 0,
      invalidEndpoints: [],
      error: '',
    };
  }

  webpush.setVapidDetails(pushConfig.subject, pushConfig.publicKey, pushConfig.privateKey);

  const payload = JSON.stringify({
    title,
    message,
    tag: notificationKey,
    icon: `${APP_BASE_URL}/brand-logo-light.png`,
    data: {
      url: toAbsoluteDeepLink(deepLink),
      notificationKey,
    },
  });

  const results = await Promise.allSettled(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(subscription, payload);
        return { endpoint: subscription.endpoint };
      } catch (error) {
        throw { endpoint: subscription.endpoint, error };
      }
    }),
  );

  const invalidEndpoints = results
    .filter((entry) => entry.status === 'rejected' && isStaleWebPushError(entry.reason?.error))
    .map((entry) => entry.reason?.endpoint)
    .filter(Boolean);

  return {
    attempted: true,
    configured: true,
    sent: results.filter((entry) => entry.status === 'fulfilled').length,
    failed: results.filter((entry) => entry.status === 'rejected').length,
    invalidEndpoints,
    error: '',
  };
};

const sendNativePushNotifications = async ({
  nativePushEntries,
  title,
  message,
  deepLink,
  notificationKey,
  orderId,
  orderNumber,
  status,
  type,
}) => {
  const messaging = getFirebaseMessaging();

  if (!messaging) {
    return {
      attempted: nativePushEntries.length > 0,
      configured: false,
      sent: 0,
      failed: 0,
      invalidTokens: [],
      error: 'firebase_not_configured',
    };
  }

  if (!nativePushEntries.length) {
    return {
      attempted: false,
      configured: true,
      sent: 0,
      failed: 0,
      invalidTokens: [],
      error: '',
    };
  }

  const tokens = nativePushEntries.map((entry) => entry.token);
  const response = await messaging.sendEachForMulticast({
    tokens,
    notification: {
      title: String(title || 'Order Update'),
      body: String(message || ''),
    },
    data: {
      title: String(title || 'Order Update'),
      message: String(message || ''),
      type: String(type || ''),
      orderId: String(orderId || ''),
      orderNumber: String(orderNumber || ''),
      status: String(status || ''),
      url: toAbsoluteDeepLink(deepLink),
      deep_link: normalizeDeepLink(deepLink),
      notificationKey: String(notificationKey || ''),
    },
    android: {
      priority: 'high',
      collapseKey: notificationKey || undefined,
      notification: {
        channelId: 'sjfc_orders',
        sound: 'default',
        visibility: 'public',
        tag: notificationKey || undefined,
      },
    },
  });

  const invalidTokens = response.responses
    .map((entry, index) => ({ entry, token: tokens[index] }))
    .filter(({ entry }) => !entry.success && INVALID_FCM_ERROR_CODES.has(entry.error?.code))
    .map(({ token }) => token);

  return {
    attempted: true,
    configured: true,
    sent: response.successCount,
    failed: response.failureCount,
    invalidTokens,
    error: '',
  };
};

const summarizeResults = (channelResults = {}) => {
  const totalDelivered =
    (channelResults.realtime?.sent || 0) +
    (channelResults.browserPush?.sent || 0) +
    (channelResults.androidPush?.sent || 0) +
    (channelResults.email?.sent || 0);

  return {
    ok: totalDelivered > 0,
    deliveredCount: totalDelivered,
  };
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { message: 'Method not allowed.' });
  }

  try {
    const authUser = await requireAuthenticatedUser(req);
    const token = getBearerToken(req);
    const actorProfile = await getActorProfile(token, authUser.id);
    const body = await readJsonBody(req);
    const requestType = String(body?.type || '').trim();

    const canSendOrderStatusAsDelivery =
      actorProfile?.role === 'delivery' &&
      (requestType === 'order_status' || (!requestType && String(body?.status || '').trim()));

    if (!actorProfile || (actorProfile.role !== 'admin' && !canSendOrderStatusAsDelivery)) {
      throw createHttpError('Admin or delivery access is required to send order notifications.', 403);
    }

    const recipient = await getOrderRecipient(token, body.orderId, body.userId);

    if (!recipient?.userId) {
      throw createHttpError('Customer notification target could not be resolved.', 404);
    }

    const notification = buildNotificationContract({ body, recipient });

    if (!notification.message) {
      throw createHttpError('A notification message is required.', 400);
    }

    const requestedChannels = new Set(notification.channels);
    const realtimeResult =
      requestedChannels.has(NOTIFICATION_CHANNELS.realtime)
        ? await safeInsertNotification({
            token,
            userId: recipient.userId,
            orderId: notification.orderId,
            message: notification.message,
          })
        : { stored: false, error: 'channel_disabled' };

    const recipientTargets = partitionUserAddresses(recipient.addresses);
    const browserPushResult = requestedChannels.has(NOTIFICATION_CHANNELS.browserPush)
      ? await sendPushNotifications({
          subscriptions: recipientTargets.pushSubscriptions,
          title: notification.title,
          message: notification.message,
          deepLink: notification.deepLink,
          notificationKey: notification.notificationKey,
        })
      : {
          attempted: false,
          configured: true,
          sent: 0,
          failed: 0,
          invalidEndpoints: [],
          error: 'channel_disabled',
        };
    const androidPushResult = requestedChannels.has(NOTIFICATION_CHANNELS.androidPush)
      ? await sendNativePushNotifications({
          nativePushEntries: recipientTargets.nativePushEntries,
          title: notification.title,
          message: notification.message,
          deepLink: notification.deepLink,
          notificationKey: notification.notificationKey,
          orderId: notification.orderId,
          orderNumber: notification.orderNumber,
          status: notification.status,
          type: notification.type,
        })
      : {
          attempted: false,
          configured: true,
          sent: 0,
          failed: 0,
          invalidTokens: [],
          error: 'channel_disabled',
        };

    let emailResult;
    try {
      emailResult = requestedChannels.has(NOTIFICATION_CHANNELS.email)
        ? await sendEmailNotification({
            recipientEmail: recipient.email,
            orderNumber: notification.orderNumber,
            message: notification.message,
          })
        : { attempted: false, configured: true, sent: 0, error: 'channel_disabled' };
    } catch (error) {
      emailResult = {
        attempted: true,
        configured: true,
        sent: 0,
        error: error.message || 'email_send_failed',
      };
    }

    const cleanupResult = await updateRecipientNotificationTargets({
      token,
      userId: recipient.userId,
      addresses: recipient.addresses,
      removeBrowserEndpoints: browserPushResult.invalidEndpoints || [],
      removeNativeTokens: androidPushResult.invalidTokens || [],
    });

    const channelResults = {
      realtime: {
        requested: requestedChannels.has(NOTIFICATION_CHANNELS.realtime),
        configured: true,
        sent: realtimeResult.stored ? 1 : 0,
        stored: realtimeResult.stored,
        error: realtimeResult.error || '',
      },
      browserPush: {
        requested: requestedChannels.has(NOTIFICATION_CHANNELS.browserPush),
        configured: browserPushResult.configured,
        sent: browserPushResult.sent || 0,
        failed: browserPushResult.failed || 0,
        removedStaleTargets: cleanupResult.removedBrowserSubscriptions,
        error: browserPushResult.error || '',
      },
      androidPush: {
        requested: requestedChannels.has(NOTIFICATION_CHANNELS.androidPush),
        configured: androidPushResult.configured,
        sent: androidPushResult.sent || 0,
        failed: androidPushResult.failed || 0,
        removedStaleTargets: cleanupResult.removedNativeTokens,
        error: androidPushResult.error || '',
      },
      email: {
        requested: requestedChannels.has(NOTIFICATION_CHANNELS.email),
        configured: emailResult.configured,
        sent: emailResult.sent || 0,
        error: emailResult.error || '',
      },
    };

    const summary = summarizeResults(channelResults);

    logNotificationAttempt('delivery_result', {
      type: notification.type,
      orderId: notification.orderId,
      userId: recipient.userId,
      notificationKey: notification.notificationKey,
      channels: channelResults,
      deliveredCount: summary.deliveredCount,
    });

    return sendJson(res, 200, {
      ok: summary.ok,
      eventType: notification.type,
      notificationKey: notification.notificationKey,
      title: notification.title,
      message: notification.message,
      deepLink: notification.deepLink,
      channels: channelResults,
      deliveredCount: summary.deliveredCount,
    });
  } catch (error) {
    logNotificationAttempt('delivery_error', {
      message: error.message || 'Unable to send the notification.',
      statusCode: error.statusCode || 500,
    });

    return sendJson(res, error.statusCode || 500, {
      message: error.message || 'Unable to send the notification.',
    });
  }
}
