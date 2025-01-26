import { Layout, Form, Input, Button, Flex, message } from "antd";
import { Typography } from "antd";
import React from 'react'
import { useHistory } from 'react-router-dom';
import { db, auth } from '../../firebase';
import { doc, updateDoc } from '@firebase/firestore';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import CryptoJS from "crypto-js";
import { ArrowLeftOutlined } from '@ant-design/icons';

function ResetPassword({ setUser, user }) {
    let history = useHistory();
    const { Title, Text, Link } = Typography;

    const Reset = async (values) => {
        const oldPassword = values.oldpassword;
        const newPassword = values.password; 
        const User = auth.currentUser;
        console.log(User,newPassword)

        const credential = EmailAuthProvider.credential(User.email, oldPassword);
        
        if (User) {
            try {
                await reauthenticateWithCredential(User, credential);
                console.log("check")
                await updatePassword(User, newPassword);
                console.log("check")
                message.success("Password updated successfully.");
                const senderprivatekey = localStorage.getItem("senderpriv")
                const encryptedPrivKey = CryptoJS.AES.encrypt(
                    senderprivatekey.toString(),
                    newPassword
                ).toString();

                const userId = User.uid;

                await updateDoc(doc(db, "users", userId), {   //Creating a new collection
                    privkey: encryptedPrivKey,
                });

                history.push("/chat")

            } catch (error) {
                message.error("Error updating password:", error.message);
            }
        }
        else{
            message.error("No user is currently signed in.")
        }
    };

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
                    <Title level={3} style={{ marginLeft: "30px", color: "#4169E1" }}><ArrowLeftOutlined style={{marginRight:"20px"}} onClick={()=>{history.push("/chat")}}/> Change Password</Title>
                </Flex>

                <Form
                    labelCol={{
                        span: 10,
                    }}
                    wrapperCol={{
                        span: 14,
                    }}
                    layout="horrizontal"
                    style={{
                        width: "500px",
                        paddingTop:"10px"
                    }}
                    requiredMark={false}
                    onFinish={Reset}
                >
                    <Form.Item
                        label="Old Password"
                        name="oldpassword"
                        rules={[{ required: true, message: "Please input your password!" }]}
                    >
                        <Input.Password placeholder="Enter your password"
                            style={{
                                width: "100%", // Ensure consistent width
                                height: "40px"
                            }}
                        />
                    </Form.Item>
                    <Form.Item
                        label="New Password"
                        name="password"
                        rules={[{ required: true, message: "Please input your password!" }]}
                    >
                        <Input.Password placeholder="Enter your password"
                            style={{
                                width: "100%", // Ensure consistent width
                                height: "40px"
                            }}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Repeat New Password"
                        name="confirmPassword"
                        dependencies={["password"]}
                        rules={[
                            { required: true, message: "Please confirm your password!" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("password") === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(
                                        new Error("The two passwords do not match!")
                                    );
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="Confirm your password"
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

export default ResetPassword;
