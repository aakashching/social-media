import { useRef } from "react";
import { Menu } from "semantic-ui-react";
import classes from './ProfileMenuTabs.module.css'

const ProfileMenuTabs = ({
  activeItem,
  handleItemClick,
  followersLength,
  followingLength,
  ownAccount,
  loggedUserFollowStats,
}) => {

  const divRef= useRef()
  const scrollDiv = (scrollOffset) => {
      (divRef.current.scrollLeft += scrollOffset);
  };
  return (
    <div style={{overflow: 'hidden'}}>
    <Menu compact secondary pointing style={{maxWidth: '100%'}} className={classes.tab} ref={divRef} >
      <Menu.Item
        name="profile"
        active={activeItem === "profile"}
        onClick={() => handleItemClick("profile")}
      />
      {ownAccount ? (
        <>
          <Menu.Item
            name={`${
              loggedUserFollowStats.followers.length > 0
                ? loggedUserFollowStats.followers.length
                : 0
            } Followers`}
            active={activeItem === "followers"}
            onClick={() => handleItemClick("followers")}
          />

          <Menu.Item
            name={`${
              loggedUserFollowStats.following.length > 0
                ? loggedUserFollowStats.following.length
                : 0
            } Following`}
            active={activeItem === "following"}
            onClick={() => handleItemClick("following")}
          />
        </>
      ) : (
        <>
          <Menu.Item
            name={`${followersLength} Followers`}
            active={activeItem === "followers"}
            onClick={() => handleItemClick("followers")}
          />

          <Menu.Item
            name={`${followingLength} Following`}
            active={activeItem === "following"}
            onClick={() => handleItemClick("following")}
          />
        </>
      )}
      {ownAccount && (
        <>
          <Menu.Item
            name="Update Profile"
            active={activeItem === "updateProfile"}
            onClick={() => handleItemClick("updateProfile") && scrollDiv(30)}
          />
          <Menu.Item
            name="Settings"
            active={activeItem === "settings"}
            onClick={() => handleItemClick("settings")}
          />
        </>
      )}
    </Menu>
    </div>


  );
};

export default ProfileMenuTabs;
