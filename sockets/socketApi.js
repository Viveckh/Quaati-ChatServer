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

    //Upon a socket disconnect, 
    //decrement the count of alive connections, emit that the socket left and new number of active sockets to everyone remaining
    socket.on('disconnect', () => {
        numberOfActiveSockets--;
        //Emitting to all the connected sockets other than itself
        socket.broadcast.emit('news', socket.id + " has just disconnected.");
        
        //Emitting to all the connected sockets
        io.emit('numOfActiveConnections', numberOfActiveSockets);
    });
    
    socket.on('other-event', (data) => {
        console.log(data);
    });

    //Fulfilling request to send a private message
    socket.on('private-message', (receipientSocketId, msg) => {
        //Emitting to itself
        socket.emit('message', '<b>' + socket.id + ': </b>' + msg);
        //Emitting to the receipient socket
        socket.broadcast.to(receipientSocketId).emit('message', '<b>' + socket.id + ': </b>' + msg);
    });

    //Fulfilling reques to send a public message
    socket.on('public-message', (msg) => {
        //Emitting to all the connected sockets including itself
        io.emit('message', '<b>' + socket.id + ': </b>' + msg);
    });
    //io.emit and io.sockets.emit are two same things
});

socketApi.sendNotification = () => {
    io.sockets.emit('hello', {msg: 'Hello World!'});
}

module.exports = socketApi;