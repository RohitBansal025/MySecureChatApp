import React, { useCallback, useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { GiftedChat, Bubble, Send, InputToolbar, SystemMessage } from 'react-native-gifted-chat';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import CryptoJS from 'crypto-js';
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

// Encryption key
const ENCRYPTION_KEY = 'my-super-secret-key';

export default function ChatScreen({ route, navigation }) {
  const { chatId, recipientEmail, recipientUid } = route.params;
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [recipientTyping, setRecipientTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [uploading, setUploading] = useState(false);
  const currentUser = auth.currentUser;
  const typingTimeoutRef = useRef(null);

  // Set header
  useEffect(() => {
    navigation.setOptions({ 
      headerTitle: () => (
        <View>
          <Text style={styles.headerTitle}>{recipientEmail}</Text>
          {isOnline && <Text style={styles.headerSubtitle}>Online</Text>}
          {recipientTyping && <Text style={styles.headerSubtitle}>Typing...</Text>}
        </View>
      ),
      headerStyle: {
        backgroundColor: '#007AFF',
      },
      headerTintColor: '#fff',
    });
  }, [navigation, recipientEmail, isOnline, recipientTyping]);

  // Listen for recipient's online status
  useEffect(() => {
    const userStatusRef = doc(db, 'userStatus', recipientUid);
    const unsubscribe = onSnapshot(userStatusRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setIsOnline(data.isOnline || false);
      }
    });
    return () => unsubscribe();
  }, [recipientUid]);

  // Listen for recipient typing
  useEffect(() => {
    const typingRef = doc(db, 'typing', chatId);
    const unsubscribe = onSnapshot(typingRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data[recipientUid]) {
          setRecipientTyping(data[recipientUid]);
        }
      }
    });
    return () => unsubscribe();
  }, [chatId, recipientUid]);

  // Update own online status
  useEffect(() => {
    const userStatusRef = doc(db, 'userStatus', currentUser.uid);
    setDoc(userStatusRef, { isOnline: true, lastSeen: serverTimestamp() }, { merge: true });

    return () => {
      setDoc(userStatusRef, { isOnline: false, lastSeen: serverTimestamp() }, { merge: true });
    };
  }, [currentUser.uid]);

  // Listen for messages
  useEffect(() => {
    const chatMessagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(chatMessagesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMessages = snapshot.docs.map(doc => {
        const data = doc.data();
        
        let decryptedText = data.text;
        if (data.text && !data.image) {
          try {
            const bytes = CryptoJS.AES.decrypt(data.text, ENCRYPTION_KEY);
            decryptedText = bytes.toString(CryptoJS.enc.Utf8);
          } catch (e) {
            console.error('Failed to decrypt:', e);
          }
        }

        // Mark as read if it's from the recipient
        if (data.user._id !== currentUser.uid && !data.read) {
          const messageRef = doc(db, 'chats', chatId, 'messages', doc.id);
          updateDoc(messageRef, { read: true }).catch(err => console.error('Error marking as read:', err));
        }

        return {
          _id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          text: decryptedText,
          user: data.user,
          image: data.image,
          read: data.read || false,
        };
      });
      setMessages(allMessages);
    });

    return () => unsubscribe();
  }, [chatId, currentUser.uid]);

  // Handle typing indicator
  const handleInputTextChanged = (text) => {
    const typingRef = doc(db, 'typing', chatId);
    
    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      setDoc(typingRef, { [currentUser.uid]: true }, { merge: true });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      setDoc(typingRef, { [currentUser.uid]: false }, { merge: true });
    }, 1000);
  };

  // Handle image picker
  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to share images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setUploading(true);
      const imageBase64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
      
      const chatMessagesRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(chatMessagesRef, {
        _id: Math.random().toString(36).substring(7),
        createdAt: new Date(),
        text: '',
        image: imageBase64,
        user: {
          _id: currentUser.uid,
          name: currentUser.email,
        },
        read: false,
      });
      setUploading(false);
    }
  };

  // Send message
  const onSend = useCallback((messages) => {
    const message = messages[0];
    
    const ciphertext = CryptoJS.AES.encrypt(message.text, ENCRYPTION_KEY).toString();

    const chatMessagesRef = collection(db, 'chats', chatId, 'messages');
    
    addDoc(chatMessagesRef, {
      _id: message._id,
      createdAt: message.createdAt,
      text: ciphertext,
      user: message.user,
      read: false,
    });

    // Clear typing indicator
    const typingRef = doc(db, 'typing', chatId);
    setDoc(typingRef, { [currentUser.uid]: false }, { merge: true });
    setIsTyping(false);
  }, [chatId, currentUser.uid]);

  const renderBubble = (props) => {
    const isCurrentUser = props.currentMessage.user._id === currentUser.uid;
    
    return (
      <View>
        <Bubble
          {...props}
          wrapperStyle={{
            right: {
              backgroundColor: '#007AFF',
              borderRadius: 20,
              borderBottomRightRadius: 4,
              padding: 2,
            },
            left: {
              backgroundColor: '#E5E5EA',
              borderRadius: 20,
              borderBottomLeftRadius: 4,
              padding: 2,
            }
          }}
          textStyle={{
            right: {
              color: '#fff',
              fontSize: 16,
            },
            left: {
              color: '#000',
              fontSize: 16,
            }
          }}
          timeTextStyle={{
            right: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
            left: { color: '#999', fontSize: 11 }
          }}
        />
        {isCurrentUser && (
          <View style={styles.readReceiptContainer}>
            <Ionicons 
              name={props.currentMessage.read ? 'checkmark-done' : 'checkmark'} 
              size={14} 
              color={props.currentMessage.read ? '#007AFF' : '#999'} 
            />
          </View>
        )}
      </View>
    );
  };

  const renderSend = (props) => {
    return (
      <View style={styles.sendContainer}>
        <TouchableOpacity onPress={handleImagePick} style={styles.imageButton}>
          {uploading ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Ionicons name="image" size={28} color="#007AFF" />
          )}
        </TouchableOpacity>
        <Send {...props} containerStyle={styles.sendButtonContainer}>
          <View style={styles.sendButton}>
            <Ionicons name="send" size={20} color="#fff" />
          </View>
        </Send>
      </View>
    );
  };

  const renderInputToolbar = (props) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={styles.inputToolbar}
        primaryStyle={styles.inputPrimary}
        onTextChanged={handleInputTextChanged}
      />
    );
  };

  const renderMessageImage = (props) => {
    return (
      <View style={styles.imageMessageContainer}>
        <Image
          source={{ uri: props.currentMessage.image }}
          style={styles.messageImage}
          resizeMode="cover"
        />
      </View>
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
        renderMessageImage={renderMessageImage}
        alwaysShowSend
        placeholder="Type a message..."
        showAvatarForEveryMessage={false}
        renderAvatar={null}
        scrollToBottom
        infiniteScroll
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  sendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 5,
  },
  imageButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
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
  readReceiptContainer: {
    alignSelf: 'flex-end',
    marginRight: 10,
    marginTop: 2,
  },
  imageMessageContainer: {
    borderRadius: 15,
    overflow: 'hidden',
    margin: 3,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 13,
  },
});
