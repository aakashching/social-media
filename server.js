const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const next = require("next");
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
require("dotenv").config({ path: "./config.env" });
const connectDb = require("./utilsServer/connectDb");
const {
  addUser,
  removeUser,
  findConnectedUser,
} = require("./utilsServer/roomActions");
const {
  loadMessages,
  sendMsg,
  setMsgToUnread,
  setMsgToRead,
  deleteMsg,
} = require("./utilsServer/messageActions");
const { likeOrUnlikePost } = require("./utilsServer/likeOrUnlikePost");
const port = process.env.PORT || 3000;
connectDb();

io.on("connection", (socket) => {
  socket.on("join", async ({ userId }) => {
    const users = await addUser(userId, socket.id);
    console.log(users);
    setInterval(() => {
      socket.emit("connectedUsers", {
        users: users.filter((user) => user.userId !== userId),
      });
    }, 10000);
  });
  socket.on("likeOrUnlikePost", async ({ postId, userId, like }) => {
    const { success, error, name, profilePicUrl, username, postByUserId } =
      await likeOrUnlikePost(postId, userId, like);
    if (success) {
      socket.emit("postLiked");
      if (postByUserId !== userId) {
        const receiverSocket = await findConnectedUser(postByUserId);
        if (receiverSocket && like) {
          // for emit data to a paricular client or socketId
          io.to(receiverSocket.socketId).emit("newNotificationRecevied", {
            name,
            profilePicUrl,
            username,
            postId,
          });
        }
      }
    }
  });
  socket.on("loadMessages", async ({ userId, messagesWith }) => {
    const { chat, error } = await loadMessages(userId, messagesWith);

    if (!error) {
      socket.emit("messagesLoaded", { chat });
      await setMsgToRead(userId);
    } else {
      socket.emit("noChatFound");
    }
  });

  socket.on("sendNewMsg", async ({ userId, messageSendToUserId, msg }) => {
    const { newMsg, error } = await sendMsg(userId, messageSendToUserId, msg);
    const reciverSocket = await findConnectedUser(messageSendToUserId);
    if (reciverSocket) {
      io.to(reciverSocket.socketId).emit("newMsgReceived", { newMsg });
    } else {
      await setMsgToUnread(messageSendToUserId);
    }
    !error && socket.emit("msgSent", { newMsg });
  });
  socket.on(
    "sendMsgFromNotification",
    async ({ userId, messageSendToUserId, msg }) => {
      const { newMsg, error } = await sendMsg(userId, messageSendToUserId, msg);
      const reciverSocket = await findConnectedUser(messageSendToUserId);
      if (reciverSocket) {
        io.to(reciverSocket.socketId).emit("newMsgReceived", { newMsg });
      } else {
        await setMsgToUnread(messageSendToUserId);
      }
      !error && socket.emit("msgSentFromNotification");
    }
  );
  socket.on("deleteMsg", async ({ userId, messagesWith, messageId }) => {
    const { success } = await deleteMsg(userId, messagesWith, messageId);

    if (success) {
      socket.emit("MsgDeleted");
    }
  });

  socket.on("disconnected", async () => {
    const { status } = await removeUser(socket.id);
    console.log(`socket ${status}`);
  });
});
nextApp.prepare().then(() => {
  app.use(express.json());
  app.use("/api/auth", require("./api/auth"));
  app.use("/api/signup", require("./api/signup"));
  app.use("/api/search", require("./api/search"));
  app.use("/api/posts", require("./api/posts"));
  app.use("/api/profile", require("./api/profile"));
  app.use("/api/notifications", require("./api/notifications"));
  app.use("/api/chats", require("./api/chats"));
  app.use("/api/reset", require("./api/reset"));

  app.get("*", (req, res) => handle(req, res));
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`express server is running on ${port}`);
  });
});
