const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const next = require('next');

require('dotenv').config()
const mongoose = require('mongoose');

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

const CONSTANTS = require('./consts');

const { Schema } = mongoose;

const chatHistorySchema = new Schema({
  user: String,
  text: String,
  room: String,
  createdAt: Number,
  updatedAt: Number
}, {
  timestamps: { currentTime: () => Math.floor(Date.now() / 1000) }
});

mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true});
const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);

// To manage participants
let users = [];
const addUser = ({ id, name, room }) => {
  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();
  const existingUser = users.find((user) => user.room === room && user.name === name);
  if (!name || !room) return { error: 'Username and room are required.' };
  if (existingUser) return { error: 'Username is taken.' };
  const user = { id, name, room };
  users.push(user);

  return { user };
}

// To manage global users
let globalUsers = [];
const addGlobalUser = ({ id, name, room }) => {
  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();
  const existingUser = globalUsers.find((user) => user.room === room && user.name === name);
  if (!name || !room) return { error: 'Username and room are required.' };
  if (existingUser) return { error: 'Username is taken.' };
  const user = { id, name, room };
  globalUsers.push(user);

  return { user };
}

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) return users.splice(index, 1)[0];
}

const removeGlobalUser = (id) => {
  const index = globalUsers.findIndex((user) => user.id === id);
  if (index !== -1) return globalUsers.splice(index, 1)[0];
}

const getUser = (id) => users.find((user) => user.id === id);
const getUsersInRoom = (room) => users.filter((user) => user.room === room);
// TODO: need to cleanup
let participants = [];
const addParticipant = ({ id, name, room }) => {
  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();
  const existingParticipant = participants.find((user) => user.room === room && user.name === name);
  if (existingParticipant) return { error: 'Participantname is taken.' };
  const user = { id, name, room };
  participants.push(user);

  return { user };
}

const removeParticipant = (id) => {
  const index = participants.findIndex((user) => user.id === id);
  if (index !== -1) return participants.splice(index, 1)[0];
}

const getParticipant = (id) => participants.find((user) => user.id === id);
const getParticipantsInRoom = (room) => participants.filter((user) => user.room === room);
// End of participant managements

// fake DB
const messages = [];

io.on('connect', (socket) => {

  socket.on(CONSTANTS.JOIN_GLOBAL, ({name, room}) => {
    const { error } = addGlobalUser({ id: socket.id, name, room });

    if (error) {
      return;
    }
    
    socket.join(CONSTANTS.GLOBAL_ROOM);
    socket.to(CONSTANTS.GLOBAL_ROOM).emit(CONSTANTS.ALL_USER, { room: CONSTANTS.GLOBAL_ROOM, users: globalUsers });
  });

  socket.on('join', ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return callback(error);
    socket.join(user.room);

    // socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}.` });
    socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });

    io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    const chat = { user: user.name, text: message };

    io.to(user.room).emit('message', chat);
    new ChatHistory({...chat, room: user.room}).save();

    callback();
  });

  socket.on('admin-message', ({ tokenContractAddress, message }) => {
    const chat = { user: 'admin', text: message };
    socket.to(tokenContractAddress).emit('message', chat);
    new ChatHistory({ ...chat, room: tokenContractAddress }).save();
  });

  socket.on('link', ({ userId, gameId }, callback) => {
    if (!userId) {
      return callback('userId is null.');
    }
    if (!gameId) {
      return callback('gameId is null.');
    }
    const channel = 'game-' + gameId.trim().toLowerCase();
    const { error, user } = addParticipant({ id: socket.id, name: userId, room: channel });
    if (error) return callback(error);
    socket.join(channel);

    io.to(channel).emit('channelData', { room: channel, users: getParticipantsInRoom(channel) });

    callback();
  });

  socket.on('sendNotify', (room_id, callback) => {
    socket.broadcast.to(room_id.trim().toLowerCase()).emit('notify');
    socket.to(room_id).emit('notify', { user: 'user.name', text: 'message' });
    callback();
  });

  socket.on('invite', userId => {
    console.log('invited: ' + userId);
    socket.to(CONSTANTS.GLOBAL_ROOM).emit('invite', userId);
  });

  socket.on('disconnect', () => {
    removeParticipant(socket.id);
    const user = removeUser(socket.id);
    const globalUser = removeGlobalUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', { user: 'admin', text: `${user.name} has left.` });
      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
    }
  })

  ///////////////////////
  socket.on('game_accepted', (room) => {
    socket.broadcast.to(room).emit('game_accepted');
  })
});

nextApp.prepare().then(() => {
  app.get('/messages', (req, res) => {
    res.json(messages)
  })

  app.all('*', (req, res) => {
    return nextHandler(req, res)
  })

  const PORT = process.env.PORT || 3000
  server.listen(PORT, (err) => {
    if (err) throw err
    console.log('> Ready on http://0.0.0.0:' + PORT)
  })
})
