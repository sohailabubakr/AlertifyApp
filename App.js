import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import ReminderFormScreen from './src/screens/ReminderFormScreen';
// import NotificationService from './services/NotificationService';
import PushNotification from 'react-native-push-notification';

const Stack = createStackNavigator();

const App = () => {
  useEffect(() => {
    // Configure PushNotification
    PushNotification.configure({
      onNotification: function (notification) {
        console.log('LOCAL NOTIFICATION ==>', notification);

        // Handle the notification here
        if (notification.foreground) {
          Alert.alert('Notification', notification.message);
        }
      },
      requestPermissions: Platform.OS === 'ios',
    });

    // Handle the initial notification if the app was terminated
    PushNotification.popInitialNotification(notification => {
      if (notification) {
        console.log('INITIAL NOTIFICATION ==>', notification);
        Alert.alert('Notification', notification.message);
      }
    });
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ReminderForm" component={ReminderFormScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
