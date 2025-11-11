import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { auth } from './firebaseConfig';
import { registerForPushNotificationsAsync, setupNotificationListeners } from './utils/notifications';

// Import your screens
import AuthScreen from './screens/AuthScreen';
import ChatListScreen from './screens/ChatListScreen';
import ChatScreen from './screens/ChatScreen';

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const navigationRef = useRef(null);

  // This "listener" checks if the user is logged in or out
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      
      // Register for push notifications when user logs in
      if (user) {
        registerForPushNotificationsAsync(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  // Setup notification listeners
  useEffect(() => {
    if (navigationRef.current) {
      const { notificationListener, responseListener } = setupNotificationListeners(navigationRef.current);
      
      return () => {
        notificationListener.remove();
        responseListener.remove();
      };
    }
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          {user ? (
            // If user is logged in, show the chat screens
            <>
              <Stack.Screen 
                name="ChatList" 
                component={ChatListScreen} 
                options={{ headerShown: false }} 
              />
              <Stack.Screen name="Chat" component={ChatScreen} />
            </>
          ) : (
            // If user is not logged in, show the login screen
            <Stack.Screen 
              name="Auth" 
              component={AuthScreen} 
              options={{ headerShown: false }} 
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
