import socket_io from 'socket.io';
var io = socket_io();

var socketApi = {};
socketApi.io = io;

let numberOfActiveSockets = 0;

io.on('connection', (socket) => {
    //Increment the count of alive connections on every new connection
    numberOfActiveSockets++;
    socket.broadcast.emit('news', socket.id + " has just connected.");
    io.emit('numOfActiveConnections', numberOfActiveSockets);

    //Upon a socket disconnect, decrement the count of alive connections
    socket.on('disconnect', () => {
        numberOfActiveSockets--;
        socket.broadcast.emit('news', socket.id + " has just disconnected.");
        io.emit('numOfActiveConnections', numberOfActiveSockets);
    });
    
    //socket.emit('news', "Socket " + socket.id + " has an active connection");
    socket.on('other-event', (data) => {
        console.log(data);
    });

    socket.on('user-message', (data) => {
        io.emit('message', '<b>' + socket.id + ': </b>' + data);
    });
});

socketApi.sendNotification = () => {
    io.sockets.emit('hello', {msg: 'Hello World!'});
}

module.exports = socketApi;