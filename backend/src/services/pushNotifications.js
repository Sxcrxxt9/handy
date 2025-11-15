import { Expo } from 'expo-server-sdk';
import { PushToken } from '../models/PushToken.js';

const expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN || undefined,
});

const buildMessage = ({
  to,
  title,
  body,
  data = {},
  sound = 'default',
}) => ({
  to,
  title,
  body,
  sound,
  data,
  priority: 'high',
  channelId: 'default',
});

const filterValidTokens = (tokens) =>
  tokens.filter((token) => Expo.isExpoPushToken(token?.token ?? token));

const chunkArray = (items, size) => {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

const sendExpoMessages = async (messages) => {
  const chunks = expo.chunkPushNotifications(messages);
  const receipts = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      receipts.push(...ticketChunk);
    } catch (error) {
      console.error('[push] Failed to send chunk', error);
    }
  }

  return receipts;
};

export const PushNotificationService = {
  async registerToken({ userId, token, platform, userType }) {
    if (!Expo.isExpoPushToken(token)) {
      throw new Error('Invalid Expo push token');
    }

    return PushToken.save({ userId, token, platform, userType });
  },

  async notifyVolunteersOfNewReport(report, reporter) {
    const tokens = await PushToken.getTokensByUserType('volunteer');
    const validTokens = filterValidTokens(tokens);

    if (!validTokens.length) {
      return [];
    }

    const subtitle =
      report.type === 'sos'
        ? 'มีเหตุฉุกเฉินที่ต้องการความช่วยเหลือด่วน'
        : 'มีคำขอความช่วยเหลือใหม่';

    const messages = validTokens.map((token) =>
      buildMessage({
        to: token.token,
        title: 'Handy: แจ้งเตือนเคสใหม่',
        body: subtitle,
        data: {
          reportId: report.id,
          type: report.type,
          latitude: report.latitude,
          longitude: report.longitude,
          requesterId: report.userId,
          requesterName: reporter?.name ?? null,
        },
      })
    );

    return sendExpoMessages(messages);
  },

  async notifyUser(userId, payload) {
    const tokens = await PushToken.getTokensByUserIds(userId);
    const validTokens = filterValidTokens(tokens);

    if (!validTokens.length) {
      return [];
    }

    const { title, body, data = {}, sound } = payload;
    const messages = validTokens.map((token) =>
      buildMessage({
        to: token.token,
        title,
        body,
        data,
        sound,
      })
    );

    return sendExpoMessages(messages);
  },
};

