# React Native Alertify App Documentation

## Overview

The React Native Alertify App is a mobile application designed to help users set reminders and receive notifications. The app uses socket connections for real-time notifications and stores reminders locally using AsyncStorage. This document provides a comprehensive guide on setting up, running, and understanding the app's architecture and functionality.

## Table of Contents
1. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
   - [Running the App](#running-the-app)
2. [Project Structure](#project-structure)
3. [Main Components](#main-components)
   - [App.js](#appjs)
   - [SocketContext.js](#socketcontextjs)
   - [NotificationHandler.js](#notificationhandlerjs)
   - [HomeScreen.js](#homescreenjs)
   - [ReminderFormScreen.js](#reminderformscreenjs)
4. [Backend Server](#backend-server)
5. [Configuration and Utilities](#configuration-and-utilities)
6. [Best Practices](#best-practices)
7. [Debugging Tips](#debugging-tips)

## Getting Started

### Prerequisites
- Node.js (v12 or higher)
- npm or yarn
- React Native CLI
- Android Studio or Xcode for iOS

### Installation
1. **Clone the repository:**
   ```sh
   git clone https://github.com/sohailabubakr/AlertifyApp
   cd AlertifyApp
   ```

2. **Install dependencies:**
   ```sh
   npm install
   # or
   yarn install
   ```

### Running the App
1. **Start the backend server:**
   ```sh
   node server.js
   ```

2. **Run the app on Android or iOS:**
   ```sh
   npx react-native run-android
   # or
   npx react-native run-ios
   ```

## Project Structure

```
/YourApp
│
├── /android
├── /ios
├── /assets
│   ├── /images
│   └── /fonts
├── /src
│   ├── /components
│   │   ├── /common
│   │   │   └── Notification.js
│   │   └── NotificationHandler.js
│   ├── /context
│   │   └── SocketContext.js
│   ├── /navigation
│   │   └── AppNavigator.js
│   ├── /screens
│   │   ├── HomeScreen.js
│   │   └── ReminderFormScreen.js
│   ├── /utils
│   │   ├── constants.js
│   │   ├── storage.js
│   │   └── validation.js
│   └── App.js
├── server.js
├── .babelrc
├── .eslintrc.js
├── app.json
├── index.js
└── package.json
```

## Main Components

### App.js
`App.js` is the root component of the application. It sets up the socket provider and notification handler.

```javascript
import React, { useEffect } from 'react';
import AppNavigator from './navigation/AppNavigator';
import { configurePushNotification } from './components/common/Notification';
import { SocketProvider } from './context/SocketContext';
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
```

### SocketContext.js
`SocketContext.js` provides a context for the socket connection, ensuring a single persistent socket connection.

```javascript
import React, { createContext, useContext, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io(SOCKET_URL);

    socket.current.on('connect', () => console.log('Connected to socket.io server'));
    socket.current.on('disconnect', () => console.log('Disconnected from socket.io server'));

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
```

### NotificationHandler.js
`NotificationHandler.js` listens for socket notifications and displays alerts.

```javascript
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useSocket } from '../context/SocketContext';

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
```

### HomeScreen.js
`HomeScreen.js` fetches and displays reminders, and handles reminder deletion.

```javascript
import React, { useState, useCallback } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotification from 'react-native-push-notification';
import { useFocusEffect } from '@react-navigation/native';
import { fetchReminders, deleteReminder } from '../utils/storage';

const HomeScreen = ({ navigation }) => {
  const [reminders, setReminders] = useState([]);

  useFocusEffect(
    useCallback(() => {
      fetchReminders().then(setReminders);

      PushNotification.configure({
        onNotification: function (notification) {
          Alert.alert('Reminder', notification.message);
        },
        requestPermissions: true,
      });
    }, [])
  );

  const handleDelete = async id => {
    const updatedReminders = await deleteReminder(id);
    setReminders(updatedReminders);
  };

  return (
    <View style={styles.container}>
      <Button
        title="Add Reminder"
        onPress={() => navigation.navigate('ReminderForm')}
      />
      <FlatList
        data={reminders}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.reminderItem}>
            <Text>{item.title}</Text>
            <Text>{item.description}</Text>
            <Text>{item.date} {item.time}</Text>
            <Button title="Delete" onPress={() => handleDelete(item.id)} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  reminderItem: {
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
});

export default HomeScreen;
```

### ReminderFormScreen.js
`ReminderFormScreen.js` allows users to create and schedule new reminders.

```javascript
import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DateTimePicker from '@react-native-community/datetimepicker';
import { saveReminder } from '../utils/storage';
import { scheduleNotification } from '../services/NotificationService';
import { useSocket } from '../context/SocketContext';

const ReminderFormScreen = ({ navigation }) => {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const socket = useSocket();

  const ReminderSchema = Yup.object().shape({
    title: Yup.string().required('Required'),
    description: Yup.string().required('Required'),
  });

  const saveReminderHandler = async values => {
    const reminder = await saveReminder(values, date);
    scheduleNotification(reminder, date);
    if (socket) {
      socket.emit('scheduleNotification', {
        date,
        message: values.description,
      });
    }

    navigation.goBack();
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || date;
    setShowTimePicker(Platform.OS === 'ios');
    setDate(currentTime);
  };

  return (
    <View style={styles.container}>
      <Formik
        initialValues={{ title: '', description: '' }}
        validationSchema={ReminderSchema}
        onSubmit={saveReminderHandler}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
        }) => (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              onChangeText

={handleChange('title')}
              onBlur={handleBlur('title')}
              value={values.title}
              placeholder="Title"
            />
            {errors.title && touched.title && (
              <Text style={styles.errorText}>{errors.title}</Text>
            )}
            <TextInput
              style={styles.input}
              onChangeText={handleChange('description')}
              onBlur={handleBlur('description')}
              value={values.description}
              placeholder="Description"
            />
            {errors.description && touched.description && (
              <Text style={styles.errorText}>{errors.description}</Text>
            )}

            <Button title="Select Date" onPress={() => setShowDatePicker(true)} />
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}

            <Button title="Select Time" onPress={() => setShowTimePicker(true)} />
            {showTimePicker && (
              <DateTimePicker
                value={date}
                mode="time"
                display="default"
                onChange={onTimeChange}
              />
            )}

            <Text style={styles.selectedDateTime}>
              Selected Date: {date.toDateString()} {date.toTimeString().substr(0, 5)}
            </Text>

            <Button title="Save" onPress={handleSubmit} />
          </View>
        )}
      </Formik>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  form: {
    marginVertical: 20,
  },
  input: {
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  errorText: {
    color: 'red',
  },
  selectedDateTime: {
    marginVertical: 10,
    fontSize: 16,
  },
});

export default ReminderFormScreen;
```

## Backend Server

The backend server is implemented using Node.js, Express, and Socket.IO to manage real-time notifications.

### server.js
```javascript
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const schedule = require('node-schedule');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', socket => {
  console.log('New client connected');

  socket.on('scheduleNotification', data => {
    console.log('Notification schedule received:', data);

    const notificationDate = new Date(data.date);
    schedule.scheduleJob(notificationDate, () => {
      io.emit('notification', data.message);
      console.log('Notification sent:', data.message);
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = 8080;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
```

## Configuration and Utilities

### constants.js
Contains application-wide constants.

```javascript
export const SOCKET_URL = 'http://localhost:8080';
```

### storage.js
Handles local storage operations.

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

export const fetchReminders = async () => {
  const savedReminders = await AsyncStorage.getItem('reminders');
  return savedReminders ? JSON.parse(savedReminders) : [];
};

export const saveReminder = async (values, date) => {
  const reminder = { ...values, id: uuid.v4(), date: date.toISOString() };
  const reminders = await fetchReminders();
  reminders.push(reminder);
  await AsyncStorage.setItem('reminders', JSON.stringify(reminders));
  return reminder;
};

export const deleteReminder = async id => {
  const reminders = await fetchReminders();
  const updatedReminders = reminders.filter(reminder => reminder.id !== id);
  await AsyncStorage.setItem('reminders', JSON.stringify(updatedReminders));
  return updatedReminders;
};
```

### validation.js
Contains validation schemas using Yup.

```javascript
import * as Yup from 'yup';

export const ReminderSchema = Yup.object().shape({
  title: Yup.string().required('Required'),
  description: Yup.string().required('Required'),
});
```

## Best Practices

- **Modular Code**: Keep your code modular by separating concerns into different files and directories.
- **Context Management**: Use React Context API to manage global state like socket connections.
- **Error Handling**: Implement proper error handling in both frontend and backend.
- **Code Consistency**: Follow consistent coding standards and styles throughout the application.
- **Documentation**: Maintain clear and concise documentation for your code and project structure.

## Debugging Tips

1. **Check Network Connection**: Ensure that the device running the app can connect to the backend server.
2. **Socket Connection Logs**: Add console logs to verify socket connection status and events.
3. **Verify Backend**: Ensure the backend server is running and accessible.
4. **Testing Tools**: Use tools like Postman or Curl to test backend endpoints.
5. **React Native Debugger**: Utilize React Native Debugger for troubleshooting frontend issues.

With this documentation, you should have a clear understanding of the React Native Alertify App, its structure, and how to set it up and run it. For any further questions or issues, please refer to the provided debugging tips or consult the relevant sections of this document.
