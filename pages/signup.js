import {
  HeaderMessage,
  FooterMessage,
} from "../components/common/WelcomeMessage";
import { useState, useEffect, useRef } from "react";
import {
  Form,
  Button,
  Message,
  TextArea,
  Divider,
  Segment,
} from "semantic-ui-react";
import SocialInputs from "../components/common/SocialInputs";
import ImageDropDiv from "../components/common/ImageDropDiv";
import axios from "axios";
import baseUrl from "../utils/baseUrl";
import { registerUser } from "../utils/authUser";
import uploadPic from "../utils/uploadPicToCloudinary";
let cancel;
const SignUpPage = () => {
  const regexUserName = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/;
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    bio: "",
    facebook: "",
    youtube: "",
    twitter: "",
    instagram: "",
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "media") {
      setMedia(files[0]);
      setMediaPreview(URL.createObjectURL(files[0]));
    }
    setUser((prev) => ({ ...prev, [name]: value }));
  };
  const { name, email, password, bio } = user;
  const [showSocialLinks, setShowSocialLinks] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errMsg, setErrMsg] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(true);
  useEffect(() => {
    const isUser = Object.values({ name, email, password, bio }).every((item) =>
      Boolean(item)
    );
    isUser ? setSubmitDisabled(false) : setSubmitDisabled(true);
  }, [user]);

  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [highlighted, setHighlighted] = useState(false);
  const inputRef = useRef();

  const [username, setUsername] = useState("");
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameAvilable, setUsernameAvilable] = useState(false);

  const checkUsername = async () => {
    setUsernameLoading(true);
    try {
      cancel && cancel();
      const CancelToken = axios.CancelToken;
      const res = await axios.get(`${baseUrl}/api/signup/${username}`, {
        cancelToken: new CancelToken((canceler) => {
          cancel = canceler;
        }),
      });
      if(errMsg!== null)setErrMsg(null)
      if (res.data === "Available") {
        setUsernameAvilable(true);
        setUser((prev) => ({ ...prev, username }));
      }
    } catch (error) {
      setErrMsg("username not Available");
      setUsernameAvilable(false)
      console.log(error);
    }
    setUsernameLoading(false);
  };

  useEffect(() => {
    username === "" ? setUsernameAvilable(false) : checkUsername();
  }, [username]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    let profilePicUrl;
    if (media !== null) {
      profilePicUrl = await uploadPic(media);
    }
    if (media !== null && !profilePicUrl) {
      setFormLoading(false);
      return setErrMsg("Error Uploading Image");
    }

    await registerUser(user, profilePicUrl, setErrMsg, setFormLoading);
  };

  return (
    <>
      <HeaderMessage />
      <Form
        loading={formLoading}
        error={errMsg !== null}
        onSubmit={handleSubmit}
      >
        <Message
          error
          header="Oops!"
          content={errMsg}
          onDismiss={() => setErrMsg(null)}
        />
        <Segment>
          <ImageDropDiv
            highlighted={highlighted}
            setHighlighted={setHighlighted}
            inputRef={inputRef}
            setMedia={setMedia}
            mediaPreview={mediaPreview}
            setMediaPreview={setMediaPreview}
            handleChange={handleChange}
          />
          <Form.Input
            label="Name"
            placeholder="Name"
            name="name"
            value={name}
            onChange={handleChange}
            fluid
            icon="user"
            iconPosition="left"
            required
          />
          <Form.Input
            label="Email"
            placeholder="Email"
            name="email"
            value={email}
            type="email"
            onChange={handleChange}
            fluid
            icon="envelope"
            iconPosition="left"
            required
          />
          <Form.Input
            label="Password"
            placeholder="Password"
            name="password"
            value={password}
            onChange={handleChange}
            fluid
            icon={{
              name: showPassword ? 'eye slash' : "eye",
              circular: true,
              link: true,
              onClick: () => setShowPassword(!showPassword),
            }}
            iconPosition="left"
            type={showPassword ? "text" : "password"}
            required
          />

          <Form.Input
            loading={usernameLoading}
            error={!usernameAvilable}
            label="Username"
            placeholder="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (regexUserName.test(e.target.value)) {
                setUsernameAvilable(true);
              } else {
                setUsernameAvilable(false);
              }
            }}
            fluid
            icon={usernameAvilable ? "check" : "close"}
            iconPosition="left"
            required
          />
        </Segment>
        <SocialInputs
          user={user}
          showSocialLinks={showSocialLinks}
          setShowSocialLinks={setShowSocialLinks}
          handleChange={handleChange}
        />
        <Divider hidden />
        <Button
          icon="signup"
          content="Signup"
          type="submit"
          color="orange"
          disabled={submitDisabled || !usernameAvilable}
        />
        <Divider hidden />
      </Form>
      <FooterMessage />
    </>
  );
};
export default SignUpPage;
