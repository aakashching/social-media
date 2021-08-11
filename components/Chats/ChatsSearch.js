import React, { useState } from "react";
import { List, Image, Search, Divider } from "semantic-ui-react";
import axios from "axios";
import cookie from "js-cookie";
import Router,{useRouter} from "next/router";
import baseUrl from "../../utils/baseUrl";

let cancel;
const ChatsSearch=({chats,setChats})=>{
    const router = useRouter()
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const handleChange = async (e) => {
    const { value } = e.target;
    setText(value);
    setLoading(true);

    try {
      cancel && cancel();
      const CancelToken = axios.CancelToken;
      const token = cookie.get("token");
      const res = await axios.get(`${baseUrl}/api/search/${value}`, {
        headers: { Authorization: token },
        cancelToken: new CancelToken((canceler) => {
          cancel = canceler;
        }),
      });

      if (res.data === 0) return setLoading(false);
      setResults(res.data);
    } catch (error) {
      console.log("error serching");
    }
    setLoading(false);
  };
  const addChat=(result)=>{
    const alreadyInChat = chats.length> 0 && chats.filter(chat=> chat.messagesWith === result._id).length>0
    if(alreadyInChat) {
      return  router.push(`/messages?message=${result._id}`)
    } else {
        const newChat={
            messagesWith: result._id,
            name: result.name,
            profilePicUrl: result.profilePicUrl,
            lastMessage: '',
            date: Date.now()
        }
        setChats(prev=>[newChat, ...prev])
        return  router.push(`/messages?message=${result._id}`)
    }
  }
  return (
    <Search
    size='large'
      onBlur={() => {
        results.length > 0 && setResults([]);
        loading && setLoading(false);
        setText("");
      }}
      loading={loading}
      value={text}
      resultRenderer={ResultRenderer}
      results={results}
      onSearchChange={handleChange}
      minCharacters={1}
      onResultSelect={(e, data) => addChat(data.result)}
    />
  );
};

const ResultRenderer = ({ _id, profilePicUrl, name,username }) => {
  return (
    <List key={_id}>
      <List.Item>
        <Image
          src={profilePicUrl}
          alt="profilePic"
          circular
          size='mini'
          avatar
        />
        <List.Content verticalAlign='middle' content={name} as="a" />
        <small style={{marginLeft: "0.5rem"}} color='#999'>{`@${username}`}</small>
      </List.Item>
    </List>
  );
};



export default ChatsSearch