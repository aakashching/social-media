import React, {useState} from 'react'
import axios from "axios";
import { parseCookies } from "nookies";
import {
  Card,
  Icon,
  Image,
  Divider,
  Segment,
  Container,
  
} from "semantic-ui-react";
import { NoPost } from "../../components/Layout/NoData";
import PostComment from "../../components/Post/PostComments";
import CommentInput from "../../components/Post/CommentInputField";
import LikesList from "../../components/Post/LikesList";
import Link from "next/link";
import { likePost } from "../../utils/postActions";
import calculateTime from "../../utils/calculateTime";
import baseUrl from "../../utils/baseUrl";
const PostPage = ({ post, errorLoading, user }) => {
  const [likes, setLikes] = useState(post.likes);

  const [comments, setComments] = useState(post.comments);

  const isLiked =
    likes.length > 0 &&
    likes.filter((like) => like.user === user._id).length > 0;

  if (errorLoading) return <NoPost />;
  return (
    <Container text>
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
                (comment) =>
                   (
                    <PostComment
                      user={user}
                      postId={post._id}
                      key={comment._id}
                      setComments={setComments}
                      comment={comment}
                    />
                  )
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
    </Container>
  );
};

PostPage.getInitialProps = async (ctx) => {
  try {
    const { postId } = ctx.query

    const { token } = parseCookies(ctx);
    const res = await axios.get(`${baseUrl}/api/posts/${postId}`, {
      headers: { Authorization: token },
    });
    return { post: res.data };
  } catch (error) {
      console.error(error)
    return { errorLoading: true };
  }
};

export default PostPage;
