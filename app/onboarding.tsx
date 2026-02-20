import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, ChevronRight } from '@/utils/icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  image: string;
  title: string;
  description: string;
  icon: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&h=600&fit=crop',
    title: 'Selamat Datang\ndi AtourWash',
    description: 'Aplikasi manajemen laundry modern untuk membantu operasional bisnis Anda lebih efisien',
    icon: '👋',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=600&h=600&fit=crop',
    title: 'Transaksi\nCepat & Mudah',
    description: 'Proses order laundry dengan cepat dan akurat. Catat semua detail cucian dalam hitungan detik',
    icon: '⚡',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&h=600&fit=crop',
    title: 'Tracking\nCucian Realtime',
    description: 'Pantau status setiap cucian dari masuk hingga siap diambil pelanggan secara realtime',
    icon: '📍',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const insets = useSafeAreaInsets();

  const handleNext = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      scrollViewRef.current?.scrollTo({ x: (currentIndex + 1) * width, animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinish();
    }
  }, [currentIndex]);

  const handleSkip = useCallback(() => {
    handleFinish();
  }, []);

  const handleFinish = async () => {
    await completeOnboarding();
    router.replace('/login');
  };

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const onMomentumScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  }, []);

  const bgColor = scrollX.interpolate({
    inputRange: slides.map((_, i) => i * width),
    outputRange: [colors.primary, '#1a8a65', '#147a58'],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        {currentIndex < slides.length - 1 ? (
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton} activeOpacity={0.7}>
            <Text style={styles.skipText}>Lewati</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.skipButton} />
        )}
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onMomentumScrollEnd={onMomentumScrollEnd}
        scrollEventThrottle={16}
        bounces={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {slides.map((item, index) => {
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

          const imageScale = scrollX.interpolate({
            inputRange,
            outputRange: [0.7, 1, 0.7],
            extrapolate: 'clamp',
          });

          const textTranslateY = scrollX.interpolate({
            inputRange,
            outputRange: [40, 0, 40],
            extrapolate: 'clamp',
          });

          const textOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0, 1, 0],
            extrapolate: 'clamp',
          });

          return (
            <View key={item.id} style={styles.slide}>
              <Animated.View style={[styles.imageContainer, { transform: [{ scale: imageScale }] }]}>
                <View style={styles.imageRing}>
                  <Image source={{ uri: item.image }} style={styles.slideImage} />
                </View>
                <View style={styles.iconBadge}>
                  <Text style={styles.iconText}>{item.icon}</Text>
                </View>
              </Animated.View>

              <Animated.View
                style={[
                  styles.textContainer,
                  { opacity: textOpacity, transform: [{ translateY: textTranslateY }] },
                ]}
              >
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </Animated.View>
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.paginationContainer}>
          {slides.map((_, index) => {
            const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 28, 8],
              extrapolate: 'clamp',
            });

            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[styles.dot, { width: dotWidth, opacity: dotOpacity }]}
              />
            );
          })}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.85}>
          {currentIndex === slides.length - 1 ? (
            <>
              <Text style={styles.nextButtonText}>Mulai Sekarang</Text>
              <ArrowRight size={20} color={colors.primary} />
            </>
          ) : (
            <>
              <Text style={styles.nextButtonText}>Lanjut</Text>
              <ChevronRight size={20} color={colors.primary} />
            </>
          )}
        </TouchableOpacity>

        <View style={styles.pageIndicator}>
          <Text style={styles.pageIndicatorText}>
            {currentIndex + 1} / {slides.length}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    alignItems: 'flex-end',
    zIndex: 10,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  skipText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  imageContainer: {
    marginBottom: 36,
    alignItems: 'center',
  },
  imageRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  iconBadge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  iconText: {
    fontSize: 24,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 36,
  },
  description: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  footer: {
    paddingHorizontal: 24,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginHorizontal: 4,
  },
  nextButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  pageIndicator: {
    alignItems: 'center',
    marginTop: 16,
  },
  pageIndicatorText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500' as const,
  },
});
