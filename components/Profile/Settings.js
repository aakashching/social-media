import React, { useState, useEffect, useRef } from "react";
import {
  Form,
  Button,
  Divider,
  List,
  Checkbox,
  Message,
} from "semantic-ui-react";
import { updatePassword, toggleMessagePopup } from "../../utils/profileActions";
const Settings = ({ newMessagePopup }) => {
  const [showUpdatePassword, setShowUpdatePassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const [showMessageSettings, setShowMessageSettings] = useState(false);
  const [popupSetting, setPopupSetting] = useState(newMessagePopup);

  const isFirstRun = useRef(true);

  useEffect(() => {
    success && setTimeout(() => setSuccess(false), 3000);
  }, [success]);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
  }, [popupSetting]);
  return (
    <>
      {success && (
        <>
          <Message icon="check circle" header="Updated Successfully" success />
          <Divider hidden />
        </>
      )}
      <List animated size="huge">
        <List.Item>
          <List.Icon name="user secret" size="large" verticalAlign="middle" />
          <List.Content>
            <List.Header
              as="a"
              onClick={() => setShowUpdatePassword(!showUpdatePassword)}
              content="Update Password"
            />
          </List.Content>
          {showUpdatePassword && (
            <UpdatePassword
              setSuccess={setSuccess}
              setShowUpdatePassword={setShowUpdatePassword}
            />
          )}
        </List.Item>
        <Divider />
        <List.Item>
          <List.Icon
            name="paper plane outline"
            size="large"
            verticalAlign="middle"
          />
          <List.Content>
            <List.Header
              onClick={() => setShowMessageSettings(!showMessageSettings)}
              as="a"
              content="Show New Message Popup?"
            />
          </List.Content>
          {showMessageSettings && (
            <div style={{ marginTop: "10px" }}>
              Control weather a Popup should appear when there is a new Message?
              <br />
              <Checkbox
                checked={popupSetting}
                toggle
                onChange={async () =>
                  toggleMessagePopup(popupSetting, setPopupSetting, setSuccess)
                }
              />
            </div>
          )}
        </List.Item>
      </List>
    </>
  );
};

export default Settings;

const UpdatePassword = ({ setSuccess, setShowUpdatePassword }) => {
  const [userPassword, setUserPassword] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    field1: false,
    field2: false,
  });

  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const { currentPassword, newPassword } = userPassword;
  const { field1, field2 } = showPassword;
  useEffect(() => {
    errorMsg !== null && setTimeout(() => setErrorMsg(null), 5000);
  }, [errorMsg]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setUserPassword((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <Form
        error={errorMsg !== null}
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          await updatePassword(setSuccess, userPassword);
          setLoading(false);
          setShowUpdatePassword(false);
        }}
        loading={loading}
      >
        <List.List>
          <List.Item>
            <Form.Input
              fluid
              icon={{
                name: field1 ? "eye slash" : "eye",
                circuler: true,
                link: true,
                onClick: () =>
                  setShowPassword((prev) => ({ ...prev, field1: !field1 })),
              }}
              type={field1 ? "text" : "password"}
              iconPosition="left"
              label="Current Password"
              placeholder="Enter Current Password"
              name="currentPassword"
              onChange={handleChange}
              value={currentPassword}
            />

            <Form.Input
              fluid
              icon={{
                name: field2 ? "eye slash" : "eye",
                circuler: true,
                link: true,
                onClick: () =>
                  setShowPassword((prev) => ({ ...prev, field2: !field2 })),
              }}
              type={field2 ? "text" : "password"}
              iconPosition="left"
              label="New Password"
              placeholder="Enter New Password"
              name="newPassword"
              onChange={handleChange}
              value={newPassword}
            />
            <Divider hidden />
            <Button
              disabled={loading || newPassword === "" || currentPassword === ""}
              compact
              icon="configure"
              type="submit"
              color="teal"
              content="Confirm"
            />
            <Button
              disabled={loading}
              compact
              icon="cancel"
              content="Cancel"
              onClick={() => setShowUpdatePassword(false)}
            />
            <Message error icon="meh" header="Oops" content={errorMsg} />
          </List.Item>
        </List.List>
      </Form>
      <Divider hidden />
    </>
  );
};
