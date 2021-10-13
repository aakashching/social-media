import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import baseUrl from "../utils/baseUrl";
import CreatePost from "../components/Post/CreatePost";
import CardPost from "../components/Post/CardPost";
import { Segment } from "semantic-ui-react";
import { parseCookies } from "nookies";
import { NoPosts } from "../components/Layout/NoData";
import { PostDeleteToastr } from "../components/Layout/Toastr";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  PlaceHolderPosts,
  EndMessage,
} from "../components/Layout/PlaceHolderGroup";
import cookie from "js-cookie";
import getUserInfo from "../utils/getUserInfo";
import MessageNotificationModal from "../components/Notifications/MessageNotificationModal";
import newMsgSound from "../utils/newMsgSound";
import NotificationPortal from "../components/Notifications/NotificationPortal";
const HomePage = ({ user, postData, errorLoading }) => {
  const [posts, setPosts] = useState(postData);
  const [showToastr, setShowToastr] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pageNumber, setPageNumber] = useState(2);
  const [newMsgReceived, setNewMsgReceived] = useState(null);
  const [newMsgModal, showNewMsgModal] = useState(null);
  const [newNotification, setNewNotification] = useState(null);
  const [notificationPopup, showNotificationPopup] = useState(false);
  const socket = useRef();
  useEffect(() => {
    if (!socket.current) {
      socket.current = io(baseUrl);
    }

    if (socket.current) {
      socket.current.emit("join", { userId: user._id });
      socket.current.on("newMsgReceived", async ({ newMsg }) => {
        const { name, profilePicUrl } = await getUserInfo(newMsg.sender);
        if (user.newMessagePopup) {
          setNewMsgReceived({
            ...newMsg,
            senderName: name,
            senderProfilePic: profilePicUrl,
          });
          showNewMsgModal(true);
          newMsgSound(name);
        }
      });

      document.title = `Welcome ${user.name.split(" ")[0]}`;
      return () => {
        if (socket.current) {
          socket.current.emit("disconnected");
          socket.current.off();
        }
      };
    }
  }, []);

    // if (document.visibilityState === "visible") {
    //   if(socket.current) {
    //     socket.current.emit("join", { userId: user._id });
    //   }
    // }

    // if (document.visibilityState !== "visible") {
    //   if(socket.current) {
    //     socket.current.emit("disconnected");
    //     socket.current.off();
    //   }
    // }
  

  useEffect(() => {
    showToastr && setTimeout(() => setShowToastr(false), 3000);
  }, [showToastr]);
  useEffect(() => {
    if (socket.current) {
      socket.current.on(
        "newNotificationRecevied",
        ({ name, profilePicUrl, username, postId }) => {
          setNewNotification({ name, profilePicUrl, username, postId });
          showNotificationPopup(true);
        }
      );
    }
  }, []);
  const fetchDataOnScroll = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/posts`, {
        headers: { Authorization: cookie.get("token") },
        params: { pageNumber },
      });
      if (res.data.length === 0) setHasMore(false);
      setPosts((prev) => [...prev, ...res.data]);
      setPageNumber((prev) => prev + 1);
    } catch (error) {
      alert("Error Fetching Posts");
    }
  };

  return (
    <>
      {notificationPopup && newNotification !== null && (
        <NotificationPortal
          newNotification={newNotification}
          notificationPopup={notificationPopup}
          showNotificationPopup={showNotificationPopup}
        />
      )}
      {showToastr && <PostDeleteToastr />}
      {showNewMsgModal && newMsgReceived !== null && (
        <MessageNotificationModal
          socket={socket}
          showNewMsgModal={showNewMsgModal}
          newMsgModal={newMsgModal}
          newMsgReceived={newMsgReceived}
          user={user}
        />
      )}
      <Segment>
        <CreatePost user={user} setPosts={setPosts} />
        {posts.length === 0 || errorLoading ? (
          <NoPosts />
        ) : (
          <InfiniteScroll
            hasMore={hasMore}
            next={fetchDataOnScroll}
            loader={<PlaceHolderPosts />}
            endMessage={<EndMessage />}
            dataLength={posts.length}
          >
            {posts.map((post) => (
              <CardPost
                user={user}
                post={post}
                key={post._id}
                setPosts={setPosts}
                setShowToastr={setShowToastr}
                socket={socket}
              />
            ))}
          </InfiniteScroll>
        )}
      </Segment>
    </>
  );
};

HomePage.getInitialProps = async (ctx) => {
  try {
    const { token } = parseCookies(ctx);
    const res = await axios.get(`${baseUrl}/api/posts`, {
      headers: { Authorization: token },
      params: { pageNumber: 1 },
    });
    return { postData: await res.data };
  } catch (error) {
    return { errorLoading: true };
  }
};
export default HomePage;
