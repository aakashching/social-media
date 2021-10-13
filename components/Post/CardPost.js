import { useState, useEffect } from "react";
import {
  Card,
  Icon,
  Image,
  Divider,
  Segment,
  Modal,
  Button,
  Popup,
  Header,
} from "semantic-ui-react";
import PostComment from "./PostComments";
import CommentInput from "./CommentInputField";
import Link from "next/link";
import baseUrl from "../../utils/baseUrl";
import calculateTime from "../../utils/calculateTime";
import { deletePost, likePost } from "../../utils/postActions";
import LikesList from "./LikesList";
import ImageModal from "./ImageModal";
import NoImageModal from "./NoImageModal";
const CardPost = ({ post, user, setPosts, setShowToastr, socket }) => {
  const [likes, setLikes] = useState(post.likes);

  const [comments, setComments] = useState(post.comments);

  const isLiked =
    likes.length > 0 &&
    likes.filter((like) => like.user === user._id).length > 0;

  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showProfilePic, setShowProfilePic] = useState(false);
  const addPropsToModal = () => ({
    post,
    user,
    setLikes,
    likes,
    isLiked,
    comments,
    setComments,
  });

  return (
    <>
      {showModal && (
        <Modal
          open={showModal}
          closeIcon
          closeOnDimmerClick
          onClose={() => setShowModal(false)}
        >
          <Modal.Content>
            {post.picUrl ? (
              <ImageModal {...addPropsToModal()} />
            ) : (
              <NoImageModal {...addPropsToModal()} />
            )}
          </Modal.Content>
        </Modal>
      )}
      {showProfilePic && (
        <Modal
          open={showProfilePic}
          closeIcon
          closeOnDimmerClick
          onClose={() => setShowProfilePic(false)}
        >
          <Modal.Content>
            <Image
              centered
              size="huge"
              alt="profilePic"
              src={post.user.profilePicUrl}
            />
          </Modal.Content>
        </Modal>
      )}
      <Segment basic>
        <Card color="teal" fluid>
          {post.picUrl && (
            <Image
              src={post.picUrl}
              style={{ cursor: "pointer" }}
              floated="left"
              wrapped
              ui={false}
              alt="post Image"
              onClick={() => setShowModal(true)}
            />
          )}
          <Card.Content>
            <Image
              floated="left"
              onClick={() => setShowProfilePic(true)}
              style={{ cursor: "pointer" }}
              size="medium"
              src={post.user.profilePicUrl}
              avatar
              circular
            />
            {(user.role === "root" || post.user._id === user._id) && (
              <>
                <Popup
                  on="click"
                  position="top right"
                  trigger={
                    <Image
                      src="/deleteIcon.svg"
                      style={{ cursor: "pointer" }}
                      size="mini"
                      floated="right"
                    />
                  }
                >
                  <Header as="h4" content="Are you sure?" />
                  <p>This action is irreversible!</p>
                  <Button
                    color="red"
                    icon="trash"
                    content="Delete"
                    onClick={() =>
                      deletePost(post._id, setPosts, setShowToastr)
                    }
                  />
                </Popup>
              </>
            )}
            <Card.Header>
              <Link href={`/${post.user.username}`}>
                <a>{post.user.name}</a>
              </Link>
            </Card.Header>
            <Card.Meta>{calculateTime(post.createdAt)}</Card.Meta>
            {post.location && <Card.Meta content={post.location} />}
            <Card.Description
              style={{
                fontSize: "17px",
                letterSpacing: "0.1px",
                wordSpacing: "0.35px",
              }}
            >
              {post.text}
            </Card.Description>
          </Card.Content>
          <Card.Content extra>
            <Icon
              onClick={() =>{
                if(socket.current) {
                  socket.current.emit('likeOrUnlikePost', {postId: post._id, userId: user._id, like: isLiked ? false : true})
                  socket.current.on('postLiked',()=>{
                    if(isLiked){
                      setLikes(prev=> prev.filter(like=> like.user !== user._id))
                    } else {
                      setLikes(prev=> [...prev, {user: user._id}])
                    }
                  })
                } else {
                  likePost(post._id, user._id, setLikes, isLiked ? false : true)
                }
              }}
              name={isLiked ? "heart" : "heart outline"}
              color="red"
              style={{ cursor: "pointer" }}
            />
            <LikesList
              postId={post._id}
              trigger={
                likes.length > 0 && (
                  <span className="spanLikesList">
                    {`${likes.length} ${likes.length === 1 ? "like" : "likes"}`}
                  </span>
                )
              }
            />
            <Icon
              name="comment outline"
              style={{ marginLeft: "7px" }}
              color="blue"
            />
            {comments.length > 0 &&
              comments.map(
                (comment, i) =>
                  i < 3 && (
                    <PostComment
                      user={user}
                      postId={post._id}
                      key={comment._id}
                      setComments={setComments}
                      comment={comment}
                    />
                  )
              )}

            {comments.length > 3 && (
              <Button
                color="teal"
                content="View More"
                basic
                circular
                onClick={() => setShowModal(true)}
              />
            )}
            <Divider hidden />
            <CommentInput
              user={user}
              postId={post._id}
              setComments={setComments}
            />
          </Card.Content>
        </Card>
      </Segment>
      <Divider hidden />
    </>
  );
};
export default CardPost;
