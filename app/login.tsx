import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  X,
  ArrowRight,
  Shield,
  MessageCircle,
} from '@/utils/icons';
import { colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const router = useRouter();
  const { loginWithPhone, loginWithGoogle } = useAuth();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    setPhoneNumber(cleaned);
  };

  const handleSendOTP = () => {
    if (phoneNumber.length < 10) {
      Alert.alert('Error', 'Masukkan nomor telepon yang valid');
      return;
    }
    setShowOTP(true);
  };

  const handleVerifyOTP = async () => {
    if (otp.length < 4) {
      Alert.alert('Error', 'Masukkan kode OTP yang valid');
      return;
    }
    setIsLoading(true);
    try {
      await loginWithPhone(phoneNumber);
      router.replace('/' as any);
    } catch (error) {
      Alert.alert('Error', 'Gagal masuk. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle('user@gmail.com', 'Pengguna Google');
      router.replace('/' as any);
    } catch (error) {
      Alert.alert('Error', 'Gagal masuk dengan Google. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithPhone('08123456789');
      router.replace('/' as any);
    } catch (error) {
      Alert.alert('Error', 'Gagal masuk.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>

        <Animated.View style={[styles.body, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {!showOTP ? (
            <>
              <View style={styles.headerSection}>
                <Text style={styles.title}>Mari Mulai</Text>
                <Text style={styles.subtitle}>Silakan masukkan nomor telepon Anda</Text>
              </View>

              <View style={styles.phoneInputContainer}>
                <View style={styles.flagSection}>
                  <Text style={styles.flagEmoji}>🇮🇩</Text>
                  <Text style={styles.countryCodeText}>+62</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="8XXXXXXXXX"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={handlePhoneChange}
                  maxLength={13}
                />
              </View>

              <TouchableOpacity
                style={[styles.whatsappButton, !phoneNumber && styles.buttonDisabled]}
                onPress={handleSendOTP}
                disabled={!phoneNumber || isLoading}
                activeOpacity={0.8}
              >
                <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/240px-WhatsApp.svg.png' }} style={styles.socialIcon} />
                <Text style={[styles.whatsappButtonText, !phoneNumber && styles.buttonTextDisabled]}>
                  Lanjutkan dengan WhatsApp
                </Text>
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Atau</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleGoogleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Image source={{ uri: 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg' }} style={styles.socialIcon} />
                <Text style={styles.socialButtonText}>Lanjut dengan Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/240px-Facebook_Logo_%282019%29.png' }} style={styles.socialIcon} />
                <Text style={styles.socialButtonText}>Lanjut dengan Facebook</Text>
              </TouchableOpacity>

              <View style={styles.simulationSection}>
                <Text style={styles.simulationLabel}>Simulasi Login WhatsApp</Text>
                <TouchableOpacity style={styles.simButtonPrimary} onPress={handleQuickLogin} activeOpacity={0.8}>
                  <Text style={styles.simButtonPrimaryText}>User Baru (OTP → Profil → PIN)</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.simButtonOutline} onPress={handleQuickLogin} activeOpacity={0.8}>
                  <Text style={styles.simButtonOutlineText}>User Terdaftar (Masukkan PIN)</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.otpSection}>
                <View style={styles.otpIconContainer}>
                  <Shield size={32} color={colors.primary} />
                </View>
                <Text style={styles.otpTitle}>Verifikasi OTP</Text>
                <Text style={styles.otpDescription}>
                  Kode verifikasi telah dikirim ke{'\n'}
                  <Text style={styles.otpPhone}>+62 {phoneNumber}</Text>
                </Text>
                
                <View style={styles.otpInputContainer}>
                  <TextInput
                    style={styles.otpInput}
                    placeholder="Masukkan kode OTP"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="number-pad"
                    value={otp}
                    onChangeText={setOtp}
                    maxLength={6}
                    textAlign="center"
                  />
                </View>

                <TouchableOpacity onPress={() => setShowOTP(false)}>
                  <Text style={styles.changeNumberText}>Ganti nomor telepon</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.verifyButton, otp.length < 4 && styles.verifyButtonDisabled]}
                onPress={handleVerifyOTP}
                disabled={otp.length < 4 || isLoading}
                activeOpacity={0.8}
              >
                <Text style={styles.verifyButtonText}>
                  {isLoading ? 'Memverifikasi...' : 'Verifikasi & Masuk'}
                </Text>
                <ArrowRight size={20} color={colors.white} />
              </TouchableOpacity>
            </>
          )}
        </Animated.View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Dengan melanjutkan, Anda menyetujui{' '}
            <Text style={styles.footerLink}>Persyaratan Penggunaan</Text>
            {' '}& <Text style={styles.footerLink}>Kebijakan Privasi</Text> kami.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  body: {
    flex: 1,
  },
  headerSection: {
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  flagSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    gap: 6,
  },
  flagEmoji: {
    fontSize: 18,
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSecondary,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  whatsappButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
  },
  buttonTextDisabled: {
    color: colors.textTertiary,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 13,
    color: colors.textTertiary,
    marginHorizontal: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 10,
    marginBottom: 12,
  },
  socialIcon: {
    width: 22,
    height: 22,
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
  },
  simulationSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  simulationLabel: {
    fontSize: 13,
    color: colors.textTertiary,
    marginBottom: 12,
  },
  simButtonPrimary: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  simButtonPrimaryText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.white,
  },
  simButtonOutline: {
    width: '100%',
    backgroundColor: colors.white,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  simButtonOutlineText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  otpSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  otpIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  otpTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
  },
  otpDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: 24,
  },
  otpPhone: {
    fontWeight: '600' as const,
    color: colors.text,
  },
  otpInputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  otpInput: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 24,
    paddingVertical: 16,
    fontSize: 24,
    fontWeight: '600' as const,
    color: colors.text,
    letterSpacing: 8,
  },
  changeNumberText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600' as const,
  },
  verifyButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  verifyButtonDisabled: {
    backgroundColor: colors.textTertiary,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.white,
  },
  footer: {
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center' as const,
    lineHeight: 18,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: '500' as const,
  },
});
