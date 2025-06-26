import { StyleSheet, View, Image } from 'react-native';
import { ThemedText } from '@/components/themed/ThemedText';
import { ThemedView } from '@/components/themed/ThemedView';

const logoImage = require('@/assets/images/logo.png');

export function LogoBox() {

  return (
    <ThemedView style={styles.logoContainer}>
            <Image
                source={logoImage} 
                style={styles.logo} 
                resizeMode="contain"
            />
            <ThemedText style={styles.appName}>Funraise</ThemedText>
        </ThemedView>
  );
};

const styles = StyleSheet.create({
    logoContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    logo: {
        width: 200,
        height: 200,
    },
    appName: {
        fontSize: 24,
        fontWeight: 'bold',
    },
}); 