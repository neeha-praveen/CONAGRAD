const { Server } = require("socket.io");
const ChatMessage = require('../Models/ChatMessage');

function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
        },
    });

    io.on("connection", (socket) => {
        console.log("✅ Real-time chat client connected:", socket.id);

        socket.on("joinRoom", (assignmentId) => {
            socket.join(assignmentId);
            console.log(`Socket ${socket.id} joined room ${assignmentId}`);
        });

        socket.on("chatMessage", async (msg) => {
            try {
                const newMessage = new ChatMessage({
                    assignmentId: msg.assignmentId,
                    senderId: msg.senderId,
                    senderModel: msg.senderModel,
                    message: msg.message,
                });
                await newMessage.save();

                const populatedMessage = await ChatMessage.findById(newMessage._id).populate('senderId', 'name');

                // Broadcast the new, complete message to everyone in the room
                io.to(msg.assignmentId).emit("newMessage", populatedMessage);

            } catch (error) {
                console.error("❌ Error handling chat message:", error);
            }
        });

        socket.on("disconnect", () => {
            console.log("🔌 Client disconnected:", socket.id);
        });
    });

    return io;
}

module.exports = { initializeSocket };