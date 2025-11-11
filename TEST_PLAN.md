# Test Plan for Secure Chat App

## Critical Tests

### 1. Crypto Error Fix
**Test:** Verify the crypto error is resolved
- Register a new user
- Login with the user
- Send messages
- **Expected:** No crypto errors in console

### 2. Message Encryption/Decryption
**Test:** Verify messages are encrypted and decrypted properly
- User A sends message "Hello World"
- **Expected:** Message appears as plaintext for both users
- **Technical:** Message stored encrypted in Firestore

### 3. Typing Indicators
**Test:** Real-time typing indicators
- Open same chat on two devices/users
- User A starts typing
- **Expected:** User B sees "Typing..." in header
- Stop typing for 1 second
- **Expected:** "Typing..." disappears

### 4. Read Receipts
**Test:** Message read status
- User A sends message to User B
- **Expected:** Single checkmark appears
- User B opens the chat
- **Expected:** Double blue checkmark appears

### 5. Online/Offline Status
**Test:** Presence detection
- User A logs in
- **Expected:** Green dot appears next to User A in User B's chat list
- User A logs out
- **Expected:** Green dot disappears

### 6. Image Sharing
**Test:** Send images in chat
- Open any chat
- Tap image icon
- Select image from gallery
- **Expected:** Image uploads and appears in chat
- **Expected:** Recipient sees the image

### 7. Push Notifications
**Test:** Notification delivery
- User B is not in chat
- User A sends message
- **Expected:** User B receives push notification
- Tap notification
- **Expected:** Opens to specific chat

## UI/UX Tests

### 1. Auth Screen
- Modern logo with icon
- Show/hide password toggle
- Tab switching between Login/Register
- Loading states

### 2. Chat List
- Online indicators
- Pull to refresh
- Smooth navigation
- Empty state display

### 3. Chat Screen
- Message bubbles styled correctly
- Send button enabled/disabled
- Image button visible
- Keyboard handling
- Scroll to bottom

## Edge Cases

1. No internet connection
2. Firebase authentication errors
3. Image too large
4. Multiple rapid messages
5. App in background
6. Notification permissions denied

## Performance Tests

1. Message load time
2. Image upload speed
3. Real-time update latency
4. Memory usage
5. Battery consumption
