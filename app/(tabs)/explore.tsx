import React from 'react';
import { StyleSheet, Image, Platform, TouchableOpacity, View } from 'react-native';
import { Stack, router } from 'expo-router';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { CustomButton } from '@/components/custom/button';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { horizontalScale, verticalScale, moderateScale } from '@/lib/utilities/Metrics';

export default function TabTwoScreen() {
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'divider');
  const textSecondary = useThemeColor({}, 'icon');
  const sectionBackground = useThemeColor({}, 'sectionBackground');

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Explore',
          headerShown: true,
        }} 
      />
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
        headerImage={
          <IconSymbol
            size={310}
            color="#808080"
            name="chevron.left.forwardslash.chevron.right"
            style={styles.headerImage}
          />
        }>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Explore</ThemedText>
        </ThemedView>

        <ThemedView style={styles.createEventSection}>
          <TouchableOpacity 
            style={styles.createEventButton}
            onPress={() => router.push('/events/create')}
            activeOpacity={0.7}
          >
            <View style={[styles.createEventIcon, { backgroundColor: primaryColor }]}>
              <IconSymbol name="plus" size={24} color="white" />
            </View>
            <ThemedText style={styles.createEventText}>Create New Event</ThemedText>
            <IconSymbol name="chevron.right" size={20} color={textSecondary} />
          </TouchableOpacity>
        </ThemedView>

        <ThemedText>This app includes example code to help you get started.</ThemedText>
        <Collapsible title="File-based routing">
          <ThemedText>
            This app has two screens:{' '}
            <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> and{' '}
            <ThemedText type="defaultSemiBold">app/(tabs)/explore.tsx</ThemedText>
          </ThemedText>
          <ThemedText>
            The layout file in <ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText>{' '}
            sets up the tab navigator.
          </ThemedText>
          <ExternalLink href="https://docs.expo.dev/router/introduction">
            <ThemedText type="link">Learn more</ThemedText>
          </ExternalLink>
        </Collapsible>
        <Collapsible title="Android, iOS, and web support">
          <ThemedText>
            You can open this project on Android, iOS, and the web. To open the web version, press{' '}
            <ThemedText type="defaultSemiBold">w</ThemedText> in the terminal running this project.
          </ThemedText>
        </Collapsible>
        <Collapsible title="Images">
          <ThemedText>
            For static images, you can use the <ThemedText type="defaultSemiBold">@2x</ThemedText> and{' '}
            <ThemedText type="defaultSemiBold">@3x</ThemedText> suffixes to provide files for
            different screen densities
          </ThemedText>
          <Image source={require('@/assets/images/react-logo.png')} style={{ alignSelf: 'center' }} />
          <ExternalLink href="https://reactnative.dev/docs/images">
            <ThemedText type="link">Learn more</ThemedText>
          </ExternalLink>
        </Collapsible>
        <Collapsible title="Custom fonts">
          <ThemedText>
            Open <ThemedText type="defaultSemiBold">app/_layout.tsx</ThemedText> to see how to load{' '}
            <ThemedText style={{ fontFamily: 'SpaceMono' }}>
              custom fonts such as this one.
            </ThemedText>
          </ThemedText>
          <ExternalLink href="https://docs.expo.dev/versions/latest/sdk/font">
            <ThemedText type="link">Learn more</ThemedText>
          </ExternalLink>
        </Collapsible>
        <Collapsible title="Light and dark mode components">
          <ThemedText>
            This template has light and dark mode support. The{' '}
            <ThemedText type="defaultSemiBold">useColorScheme()</ThemedText> hook lets you inspect
            what the user's current color scheme is, and so you can adjust UI colors accordingly.
          </ThemedText>
          <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
            <ThemedText type="link">Learn more</ThemedText>
          </ExternalLink>
        </Collapsible>
        <Collapsible title="Animations">
          <ThemedText>
            This template includes an example of an animated component. The{' '}
            <ThemedText type="defaultSemiBold">components/HelloWave.tsx</ThemedText> component uses
            the powerful <ThemedText type="defaultSemiBold">react-native-reanimated</ThemedText>{' '}
            library to create a waving hand animation.
          </ThemedText>
          {Platform.select({
            ios: (
              <ThemedText>
                The <ThemedText type="defaultSemiBold">components/ParallaxScrollView.tsx</ThemedText>{' '}
                component provides a parallax effect for the header image.
              </ThemedText>
            ),
          })}
        </Collapsible>
      </ParallaxScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  createEventSection: {
    marginVertical: moderateScale(16),
    borderRadius: moderateScale(12),
    overflow: 'hidden',
  },
  createEventButton: {
    padding: moderateScale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  createEventIcon: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  createEventText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    flex: 1,
    marginLeft: horizontalScale(12),
  },
});
