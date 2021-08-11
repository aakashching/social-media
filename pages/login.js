import { HeaderMessage, FooterMessage } from "../components/common/WelcomeMessage"
import { useState, useEffect} from "react";
import {
  Form,
  Button,
  Message,
  Divider,
  Segment,
} from "semantic-ui-react";
import {loginUser} from '../utils/authUser'
import cookie from 'js-cookie'
const LoginPage = () => {
    const [user, setUser] = useState({
        email: "",
        password: ""
      });
    
      const handleChange = (e) => {
        const { name, value} = e.target;
        setUser((prev) => ({ ...prev, [name]: value }));
      };
      const { email, password} = user;
      const [showPassword, setShowPassword] = useState(false);
      const [errMsg, setErrMsg] = useState(null);
      const [formLoading, setFormLoading] = useState(false);
      const [submitDisabled, setSubmitDisabled] = useState(true);
      useEffect(() => {
        const isUser = Object.values({email, password}).every((item) =>
          Boolean(item)
        );
        isUser ? setSubmitDisabled(false) : setSubmitDisabled(true);
      }, [user]);

      const handleSubmit = async e => {
          e.preventDefault()
          await loginUser(user,setErrMsg,setFormLoading)
      }
      useEffect(()=>{
        document.title='Sign In Page'
        const userEmail =cookie.get('userEmail')
        if(userEmail) setUser(prev=>({...prev,email: userEmail}))
      },[])
    return <>
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
        </Segment>
        <Divider hidden />
        <Button
          icon='sign-in'
          content="Login"
          type="submit"
          color="orange"
          disabled={submitDisabled}
        />
        <Divider hidden />
    </Form> 
    <FooterMessage />
    </>
}
export default LoginPage