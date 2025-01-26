import { collection, getDocs } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import ChatHeads from '../../components/chatheads/ChatHeads';
import Conversation from '../../components/conversation/Conversation';
import { db } from '../../firebase';
import { Flex } from 'antd';

export default function Chat({ setUser, user }) {

    let history = useHistory();

    const [chatHeads, setchatHeads] = useState([]); //Initially no chat heads so empty array
    const [receiver, setreceiver] = useState(null); //Since no receiver is clicked yet reciever is initially null

    useEffect(() => { //Checking if the user is logged in
        //Getting user from localstorage
        const user = JSON.parse(localStorage.getItem("user"));

        //Setting log in state for the user as active
        if (user) setUser(user);
        //If not logged in we go back to the login screen
        else history.push("/login");

    }, [history, setUser]);

    useEffect(() => { //To fetch the available users from firebase
        if (!user) return; //If not logged in we return back

        (async () => {
            const querySnapshot = await getDocs(collection(db, "users"));  //Querying for all the users
            setchatHeads( //Setting the chatheads on the screen to the query results
                querySnapshot.docs
                    .map((doc) => doc.data())
                    .filter((obj) => obj.uid !== user.uid)
            );
        })();
        console.log("This is from chat")
    }, [user]);

    return (
        <Flex
            style={{
                backgroundColor:"#FAF9F6",
                flexDirection:"row",
                width:"100%",
                gap:"10px"
            }}
        >
            <Flex
                style={{
                    backgroundColor:"#FFFFFF",
                    width:"20%",
                    height:"90vh",
                    border:"1px solid #4169E1",
                    borderRadius:"20px",
                    marginLeft:"10px"
                }}
            >
                <ChatHeads AllUsers={chatHeads} setreceiver={setreceiver} user={user}/>
            </Flex>
            <Flex
                style={{
                    backgroundColor:"#FAF9F6",
                    width:"78%",
                    height:"90vh",
                }}
            >
                <Conversation receiver={receiver} user={user} />
            </Flex>
        </Flex>
    )
}