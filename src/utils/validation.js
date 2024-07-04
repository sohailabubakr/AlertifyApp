import * as Yup from 'yup';

export const ReminderSchema = Yup.object().shape({
  title: Yup.string().required('Required'),
  description: Yup.string().required('Required'),
});
