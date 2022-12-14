import { useRouter } from "next/router";
import axios from "axios";
import baseUrl from "../utils/baseUrl";
import { parseCookies } from "nookies";
import { NoProfile, NoProfilePosts } from "../components/Layout/NoData";
import { useEffect, useState } from "react";
import cookie from "js-cookie";
import { Grid } from "semantic-ui-react";
import ProfileMenuTabs from "../components/Profile/ProfileMenuTabs";
import ProfileHeader from "../components/Profile/ProfileHeader";
import CardPost from "../components/Post/CardPost";
import { PlaceHolderPosts } from "../components/Layout/PlaceHolderGroup";
import { PostDeleteToastr } from "../components/Layout/Toastr";
import Followers from "../components/Profile/Followers";
import Following from '../components/Profile/Following'
import UpdateProfile from '../components/Profile/UpdateProfile'
import Settings from '../components/Profile/Settings'
const Profile = ({
  profile,
  followersLength,
  followingLength,
  errorLoading,
  user,
  userFollowStats,
}) => {
  const router = useRouter();
  const { username } = router.query;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loggedUserFollowStats, setUserFollowStats] = useState(userFollowStats);

  const [activeItem, setActiveItem] = useState("profile");
  const [showTostr, setShowToastr] = useState(false);
  const handleItemClick = (item) => setActiveItem(item);
  const ownAccount = profile.user._id === user._id;

  useEffect(() => {
    const getPosts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${baseUrl}/api/profile/posts/${username}`,
          {
            headers: { Authorization: cookie.get("token") },
          }
        );
        setPosts(res.data);
      } catch (error) {
        console.log(error);
        alert("error loading post");
      }
      setLoading(false);
    };
    getPosts();
  }, []);

  useEffect(() => {
    showTostr && setTimeout(() => setShowToastr(false), 3000);
  }, [showTostr]);
  if (errorLoading) return <NoProfile />;

  return (
    <>
      {showTostr && <PostDeleteToastr />}
      <Grid stackable>
        <Grid.Row>
          <Grid.Column>
            <ProfileMenuTabs
              activeItem={activeItem}
              handleItemClick={handleItemClick}
              followersLength={followersLength}
              followingLength={followingLength}
              ownAccount={ownAccount}
              loggedUserFollowStats={loggedUserFollowStats}
            />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            {activeItem === "profile" && (
              <>
                <ProfileHeader
                  profile={profile}
                  ownAccount={ownAccount}
                  loggedUserFollowStats={loggedUserFollowStats}
                  setUserFollowStats={setUserFollowStats}
                />

                {loading ? (
                  <PlaceHolderPosts />
                ) : posts.length > 0 ? (
                  posts.map((post) => (
                    <CardPost
                      key={post._id}
                      post={post}
                      user={user}
                      setPosts={setPosts}
                      setShowToastr={setShowToastr}
                    />
                  ))
                ) : (
                  <NoProfilePosts />
                )}
              </>
            )}
            {activeItem === "followers" && (
              <Followers
                user={user}
                loggedUserFollowStats={loggedUserFollowStats}
                setUserFollowStats={setUserFollowStats}
                profileUserId={profile.user._id}
              />
            )}

{activeItem === "following" && (
              <Following
                user={user}
                loggedUserFollowStats={loggedUserFollowStats}
                setUserFollowStats={setUserFollowStats}
                profileUserId={profile.user._id}
              />
            )}
            {activeItem === 'updateProfile' && <UpdateProfile Profile={profile} />}
            {activeItem === 'settings' && <Settings newMessagePopup={user.newMessagePopup} />}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </>
  );
};

Profile.getInitialProps = async (ctx) => {
  try {
    const { username } = ctx.query;
    const { token } = parseCookies(ctx);
    const res = await axios.get(`${baseUrl}/api/profile/${username}`, {
      headers: { Authorization: token },
    });
    const { profile, followersLength, followingLength } = res.data;

    return { profile, followersLength, followingLength };
  } catch (error) {
    console.log(error);
    return { errorLoading: true };
  }
};

export default Profile;
