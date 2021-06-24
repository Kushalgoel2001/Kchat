import "./conversation.css" ; 
import person from  "./1.png"
import { useEffect,useState } from "react";
import axios from "axios" 


export default function Conversation({conversation,currentUser}){
    const [user,setUser] = useState(null) ; 
   
    useEffect(()=> {

        const friendId = conversation.members.find((m) => m !== currentUser._id) ; 
       

        const getUser = async () => {
            try{
                const res = await axios("/users?userId=" + friendId) ; 
                setUser(res.data) ; 
            }
            catch(err){
                console.log(err) ; 
            }
        } ; 
        getUser(); 
        
       

    },[currentUser,conversation]) ; 

    return(

        <div className = "conversation">

        <img className = "conversationImg" src = { user ? user.profilePicture ? user.profilePicture : person : person } alt= "" />
        <span className = "conversationName">{user ? user.username : ""}</span>
        </div>

    ) ; 
}