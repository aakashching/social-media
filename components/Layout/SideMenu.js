import { List, Icon } from "semantic-ui-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { logoutUser } from "../../utils/authUser";
import classes from "./SideMenu.module.css";
const SideMenu = ({
  user: { email, username, unreadNotification, unreadMessage }, pc=true
}) => {
  const router = useRouter();
  const isActive = (route) => router.pathname === route;
  console.log(unreadNotification)
  return (
    <>
      <List
        style={{ paddingTop: "1rem" }}
        size="big"
        verticalAlign="middle"
        selection
      >
        <Link href="/">
          <List.Item active={isActive("/")}>
            <Icon name="home" size="large" color={isActive("/") && "teal"} />
            <List.Content>
              {pc && <List.Header className={classes.mobile} content="Home" />}
            </List.Content>
          </List.Item>
        </Link>

        <br />

        <Link href="/messages">
          <List.Item active={isActive("/messages")}>
            <Icon
              name={unreadMessage ? "hand point right" : "mail outline"}
              size="large"
              color={
                (isActive("/messages") && "teal") || (unreadMessage && "orange")
              }
            />
            <List.Content>
              {pc && <List.Header className={classes.mobile} content="Messages" />}
            </List.Content>
          </List.Item>
        </Link>
        <br />
        <Link href="/notifications">
          <List.Item active={isActive("/notifications")}>
            <Icon
              name={unreadNotification ? "hand point right" : "bell outline"}
              size="large"
              color={
                (isActive("/notifications") && "teal") ||
                (unreadNotification && "orange")
              }
            />
            <List.Content>
              {pc &&<List.Header className={classes.mobile} content="Notifications" />}
            </List.Content>
          </List.Item>
        </Link>

        <br />
        <Link href={`/${username}`}>
          <List.Item active={router.query.username === username}>
            <Icon
              name="user"
              size="large"
              color={(router.query.username === username) && "teal"}
            />
            <List.Content>
              {pc && <List.Header className={classes.mobile} content="Account" />}
            </List.Content>
          </List.Item>
        </Link>
        <br />
        <List.Item onClick={() => logoutUser(email)}>
          <Icon name="log out" size="large" />
          <List.Content>
           {pc && <List.Header className={classes.mobile} content="Logout" />}
          </List.Content>
        </List.Item>
      </List>
    </>
  );
};
export default SideMenu;
