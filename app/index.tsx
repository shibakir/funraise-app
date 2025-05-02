import { Redirect } from 'expo-router';
import { useAuth } from '@/lib/context/AuthContext';

export default function Index() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect href="/(app)/(tabs)/home" />;
  } else {
    return <Redirect href="/(auth)/login" />;
  }
} 