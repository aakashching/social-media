import {
  Modal,
  Grid,
  Image,
  Card,
  Icon,
  Divider,
  GridColumn,
} from "semantic-ui-react";
import PostComment from "./PostComments";
import CommentInput from "./CommentInputField";
import Link from "next/link";
import baseUrl from "../../utils/baseUrl";
import calculateTime from "../../utils/calculateTime";
import { deletePost, likePost } from "../../utils/postActions";
import LikesList from "./LikesList";

const ImageModal = ({
  post,
  user,
  setLikes,
  likes,
  isLiked,
  comments,
  setComments,
}) => {
  return (
    <>
      <Grid stackable relaxed columns={2}>
        <Grid.Column>
          <Modal.Content image>
            <Image src={post.picUrl} wrapped size="large" />
          </Modal.Content>
        </Grid.Column>
        <Grid.Column>
          <Card fluid>
            <Card.Content>
              <Image floated="left" avatar src={post.user.profilePicUrl} />
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
                onClick={() =>
                  likePost(post._id, user._id, setLikes, isLiked ? false : true)
                }
                name={isLiked ? "heart" : "heart outline"}
                color="red"
                style={{ cursor: "pointer" }}
              />
              <LikesList
                postId={post._id}
                trigger={
                  likes.length > 0 && (
                    <span className="spanLikesList">
                      {`${likes.length} ${
                        likes.length === 1 ? "like" : "likes"
                      }`}
                    </span>
                  )
                }
              />

              <Divider hidden />
              <div
                style={{
                  overflow: "auto",
                  height: comments.length> 2 ? "200px" :"60px",
                  marginBottom: "8px",
                }}
              >
                {comments.length > 0 &&
                  comments.map((comment) => (
                    <PostComment
                      user={user}
                      postId={post._id}
                      key={comment._id}
                      setComments={setComments}
                      comment={comment}
                    />
                  ))}
              </div>

              <CommentInput postId={post._id} user={user} setComments={setComments} />
            </Card.Content>
          </Card>
        </Grid.Column>
      </Grid>
    </>
  );
};
export default ImageModal;
