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
