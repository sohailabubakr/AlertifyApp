import React, {useState} from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import {Formik} from 'formik';
import * as Yup from 'yup';
import DateTimePicker from '@react-native-community/datetimepicker';
import {saveReminder} from '../utils/storage';
import {scheduleNotification} from '../services/NotificationService';
import {useSocket} from '../context/SocketContext';

const ReminderFormScreen = ({navigation}) => {
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
        initialValues={{title: '', description: ''}}
        validationSchema={ReminderSchema}
        onSubmit={saveReminderHandler}>
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
              onChangeText={handleChange('title')}
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

            <Button
              title="Select Date"
              onPress={() => setShowDatePicker(true)}
            />
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}

            <Button
              title="Select Time"
              onPress={() => setShowTimePicker(true)}
            />
            {showTimePicker && (
              <DateTimePicker
                value={date}
                mode="time"
                display="default"
                onChange={onTimeChange}
              />
            )}

            <Text style={styles.selectedDateTime}>
              Selected Date: {date.toDateString()}{' '}
              {date.toTimeString().substr(0, 5)}
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
