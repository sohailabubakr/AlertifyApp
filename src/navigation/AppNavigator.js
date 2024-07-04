import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import ReminderFormScreen from '../screens/ReminderFormScreen';
import PushNotification from 'react-native-push-notification';

const Stack = createStackNavigator();

const AppNavigator = () => {
  useEffect(() => {
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

export default AppNavigator;
