module.exports = class ChatController {
    static chats = [
        {
            message: "Welcome to the chat!",
            name: "Systems",
        },
    ];

    static async handlerConnection(io, socket) {
        try {
            console.log("A user connected:", socket.id);

            // initial chat data to newly connected client
            socket.emit("chats/response", this.chats);
            // console.log(this.chats);

            // Handle new chat messages
            socket.on("chats/create", async (args) => {
                // console.log(args);
                await this.createChat(io, socket, args);
            });

            // Handle disconnection
            socket.on("disconnect", async () => {
                await this.handleDisconnect(socket);
            });
        } catch (error) {
            console.log(
                "🚀 ~ ChatController ~ handlerConnection ~ error:",
                error
            );
        }
    }

    static async createChat(io, socket, args) {
        try {
            const newMessage = { message: args.message, name: args.name };
            this.chats.push(newMessage);

            // updated chat list to all connected clients
            io.emit("chats/response", this.chats);
        } catch (error) {
            console.error("🚀 ~ ChatController ~ createChat ~ error:", error);
        }
    }

    static async handleDisconnect(socket) {
        try {
            console.log("A user disconnected:", socket.id);
        } catch (error) {
            console.error(
                "🚀 ~ ChatController ~ handleDisconnect ~ error:",
                error
            );
        }
    }
};
