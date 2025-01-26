import React, { useEffect, useState } from 'react'
import { Divider, Typography, Popover, Select, List } from 'antd';
import { PlusSquareOutlined } from '@ant-design/icons';
import { updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { onSnapshot } from "firebase/firestore";

export default function ChatHeads({ AllUsers, setreceiver, user }) {
  const { Title, Paragraph, Text, Link } = Typography;
  const text = <span>New Chat</span>;
  const [activeChats, setActiveChats] = useState([]);
  const [searchValue, setSearchValue] = useState('Search contacts');
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Track if it's the initial load
  const [selectedUser, setSelectedUser] = useState(null); // Track selected user

  const handleUserClick = (user) => {
    setSelectedUser(user.email); // Set the selected user
    setreceiver(user); // Pass the selected user to the parent
  };

  const availableUsers = AllUsers.filter(
    (user) => !activeChats.find((chat) => chat.email === user.email)
  );

  const handleStartChat = async (email) => {
    const selectedUser = AllUsers.find((user) => user.email === email);

    if (selectedUser) {
      // Add user to active chats
      const selectedUserDocRef = doc(db, 'users', selectedUser.uid); // Assuming selectedUser has a uid
      const selectedUserDoc = await getDoc(selectedUserDocRef);

      if (selectedUserDoc.exists()) {
        const otherUserActiveChats = selectedUserDoc.data().activeChats || [];
        const updatedOtherUserChats = [...otherUserActiveChats, user];
        await updateDoc(selectedUserDocRef, { activeChats: updatedOtherUserChats }, { merge: true });
      }

      setActiveChats([...activeChats, {
        email: selectedUser.email,
        uid: selectedUser.uid,
        username: selectedUser.username
      }]);
      setreceiver(selectedUser); // Set receiver for chat
      setSearchValue('Search contacts')
      setSelectedUser(selectedUser.email);
    }
  };

  const saveActiveChatsToFirestore = async (userId, activeChats) => {
    console.log("In firestore")
    try {
      await updateDoc(doc(db, 'users', userId), { activeChats }, { merge: true });

    } catch (error) {
      console.error('Error saving active chats:', error);
    }
  };

  const fetchActiveChatsFromFirestore = () => {
    if (!user || !user.uid) return;

    // Set up a real-time listener
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setActiveChats(data.activeChats || []);

          if (isInitialLoad && data.activeChats && data.activeChats.length > 0) {
            handleUserClick(data.activeChats[0]); // Handle first chat on initial load
          }
          setIsInitialLoad(false);
        } else {
          console.error('User document does not exist.');
          setActiveChats([]); // Ensure state is reset if the document does not exist
        }
      },
      (error) => {
        console.error('Error fetching active chats:', error);
      }
    );

    // Cleanup the listener on component unmount
    return unsubscribe;
  };


  useEffect(() => {
    if (!isInitialLoad && user && user.uid) {
      saveActiveChatsToFirestore(user.uid, activeChats);
    }
  }, [activeChats, user, isInitialLoad]);

  useEffect(() => {
    fetchActiveChatsFromFirestore();
  }, [user]);

  const content = (
    <div>
      <Select
        showSearch
        style={{ width: "100%" }}
        placeholder="Search contacts"
        value={searchValue}
        onSelect={handleStartChat} // When a user is selected, start a chat
        onSearch={(value) => setSearchValue(value)} // Update search value
        filterOption={(input, option) =>
          option.label.toLowerCase().includes(input.toLowerCase())
        }
        options={availableUsers.map((user) => ({
          value: user.email,
          label: user.email,
        }))}
      />
    </div>
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "stretch", // Ensure items stretch to full width
        width: "100%", // Container width
      }}
    >
      {/* Header Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between", // Space items between ends
          alignItems: "center", // Vertically align items
          padding: "10px 20px", // Add some padding
          width: "100%", // Ensure it spans full width
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          Chats
        </Title>
        <Popover placement="rightTop" trigger="click" title={text} content={content}>
          <PlusSquareOutlined
            style={{
              fontSize: "24px",
              cursor: "pointer",
              color: "#1890ff",
            }}
          />
        </Popover>
      </div>

      <Divider style={{ margin: 0 }} />

      <div
        style={{
          padding: "10px 20px", // Add padding for the user list
          width: "100%",
        }}
      >
        <List
          itemLayout="horizontal"
          dataSource={activeChats}
          renderItem={(user) => (
            <List.Item
              onClick={() => handleUserClick(user)} // Set receiver on click
              style={{
                cursor: "pointer",
                backgroundColor: selectedUser === user.email ? "#A7C7E7" : "white", // Change background color if selected
                borderRadius: "10px",
                height: "60px", // Set a consistent height for the list item
                display: "flex", // Enable flexbox for vertical alignment
                alignItems: "center", // Center content vertically
                transition: "background-color 0.3s", // Smooth transition for hover
              }}
              onMouseEnter={(e) => {
                if (selectedUser !== user.email) e.currentTarget.style.backgroundColor = "#f5f5f5"; // Hover effect
              }}
              onMouseLeave={(e) => {
                if (selectedUser !== user.email) e.currentTarget.style.backgroundColor = "white"; // Reset hover effect
              }}
            >
              <List.Item.Meta
                style={{
                  display: "flex", // Enable flexbox for vertical alignment
                  alignItems: "center", // Center content vertically
                  marginLeft: "20px"
                }}
                title={<Title level={5} style={{ margin: 0 }}>{user.username}</Title>}
              />
            </List.Item>
          )}
        />
      </div>
    </div>
  );
}