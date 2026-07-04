import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import IssuesScreen from '../screens/IssuesScreen';
import RequestsScreen from '../screens/RequestsScreen';
import NewRequestScreen from '../screens/NewRequestScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import HelpScreen from '../screens/HelpScreen';
import { LoadingState } from '../components/ScreenState';
import { colors, spacing } from '../lib/theme';

const Tab = createBottomTabNavigator();
const RequestsStack = createNativeStackNavigator();

function RequestsStackScreen() {
  return (
    <RequestsStack.Navigator>
      <RequestsStack.Screen name="RequestsList" component={RequestsScreen} options={{ headerShown: false }} />
      <RequestsStack.Screen name="NewRequest" component={NewRequestScreen} options={{ title: 'New request' }} />
    </RequestsStack.Navigator>
  );
}

function ResidentTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Issues" component={IssuesScreen} />
      <Tab.Screen name="Requests" component={RequestsStackScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Help" component={HelpScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { session, profile, profileError, signOut } = useAuth();

  let content;
  if (session === undefined) {
    content = <LoadingState label="Loading..." />;
  } else if (!session) {
    content = <LoginScreen />;
  } else if (profileError) {
    content = (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Couldn't load your profile</Text>
        <Text style={styles.errorBody}>{profileError}</Text>
        <Text style={styles.errorBody}>This account may not have a resident profile linked to it.</Text>
        <Pressable style={styles.signOutButton} onPress={signOut}>
          <Text style={styles.signOutLabel}>Sign out and try another account</Text>
        </Pressable>
      </View>
    );
  } else if (!profile) {
    content = <LoadingState label="Loading your profile..." />;
  } else {
    content = <ResidentTabs />;
  }

  return <NavigationContainer>{content}</NavigationContainer>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  errorTitle: { color: colors.danger, fontWeight: '600', fontSize: 16 },
  errorBody: { color: colors.textMuted, textAlign: 'center' },
  signOutButton: { marginTop: spacing.md, padding: spacing.sm },
  signOutLabel: { color: colors.primary, fontWeight: '600' },
});
