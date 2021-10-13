import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import baseUrl from "../utils/baseUrl";
import { parseCookies } from "nookies";
import {
  Segment,
  Header,
  Divider,
  Comment,
  Grid,
  Icon,
  Modal
} from "semantic-ui-react";
import Chat from "../components/Chats/Chat";
import ChatsSearch from "../components/Chats/ChatsSearch";
import { useRouter } from "next/router";
import { NoMessages } from "../components/Layout/NoData";
import io from "socket.io-client";
import MessageInputField from "../components/Messages/MessageInputField";
import Message from "../components/Messages/Message";
import Banner from "../components/Messages/Banner";
import getUserInfo from "../utils/getUserInfo";
import newMsgSound from "../utils/newMsgSound";
import cookie from "js-cookie";
import classes from '../components/Messages/MessageModal.module.css'
const scrollDivToBottom = (divRef) => {
  divRef.current !== null &&
    divRef.current.scrollIntoView({ behaviour: "smooth" });
};
const Messages = ({ chatsData, user, errorLoading }) => {
  const router = useRouter();
  const socket = useRef();

  const [chats, setChats] = useState(chatsData);

  const [messages, setMessages] = useState([]);
  const [bannerData, setBannerData] = useState({
    name: "",
    profilePicUrl: "",
  });

  const divRef = useRef();
  const openChatId = useRef("");
  const [connectedUsers, setConnectedUsers] = useState([]);

  useEffect(() => {
    if (!socket.current) {
      socket.current = io(baseUrl);
    }
    if (socket.current) {
      socket.current.emit("join", { userId: user._id });

      socket.current.on("connectedUsers", ({ users }) => {
        users.length > 0 && setConnectedUsers(users);
      });
    }

    if (chats.length > 0 && !router.query.message)
      router.push(`/messages?message=${chats[0].messagesWith}`, undefined, {
        shallow: true,
      });

    return () => {
      if (socket.current) {
        socket.current.emit("disconnected");
        socket.current.off();
      }
    };
  }, []);

  useEffect(() => {
    const loadMessages = () => {
      socket.current.emit("loadMessages", {
        userId: user._id,
        messagesWith: router.query.message,
      });
      socket.current.on("messagesLoaded", ({ chat }) => {
        setMessages(chat.messages);
        setBannerData({
          name: chat.messagesWith.name,
          profilePicUrl: chat.messagesWith.profilePicUrl,
          userId: router.query.message,
        });
        openChatId.current = chat.messagesWith._id;
        divRef.current && scrollDivToBottom(divRef);
      });

      socket.current.on("noChatFound", async () => {
        const { name, profilePicUrl } = await getUserInfo(router.query.message);
        setBannerData({ name, profilePicUrl, userId: router.query.message });
        setMessages([]);
        openChatId.current = router.query.message;
      });
    };
    if (socket.current && router.query.message) {
      loadMessages();
    }
  }, [router.query.message]);

  const sendMsg = (msg) => {
    if (socket.current) {
      socket.current.emit("sendNewMsg", {
        userId: user._id,
        messageSendToUserId: openChatId.current,
        msg,
      });
    }
  };

  useEffect(() => {
    if (socket.current) {
      socket.current.on("msgSent", ({ newMsg }) => {
        if (newMsg.reciver === openChatId.current)
          setMessages((prev) => [...prev, newMsg]);

        setChats((prev) => {
          const previousChat = prev.find(
            (chat) => chat.messagesWith === newMsg.reciver
          );
          previousChat.lastMessage = newMsg.msg;
          previousChat.date = newMsg.date;
          return [...prev];
        });
      });
      socket.current.on("newMsgReceived", async ({ newMsg }) => {
        let senderName;

        if (newMsg.sender === openChatId.current) {
          setMessages((prev) => [...prev, newMsg]);
          setChats((prev) => {
            const previousChat = prev.find(
              (chat) => chat.messagesWith === newMsg.sender
            );
            previousChat.lastMessage = newMsg.msg;
            previousChat.data = newMsg.date;
            senderName = previousChat.name;
            return [...prev];
          });
        }
        //
        else {
          const ifPrevMsg =
            chats.filter((chat) => chat.messagesWith === newMsg.sender).length >
            0;
          if (ifPrevMsg) {
            setChats((prev) => {
              const previousChat = prev.find(
                (chat) => chat.messagesWith === newMsg.sender
              );
              previousChat.lastMessage = newMsg.msg;
              previousChat.dat = newMsg.date;
              senderName = previousChat.name;
              return [...prev];
            });
          } else {
            const { name, profilePicUrl } = await getUserInfo(newMsg.sender);
            senderName = name;
            const newChat = {
              messagesWith: newMsg.sender,
              name,
              profilePicUrl,
              lastMessage: newMsg.msg,
              date: newMsg.date,
            };
            setChats((prev) => [newChat, ...prev]);
          }
        }
        newMsgSound(senderName);
      });
    }
  }, []);
  useEffect(() => {
    messages.length > 0 && scrollDivToBottom(divRef);
  }, [messages]);

  const deleteMsg = (messageId) => {
    if (socket.current) {
      socket.current.emit("deleteMsg", {
        userId: user._id,
        messagesWith: openChatId.current,
        messageId,
      });
      socket.current.on("MsgDeleted", () => {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      });
    }
  };

  const deleteChat = async (messagesWith) => {
    try {
      const res = await axios.delete(`/api/chats/${messagesWith}`, {
        headers: { Authorization: cookie.get("token") },
      });
      console.log(res.data);
      setChats((prev) =>
        prev.filter((chat) => chat.messagesWith !== messagesWith)
      );
      router.push("/messages", undefined, { shallow: true });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Segment basic size="large" style={{ marginTop: "5px" }} padded>
      <Header
        icon="home"
        content="Go Back!"
        onClick={() => router.push("/")}
        style={{ cursor: "pointer" }}
      />
      <Divider hidden />
      <div style={{ marginBottom: "10px" }}>
        <ChatsSearch chats={chats} setChats={setChats} user={user} />
      </div>

      {chats.length > 0 ? (
        <>
          <Grid stackable>
            <Grid.Column width='10'>
              <Comment.Group size="big">
                <Segment
                  raised
                  style={{ overflow: "auto", maxHeight: "32rem" }}
                >
                  {chats.map((chat, i) => (
                    <Chat
                      connectedUsers={connectedUsers}
                      key={i}
                      chat={chat}
                      setChats={setChats}
                      deleteChat={deleteChat}
                    />
                  ))}
                </Segment>
              </Comment.Group>
            </Grid.Column>
            
              {router.query.message && (
                <>
                  <Modal
                    open={openChatId}
                    size='large'
                    onClose={() => router.replace("/messages")}
                    closeIcon
                  >
                    <div
                      style={{
                        overflow: "auto",
                        overflowX: "hidden",
                        maxHeight: "75%",
                        height: "45rem",
                        width: '100%'
                      }}
                      className={classes.msgBox}
                    >
                      <>
                        <div style={{ position: "sticky", top: "0" }}>
                          <Banner
                            bannerData={bannerData}
                            connectedUsers={connectedUsers}
                          />
                        </div>
                        {messages.length > 0 && (
                          <>
                            {messages.map((message, i) => (
                              <Message
                                divRef={divRef}
                                key={i}
                                bannerProfilePic={bannerData.profilePicUrl}
                                message={message}
                                user={user}
                                deleteMsg={deleteMsg}
                              />
                            ))}
                          </>
                        )}
                      </>
                    </div>
                    <MessageInputField sendMsg={sendMsg} />
                  </Modal>
                </>
              )}
          </Grid>
        </>
      ) : (
        <NoMessages />
      )}
    </Segment>
  );
};

Messages.getInitialProps = async (ctx) => {
  try {
    const { token } = parseCookies(ctx);
    const res = await axios.get(`${baseUrl}/api/chats`, {
      headers: { Authorization: token },
    });

    return { chatsData: res.data };
  } catch (error) {
    console.log(error);
    return { errorLoading: true };
  }
};

export default Messages;
