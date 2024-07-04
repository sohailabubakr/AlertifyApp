import {Alert, Platform} from 'react-native';
import PushNotification from 'react-native-push-notification';

export const configurePushNotification = () => {
  PushNotification.configure({
    onNotification: function (notification) {
      if (notification.foreground) {
        Alert.alert('Notification', notification.message);
      }
    },
    requestPermissions: Platform.OS === 'ios',
  });

  PushNotification.popInitialNotification(notification => {
    if (notification) {
      Alert.alert('Notification', notification.message);
    }
  });
};
