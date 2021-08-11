import React, {useState, useEffect} from 'react'
import { Form, Button, Message, Segment, Divider } from "semantic-ui-react";
import baseUrl from "../../utils/baseUrl";
import catchErrors from "../../utils/catchErrors";
import axios from "axios";
import {useRouter} from 'next/router'
const TokenPage=()=>{
    const router = useRouter()
    const [newPassword,setNewPassword] = useState({field_1:'',field_2: ''})
    const [loading,setLoading] = useState(false)
    const [success,setSuccess] = useState(false)
    const [errorMsg,setErrorMsg] = useState(null)

    const {field_1,field_2} = newPassword

    useEffect(()=>{
        errorMsg!==null && setTimeout(()=> setErrorMsg(null), 5000)
    }, [errorMsg])   

    const handleChange=e=> {
        const {name, value} = e.target

        setNewPassword(prev=> ({...prev, [name]: value}))
    }
    const resetPassword= async e =>{
        e.preventDefault()
        setLoading(true)
        try {
            if(field_1!==field_2) setErrorMsg('Password do not match')
            await axios.post(`${baseUrl}/api/reset/token`, {password: field_1,token: router.query.token})
            setSuccess(true)
            
        } catch(error) {
            setErrorMsg(catchErrors(error))
            console.log(error)
        }
        setLoading(false)
    }

    return <>
    {success ? <Message attached success size='large' header='Password reset successfull' icon='check' style={{cursor: 'pointer'}} onClick={()=> router.push('/login')} /> :  <Message attached icon="settings" header="Reset Password" color="teal" />}

    {!success && <Form loading={loading} onSubmit={resetPassword} error={errorMsg!==null} >
    <Segment>
    <Form.Input
              fluid
              type="password"
             
              label="New Password"
              placeholder="Enter New Password"
              name="field_1"
              onChange={handleChange}
              value={field_1}
            />

            <Form.Input
              fluid
              type="password"
              label="Confirm Password"
              placeholder="Confirm Password"
              name="field_2"
              onChange={handleChange}
              value={field_2}
            />
            <Divider hidden />
            <Button disabled={field_1===''|| field_2==='' || loading} icon='configure' type='submit' content='Reset' color='orange' />
    </Segment>
    
    </Form> }
    </>
}

export default TokenPage