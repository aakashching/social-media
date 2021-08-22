import React from "react";
import { Modal } from "semantic-ui-react";
import classes from './MessageModal.module.css'
import {useRouter} from 'next/router'
import MessageInputField from "./MessageInputField";
import Message from "./Message";
import Banner from "./Banner";

const MessageModal = ({user,bannerData,connectedUsers, messages, divRef,deleteMsg, sendMsg, openChatId,}) => {
  const router = useRouter()
  return (
    <>
      <Modal open={openChatId} size='fullscreen' onClose={()=> router.replace('/messages')} closeIcon >
        <div
          style={{
            overflow: "auto",
            overflowX: "hidden",
            maxHeight: "35rem",
            height: "35rem",
          }}
          className={classes.msgBox}
        >
          <>
            <div style={{ position: "sticky", top: "0" }}>
              <Banner bannerData={bannerData} connectedUsers={connectedUsers} />
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
  );
};

export default MessageModal;
