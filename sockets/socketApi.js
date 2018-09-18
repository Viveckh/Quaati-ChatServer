import socket_io from 'socket.io';
import _ from 'lodash'
import {
    dbConnection
} from './../db/index.js';
import ActiveUserService from './../services/activeUserService.js'
import MessageService from './../services/messageService.js'

var io = socket_io();

var socketApi = {};
socketApi.io = io;

let numberOfActiveSockets = 0;

let usersDB = []
let users = {};

let userToSocket = {},
    socketToUser = {};

let chatId = 1;

let messagesDB = [];

io.on('connection', (socket) => {

    console.log("New socket connected: ", socket.id)

    socket.on('getOnlineUsers', () => getAllOnlineUsers(socket))

    //Upon a socket disconnect, 
    //decrement the count of alive connections, emit that the socket left and new number of active sockets to everyone remaining
    socket.on('disconnect', () => {
        numberOfActiveSockets--;

        console.log("Socket disconnected: ", socket.id)
        //Emitting to all the connected sockets
        io.emit('numOfActiveConnections', numberOfActiveSockets);
    });

    socket.on('userJoined', (userId) => onUserJoined(userId, socket));

    socket.on('chatHistory', (chatId) => onChatHistory(chatId, socket))

    socket.on('other-event', (data) => {
        console.log(data);
    });

    socket.on("web-message", msg => webMessageReceived(msg, socket))

    //Fulfilling request to send a private message
    socket.on('private-message', (receipientSocketId, msg) => {
        //Emitting to itself
        socket.emit('message', '<b>' + socket.id + ': </b>' + msg);
        //Emitting to the receipient socket
        socket.broadcast.to(receipientSocketId).emit('message', '<b>' + socket.id + ': </b>' + msg);
    });

    socket.on('public-message', (message) => onMessageReceived(message, socket));
    //io.emit and io.sockets.emit are two same things
});

socketApi.sendNotification = () => {
    io.sockets.emit('hello', {
        msg: 'Hello World!'
    });
}

function getAllOnlineUsers(socket) {
    socket.emit('showOnlineUsers', {
        msg: users
    });
}


// Event listeners.
// When a user joins the chatroom. Send back all the users that the current user has chatted with from messages
async function onUserJoined(userId, socket) {
    let friendList = await ActiveUserService.getAllFriendsChattedWith(userId);
    socket.emit('allUsers', friendList);

    userToSocket[userId] = socket.id;
}

async function onChatHistory(chatId, socket) {
    let history = await MessageService.getChatHistory(chatId);
    socket.emit('showChatHistory', history)
}

function webMessageReceived(message, senderSocket) {
    var userId = users[senderSocket.id];

    // Safety check.
    if (!userId) {
        users[senderSocket.id] = senderSocket.id;
        userId = senderSocket.id;
    }
    let msg = {
        text: message,
        user: {
            _id: userId
        }
    }

    _sendAndSaveMessage(msg, senderSocket);
}

// When a user sends a message in the chatroom.
function onMessageReceived(message, senderSocket) {
    var userId = users[senderSocket.id];

    // Safety check.
    if (!userId) return;

    _sendAndSaveMessage(message, senderSocket);
}


// Helper functions.
// Send the pre-existing messages to the user that just joined.
function _sendExistingMessages(socket) {
    var messages = _.filter(messagesDB, msg => {
        return msg.chatId == chatId;
    })

    if (!messages.length) return;
    socket.emit('message', messages.reverse());


    // var messages = db.collection('messages')
    //   .find({ chatId })
    //   .sort({ createdAt: 1 })
    //   .toArray((err, messages) => {
    //     // If there aren't any messages, then return.
    //     if (!messages.length) return;
    //     socket.emit('message', messages.reverse());
    // });
}

// Save the message to the db and send all sockets but the sender.
function _sendAndSaveMessage(message, socket, fromServer) {
    var messageData = {
        text: message.text,
        user: message.user,
        createdAt: new Date(message.createdAt),
        chatId: chatId,
        _id: parseInt((Math.random() * 100) + 1)
    };

    messagesDB.push(messageData);

    var emitter = fromServer ? io : socket.broadcast;
    emitter.emit('message', [messageData]);
}

module.exports = socketApi;