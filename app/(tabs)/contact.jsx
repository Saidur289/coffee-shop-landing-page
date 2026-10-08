import { View, Text, StyleSheet, TextInput, Pressable, useWindowDimensions } from 'react-native';
import React, { useState } from 'react';
import { Image } from 'expo-image';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Animated, { useAnimatedScrollHandler, useSharedValue, useAnimatedStyle, withSpring, withDelay, interpolate, Extrapolation } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const contactImage = require('../../assets/images/download.jpg');

// Colors
const colors = {
  bgBase: '#0c0a09', // stone-950
  textPrimary: '#f5f5f4', // stone-100
  textSecondary: '#a8a29e', // stone-400
  accent: '#b45309', // amber-700
  accentHover: '#d97706', // amber-600
  glassBg: 'rgba(255, 255, 255, 0.1)', // white/10
  glassBorder: 'rgba(255, 255, 255, 0.2)', // white/20
};

const FadeUpBounce = ({ children, scrollY, delay = 0, style, sectionY = 0 }) => {
  const itemY = useSharedValue(-1);
  const { height: windowHeight } = useWindowDimensions();

  const animatedStyle = useAnimatedStyle(() => {
    if (itemY.value === -1) return { opacity: 0, transform: [{ translateY: 50 }] };
    
    const absoluteY = sectionY + itemY.value;
    const isVisible = scrollY.value + windowHeight > absoluteY + 50;
    
    return {
      opacity: withDelay(delay, withSpring(isVisible ? 1 : 0, { stiffness: 100, damping: 10 })),
      transform: [{ translateY: withDelay(delay, withSpring(isVisible ? 0 : 50, { stiffness: 100, damping: 10 })) }],
    };
  });

  return (
    <Animated.View style={[style, animatedStyle]} onLayout={(e) => { itemY.value = e.nativeEvent.layout.y; }}>
      {children}
    </Animated.View>
  );
};

const ContactInfoItem = ({ icon, title, content }) => (
  <View style={styles.infoItem}>
    <View style={styles.iconCircle}>
      <IconSymbol name={icon} size={20} color={colors.accent} />
    </View>
    <View style={styles.infoTextContainer}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoContent}>{content}</Text>
    </View>
  </View>
);

const SendButton = () => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Pressable 
      style={[styles.submitBtn, { backgroundColor: isHovered ? colors.accentHover : colors.accent }]}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      onPressIn={() => setIsHovered(true)}
      onPressOut={() => setIsHovered(false)}
    >
      <Text style={styles.submitBtnText}>Send Message</Text>
    </Pressable>
  );
};

export default function ContactScreen() {
  const { width, height } = useWindowDimensions();
  const isWeb = width > 768;
  const scrollY = useSharedValue(0);
  
  const [mainY, setMainY] = useState(0);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  // Initial load animations
  const initialTextY = useSharedValue(50);
  const initialTextOpacity = useSharedValue(0);

  React.useEffect(() => {
    initialTextY.value = withDelay(300, withSpring(0, { stiffness: 100, damping: 10 }));
    initialTextOpacity.value = withDelay(300, withSpring(1, { stiffness: 100, damping: 10 }));
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => { scrollY.value = event.contentOffset.y; },
  });

  // Sticky Container Pinned to Viewport
  const stickyHeroStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(scrollY.value, [0, height], [0, height], Extrapolation.CLAMP)
        }
      ]
    };
  });

  // Background scales up
  const bgStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: interpolate(scrollY.value, [0, height], [1, 1.15], Extrapolation.CLAMP) }
      ]
    };
  });

  // Overlay gets darker
  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [0, height], [0.5, 0.9], Extrapolation.CLAMP)
    };
  });

  // Text moves up and fades out
  const heroContentStyle = useAnimatedStyle(() => {
    return {
      opacity: initialTextOpacity.value * interpolate(scrollY.value, [0, height * 0.5], [1, 0], Extrapolation.CLAMP),
      transform: [
        {
          translateY: initialTextY.value + interpolate(scrollY.value, [0, height], [0, -200], Extrapolation.CLAMP)
        }
      ]
    };
  });

  return (
    <Animated.ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
    >
      {/* 200vh Scroll-Jacking Wrapper */}
      <View style={[styles.heroSection, { height: height * 2 }]}>
        
        {/* Sticky Container */}
        <Animated.View style={[styles.stickyContainer, { height }, stickyHeroStyle]}>
          <Animated.View style={[StyleSheet.absoluteFillObject, bgStyle]}>
            <Image source={contactImage} style={styles.heroBg} contentFit="cover" />
          </Animated.View>
          
          <Animated.View style={[styles.heroOverlay, overlayStyle]}>
            <LinearGradient 
              colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.4)', colors.bgBase]}
              style={StyleSheet.absoluteFillObject} 
            />
          </Animated.View>
          
          <Animated.View style={[styles.heroContent, heroContentStyle]}>
            <Text style={styles.heroEyebrow}>— GET IN TOUCH</Text>
            <Text style={styles.heroTitle}>We'd Love to Hear{'\n'}From You</Text>
          </Animated.View>
        </Animated.View>
      </View>

      <View style={[styles.mainSection, isWeb && styles.mainSectionWeb]} onLayout={(e) => setMainY(e.nativeEvent.layout.y)}>
        
        <FadeUpBounce scrollY={scrollY} delay={100} style={styles.infoSection} sectionY={mainY}>
          <Text style={styles.sectionTitle}>Contact Info</Text>
          <Text style={styles.sectionDesc}>
            Whether you have a question about our menu, reservations, or anything else, our team is ready to answer all your questions.
          </Text>
          
          <View style={styles.infoList}>
            <ContactInfoItem icon="mappin.and.ellipse" title="Our Location" content="123 Coffee Bean Street, Seattle, WA 98101" />
            <ContactInfoItem icon="envelope.fill" title="Email Us" content="hello@beanandbloom.com" />
            <ContactInfoItem icon="phone.fill" title="Call Us" content="+1 (555) 123-4567" />
          </View>

          <View style={styles.hoursCard}>
            <Text style={styles.hoursTitle}>Opening Hours</Text>
            <View style={styles.hoursRow}><Text style={styles.hoursDay}>Mon - Fri</Text><Text style={styles.hoursTime}>7:00 AM - 8:00 PM</Text></View>
            <View style={styles.hoursRow}><Text style={styles.hoursDay}>Saturday</Text><Text style={styles.hoursTime}>8:00 AM - 9:00 PM</Text></View>
            <View style={styles.hoursRow}><Text style={styles.hoursDay}>Sunday</Text><Text style={styles.hoursTime}>8:00 AM - 6:00 PM</Text></View>
          </View>
        </FadeUpBounce>

        <FadeUpBounce scrollY={scrollY} delay={250} style={styles.formSection} sectionY={mainY}>
          <Text style={styles.sectionTitle}>Send a Message</Text>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Your Name</Text>
              <TextInput style={styles.input} placeholder="John Doe" placeholderTextColor={colors.textSecondary} value={form.name} onChangeText={(text) => setForm({...form, name: text})} />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput style={styles.input} placeholder="john@example.com" placeholderTextColor={colors.textSecondary} keyboardType="email-address" value={form.email} onChangeText={(text) => setForm({...form, email: text})} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Message</Text>
              <TextInput style={[styles.input, styles.textArea]} placeholder="How can we help you?" placeholderTextColor={colors.textSecondary} multiline numberOfLines={5} textAlignVertical="top" value={form.message} onChangeText={(text) => setForm({...form, message: text})} />
            </View>

            <SendButton />
          </View>
        </FadeUpBounce>
      </View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { paddingBottom: 40 },
  heroSection: { position: 'relative', overflow: 'hidden' },
  stickyContainer: { position: 'absolute', top: 0, left: 0, right: 0, width: '100%', justifyContent: 'center', alignItems: 'center' },
  heroBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject },
  heroContent: { alignItems: 'center', paddingHorizontal: 20, marginTop: 20 },
  heroEyebrow: { color: colors.textSecondary, fontSize: 12, fontWeight: '600', letterSpacing: 1.5, marginBottom: 8 },
  heroTitle: { color: colors.textPrimary, fontSize: 40, fontWeight: '700', textAlign: 'center', fontFamily: 'serif' },
  mainSection: { flexDirection: 'column', padding: 20, gap: 40, maxWidth: 1000, alignSelf: 'center', width: '100%' },
  mainSectionWeb: { flexDirection: 'row', padding: 40, gap: 60 },
  infoSection: { flex: 1, backgroundColor: colors.glassBg, padding: 30, borderRadius: 16, borderWidth: 1, borderColor: colors.glassBorder },
  formSection: { flex: 1.2, backgroundColor: colors.glassBg, padding: 30, borderRadius: 16, borderWidth: 1, borderColor: colors.glassBorder },
  sectionTitle: { fontSize: 28, fontWeight: '700', color: colors.textPrimary, fontFamily: 'serif', marginBottom: 16 },
  sectionDesc: { fontSize: 15, color: colors.textSecondary, lineHeight: 24, marginBottom: 32 },
  infoList: { gap: 24, marginBottom: 40 },
  infoItem: { flexDirection: 'row', alignItems: 'flex-start' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.glassBg, justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 1, borderColor: colors.glassBorder },
  infoTextContainer: { flex: 1 },
  infoTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  infoContent: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  hoursCard: { backgroundColor: 'rgba(0,0,0,0.2)', padding: 24, borderRadius: 12, borderWidth: 1, borderColor: colors.glassBorder },
  hoursTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, fontFamily: 'serif', marginBottom: 16 },
  hoursRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.glassBorder },
  hoursDay: { color: colors.textSecondary, fontSize: 14 },
  hoursTime: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  input: { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: colors.glassBorder, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: colors.textPrimary },
  textArea: { minHeight: 120 },
  submitBtn: { borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
