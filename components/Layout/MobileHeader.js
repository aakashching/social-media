import React from "react";
import { Menu, Container, Icon, Dropdown } from "semantic-ui-react";
import { useRouter } from "next/dist/client/router";
import Link from "next/link";
import { logoutUser } from "../../utils/authUser";

const MobileHeader = ({
  user: { email, username, unreadNotification, unreadMessage },
}) => {
  const router = useRouter();
  const isActive = (route) => router.pathname == route;
  return (
    <>
      <Menu fixed='top' borderless fluid>
        <Container text>
          <Link href="/">
            <Menu.Item header active={isActive("/")}>
              <Icon name="feed" size="large" color={isActive("/") && "teal"} />
            </Menu.Item>
          </Link>

          <Link href="/messages">
            <Menu.Item header active={isActive("/messages") || unreadMessage}>
              <Icon
                name={
                  unreadMessage
                    ? "hand point right"
                    : isActive("/messages")
                    ? "mail"
                    : "mail outline"
                }
                size="large"
                color={isActive("/messages") && "teal"}
              />
            </Menu.Item>
          </Link>

          <Link href="/notifications">
            <Menu.Item
              header
              active={isActive("/notifications") || unreadNotification}
            >
              <Icon
                name={
                  unreadNotification
                    ? "hand point right"
                    : isActive("/notifications")
                    ? "bell"
                    : "bell outline"
                }
                size="large"
                color={isActive("/notifications") && "teal"}
              />
            </Menu.Item>
          </Link>
          <Dropdown item icon={{name: 'bars', size: 'large'}} direction="left">
            <Dropdown.Menu>
              <Link href={`/${username}`}>
                <Dropdown.Item active={isActive(`/${username}`)}>
                  <Icon name="user" size="large" />
                  Account
                </Dropdown.Item>
              </Link>

              <Link href={`/search`}>
                <Dropdown.Item active={isActive(`/search`)}>
                  <Icon name="search" size="large" />
                  Search
                </Dropdown.Item>
              </Link>
              <Dropdown.Item onClick={() => logoutUser(email)}>
                <Icon name="sign out alternate" size="large" />
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Container>
      </Menu>
    </>
  );
};

export default MobileHeader;
