import nodemailer from 'nodemailer';
import webpush from 'web-push';
import { getEnv, getBearerToken, readJsonBody, requireAuthenticatedUser, sendJson } from './_lib/server.js';
import { getFirebaseMessaging } from './_lib/firebase.js';
import { getSupabaseRows, mutateSupabaseRows } from './_lib/supabase.js';
import { buildOrderStatusNotification } from '../src/utils/orderNotifications.js';

const APP_BASE_URL = 'https://www.sardarjifoodcorner.shop';
const PUSH_META_TYPE = 'push-subscription';
const NATIVE_PUSH_META_TYPE = 'native-push-token';

const createHttpError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
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

const extractPushSubscriptions = (addresses = []) =>
  (addresses || [])
    .filter((entry) => entry?._type === PUSH_META_TYPE)
    .map((entry) => entry?.payload || {})
    .filter((subscription) => subscription.endpoint && subscription.keys?.auth && subscription.keys?.p256dh);

const extractNativePushTokens = (addresses = []) =>
  Array.from(
    new Set(
      (addresses || [])
        .filter((entry) => entry?._type === NATIVE_PUSH_META_TYPE)
        .map((entry) => entry?.payload?.token || '')
        .filter(Boolean),
    ),
  );

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

    return true;
  } catch (error) {
    if (/Could not find the table|schema cache|notifications/i.test(error.message || '')) {
      return false;
    }

    return false;
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

const sendEmailNotification = async ({ recipientEmail, orderNumber, message }) => {
  const mailerConfig = getMailerConfig();

  if (!mailerConfig || !recipientEmail) {
    return { sent: false, reason: 'missing_config_or_email' };
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

  return { sent: true };
};

const sendPushNotifications = async ({ subscriptions, message, orderId }) => {
  const pushConfig = getPushConfig();

  if (!pushConfig || !subscriptions.length) {
    return { sent: 0, skipped: subscriptions.length, configured: false };
  }

  webpush.setVapidDetails(pushConfig.subject, pushConfig.publicKey, pushConfig.privateKey);

  const payload = JSON.stringify({
    title: 'Order Update',
    message,
    icon: `${APP_BASE_URL}/brand-logo-light.png`,
    data: {
      url: orderId ? `${APP_BASE_URL}/track/${orderId}` : `${APP_BASE_URL}/profile`,
    },
  });

  const results = await Promise.allSettled(
    subscriptions.map((subscription) => webpush.sendNotification(subscription, payload)),
  );

  return {
    sent: results.filter((entry) => entry.status === 'fulfilled').length,
    failed: results.filter((entry) => entry.status === 'rejected').length,
    configured: true,
  };
};

const sendNativePushNotifications = async ({
  nativePushTokens,
  title,
  message,
  orderId,
  orderNumber,
  status,
}) => {
  const messaging = getFirebaseMessaging();

  if (!messaging || !nativePushTokens.length) {
    return { sent: 0, skipped: nativePushTokens.length, configured: false };
  }

  const data = {
    title: String(title || 'Order Update'),
    message: String(message || ''),
    orderId: String(orderId || ''),
    orderNumber: String(orderNumber || ''),
    status: String(status || ''),
    url: orderId ? `${APP_BASE_URL}/track/${orderId}` : `${APP_BASE_URL}/profile`,
  };

  const response = await messaging.sendEachForMulticast({
    tokens: nativePushTokens,
    notification: {
      title: data.title,
      body: data.message,
    },
    data,
    android: {
      priority: 'high',
      notification: {
        channelId: 'order-updates',
        sound: 'default',
        visibility: 'public',
      },
    },
  });

  return {
    sent: response.successCount,
    failed: response.failureCount,
    configured: true,
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

    if (!actorProfile || actorProfile.role !== 'admin') {
      throw createHttpError('Admin access is required to send order notifications.', 403);
    }

    const body = await readJsonBody(req);
    const recipient = await getOrderRecipient(token, body.orderId, body.userId);

    if (!recipient?.userId) {
      throw createHttpError('Customer notification target could not be resolved.', 404);
    }

    const notification =
      buildOrderStatusNotification({
        orderId: recipient.orderId || body.orderId || '',
        orderNumber: recipient.orderNumber || body.orderNumber || '',
        status: body.status || '',
      }) ||
      {
        title: 'Order Update',
        message: String(body.message || '').trim(),
      };

    if (!notification.message) {
      throw createHttpError('A notification message is required.', 400);
    }

    const stored = await safeInsertNotification({
      token,
      userId: recipient.userId,
      orderId: recipient.orderId || body.orderId || '',
      message: notification.message,
    });

    const pushResult = await sendPushNotifications({
      subscriptions: extractPushSubscriptions(recipient.addresses),
      message: notification.message,
      orderId: recipient.orderId || body.orderId || '',
    });
    const nativePushResult = await sendNativePushNotifications({
      nativePushTokens: extractNativePushTokens(recipient.addresses),
      title: notification.title,
      message: notification.message,
      orderId: recipient.orderId || body.orderId || '',
      orderNumber: recipient.orderNumber || body.orderNumber || '',
      status: body.status || '',
    });

    const emailResult = await sendEmailNotification({
      recipientEmail: recipient.email,
      orderNumber: recipient.orderNumber || body.orderNumber || '',
      message: notification.message,
    });

    return sendJson(res, 200, {
      ok: true,
      stored,
      push: pushResult,
      nativePush: nativePushResult,
      email: emailResult,
    });
  } catch (error) {
    return sendJson(res, error.statusCode || 500, {
      message: error.message || 'Unable to send the notification.',
    });
  }
}
