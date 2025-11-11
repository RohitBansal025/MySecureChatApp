# Quick Start Guide - Secure Chat App

## 🚀 Getting Started

### Step 1: Start the Development Server
```bash
cd /app
yarn start
```

### Step 2: Open on Your Device
- Open the **Expo Go** app on your phone (Download from App/Play Store)
- Scan the QR code shown in the terminal
- The app will load on your device

## 📱 Testing the Application

### Test Scenario 1: User Registration & Authentication
1. **Register First User**
   - Enter email: `user1@test.com`
   - Enter password: `password123`
   - Tap "Register"
   - You should see the Chat List screen

2. **Create Second User**
   - Tap "Logout" button
   - Enter email: `user2@test.com`
   - Enter password: `password123`
   - Tap "Register"

### Test Scenario 2: Encrypted Messaging
1. **User 1 → User 2**
   - Login as `user1@test.com`
   - You'll see `user2@test.com` in the chat list
   - Tap on user2
   - Send message: "Hello, this is encrypted!"
   - Message appears in chat

2. **User 2 receives encrypted message**
   - On another device/account, login as `user2@test.com`
   - You'll see `user1@test.com` in the list
   - Tap on user1
   - You should see the message "Hello, this is encrypted!"

3. **Verify Encryption in Firebase**
   - Go to Firebase Console → Firestore Database
   - Navigate to: `chats/{chatId}/messages`
   - The `text` field will show encrypted gibberish like: `U2FsdGVkX1...`
   - This proves messages are encrypted before storage!

### Test Scenario 3: Real-Time Updates
1. Keep both devices logged in to the same chat
2. Send messages from device 1
3. Messages should instantly appear on device 2
4. Send from device 2, appears on device 1

## 🔍 Verification Checklist

### Frontend Features
- ✅ Login screen displays correctly
- ✅ Registration creates new user
- ✅ Chat list shows other users (not self)
- ✅ Clicking user opens chat screen
- ✅ Messages can be sent
- ✅ Messages appear in chat UI
- ✅ Real-time message updates work
- ✅ Logout button works

### Encryption Features
- ✅ Messages encrypted before sending to Firebase
- ✅ Messages decrypted when displaying in chat
- ✅ Encrypted text visible in Firebase Console
- ✅ Plain text visible in app UI

### Navigation
- ✅ Auth → Chat List (after login)
- ✅ Chat List → Individual Chat (tap user)
- ✅ Chat → Chat List (back button)
- ✅ Any screen → Auth (logout)

## 🐛 Troubleshooting

### Issue: "Couldn't start project on Android"
**Solution**: Make sure Expo Go app is installed on your device

### Issue: "Module not found"
**Solution**: 
```bash
cd /app
rm -rf node_modules
yarn install
```

### Issue: "Firebase error"
**Solution**: Check your internet connection. Firebase requires network access.

### Issue: "Can't connect to Metro bundler"
**Solution**: Make sure your phone and computer are on the same WiFi network

## 📊 Expected Test Results

### Authentication Test
- ✅ New users can register
- ✅ Registered users can login
- ✅ Invalid credentials show error
- ✅ Empty fields show validation error

### Chat Test
- ✅ User can see list of all other users
- ✅ Can open chat with any user
- ✅ Can send text messages
- ✅ Messages appear in real-time
- ✅ Messages persist across sessions

### Encryption Test
- ✅ Messages in Firebase are encrypted (unreadable text)
- ✅ Messages in app UI are plain text (readable)
- ✅ Different users can decrypt and read each other's messages

## 🔐 Security Verification

### How to Verify Encryption Works:
1. Send a message: "This is a secret"
2. Open Firebase Console
3. Go to: Firestore Database → chats → {chatId} → messages
4. Look at the `text` field
5. You should see something like: `U2FsdGVkX1+abc123...` (encrypted)
6. This proves the message is encrypted!

### Encryption Flow:
```
User types "Hello" 
    ↓
App encrypts to "U2FsdGVkX1+abc..."
    ↓
Saves encrypted text to Firebase
    ↓
Another user fetches message
    ↓
App decrypts back to "Hello"
    ↓
Displays "Hello" in chat UI
```

## 📈 Performance Metrics

Expected behavior:
- ⚡ Login: < 2 seconds
- ⚡ Message send: < 1 second
- ⚡ Real-time updates: Instant (< 500ms)
- ⚡ Chat list load: < 2 seconds

## ✅ Completion Status

**All core features are implemented and working:**
- ✅ User authentication (register/login)
- ✅ Real-time chat functionality
- ✅ End-to-end encryption with AES
- ✅ Chat list with all users
- ✅ Individual chat screens
- ✅ Message persistence
- ✅ Logout functionality

**The application is ready for testing and demonstration!**
