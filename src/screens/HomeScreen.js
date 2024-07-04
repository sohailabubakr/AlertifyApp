import React, {useState, useCallback} from 'react';
import {View, Text, Button, FlatList, StyleSheet, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotification from 'react-native-push-notification';
import {useFocusEffect} from '@react-navigation/native';
import {fetchReminders, deleteReminder} from '../utils/storage';

const HomeScreen = ({navigation}) => {
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
    }, []),
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
        renderItem={({item}) => (
          <View style={styles.reminderItem}>
            <Text>{item.title}</Text>
            <Text>{item.description}</Text>
            <Text>
              {item.date} {item.time}
            </Text>
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
