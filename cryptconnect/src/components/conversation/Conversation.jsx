import React, { useRef, useState, useEffect } from "react";
import { doc, getDoc, updateDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { Typography, Input, Button, Upload } from "antd";
import { SendOutlined, UploadOutlined, DownCircleFilled } from '@ant-design/icons';

export default function Conversation({ receiver, user }) {
  const { Title, Paragraph, Text, Link } = Typography;
  const [conversationId, setConversationId] = useState(null); //Initially conversation id is null
  const [messages, setMessages] = useState([]); //Initializing empty array to store messages
  var [lastmessageencrypted, setlastmessageencrypted] = useState("");  //To handle encryption and decryption process
  var [lastmessagedecrypted, setlastmessagedecrypted] = useState("");
  var [messagesent, setmessagesent] = useState("");  //Storing the sent message
  var [secretkey, setsecretkey] = useState("");  //Secret key for AES
  var [messageencrypted, setMessageencrypted] = useState("");  //Storing the encrypted version of the sent message

  var [dhprime, setdhprime] = useState("");
  var [dhgenerator, setdhgenerator] = useState("");
  // var [senderpriv,setsenderpriv] = useState("");
  var [senderpub, setsenderpub] = useState("");

  const currentMessage = useRef(null);    //Current message reference initialized to null
  const chatBodyRef = useRef(null); //To make the chat screen scrollable

  var CryptoJS = require("crypto-js");

  const handleFileUpload = async (file) => {
    if (!file) {
      console.error("No file selected.");
      return;
    }
    console.log(file)
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const base64Content = reader.result.split(",")[1]; // Extract Base64 content
        const sharedSecret = secretkey.toString(); // Use your shared secret
        const encryptedContent = CryptoJS.AES.encrypt(base64Content, sharedSecret).toString();

        const message = {
          type: "file",
          fileType: file.type,
          filename: file.name,
          fileContent: encryptedContent, // Encrypted content
          uid: user.uid,
        };

        // Save to Firestore
        const conversationRef = doc(db, "conversations", conversationId);
        const docSnap = await getDoc(conversationRef);

        if (docSnap.exists()) {
          const docData = docSnap.data();
          await updateDoc(conversationRef, {
            messages: [...docData.messages, message],
          });
        } else {
          await setDoc(doc(db, "conversations", conversationId), {
            messages: [message],
          });
        }

        console.log("File uploaded and encrypted successfully!");
      } catch (error) {
        console.error("Error during file upload:", error);
      }
    };

    reader.readAsDataURL(file); // Read file as Base64
  };


  // handle sending the messages
  const sendMessage = async () => {
    if (!currentMessage.current?.input?.value) return;

    messagesent = currentMessage.current?.input?.value; //Message entered by the user
    setmessagesent(messagesent);

    // Encrypt
    const sharedsecret = secretkey.toString(); //Getting the Diffie Hellman shared secret key

    var ciphertext = CryptoJS.AES.encrypt(currentMessage.current?.input?.value, sharedsecret).toString(); //Encryption
    messageencrypted = ciphertext;
    setMessageencrypted(messageencrypted);

    const myMessage = { //Uid and ciphertext of message entered by the user in a message object

      message: ciphertext,
      uid: user.uid,
    };

    // add and save encrypted message to firestore
    const conversationRef = doc(db, "conversations", conversationId);
    const docSnap = await getDoc(conversationRef);

    // append message to existing conversation
    //If conversation already exists
    if (docSnap.exists()) {
      const docData = docSnap.data();
      await updateDoc(conversationRef, {
        messages: [...docData.messages, myMessage],
      });


    } else {
      // create a new conversation
      await setDoc(doc(db, "conversations", conversationId), {
        messages: [myMessage],
      });
    }

    ciphertext = "";
    currentMessage.current.input.value = "";
  };

  //Method to compute the Diffie Hellman shared secret key
  const setSecretKey = async () => {
    var dhprime, dhgen, receiverpub, senderpub;  //Required variables

    if (!receiver || !user) return; //If no receiver is selected we return

    setmessagesent("");
    setMessageencrypted("");
    setlastmessageencrypted("");
    setlastmessagedecrypted("");


    const dhRef = doc(db, "dhparameters", "dh");  //Getting the DH prime and generator from the dhparameters collection in firebase
    const docSnap = await getDoc(dhRef);

    if (docSnap.exists()) {
      const docData = docSnap.data();
      dhprime = docData.prime;
      setdhprime(dhprime);
      dhgen = docData.generator
      setdhgenerator(dhgen);
    }

    const pubkeyRef = doc(db, "users", user.uid); //Getting the sender's private and public key from the users collection in firebase
    const docSnap1 = await getDoc(pubkeyRef);

    if (docSnap1.exists()) {
      const docData1 = docSnap1.data();
      // senderpriv = docData1.privkey;
      // setsenderpriv(senderpriv);
      senderpub = docData1.pubkey;
      setsenderpub(senderpub);
    }

    const privkeyRef = doc(db, "users", receiver.uid);  ////Getting the receiver's public key from the users collection in firebase
    const docSnap2 = await getDoc(privkeyRef);

    if (docSnap2.exists()) {
      const docData2 = docSnap2.data();
      receiverpub = docData2.pubkey;
    }

    let sharedSecret = power(receiverpub, localStorage.getItem("senderpriv"), dhprime); //Computing the value of the shared secret
    setsecretkey(sharedSecret);
    let myConvId;

    if (receiver.uid > user.uid) myConvId = receiver.uid + user.uid;  //Appending the ids in alphabetical order to get the Conversation id in the database
    else myConvId = user.uid + receiver.uid;

    setConversationId(myConvId);
    console.log("ConversationID is set and the sharedkey is created")
    console.log(sharedSecret, secretkey, conversationId, senderpub, localStorage.getItem("senderpriv"), receiverpub)
  }


  useEffect(() => {
    console.log("first useEffect runs")
    setSecretKey(); //Calculating the Diffie Hellman shared secret
  }, [receiver, user]);

  // get converastion from firestore
  useEffect(() => {
    if (!conversationId || !secretkey) return;

    console.log("useEffect after conversationID is set")

    const sharedsecret = secretkey.toString();  //Getting the Diffie Hellman shared secret key

    const unsub = onSnapshot(
      doc(db, "conversations", conversationId), //Conversations collection in firebase
      (doc) => {
        const currentData = doc.data(); //Getting the data (All messages)

        if (currentData?.messages.length > 0) {   //For each message

          const decryptedMessages = currentData.messages.map(element => {
            if (element.type === "file") {
              // Decrypt the file content
              var bytes = CryptoJS.AES.decrypt(element.fileContent, sharedsecret);
              const decryptedFileContent = bytes.toString(CryptoJS.enc.Utf8);
              return { ...element, fileContent: decryptedFileContent };
            }
            else {
              lastmessageencrypted = element.message; //Collecting encrypted message

              //Decryption of message with DH shared secret
              var bytes = CryptoJS.AES.decrypt(element.message, sharedsecret);
              element.message = bytes.toString(CryptoJS.enc.Utf8);
              lastmessagedecrypted = bytes.toString(CryptoJS.enc.Utf8);
              return { ...element, message: element.message }; // Add decrypted message

            }
          });

          //Before decryption
          setlastmessageencrypted(lastmessageencrypted);

          //After decryption
          setlastmessagedecrypted(lastmessagedecrypted);
          setMessages(decryptedMessages); //Setting message to screen

          console.log(messages, lastmessagedecrypted, lastmessageencrypted)

        }
        else setMessages([]); //If tere are no messages in the conversation
      }
    );

    return unsub;
  }, [conversationId]);

  // send message with enter
  const handleEnterKeyPressDown = (e) => {
    if ((e.code === "Enter" || e.key === "Enter") && !e.shiftKey) {
      sendMessage();
      currentMessage.current.value = "";
    }
  };

  //Scroll to bottom of the chat
  const scrollToBottomOfChat = () => {
    if (!chatBodyRef.current) return;
    chatBodyRef.current.style.scrollBehaviour = "smooth";
    chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  };

  useEffect(() => {
    scrollToBottomOfChat();
  }, [messages, chatBodyRef]);

  const uploadProps = {
    beforeUpload: handleFileUpload,
    showUploadList: false,
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        height: "90vh",
      }}
    >
      {/* Chat Area */}
      <div
        style={{
          flex: 3, // Chat area takes up more space
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid #f0f0f0",
          padding: "20px",
        }}
      >
        {receiver ? (
          <>
            <div style={{ borderRadius: "10px", backgroundColor: "#FFFFFF", border: "1px solid #4169E1",display:"flex",  }}>
              <p title={receiver.email} style={{ fontWeight: "bold", fontSize: "25px", marginLeft: "15px" }}>
                {receiver.username}
              </p>
              <p title={receiver.email} style={{  fontSize: "15px", marginTop: "15px" }}>
                ({receiver.email})
              </p>
            </div>
            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                marginBottom: "20px",
                padding: "10px",
              }}
              ref={chatBodyRef}
            >
              {messages?.length > 0 ? (
                messages.map((obj, i) => (
                  <div
                    key={i}
                    style={{
                      textAlign: obj.uid === user.uid ? "right" : "left",
                      marginBottom: "10px",
                    }}
                  >
                    {obj.type === "file" ? ((
                      <div
                        style={{
                          display: "flex",
                          justifyContent: obj.uid === user.uid ? "flex-end" : "flex-start",
                          marginBottom: "10px",
                        }}
                      >
                        <div
                          style={{
                            maxWidth: "60%",
                            padding: "12px 20px",
                            borderRadius: "12px",
                            backgroundColor: "#f9f9f9",
                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            border: "1px solid #e0e0e0",
                          }}
                        >
                          <Title level={5} style={{ margin: 0, color: "#333" }}>
                            {obj.filename}
                          </Title>
                          <a
                            href={`data:${obj.fileType};base64,${obj.fileContent}`}
                            download={obj.filename}
                            style={{
                              textDecoration: "none",
                              color: "#007bff",
                              fontSize: "18px",
                              cursor: "pointer",
                              marginLeft: "10px"
                            }}
                          >
                            <DownCircleFilled style={{color: "#4169E1"}}/>
                          </a>
                        </div>
                      </div>
                    )
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: obj.uid === user.uid ? "flex-end" : "flex-start",
                          marginBottom: "10px",
                        }}
                      >
                        <div
                          style={{
                            maxWidth: "60%",
                            padding: "10px",
                            borderRadius: "8px",
                            backgroundColor: obj.uid === user.uid ? "#e6f7ff" : "#f5f5f5",
                          }}
                        >
                          {obj.message}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p>No messages yet</p> // Fallback message if no messages
              )}
            </div>


            {/* Input Section */}
            < div style={{ display: "flex", gap: "10px" }}>
              <Input
                placeholder="Enter message"
                ref={currentMessage}
                onKeyPress={handleEnterKeyPressDown}
                style={{ border: "1px solid #4169E1" }}
              />
              <Upload accept=".pdf,.txt,.docx" {...uploadProps}>
                <Button icon={<UploadOutlined />}></Button>
              </Upload>
              <Button type="primary" onClick={sendMessage}>
                <SendOutlined />
              </Button>
            </div>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Title level={4}>Pick someone to talk to.</Title>
          </div>
        )}
      </div>
    </div>
  );
}

// Power function to return value of a ^ b mod P  Source: https://www.geeksforgeeks.org/how-to-avoid-overflow-in-modular-multiplication/#:~:text=We%20can%20multiply%20recursively%20to,to%20log%20n%20exponentiation%20algorithm).
function power(a, b, p) {
  let res = 0; //Initialize result
  a = a % p;
  while (b > 0) {
    // If b is odd, add 'a' to result
    if (b % 2 === 1) {
      res = (res + a) % p;
    }

    // Multiply 'a' with 2
    a = (a * 2) % p;

    // Divide b by 2
    b = b / 2;
  }

  // Return result
  return res % p;
}