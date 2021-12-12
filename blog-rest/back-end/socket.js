let io;

module.exports = {
    init: (httpServer) => {
        const { Server } = require("socket.io");
        io = new Server(httpServer, {cors: {
                origin: '*',
            }})
        console.log('socket successfully initialized...')
        return io;
    },

    getIO: () => {
        if(!io){
            throw new Error('Socket.io not initialized');
        }

        return io;
    }
}
