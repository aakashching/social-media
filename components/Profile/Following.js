import { useEffect, useState } from "react";
import { Image, Button, List } from "semantic-ui-react";
import Spinner from "../Layout/Spinner";
import axios from "axios";
import baseUrl from "../../utils/baseUrl";
import cookie from "js-cookie";
import { NoFollowData } from "../Layout/NoData";
import { useRouter } from "next/router";
import {followUser, unfollowUser} from '../../utils/profileActions'
const Following = ({
  user,
  loggedUserFollowStats,
  setUserFollowStats,
  profileUserId,
}) => {
  const router = useRouter();
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  useEffect(() => {
    const getFollowing = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${baseUrl}/api/profile/following/${profileUserId}`,
          {
            headers: { Authorization: cookie.get("token") },
          }
        );
        setFollowing(res.data);
      } catch (error) {
        console.error(error);
        alert("error loading following");
      }
      setLoading(false);
    };
    getFollowing();
  }, [router.query.username]);
  return (
    <>
      {loading ? (
        <Spinner />
      ) : following.length > 0 ? (
        following.map((profileFollowing) => {
          const isFollowing =
            loggedUserFollowStats.following.length > 0 &&
            loggedUserFollowStats.following.filter(
              (following) => following.user === profileFollowing.user._id
            ).length > 0;

          return (
            <>
              <List
                key={profileFollowing.user._id}
                divided
                verticalAlign="middle"
              >
                <List.Item>
                  <List.Content floated="right">
                    {profileFollowing.user._id !== user._id && (
                      <Button
                        color={isFollowing ? "instagram" : "twitter"}
                        content={isFollowing ? "Following" : "Follow"}
                        icon={isFollowing ? "check" : "add user"}
                        disabled={followLoading}
                        compact
                        
                        onClick={async () => {
                          setFollowLoading(true);
                          isFollowing
                            ? await unfollowUser(
                                profileFollowing.user._id,
                                setUserFollowStats
                              )
                            : await followUser(
                                profileFollowing.user._id,
                                setUserFollowStats
                              );
                              setFollowLoading(false)
                        }}
                      />
                    )}
                  </List.Content>
                  <Image avatar src={profileFollowing.user.profilePicUrl} />
                  <List.Content
                    as="a"
                    href={`${profileFollowing.user.username}`}
                  >
                    {profileFollowing.user.name}
                  </List.Content>
                </List.Item>
              </List>
            </>
          );
        })
      ) : (
        <NoFollowData followingComponent={true} />
      )}
    </>
  );
};
export default Following;
