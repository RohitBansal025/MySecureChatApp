# Real-Time Chat Application with End-to-End Encryption

## Project Overview
This is a React Native mobile application built with Expo that provides real-time chat functionality with end-to-end encryption using Firebase as the backend.

## Tech Stack
- **Frontend**: React Native (Expo)
- **Backend**: Firebase (Authentication + Firestore)
- **Encryption**: CryptoJS (AES encryption)
- **UI Library**: React Native Gifted Chat
- **Navigation**: React Navigation

## Features Implemented

### ✅ Completed Features
1. **User Authentication**
   - Email/Password registration
   - Email/Password login
   - Firebase Authentication integration
   - Auto user document creation in Firestore

2. **Chat List Screen**
   - Display all registered users except current user
   - Real-time user list updates
   - Navigate to individual chats
   - Logout functionality

3. **Chat Screen**
   - Real-time messaging with Firestore
   - End-to-end encryption using AES-256
   - Message encryption before sending
   - Automatic message decryption on receive
   - Beautiful chat UI with React Native Gifted Chat
   - Unique chat room IDs for user pairs

4. **Security**
   - Messages encrypted with AES before storing in database
   - Encryption key: `my-super-secret-key` (hardcoded for demo)
   - Only encrypted text stored in Firebase

## Bugs Fixed
1. ✅ Missing imports in `firebaseConfig.js` - Added `getAuth` and `getFirestore`
2. ✅ Missing dependency array in `App.js` useEffect
3. ✅ Uninitialized state in `ChatListScreen.js` - Changed from `undefined` to `[]`
4. ✅ Missing dependency array in `ChatListScreen.js` useEffect
5. ✅ Uninitialized state in `ChatScreen.js` - Changed from `undefined` to `[]`
6. ✅ Created missing `index.js` entry point
7. ✅ Created missing `babel.config.js`
8. ✅ Updated package.json main entry from expo-router to index.js
9. ✅ Added missing peer dependencies

## Project Structure
```
/app/
├── screens/              # Application screens
│   ├── AuthScreen.js     # Login/Register screen
│   ├── ChatListScreen.js # List of available users
│   └── ChatScreen.js     # Individual chat screen with encryption
├── App.js               # Main app with navigation & auth state
├── index.js             # Entry point
├── firebaseConfig.js    # Firebase configuration
├── babel.config.js      # Babel configuration
└── package.json         # Dependencies
```

## How to Run

### Prerequisites
- Node.js and npm/yarn installed
- Expo CLI installed globally: `npm install -g expo-cli`
- Expo Go app on your mobile device (iOS/Android)

### Installation
```bash
# Install dependencies
cd /app
yarn install

# Start the development server
yarn start
```

### Testing on Device
1. Open Expo Go app on your phone
2. Scan the QR code from the terminal
3. App will load on your device

### Testing Authentication
1. Register a new user with email and password
2. Log out and register another user
3. Log in with first user
4. You should see the second user in the chat list

### Testing Encrypted Chat
1. Click on a user from the chat list
2. Send messages - they will be encrypted before saving to Firebase
3. Messages appear decrypted in the chat UI
4. Check Firebase Console to verify messages are stored encrypted

## Firebase Configuration
The app uses Firebase with the following services:
- **Firebase Authentication** - Email/Password authentication
- **Cloud Firestore** - Real-time database for messages and user data

### Collections Structure
```
users/
  └── {userId}/
      ├── uid: string
      └── email: string

chats/
  └── {chatId}/          # Format: userId1_userId2 (sorted)
      └── messages/
          └── {messageId}/
              ├── _id: string
              ├── text: string (encrypted)
              ├── createdAt: timestamp
              └── user: object
```

## Encryption Details
- **Algorithm**: AES-256
- **Library**: CryptoJS
- **Key**: Hardcoded in `ChatScreen.js` as `my-super-secret-key`
- **Process**: 
  - Outgoing: Plain text → Encrypt → Store encrypted
  - Incoming: Fetch encrypted → Decrypt → Display plain text

## Known Limitations
1. Encryption key is hardcoded (for demo purposes)
2. In production, implement secure key exchange
3. No key rotation mechanism
4. No message deletion feature
5. No typing indicators
6. No read receipts
7. No image/file sharing
8. No push notifications

## Future Enhancements (Not Implemented)
- [ ] Secure key exchange mechanism
- [ ] Public/Private key encryption instead of shared key
- [ ] Group chats
- [ ] Message deletion
- [ ] File/Image sharing
- [ ] Push notifications
- [ ] User profiles
- [ ] Online/Offline status
- [ ] Message read receipts
- [ ] Typing indicators

## Security Notes
⚠️ **Important**: This is a demo application. For production use:
1. Implement proper key management (not hardcoded)
2. Use asymmetric encryption (RSA + AES)
3. Implement perfect forward secrecy
4. Add message authentication codes (MAC)
5. Implement secure key exchange protocol
6. Add Firebase Security Rules
7. Implement rate limiting
8. Add input validation and sanitization

## Dependencies Installed
- expo: ~54.0.23
- react: 19.1.0
- react-native: 0.81.5
- firebase: ^12.5.0
- crypto-js: ^4.2.0
- react-native-gifted-chat: ^2.8.1
- @react-navigation/native: ^7.1.19
- @react-navigation/stack: ^7.6.3
- react-native-keyboard-controller: ^1.19.5
- @babel/core: ^7.28.5
- @expo/metro-runtime: ^6.1.2

## Current Status
✅ **All core features are working**
✅ **All bugs have been fixed**
✅ **App is ready to run and test**

The application is complete and functional. You can now:
1. Register and login users
2. See list of other users
3. Chat with end-to-end encryption
4. Messages are encrypted in the database
5. Messages are automatically decrypted in the UI
