import { Layout, Image, Form, Input, Button, message } from "antd";
import { Typography } from "antd";
import React, { useEffect, useState } from 'react'
import image from "../../images/image.png"
import { useHistory } from 'react-router-dom';
import { db, auth } from '../../firebase';
import { getDoc, doc } from '@firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import CryptoJS from "crypto-js";

function Login({ setUser }) {
    let history = useHistory();
    const [isMounted, setIsMounted] = useState(true);
    const { Title, Text, Link } = Typography;

    const login = async (values) => {    //Method to log in
        console.log("check")
        const myEmail = values.email;    //Getting credentials entered by the user
        const myPassword = values.password;
        var username = "";

        try {
            if (isMounted) {
                console.log("check")
                const responseFromAuth = await signInWithEmailAndPassword(
                    auth,
                    myEmail,
                    myPassword
                );
                const user = responseFromAuth.user;
                if (!user.emailVerified) {
                    message.error("Your email is not verified. Please verify your email before logging in.");
                    return;
                }
                const userId = responseFromAuth.user.uid;   //Getting the uid from authentication response
                
                const userDocRef = doc(db, "users", userId);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const encryptedPrivKey = userDoc.data().privkey;
                    username = userDoc.data().username;

                    // Decrypt the private key using the login password
                    const bytes = CryptoJS.AES.decrypt(encryptedPrivKey, myPassword);
                    const decryptedPrivKey = bytes.toString(CryptoJS.enc.Utf8);

                    // Set the decrypted private key in UserContext
                    localStorage.setItem("senderpriv", decryptedPrivKey);

                    console.log("Decrypted Private Key:", decryptedPrivKey);
                } else {
                    console.error("No such document!");
                }

                // Saving the user to localstorage setting the user to logged in state
                localStorage.setItem(
                    "user",
                    JSON.stringify({
                        username: username,
                        email:myEmail,
                        uid:userId
                    })
                );
                console.log("check")
                //Setting the signed in user as active
                setUser({
                    username: username,
                    email: myEmail,
                    uid: userId,
                });
                console.log("check")
                //Moving to chat screen
                history.push('/chat');
            }

        } catch (error) {
            if (isMounted) {
                alert(error);
            }
        }
    };

    useEffect(() => {
        // Mark the component as mounted
        setIsMounted(true);

        return () => {
            // Cleanup: Mark the component as unmounted
            setIsMounted(false);
        };
    }, []);

    useEffect(() => {
        //Getting the user from localstorage
        const user = JSON.parse(localStorage.getItem("user"));
        //if users state is logged in then dont allow to login again (stay on chat screen)
        if (user && user.uid) {
            setUser(user);
            // history.push('/chat');
        }
    }, [history, setUser]);

    return (
        <Layout
            style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-around",
                alignItems: "center",
                backgroundColor: "#FAF9F6",
                height: "85vh"
            }}
        >
            <Image
                width={600}
                src={image}
                preview={false}
            />
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    backgroundColor: "#ffffff",
                    padding: "30px",
                    borderRadius: "8px",
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                }}
            >
                <Form
                    layout="vertical"
                    style={{
                        width: "350px",
                    }}
                    requiredMark={false}
                    onFinish={login}
                >
                    <Title level={4}>Sign in to your Account</Title>
                    <Text strong>
                        Don't have an account? <Link onClick={() => { history.push('/register') }}>Create a new Account</Link>
                    </Text>
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: "Please input your email!" },
                            { type: "email", message: "Please enter a valid email!" },
                        ]}
                        style={{ marginTop: "20px" }}
                    >
                        <Input placeholder="Enter your email"
                            style={{
                                width: "100%",
                                height: "40px"
                            }}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: "Please input your password!" }]}
                    >
                        <Input.Password placeholder="Enter your password"
                            style={{
                                width: "100%",
                                height: "40px"
                            }}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Sign in
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </Layout>
    );
}

export default Login;
