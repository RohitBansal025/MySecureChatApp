import React from 'react';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot, query, where, orderBy as firestoreOrderBy, limit } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { 
  Alert,
  FlatList, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
  RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../firebaseConfig';

export default function ChatListScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userStatuses, setUserStatuses] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    // Query Firestore for all users *except* the current one
    const currentUserUid = auth.currentUser.uid;
    const q = query(collection(db, 'users'), where('uid', '!=', currentUserUid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => doc.data());
      setUsers(usersData);
      setLoading(false);
      setRefreshing(false);
    });

    return unsubscribe;
  };

  // Listen for online statuses
  useEffect(() => {
    const unsubscribes = users.map(user => {
      const statusRef = collection(db, 'userStatus');
      const q = query(statusRef);
      
      return onSnapshot(q, (snapshot) => {
        const statuses = {};
        snapshot.docs.forEach(doc => {
          statuses[doc.id] = doc.data();
        });
        setUserStatuses(statuses);
      });
    });

    return () => unsubscribes.forEach(unsub => unsub && unsub());
  }, [users]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  // Helper function to create a unique chat room ID
  const getChatId = (user1, user2) => {
    return user1 < user2 ? `${user1}_${user2}` : `${user2}_${user1}`;
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => signOut(auth) }
      ]
    );
  };

  const getInitials = (email) => {
    return email.charAt(0).toUpperCase();
  };

  const getAvatarColor = (email) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
    const index = email.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>No Chats Yet</Text>
      <Text style={styles.emptyText}>
        Ask your friends to create an account to start chatting!
      </Text>
      <Text style={styles.emptyHint}>
        Create another account to test the chat
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Messages</Text>
          <Text style={styles.headerSubtitle}>{auth.currentUser?.email}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading chats...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.uid}
          contentContainerStyle={users.length === 0 && styles.emptyList}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => {
            const isOnline = userStatuses[item.uid]?.isOnline || false;
            
            return (
              <TouchableOpacity
                style={styles.chatItem}
                onPress={() => {
                  const chatId = getChatId(auth.currentUser.uid, item.uid);
                  navigation.navigate('Chat', { 
                    chatId: chatId, 
                    recipientEmail: item.email,
                    recipientUid: item.uid
                  });
                }}
              >
                <View style={styles.avatarContainer}>
                  <View style={[styles.avatar, { backgroundColor: getAvatarColor(item.email) }]}>
                    <Text style={styles.avatarText}>{getInitials(item.email)}</Text>
                  </View>
                  {isOnline && <View style={styles.onlineIndicator} />}
                </View>
                <View style={styles.chatInfo}>
                  <View style={styles.chatHeader}>
                    <Text style={styles.chatName}>{item.email}</Text>
                    {isOnline && (
                      <View style={styles.onlineBadge}>
                        <Text style={styles.onlineBadgeText}>Online</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.chatPreviewContainer}>
                    <Ionicons name="lock-closed" size={14} color="#999" />
                    <Text style={styles.chatPreview}> End-to-end encrypted</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#ccc" />
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyHint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  chatPreview: {
    fontSize: 14,
    color: '#999',
  },
  chevron: {
    marginLeft: 8,
  },
  chevronText: {
    fontSize: 24,
    color: '#ccc',
  },
});
