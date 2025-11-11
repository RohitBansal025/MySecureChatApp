import CryptoJS from 'crypto-js';
import {
    addDoc,
    collection,
    onSnapshot,
    orderBy,
    query
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { GiftedChat, Bubble, Send, InputToolbar } from 'react-native-gifted-chat';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../firebaseConfig';

//!!! --- THIS IS YOUR ENCRYPTION KEY ---!!!
// For a real app, this key would be shared securely.
// For demo purposes, it's here.
const ENCRYPTION_KEY = 'my-super-secret-key';

export default function ChatScreen({ route, navigation }) {
  const { chatId, recipientEmail, recipientUid } = route.params;
  const [messages, setMessages] = useState([]);
  const currentUser = auth.currentUser;

  // Set the screen title to the person you're chatting with
  useEffect(() => {
    navigation.setOptions({ 
      title: recipientEmail,
      headerStyle: {
        backgroundColor: '#007AFF',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    });
  }, [navigation, recipientEmail]);

  // This "listens" for new messages in the database
  useEffect(() => {
    const chatMessagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(chatMessagesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMessages = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // --- THIS IS THE DECRYPTION ---
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

  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#007AFF',
          },
          left: {
            backgroundColor: '#E5E5EA',
          }
        }}
        textStyle={{
          right: {
            color: '#fff',
          },
          left: {
            color: '#000',
          }
        }}
      />
    );
  };

  const renderSend = (props) => {
    return (
      <Send
        {...props}
        containerStyle={styles.sendContainer}
      >
        <View style={styles.sendButton}>
          <Text style={styles.sendText}>Send</Text>
        </View>
      </Send>
    );
  };

  const renderInputToolbar = (props) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={styles.inputToolbar}
        primaryStyle={styles.inputPrimary}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{
          _id: currentUser.uid,
          name: currentUser.email,
        }}
        renderBubble={renderBubble}
        renderSend={renderSend}
        renderInputToolbar={renderInputToolbar}
        alwaysShowSend
        placeholder="Type a message..."
        showAvatarForEveryMessage={false}
        renderAvatar={null}
        timeTextStyle={{
          left: { color: '#999' },
          right: { color: '#fff' }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  sendContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 5,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
  },
  sendText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  inputToolbar: {
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    backgroundColor: '#fff',
    paddingVertical: 4,
  },
  inputPrimary: {
    alignItems: 'center',
  },
});
