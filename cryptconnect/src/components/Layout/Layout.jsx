import React,{useState} from "react";
import { Layout, Image, Button, Typography, Popover, Flex } from 'antd';
import logo from '../../images/logo.png';
import name from '../../images/name.png';
import { useHistory } from 'react-router-dom';
import { LogoutOutlined, UserOutlined, LockOutlined } from '@ant-design/icons';

function AppLayout({ children, user, setUser }) {
    const { Header, Content } = Layout;
    const { Text } = Typography;
    let history = useHistory();
    const [isHovered, setIsHovered] = useState(false);

    const logout = () => {
        localStorage.setItem("user", null); // Removing user from localstorage
        localStorage.removeItem("senderpriv");
        setUser(null); // Setting user back to null
        history.push("/login"); // Going back to login screen
    };

    const content = (
        <Flex
            style={{
                flexDirection:"column",
                gap:"5px"
            }}
        >
            <Button type="text" onClick={()=>{history.push("/resetpassword")}}>
                <LockOutlined />
                Reset Password
            </Button>
            <Button type="text" onClick={()=>{history.push("/editprofile")}}>
                <UserOutlined />
                Edit Profile
            </Button>
            {/* <Divider style={{}}/> */}
            <Button type="primary" danger onClick={logout}>
                Logout
                <LogoutOutlined />
            </Button>
        </Flex>
    );


    return (
        <Layout>
            <Header
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: "#FAF9F6",
                    padding: '0 20px',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Image
                        width={50}
                        src={logo}
                        preview={false}
                    />
                    <Image
                        width={200}
                        src={name}
                        preview={false}
                    />
                </div>
    
                <div>
                    {user && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <Popover placement="top" content={content}>
                                <Text strong style={{ fontSize: '16px',cursor: "pointer", color: isHovered ? "#4169E1" : "black",}}
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                                >
                                    {user.username}
                                </Text>
                            </Popover>
                        </div>
                    )}

                </div>
            </Header>
            <Content>
                {children}
            </Content>
        </Layout>
    );
}

export default AppLayout;
