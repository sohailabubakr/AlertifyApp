import {useEffect} from 'react';
import {Alert} from 'react-native';
import {useSocket} from '../context/SocketContext';

const NotificationHandler = () => {
  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      const handleNotification = message => {
        Alert.alert('Notification', message);
      };

      socket.on('notification', handleNotification);

      return () => {
        socket.off('notification', handleNotification);
      };
    }
  }, [socket]);

  return null;
};

export default NotificationHandler;
