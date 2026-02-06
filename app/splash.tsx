import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Droplets } from 'lucide-react-native';
import { colors } from '@/constants/colors';

const { width } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const bubbleAnimations = useRef(
    Array.from({ length: 6 }, () => ({
      translateY: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0.5),
    }))
  ).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    bubbleAnimations.forEach((anim, index) => {
      const delay = index * 200;
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(anim.translateY, {
              toValue: -100 - Math.random() * 50,
              duration: 2000 + Math.random() * 1000,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(anim.opacity, {
                toValue: 0.6,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(anim.opacity, {
                toValue: 0,
                duration: 1500 + Math.random() * 500,
                useNativeDriver: true,
              }),
            ]),
            Animated.timing(anim.scale, {
              toValue: 1,
              duration: 2000 + Math.random() * 1000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(anim.translateY, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(anim.scale, {
              toValue: 0.5,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    });

    const timer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const bubblePositions = [
    { left: width * 0.1, bottom: 100 },
    { left: width * 0.3, bottom: 80 },
    { left: width * 0.5, bottom: 120 },
    { left: width * 0.7, bottom: 90 },
    { left: width * 0.85, bottom: 110 },
    { left: width * 0.2, bottom: 60 },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.backgroundPattern}>
        {bubbleAnimations.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.bubble,
              {
                left: bubblePositions[index].left,
                bottom: bubblePositions[index].bottom,
                transform: [
                  { translateY: anim.translateY },
                  { scale: anim.scale },
                ],
                opacity: anim.opacity,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: logoScale }],
              opacity: logoOpacity,
            },
          ]}
        >
          <View style={styles.logoCircle}>
            <Droplets size={56} color={colors.white} strokeWidth={2} />
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: textOpacity }}>
          <Text style={styles.title}>AtourWash</Text>
          <Text style={styles.subtitle}>Laundry Management System</Text>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <View style={styles.loadingBar}>
          <Animated.View style={[styles.loadingProgress]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  backgroundPattern: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  bubble: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  title: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: colors.white,
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    paddingBottom: 60,
    paddingHorizontal: 60,
  },
  loadingBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingProgress: {
    height: '100%',
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 2,
  },
});
