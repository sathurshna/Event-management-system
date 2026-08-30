"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushService = void 0;
const expo_server_sdk_1 = require("expo-server-sdk");
class PushService {
    constructor() {
        this.expo = new expo_server_sdk_1.Expo();
    }
    async sendPushNotification(pushToken, title, body, data) {
        if (!expo_server_sdk_1.Expo.isExpoPushToken(pushToken)) {
            console.error(`Push token ${pushToken} is not a valid Expo push token`);
            return;
        }
        const message = {
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
        }
        catch (error) {
            console.error('Failed to send push notification:', error);
        }
    }
    async sendBatchPushNotifications(messages) {
        const validMessages = messages.filter(msg => {
            const to = Array.isArray(msg.to) ? msg.to[0] : msg.to;
            return expo_server_sdk_1.Expo.isExpoPushToken(to);
        });
        try {
            const chunks = this.expo.chunkPushNotifications(validMessages);
            for (const chunk of chunks) {
                const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
                console.log('Batch push tickets:', ticketChunk);
            }
        }
        catch (error) {
            console.error('Failed to send batch push notifications:', error);
        }
    }
}
exports.pushService = new PushService();
