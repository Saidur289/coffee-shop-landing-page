import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { View, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing, withSequence } from 'react-native-reanimated';
import { useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

const { width, height } = Dimensions.get('window');

const Orb = ({ color, size, initialX, initialY, duration }) => {
  const tX = useSharedValue(initialX);
  const tY = useSharedValue(initialY);

  useEffect(() => {
    tX.value = withRepeat(
      withSequence(
        withTiming(initialX + 100, { duration, easing: Easing.inOut(Easing.ease) }),
        withTiming(initialX - 100, { duration, easing: Easing.inOut(Easing.ease) }),
        withTiming(initialX, { duration, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    tY.value = withRepeat(
      withSequence(
        withTiming(initialY + 150, { duration: duration * 1.2, easing: Easing.inOut(Easing.ease) }),
        withTiming(initialY - 50, { duration: duration * 1.2, easing: Easing.inOut(Easing.ease) }),
        withTiming(initialY, { duration: duration * 1.2, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: tX.value }, { translateY: tY.value }],
  }));

  return (
    <Animated.View style={[
      {
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: 0.6,
      },
      style
    ]} />
  );
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={styles.container}>
        {/* Animated Mesh Gradient Base - Deep Espresso Coffee Theme */}
        <LinearGradient colors={['#1c1917', '#0c0a09', '#171717']} style={styles.background} />
        
        {/* Floating colored orbs (Warm caramel, roasted amber) */}
        <Orb color="#b45309" size={300} initialX={-50} initialY={height * 0.2} duration={8000} />
        <Orb color="#78350f" size={400} initialX={width * 0.5} initialY={height * 0.6} duration={10000} />
        <Orb color="#451a03" size={350} initialX={width * 0.2} initialY={height * 0.8} duration={12000} />

        {/* Global Blur Layer */}
        <BlurView intensity={100} tint="dark" style={styles.absoluteFill}>
          <Stack screenOptions={{ contentStyle: { backgroundColor: 'transparent' } }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </BlurView>
      </View>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0a09',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
  },
});
