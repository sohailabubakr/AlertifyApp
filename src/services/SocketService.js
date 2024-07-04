import {useEffect, useRef} from 'react';
import io from 'socket.io-client';
import {Alert} from 'react-native';
import {SOCKET_URL} from '../utils/constants';

const useSocket = () => {
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io(SOCKET_URL);

    socket.current.on('connect', () =>
      console.log('Connected to socket.io server'),
    );
    socket.current.on('notification', message =>
      Alert.alert('Notification', message),
    );
    socket.current.on('disconnect', () =>
      console.log('Disconnected from socket.io server'),
    );

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  return socket.current;
};

export default useSocket;
