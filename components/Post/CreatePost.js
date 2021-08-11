import { useState, useRef } from "react";
import { Form, Button, Image, Divider, Icon, Message } from "semantic-ui-react";
import uploadPic from "../../utils/uploadPicToCloudinary";
import { submitNewPost } from "../../utils/postActions";
const CreatePost = ({ user, setPosts }) => {
  const [newPost, setNewPost] = useState({ text: "", location: "" });
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);
  const [highlighted, setHighlighted] = useState(false);
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const inputRef = useRef();

  const handleChange = async (e) => {
    const { name, value, files } = e.target;
    if (name === "media") {
      setMedia(files[0]);
      setMediaPreview(URL.createObjectURL(files[0]));
    }
    setNewPost((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let picUrl;
    if (media !== null) {
      picUrl = await uploadPic(media);
      if (!picUrl) {
        setLoading(false);
        return setError("Error Uploading Image");
      }
    }
    await submitNewPost(
      newPost.text,
      newPost.location,
      picUrl,
      setPosts,
      setNewPost,
      setError
    );
    setMedia(null);
    setMediaPreview(null);
    setLoading(false);
  };

  const addStyles = () => {
    return {
      textAlign: "center",
      height: "150px",
      width: "150px",
      border: "dotted",
      paddingTop: media === null && "60px",
      cursor: "pointer",
      borderColor: highlighted ? "green" : "black",
    };
  };

  return (
    <>
      <Form error={error !== null} onSubmit={handleSubmit}>
        <Message
          error
          onDismiss={() => setError(null)}
          content={error}
          header="Oops"
        />
        <Form.Group>
          <Image src={user.profilePicUrl} circular avatar inline />
          <Form.TextArea
            placeholder="Whats Happening"
            name="text"
            value={newPost.text}
            onChange={handleChange}
            rows={4}
            width={14}
          />
        </Form.Group>
        <Form.Group>
          <Form.Input
            name="location"
            value={newPost.location}
            label="Add Location"
            icon="map marker alternate"
            placeholder={"Want to add Location?"}
            onChange={handleChange}
          />
          <input
            ref={inputRef}
            onChange={handleChange}
            name="media"
            style={{ display: "none" }}
            type="file"
            accept="image/*"
          />
        </Form.Group>
        <div
          onClick={() => inputRef.current.click()}
          style={addStyles()}
          onDragOver={(e) => {
            e.preventDefault();
            setHighlighted(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setHighlighted(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setHighlighted(true);
            const dropedFiles = Array.from(e.dataTransfer.files);
            setMedia(dropedFiles[0]);
            setMediaPreview(URL.createObjectURL(dropedFiles[0]));
          }}
        >
          {media === null ? (
            <>
              <Icon name="plus" size="big" />
            </>
          ) : (
            <>
              <Image
                style={{ height: "150px", width: "150px" }}
                src={mediaPreview}
                alt="postImage"
                centered
                size="medium"
              />
            </>
          )}
        </div>
        <Divider hidden />
        <Button
          circular
          disabled={newPost.text === "" || loading}
          content={<strong>Post</strong>}
          style={{ backgroundColor: "#1DA1F2", color: "white" }}
          icon="send"
          loading={loading}
        />
      </Form>
      <Divider />
    </>
  );
};
export default CreatePost;
