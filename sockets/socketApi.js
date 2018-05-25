import socket_io from 'socket.io';
var io = socket_io();

var socketApi = {};
socketApi.io = io;

io.on('connection', function(socket){
    console.log("A user connected");
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
        console.log(data);
    });
});

socketApi.sendNotification = function() {
    io.sockets.emit('hello', {msg: 'Hello World!'});
}

module.exports = socketApi;