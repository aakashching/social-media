import { useRef, useState } from "react";
import { Form, Button, Divider, Message } from "semantic-ui-react";
import uploadPic from "../../utils/uploadPicToCloudinary";
import ImageDropDiv from "../common/ImageDropDiv";
import SocialInputs from "../common/SocialInputs";
import {updateProfile} from '../../utils/profileActions'
const UpdateProfile = ({ Profile }) => {
  const [profile, setProfile] = useState({
    profilePicUrl: Profile.user.profilePicUrl,
    bio: Profile.bio,
    facebook: ( Profile.social && Profile.social.facebook) || "",
    instagram: ( Profile.social && Profile.social.instagram ) || "",
    twitter: ( Profile.social && Profile.social.twitter ) || "",
    youtube: ( Profile.social && Profile.social.youtube ) || "",
  });
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSocialLinks, setShowSocialLinks] = useState(false);
  const [highligted, setHighlighted] = useState(false);

  const inputRef = useRef();

  const handleChange = (e) => {
    const { name, files, value } = e.target;

    if (name === "media") {
      setMedia(files[0]);
      setMediaPreview(URL.createObjectURL(files[0]));
    }
 
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Form
      loading={loading}
      error={errorMsg !== null}
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true)
        let profilePicUrl;
        if(media !==null) {
          profilePicUrl = await uploadPic(media)
        }
        if(media !== null && !profilePicUrl) {
          setLoading(false)
          return setErrorMsg('Error Uploading Image')
        }
        await updateProfile(profile,setLoading, setErrorMsg, profilePicUrl)
      }}
    >
      <Message
        error
        onDismiss={() => setErrorMsg(null)}
        content={errorMsg}
        header="Oops!"
        attached
      />
      <ImageDropDiv
        inputRef={inputRef}
        mediaPreview={mediaPreview}
        highlighted={highligted}
        handleChange={handleChange}
        setHighlighted={setHighlighted}
        setMedia={setMedia}
        setMediaPreview={setMediaPreview}
        profilePicUrl={profile.profilePicUrl}
      />
      <SocialInputs
        user={profile}
        handleChange={handleChange}
        showSocialLinks={showSocialLinks}
        setShowSocialLinks={setShowSocialLinks}
      />
      <Divider hidden />
      <Button
        color="blue"
        disabled={profile.bio === "" || loading}
        icon="pencil alternet"
        content="Submit"
        type="submit"
      />
    </Form>
  );
};

export default UpdateProfile;
