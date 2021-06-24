import "./messenger.css";
import React, { useContext, useEffect,useState,useRef } from "react";
import Topbar from "../../components/topbar/Topbar";
import Conversation from "../../components/conversation/Conversation" 
import Message from "../../components/message/Message"
import ChatOnline from "../../components/chatOnline/ChatOnline"
import { AuthContext } from "../../context/AuthContext"
import axios from "axios" 
import {io} from "socket.io-client" 



function Messenger() {
  const [conversations,setConversation] = useState([]) ; 
  const [currentChat,setCurrentChat] = useState(null) ; 
  const [messages,setMessages] = useState([]) ; 
  const[newMessage,setNewMessages] = useState("") ; 
  const[arrivalMessage,setArrivalMessage] = useState(null) ; 
  const[onlineUsers,setOnlineUsers] = useState([]) ; 
  const {user} = useContext(AuthContext) ; 
  const scrollRef = useRef() ; 
  const socket = useRef() ; 
  
  useEffect(() => {

    socket.current = io("ws://localhost:8900");
    socket.current.on("getMessage",data => {

      setArrivalMessage({
        sender : data.senderId , 
        text : data.text ,
        createdAt : Date.now() ,
      })

    }) ; 

  },[]) ;
  useEffect(()=>{

    arrivalMessage && currentChat?.members.includes(arrivalMessage.sender)&&setMessages((prev)=>[...prev,arrivalMessage]) ; 

  },[arrivalMessage,currentChat]);
  useEffect(function(){
    const getConversation = async function(){
      try{
      const res = await axios.get("/conversations/" + user._id) 
      setConversation(res.data) ; 
      }
      catch(err){
        console.log(err) ; 
      }
    };
    getConversation() ;
  },[user]) ; 
  useEffect(()=>{
    const getMessages = async ()=> {
      try{
        const res = await axios.get("/messages/" + currentChat?._id) ;  
        setMessages(res.data) ; 
        

      }
      catch(err){
        console.log(err) ; 
      }
    }
    getMessages()  ;
   

  },[currentChat]) ; 
  const handleSubmit = async (e) =>{
    e.preventDefault() ;
    const message = {

      sender : user._id , 
      text : newMessage ,
      conversationId : currentChat ,
      

    };

    const receiverId  = currentChat.members.find(member=>member !== user._id) ; 
   // console.log(receiverId) ; 
    socket.current.emit("sendMessage",{
      senderId : user._id,
      receiverId ,
      
      text : newMessage 

    }) 
      try{

        const res = await axios.post("/messages",message) ;
        setMessages([...messages,res.data]) ;  
        setNewMessages("") ;

      }
      catch(err){
        console.log(err) ; 
      }

  
  } ; 
  useEffect(() => {
    scrollRef.current?.scrollIntoView({behavior : "smooth"}) ; 


  },[messages]) ;
  
 useEffect(() => {
   socket.current.emit("addUser",user._id) ; 
   socket.current.on("getUsers",users => {
     setOnlineUsers(user.followings.filter(f=>users.some(u=>u.userId === f ))); 
    // console.log(users) ; 
   })


  },[user])
  

  
  
   
  
  return (
    <div>
      <Topbar />
      <div className="messenger">
        <div className="chatMenu">
          <div className="chatMenuWrapper">
            <input
              placeholder="Search for friends"
              className="chatMenuInput"
            ></input>
            {conversations.map((c)=>(
              <div onClick={()=>setCurrentChat(c)}>
              <Conversation conversation = {c} currentUser = {user} />
              </div>
            ))  }
            
          </div>
        </div>
        <div className="chatBox">
          <div className="chatBoxWrapper">
          {
            currentChat ?  <>
          
          <div className = "chatBoxTop">
          {messages.map((m)=>(
            <div ref = {scrollRef}>
            <Message message = {m} own = {m.sender === user._id} />
            </div>
          ))}
          
          </div>
          <div className  = "chatBoxBottom">
          <textarea className = "chatMessageInput" placeholder = "write your message" onChange = {(e)=>setNewMessages(e.target.value)}
            value = {newMessage} 
          ></textarea> 
          <button className ="chatSubmitButton" onClick= {handleSubmit}>Send</button>
          </div></> : <span className = "noConversationText"> Open a conversation to chat. </span>  }

        </div>
        </div>
        <div className="chatOnline">
          <div className="chatOnlineWrapper">
           <ChatOnline
            onlineUsers = {onlineUsers} 
            currentId = {user._id}
            setCurrentChat =  {setCurrentChat} 
          />
          
          </div>
        </div>
      </div>
    </div>
  );
}

export default Messenger;
