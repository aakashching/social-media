import { useState } from "react";
import { Form, Modal, Segment, List, Icon } from "semantic-ui-react";
import Link from "next/link";
import calculateTime from "../../utils/calculateTime";
const MessageNotificationModal = ({
  socket,
  showNewMsgModal,
  newMsgModal,
  newMsgReceived,
  user,
}) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const formSubmit = (e) => {
    e.preventDefault();
    if (socket.current) {
      socket.current.emit("sendMsgFromNotification", {
        userId: user._id,
        messageSendToUserId: newMsgReceived.sender,
        msg: text,
      });
      socket.current.on('msgSentFromNotification',()=>{
          showNewMsgModal(false)
      })
    }
    setText('')
  };
  return (
    <>
      <Modal
        size="small"
        open={newMsgModal}
        onClose={() => showNewMsgModal(false)}
        closeIcon
        closeOnDimmerClick
      >
        <Modal.Header
          content={`New Message from ${newMsgReceived.senderName}`}
        />
        <Modal.Content>
          <div className="bubbleWrapper">
            <div className="inlineContainer">
              <img
                className="inlineIcon"
                src={newMsgReceived.senderProfilePic}
              />
            </div>
            <div className="otherBubble other">{newMsgReceived.msg}</div>
            <span>{calculateTime(newMsgReceived.date)}</span>
            <div style={{ position: "sticky", bottom: "0px" }}>
              <Segment secondary color="teal" attached="bottom">
                <Form
                  reply
                  onSubmit={formSubmit}
                >
                  <Form.Input
                    size="large"
                    placeholder="Send New Message"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    action={{
                      color: "blue",
                      icon: "telegram plane",
                      disabled: text === "",
                      loading: loading,
                    }}
                  />
                </Form>
              </Segment>
            </div>
          </div>
          <div style={{ marginTop: "5px" }}>
            <Link href={`/messages?message=${newMsgReceived.sender}`}>
              <a>View All Messages</a>
            </Link>
            <br />
            <Instructions username={user.username} />
          </div>
        </Modal.Content>
      </Modal>
    </>
  );
};

const Instructions = ({ username }) => (
  <List>
    <List.Item>
      <Icon name="help" />
      <List.Content>
        <List.Header>
          If you do not like this popup to appear when you receive a new
          message:
        </List.Header>
      </List.Content>
    </List.Item>

    <List.Item>
      <Icon name="hand point right" />
      <List.Content>
        You can disable it by going to
        <Link href={`/${username}`}>
          <a> Account </a>
        </Link>
        Page and clicking on Settings Tab.
      </List.Content>
    </List.Item>

    <List.Item>
      <Icon name="hand point right" />
      Inside the menu,there is an setting named: Show New Message Popup?
    </List.Item>

    <List.Item>
      <Icon name="hand point right" />
      Just toggle the setting to disable/enable the Message Popup to appear.
    </List.Item>
  </List>
);

export default MessageNotificationModal;
