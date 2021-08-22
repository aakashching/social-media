import { Feed, Icon } from "semantic-ui-react";
import calculateTime from "../../utils/calculateTime";
const LikeNotification = ({ user, notification }) => {
  return (
    <>
      <Feed.Event>
        <Feed.Label image={notification.user.profilePicUrl} />
        <Feed.Content>
          <Feed.Summary>
            <>
              <Feed.User
                as="a"
                href={`/${notification.user.username.toString}`}
              >
                {notification.user.name}
              </Feed.User>{" "}
              liked your <a href={`/post/${notification.post._id}`}>post</a>
              <Feed.Date>{calculateTime(notification.date)}</Feed.Date>
            </>
          </Feed.Summary>
          {notification.post.picUrl && (
            <Feed.Extra images>
              <a href={`/post/${notification.post._id}`}>
                <img src={notification.post.picUrl} />
              </a>
            </Feed.Extra>
          )}
          <Feed.Meta>
            <Feed.Like>
              <Icon name="like" />{" "}
              {notification.post.likes.length === 1
                ? "1 like"
                : `${notification.post.likes.length} likes`}
            </Feed.Like>
          </Feed.Meta>
        </Feed.Content>
      </Feed.Event>
    </>
  );
};
export default LikeNotification;
