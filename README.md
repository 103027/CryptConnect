**CryptConnect**

A secure messaging platform designed to provide end-to-end encryption, secure key management, and user-friendly functionality, all while prioritizing data privacy.

**Overview**

With the increasing popularity of messaging applications, concerns about data privacy and security have grown. CryptConnect addresses these challenges by using decentralized end-to-end encryption to protect users' data. The platform employs trusted technologies and advanced security protocols to ensure secure communication.


**Features**

 - User Registration & Authentication: Secure sign-up and login through Firebase Authentication.
 - Password Reset: Users can reset their passwords securely.
 - Chat Functionality: Search for other users and initiate secure conversations.
 - Profile Editing: Users can update their profiles.
 - End-to-End Encryption: Messages are encrypted during transit and storage.
 - Key Management: Public-private key pairs are generated for each user, with private keys encrypted using their password.
 - Secure Key Exchange: Diffie-Hellman algorithm is used to derive shared symmetric keys for communication.
 - File Upload & Storage: Upload files in formats like .pdf, .docx, and .txt, encrypted with AES and securely stored in the database.



**Technical Architecture**

**Frontend**
 - Built with React.js.
 - Handles user interactions such as registration, login, chat, and profile management.

**Backend**
 - Powered by Firebase.
 - Manages data storage, authentication, and message delivery in encrypted formats.

**Encryption Mechanisms**
 - Diffie-Hellman: Derives shared symmetric keys without exposing sensitive data.
 - AES Encryption: Ensures confidentiality and integrity of messages and files.
**Inner Workings**
 - Upon registration, unique public-private key pairs are generated for each user.
 - Private keys are encrypted using the user’s password for added security.
 - Chats use shared symmetric keys derived from the Diffie-Hellman key exchange.
 - Messages are encrypted with AES before storage in Firebase.
 - Files are encrypted with AES before upload and decrypted on download for secure transfer.

**Security Analysis**
**Findings:**

 - Messages and files are protected by end-to-end encryption.
 - Password-encrypted private keys enhance security.
 - "Forgot Password" limitation: Losing a password means losing access to previously encrypted messages.

**Lessons Learned:**

 - Trade-offs exist between robust security and usability.
 - Future improvements could include secure recovery keys or multi-layer encryption.

**Screenshots**

<img width="1440" alt="Screenshot 2025-01-26 at 4 39 11 PM" src="https://github.com/user-attachments/assets/b12c9c52-0430-493e-a314-bd0f0e62496b" />
<img width="1440" alt="Screenshot 2025-01-26 at 4 39 03 PM" src="https://github.com/user-attachments/assets/1125c76e-4f71-4401-9edb-353df1b0de56" />
<img width="1440" alt="Screenshot 2025-01-26 at 4 38 55 PM" src="https://github.com/user-attachments/assets/a184899e-d1c3-47fc-b4a7-f559b8ca6e45" />
<img width="1440" alt="Screenshot 2025-01-26 at 4 38 36 PM" src="https://github.com/user-attachments/assets/5a99f081-38f9-4bd6-a7df-f8ded8eec80d" />
<img width="1440" alt="Screenshot 2025-01-26 at 4 38 27 PM" src="https://github.com/user-attachments/assets/da858f5e-6a6c-4b1a-a6a2-0130073de3dc" />



**Future Enhancements**
 - Implementing a secure recovery mechanism for private keys.
 - Adding more file formats and media support.
 - Introducing group chat and video call functionality.

**Installation and Usage**
**Prerequisites**
 - Node.js
 - Firebase project setup
**Steps**
 - Clone the repository.
 - Install dependencies: npm install.
 - Set up Firebase credentials in the .env file.
 - Start the development server: npm start.
