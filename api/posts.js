const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const UserModel = require("../models/UserModel");
const FollowerModel = require("../models/FollowerModel");
const PostModel = require("../models/PostModel");
const uuid = require("uuid").v4;
const {newLikeNotification,removeLikeNotification, newCommentNotification,removeCommetNotification} = require('../utilsServer/NotificationActions')

//  CREATE A POST
router.post("/", authMiddleware, async (req, res) => {
  const { text, location, picUrl } = req.body;

  if (text.length < 1)
    return res.status(401).send("text must be atleast 1 character");
  try {
    const newPost = {
      user: req.userId,
      text,
    };
    if (location) newPost.location = location;
    if (picUrl) newPost.picUrl = picUrl;
    const post = await new PostModel(newPost).save();
    const postCreated = await PostModel.findById(post._id).populate("user");
    return res.json(postCreated);
  } catch (error) {
    console.error(error);
    return res.status(501).send("server error");
  }
});

// GET ALL POSTS

router.get("/", authMiddleware, async (req, res) => {
  const { pageNumber } = req.query;
  const number = Number(pageNumber);
  const size = 8;
  try {
    let posts;
    if (number === 1) {
      posts = await PostModel.find()
        .limit(size)
        .sort({ createdAt: -1 })
        .populate("user")
        .populate("comments.user");
    } else {
      const skips = size * (number - 1);
      posts = await PostModel.find()
        .skip(skips)
        .limit(size)
        .sort({ createdAt: -1 })
        .populate("user")
        .populate("comments.user");
    }
    const { userId } = req;
    const loggedUser = await FollowerModel.findOne({ user: userId });
    if (posts.length === 0) return res.json([]);

    let postToBeSent = [];
    if (loggedUser.following.length === 0) {
      postToBeSent = posts.filter(
        (post) => post.user._id.toString() === userId
      );
    }
    //
    else {
      for (i = 0; i < loggedUser.following.length; i++) {
        const foundPostFromFollowing = posts.filter(
          (post) =>
            post.user._id.toString() ===
              loggedUser.following[i].user.toString()
        );
        if (foundPostFromFollowing.length > 0) postToBeSent.push(...foundPostFromFollowing);
      }
      const foundOwnPosts= posts.filter(post=>post.user._id.toString()===userId)
      if(foundOwnPosts.length>0) postToBeSent.push(...foundOwnPosts)
    }
    postToBeSent.length>0 && postToBeSent.sort((a,b)=>[new Date(b.createdAt) - new Date(a.createdAt)])
    return res.json(postToBeSent);
  } catch (error) {
    console.error(error);
    return res.status(501).send("server error");
  }
});

//GET POST BY ID
router.get("/:postId", authMiddleware, async (req, res) => {
  const { postId } = req.params;

  const post = await PostModel.findById(postId).populate('user').populate('comments.user');
  if (!post) return res.status(404).send("Post Not Found!");

  return res.json(post);
});

// DELETE THE POST

router.delete("/:postId", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req;

    const post = await PostModel.findById(postId);
    if (!post) return res.status(404).send("Post Not Found!");

    const user = await UserModel.findById(userId);

    if (post.user.toString() !== userId) {
      if (user.role === "root") {
        await post.remove();
        return res.status(200).send("Scussfully Deleted!");
      } else {
        return res.status(401).send("Unauthorized");
      }
    }
    await post.remove();
    return res.status(200).send("Scussfully Deleted!");
  } catch (error) {}
});

// FOR LIKE A POST
router.post("/like/:postId", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req;
    const post = await PostModel.findById(postId);
    if (!post) return res.status(404).send("No Post found");

    const isLiked =
      post.likes.filter((like) => like.user.toString() === userId).length > 0;
    if (isLiked) return res.status(401).send("post already liked");
    await post.likes.unshift({ user: userId });
    await post.save();

    if(post.user.toString() !== userId) {
      await newLikeNotification(userId,postId,post.user.toString())
    }

    return res.status(200).send("post liked");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
});

// FOR UNLIKE A POST
router.put("/unlike/:postId", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req;
    const post = await PostModel.findById(postId);
    if (!post) return res.status(404).send("No Post found");
    const isLiked =
      post.likes.filter((like) => like.user.toString() === userId).length === 0;
    if (isLiked) return res.status(401).send("post not liked before");
    const index = post.likes.map((like) => like.user.toString()).indexOf();
    await post.likes.splice(index, 1);

    await post.save();
    if(post.user.toString() !== userId) {
      await removeLikeNotification(userId,postId,post.user.toString())
    }
    return res.status(200).send("post unliked");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
});

// GET ALL LIKES OF A POST

router.get("/like/:postId", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await PostModel.findById(postId).populate("likes.user");
    if (!post) return res.status(404).send("No Post Found");
    return res.status(200).json(post.likes);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
});

// CREATE A COMMENT
router.post("/comment/:postId", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req;

    const { text } = req.body;
    if (text.length < 1)
      return res.status(401).send("Comment should be alteast 1 character");
    const post = await PostModel.findById(postId);
    if (!post) return res.status(404).send("Post Not Found");
    const newComment = {
      _id: uuid(),
      text,
      user: userId,
      date: Date.now(),
    };
    await post.comments.unshift(newComment);
    await post.save();
    if(post.user.toString() !== userId) {
      await newCommentNotification(postId,newComment._id,userId,post.user.toString(),text)
    }
    return res.status(200).json(newComment._id);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
});

// DELETE A COMMENT
router.delete("/:postId/:commentId", authMiddleware, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { userId } = req;
    const post = await PostModel.findById(postId);
    if (!post) return res.status(404).send("Post Not Found");
    const comment = await post.comments.find(
      (comment) => comment._id === commentId
    );
    if (!comment) return res.status(404).send("no comment found");

    const user = await UserModel.findById(userId);
    const deleteComment = async () => {
      const indexOf = post.comments
        .map((comment) => comment._id)
        .indexOf(commentId);
      await post.comments.splice(indexOf, 1);
      await post.save();

      if(post.user.toString() !== userId) {
        await removeCommetNotification(postId,commentId,userId,post.user.toString())
      }
      return res.status(200).send("Scussfully Deleted");
    };
    if (comment.user.toString() !== userId) {
      if (user.role === "root") {
        await deleteComment();
      } else {
        return res.status(401).send("Unauthorized");
      }
    }
    await deleteComment();
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
});

module.exports = router;
