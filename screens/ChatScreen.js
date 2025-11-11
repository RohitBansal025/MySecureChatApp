import CryptoJS from 'crypto-js';
import {
    addDoc,
    collection,
    onSnapshot,
    orderBy,
    query
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import { auth, db } from '../firebaseConfig';

//!!! --- THIS IS YOUR ENCRYPTION KEY ---!!!
// For a real app, this key would be shared securely.
// For your MTE demo, it's perfect to have it here.
const ENCRYPTION_KEY = 'my-super-secret-key';

export default function ChatScreen({ route, navigation }) {
  const { chatId, recipientEmail, recipientUid } = route.params;
  const [messages, setMessages] = useState();
  const currentUser = auth.currentUser;

  // Set the screen title to the person you're chatting with
  useEffect(() => {
    navigation.setOptions({ title: recipientEmail });
  }, [navigation, recipientEmail]);

  // This "listens" for new messages in the database
  useEffect(() => {
    const chatMessagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(chatMessagesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMessages = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // --- THIS IS THE DECRYPTION ---
        // Try to decrypt the text.
        let decryptedText = data.text;
        try {
          const bytes = CryptoJS.AES.decrypt(data.text, ENCRYPTION_KEY);
          decryptedText = bytes.toString(CryptoJS.enc.Utf8);
        } catch (e) {
          console.error("Failed to decrypt:", e);
        }
        // -----------------------------

        return {
          _id: doc.id,
          createdAt: data.createdAt.toDate(),
          text: decryptedText, // Use the decrypted text
          user: data.user,
        };
      });
      setMessages(allMessages);
    });

    return () => unsubscribe();
  }, [chatId]);

  // This function runs when you press the "send" button
  const onSend = useCallback((messages) => {
    const message = messages[0];
    
    // --- THIS IS THE ENCRYPTION ---
    const ciphertext = CryptoJS.AES.encrypt(message.text, ENCRYPTION_KEY).toString();
    // ----------------------------

    const chatMessagesRef = collection(db, 'chats', chatId, 'messages');
    
    addDoc(chatMessagesRef, {
      _id: message._id,
      createdAt: message.createdAt,
      text: ciphertext, // <-- Save the ENCRYPTED text
      user: message.user,
    });

  }, [chatId]);

  return (
    <GiftedChat
      messages={messages}
      onSend={messages => onSend(messages)}
      user={{
        _id: currentUser.uid,
        name: currentUser.email,
      }}
    />
  );
}