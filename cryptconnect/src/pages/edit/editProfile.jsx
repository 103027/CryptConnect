import { Layout, Form, Input, Button, Flex, message } from "antd";
import { Typography } from "antd";
import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom';
import { db, auth } from '../../firebase';
import { doc, updateDoc, getDoc } from '@firebase/firestore';
import { ArrowLeftOutlined } from '@ant-design/icons';

function EditProfile({ setUser, user }) {
    const [form] = Form.useForm();
    let history = useHistory();
    const { Title, Text, Link } = Typography;

    const Edit = async (values) => {
        const newUsername = values.username;

        console.log(newUsername)

        const User = auth.currentUser;

        if (User) {
            try {
                const userId = User.uid;

                await updateDoc(doc(db, "users", userId), {   //Creating a new collection
                    username: newUsername,
                });

                localStorage.setItem("user",
                    JSON.stringify({
                        username: newUsername,
                        email: User.email,
                        uid: userId
                    })
                );

                setUser({
                    username: newUsername,
                    email: User.email,
                    uid: userId,
                });

                updateActiveChatUsernames()
                message.success("Profile updated successfully.");
                // history.push("/chat")

            } catch (error) {
                message.error("Error updating profile:", error.message);
            }
        }
        else {
            message.error("No user is currently signed in.")
        }
    };

    const updateActiveChatUsernames = async () => {
        const User = auth.currentUser;

        if (!User) {
            message.error("No user is currently signed in.");
            return;
        }

        try {
            const userDocRef = doc(db, "users", User.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                console.warn(`User with UID: ${User.uid} does not exist.`);
                return;
            }

            const userData = userDoc.data();

            for (const activeChat of userData.activeChats) {
                // Fetch the other user's document
                const otherUserDocRef = doc(db, "users", activeChat.uid);
                const otherUserDoc = await getDoc(otherUserDocRef);

                if (!otherUserDoc.exists()) {
                    console.warn(`User with UID: ${activeChat.uid} does not exist.`);
                    continue;
                }

                const otherUserData = otherUserDoc.data();
                const updatedActiveChats = otherUserData.activeChats.map((chat) => {
                    if (chat.uid === User.uid) {
                        return { ...chat, username: userData.username };
                    }
                    return chat; 
                });

                // Save the updated activeChats array to Firestore
                await updateDoc(otherUserDocRef, { activeChats: updatedActiveChats });
            }

            console.log("Active chat usernames updated successfully.");
        } catch (error) {
            console.error("Error updating active chat usernames:", error);
        }
    };

    useEffect(() => {
        form.setFieldsValue({
            username: user.username,
        })
    }, [])

    useEffect(() => {
        console.log("User state updated:", user);
    }, [user]);

    return (
        <Layout
            style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                padding: "10px 20px",
                backgroundColor: "#FAF9F6",
                height: "85vh"
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    backgroundColor: "#ffffff",
                    // padding: "30px",
                    borderRadius: "10px",
                    width: "100%",
                    border: "1px solid #4169E1",
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Add shadow for card effect
                }}
            >
                <Flex
                    style={{
                        width: "100%",
                        justifyContent: "flex-start",
                    }}
                >
                    <Title level={3} style={{ marginLeft: "30px", color: "#4169E1" }}><ArrowLeftOutlined style={{ marginRight: "20px" }} onClick={() => { history.push("/chat") }} /> Edit Profile </Title>
                </Flex>

                <Form
                    form={form}
                    labelCol={{
                        span: 10,
                    }}
                    wrapperCol={{
                        span: 14,
                    }}
                    layout="horrizontal"
                    style={{
                        width: "500px",
                        paddingTop: "10px"
                    }}
                    requiredMark={false}
                    onFinish={Edit}
                >
                    <Form.Item
                        label="Username"
                        name="username"
                        rules={[{ required: true, message: "Please input your username!" }]}
                        style={{ marginTop: "20px" }}
                    >
                        <Input placeholder="Enter your username"
                            style={{
                                width: "100%", // Ensure consistent width
                                height: "40px"
                            }}
                        />
                    </Form.Item>
                    <Flex
                        style={{
                            width: "100%",
                            justifyContent: "flex-end",
                        }}
                    >
                        <Form.Item>
                            <Button type="primary" htmlType="submit" block
                                style={{
                                    width: "100px"
                                }}
                            >
                                Submit
                            </Button>
                        </Form.Item>
                    </Flex>
                </Form>
            </div>
        </Layout>
    );
}

export default EditProfile;
