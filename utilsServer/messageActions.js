const ChatModel = require("../models/ChatModel");
const UserModel = require("../models/UserModel");
const loadMessages = async (userId, messagesWith) => {
  try {
    const user = await ChatModel.findOne({ user: userId }).populate(
      "chats.messagesWith"
    );
    const chat = await user.chats.find(
      (chat) => chat.messagesWith._id.toString() === messagesWith
    );

    if (!chat) return { error: "No chat found" };
    return { chat };
  } catch (error) {
    console.log(error);
    return { error };
  }
};

const sendMsg = async (userId, messageSendToUserId, msg) => {
  try {
    const user = await ChatModel.findOne({ user: userId });

    const messageSendToUser = await ChatModel.findOne({
      user: messageSendToUserId,
    });

    const newMsg = {
      sender: userId,
      reciver: messageSendToUserId,
      msg,
      date: Date.now(),
    };

    const previousChat = user.chats.find(
      (chat) => chat.messagesWith.toString() === messageSendToUserId
    );
    if (previousChat) {
      previousChat.messages.push(newMsg);
      await user.save();
    } else {
      const newChat = {
        messagesWith: messageSendToUserId,
        messages: [newMsg],
      };
      user.chats.unshift(newChat);
      await user.save();
    }

    const previousChatForReciver = messageSendToUser.chats.find(
      (chat) => chat.messagesWith.toString() === userId
    );
    if (previousChatForReciver) {
      previousChatForReciver.messages.push(newMsg);
      await messageSendToUser.save();
    } else {
      const newChat = {
        messagesWith: userId,
        messages: [newMsg],
      };
      messageSendToUser.chats.unshift(newChat);
      await messageSendToUser.save();
    }
    return { newMsg };
  } catch (error) {
    console.log(error);
    return { error };
  }
};

const setMsgToUnread = async (userId) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user.unreadMessage) {
      user.unreadMessage = true;
      await user.save();
    }
    return;
  } catch (error) {
    console.log(error);
  }
};

const setMsgToRead = async (userId) => {
  try {
    const user = await UserModel.findById(userId);
    if (user.unreadMessage) {
      user.unreadMessage = false;
      await user.save();
    }
    return;
  } catch (error) {
    console.log(error);
  }
};


const deleteMsg = async (userId, messagesWith, messageId) => {
  try {
    console.log(messageId)
    const user = await ChatModel.findOne({ user: userId });
    const chat = user.chats.find(
      (chat) => chat.messagesWith.toString() === messagesWith
    );
    if (!chat) return;
      console.log(chat)
    const messageToDelete = chat.messages.find(
      (message) => String(message._id) === messageId
    );
    if (!messageToDelete) return;
    if (messageToDelete.sender.toString() !== userId) return;

    const indexOf = chat.messages
      .map((message) => String(message._id))
      .indexOf(messageToDelete._id.toString());
    await chat.messages.splice(indexOf, 1);
    await user.save();

    return { success: true };
  } catch (error) {
    console.log(error);
  }
};

module.exports = { loadMessages, sendMsg, setMsgToUnread, setMsgToRead, deleteMsg };
