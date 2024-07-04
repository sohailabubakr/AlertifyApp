import PushNotification from 'react-native-push-notification';

export const scheduleNotification = (reminder, date) => {
  PushNotification.localNotificationSchedule({
    id: reminder.id,
    message: reminder.description,
    date: date,
    allowWhileIdle: true,
  });
};
