import { signOut } from 'firebase/auth';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Button, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { auth, db } from '../firebaseConfig';

export default function ChatListScreen({ navigation }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Query Firestore for all users *except* the current one
    const currentUserUid = auth.currentUser.uid;
    const q = query(collection(db, 'users'), where('uid', '!=', currentUserUid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => doc.data());
      setUsers(usersData);
    });

    return () => unsubscribe();
  }, []);

  // Helper function to create a unique chat room ID
  // This makes sure that user A chatting with user B
  // is the *same chat room* as user B chatting with user A.
  const getChatId = (user1, user2) => {
    return user1 < user2? `${user1}_${user2}` : `${user2}_${user1}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.uid}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => {
              // Create a unique chat ID and pass it to the chat screen
              const chatId = getChatId(auth.currentUser.uid, item.uid);
              navigation.navigate('Chat', { 
                chatId: chatId, 
                recipientEmail: item.email,
                recipientUid: item.uid
              });
            }}
          >
            <Text style={styles.text}>{item.email}</Text>
          </TouchableOpacity>
        )}
      />
      <Button title="Logout" onPress={() => signOut(auth)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  item: { padding: 20, borderBottomColor: '#ccc', borderBottomWidth: 1 },
  text: { fontSize: 18 },
});