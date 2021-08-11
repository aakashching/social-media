import React, { useState, useEffect } from "react";
import { Form, Button, Message, Segment } from "semantic-ui-react";
import baseUrl from "../../utils/baseUrl";
import catchErrors from "../../utils/catchErrors";
import axios from "axios";
const ResetPage = () => {
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);
  const [emailChecked, setEmailChecked] = useState(false);
  const [loading, setLoading] = useState(false);

    const resetPassword= async e=>{
        e.preventDefault()
        setLoading(true)
        try {
            await axios.post(`${baseUrl}/api/reset`, {email})
            setEmailChecked(true)
        } catch (error) {
            setErrorMsg(catchErrors(error))
        }
        setLoading(false)
    }
useEffect(()=>{
    errorMsg!==null && setTimeout(()=> setErrorMsg(null), 5000)
}, [errorMsg])
  return (
    <>
      {emailChecked ? (
        <Message
          attached
          icon="mail"
          header="Check Your Inbox"
          content="Please Check Your Email for further Instructions"
          success
        />
      ) : (
        <Message icon="settings" header="Reset Password" color="teal" />
      )}

      <Form loading={loading} onSubmit={resetPassword} error={errorMsg!==null} >
           <Message error header='Oops' content={errorMsg} /> 
           <Segment>
               <Form.Input fluid icon='mail outline' iconPosition='left' type='email' label="Email" placeholder='Enter email address' name='email' value={email} onChange={e=> setEmail(e.target.value)} required />
               <Button disabled={loading || email.length===0} type='submit' icon='configure' color='orange' content='Submit' />
           </Segment>
      </Form>
    </>
  );
};

export default ResetPage;
