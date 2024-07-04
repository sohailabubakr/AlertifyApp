import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

export const fetchReminders = async () => {
  const savedReminders = await AsyncStorage.getItem('reminders');
  return savedReminders ? JSON.parse(savedReminders) : [];
};

export const saveReminder = async (values, date) => {
  const reminder = {...values, id: uuid.v4(), date: date.toISOString()};
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
