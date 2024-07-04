import React, {createContext, useContext, useEffect, useRef} from 'react';
import io from 'socket.io-client';
import {SOCKET_URL} from '../utils/constants';

const SocketContext = createContext();

export const SocketProvider = ({children}) => {
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io(SOCKET_URL);

    socket.current.on('connect', () =>
      console.log('Connected to socket.io server'),
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

  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
