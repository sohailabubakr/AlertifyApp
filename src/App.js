import React, {useEffect} from 'react';
import AppNavigator from './navigation/AppNavigator';
import {configurePushNotification} from './components/common/Notification';
import {SocketProvider} from './context/SocketContext';
import NotificationHandler from './components/NotificationHandler';

const App = () => {
  useEffect(() => {
    configurePushNotification();
  }, []);

  return (
    <SocketProvider>
      <NotificationHandler />
      <AppNavigator />
    </SocketProvider>
  );
};

export default App;
