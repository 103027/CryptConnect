import { Layout, Image, Form, Input, Button, message} from "antd";
import { Typography } from "antd";
import React from 'react'
import image from "../../images/image.png"
import { createUserWithEmailAndPassword, sendEmailVerification } from '@firebase/auth';
import { getDoc, setDoc, doc } from '@firebase/firestore';
import { useHistory } from 'react-router-dom';
import { db, auth } from '../../firebase';
import CryptoJS from "crypto-js";

function Register() {
    let history = useHistory();
    const { Title, Text, Link } = Typography;

    var generator = 0; //Diffie Hellman Prime and Generator value initialized to 0
    var prime = 0;

    const register = async (values) => {
        console.log(values)
        const username = values.username;
        const myEmail = values.email;    //Getting the user input
        const myPassword = values.password;

        try {
            console.log("check")
            const responseFromAuth = await createUserWithEmailAndPassword(  //Waiting for a response from firebase authentication (user creation)
                auth,
                myEmail,
                myPassword
            );
            const user = responseFromAuth.user;
            await sendEmailVerification(user);
            message.success("Please verify your email before logging in.");
            const userId = responseFromAuth.user.uid;   //uid from authentication response

            const dhRef = doc(db, "dhparameters", "dh");    //Getting the Diffie Hellman parameters
            const docSnap = await getDoc(dhRef);

            if (docSnap.exists()) {
                const docData = docSnap.data();
                generator = docData.generator;
                prime = docData.prime;
            }

            const privkey = randomint(5, generator - 1); //Choosing a random private key which is lesser than the generator value
            const pubkey = power(generator, privkey, prime);  //Computing the public key from the private key

            const encryptedPrivKey = CryptoJS.AES.encrypt(
                privkey.toString(), // Convert private key to string
                myPassword // Use the login password as the encryption key
            ).toString();

            console.error(privkey)
            console.error(encryptedPrivKey)
            console.log("check")
            //Saving to firestore
            await setDoc(doc(db, "users", userId), {   //Creating a new collection
                username: username,
                email: myEmail,
                uid: userId,
                privkey: encryptedPrivKey,
                pubkey: pubkey,
            });

            history.push('/login');

        } catch (error) {
            alert(error);
        }
    };

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
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Add shadow for card effect
                }}
            >
                <Form
                    layout="vertical"
                    style={{
                        width: "350px",
                    }}
                    requiredMark={false}
                    onFinish={register}
                >
                    <Title level={4}>Get started with CryptConnect</Title>
                    <Text strong>
                        Already registered? <Link onClick={() => { history.push('/login') }}>Sign in</Link> to your account
                    </Text>
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
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: "Please input your email!" },
                            { type: "email", message: "Please enter a valid email!" },
                        ]}
                    >
                        <Input placeholder="Enter your email"
                            style={{
                                width: "100%", // Ensure consistent width
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
                                width: "100%", // Ensure consistent width
                                height: "40px"
                            }}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Confirm Password"
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
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Register
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </Layout>
    );
}

export default Register;


function randomint(min, max)    //Function to return a random integer within a range
{
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// Power function to return value of a ^ b mod P
function power(a, b, p) {
    let res = 0; //Initialize result
    a = a % p;
    while (b > 0) {
        // If b is odd, add 'a' to result
        if (b % 2 == 1) {
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
