import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';

class PushService {
  private expo: Expo;

  constructor() {
    this.expo = new Expo();
  }

  async sendPushNotification(pushToken: string, title: string, body: string, data?: Record<string, any>) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      return;
    }

    const message: ExpoPushMessage = {
      to: pushToken,
      sound: 'default',
      title,
      body,
      data: data || {},
    };

    try {
      const chunks = this.expo.chunkPushNotifications([message]);
      for (const chunk of chunks) {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        console.log('Push ticket:', ticketChunk);
      }
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }

  async sendBatchPushNotifications(messages: ExpoPushMessage[]) {
    const validMessages = messages.filter(msg => {
      const to = Array.isArray(msg.to) ? msg.to[0] : msg.to;
      return Expo.isExpoPushToken(to);
    });

    try {
      const chunks = this.expo.chunkPushNotifications(validMessages);
      for (const chunk of chunks) {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        console.log('Batch push tickets:', ticketChunk);
      }
    } catch (error) {
      console.error('Failed to send batch push notifications:', error);
    }
  }

  async sendPushNotificationToUser(userId: string, title: string, body: string, data?: Record<string, any>) {
    try {
      const [users] = await pool.execute<RowDataPacket[]>(
        'SELECT expo_push_token, push_enabled FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) return;

      const user = users[0];
      // Only send if they have a token AND they haven't explicitly disabled push notifications
      if (user.expo_push_token && user.push_enabled !== 0) {
        await this.sendPushNotification(user.expo_push_token, title, body, data);
      }
    } catch (error) {
      console.error(`Failed to send push notification to user ${userId}:`, error);
    }
  }
}

export const pushService = new PushService();
export const sendPushNotificationToUser = pushService.sendPushNotificationToUser.bind(pushService);
