import { View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import React, { useState } from 'react';
import { Image } from 'expo-image';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Animated, { useAnimatedScrollHandler, useSharedValue, useAnimatedStyle, withSpring, withDelay, withRepeat, withTiming, interpolate, Extrapolation } from 'react-native-reanimated';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

const heroVideo = require('../../assets/images/gemini_generated_video_04e8c9d4.mp4'); 
const img1 = require('../../assets/images/download.jpg');
const img2 = require('../../assets/images/download (1).jpg');
const img3 = require('../../assets/images/download (2).jpg');

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

// Reusable scroll-animated container (Fade Up & Bounce)
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

// Pulsing CTA Button with Hover
const PulseButton = ({ title }) => {
  const scale = useSharedValue(1);
  const [isHovered, setIsHovered] = useState(false);

  React.useEffect(() => {
    scale.value = withRepeat(withTiming(1.05, { duration: 1000 }), -1, true);
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={style}>
      <Pressable 
        style={[styles.heroBtn, { backgroundColor: isHovered ? colors.accentHover : colors.accent }]}
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        onPressIn={() => setIsHovered(true)}
        onPressOut={() => setIsHovered(false)}
      >
        <Text style={styles.heroBtnText}>{title}</Text>
      </Pressable>
    </Animated.View>
  );
};

// 3-Column Glass Card
const SpecialCard = ({ img, title, desc, price, scrollY, index, isWeb, sectionY }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <FadeUpBounce scrollY={scrollY} delay={index * 150} sectionY={sectionY} style={[styles.specialCard, isWeb && styles.specialCardWeb]}>
      <Image source={img} style={styles.specialImg} contentFit="cover" />
      <View style={styles.specialContent}>
        <Text style={styles.specialTitle}>{title}</Text>
        <Text style={styles.specialDesc}>{desc}</Text>
        <View style={styles.specialFooter}>
          <Text style={styles.specialPrice}>{price}</Text>
          <Pressable 
            style={[styles.addBtn, { backgroundColor: isHovered ? colors.accentHover : colors.glassBg }]}
            onHoverIn={() => setIsHovered(true)}
            onHoverOut={() => setIsHovered(false)}
            onPressIn={() => setIsHovered(true)}
            onPressOut={() => setIsHovered(false)}
          >
            <Text style={[styles.addBtnText, { color: isHovered ? '#fff' : colors.textPrimary }]}>+</Text>
          </Pressable>
        </View>
      </View>
    </FadeUpBounce>
  );
};

export default function IndexScreen() {
  const { width, height } = useWindowDimensions();
  const isWeb = width > 768;
  const scrollY = useSharedValue(0);
  
  const [isHovered, setIsHovered] = useState(false); // For tilt effect
  const [menuY, setMenuY] = useState(0);
  const [visitY, setVisitY] = useState(0);

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

  // The wrapper is height * 2 (200vh). This style pins the inner content to the screen.
  const stickyHeroStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(scrollY.value, [0, height], [0, height], Extrapolation.CLAMP)
        }
      ]
    };
  });

  // Video scales up from 1 to 1.15
  const videoStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: interpolate(scrollY.value, [0, height], [1, 1.15], Extrapolation.CLAMP) }
      ]
    };
  });

  // Overlay gets darker as you scroll
  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [0, height], [0.5, 0.9], Extrapolation.CLAMP)
    };
  });

  // Text moves up (-200) and fades out at 50% of the scroll
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

  const tiltStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 1000 },
        { rotateX: withSpring(isHovered ? '5deg' : '0deg') },
        { rotateY: withSpring(isHovered ? '-5deg' : '0deg') },
        { scale: withSpring(isHovered ? 1.02 : 1) }
      ],
    };
  });

  return (
    <View style={styles.container}>
      
      {/* Sticky Frosted-Glass Navbar */}
      <View style={[styles.header, isWeb && styles.headerWeb]}>
        <View style={styles.logoContainer}>
          <IconSymbol name="cup.and.saucer.fill" size={24} color={colors.textPrimary} />
          <View style={{marginLeft: 8}}>
            <Text style={styles.logoTitle}>Bean & Bloom</Text>
          </View>
        </View>
        
        {isWeb && (
          <View style={styles.navLinks}>
            <Text style={[styles.navLink, styles.navLinkActive]}>Home</Text>
            <Text style={styles.navLink}>Menu</Text>
            <Text style={styles.navLink}>About</Text>
            <Text style={styles.navLink}>Contact</Text>
          </View>
        )}
        
        <View style={styles.headerIcons}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.textPrimary} />
          <IconSymbol name="person" size={20} color={colors.textPrimary} style={{marginLeft: 16}} />
        </View>
      </View>

      <Animated.ScrollView 
        contentContainerStyle={styles.content}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* 200vh Scroll-Jacking Wrapper */}
        <View style={[styles.heroSection, { height: height * 2 }]}>
          
          {/* Sticky Container (Pinned to viewport for the first 100vh of scroll) */}
          <Animated.View style={[styles.stickyContainer, { height }, stickyHeroStyle]}>
            
            <Animated.View style={[styles.videoContainer, videoStyle]}>
              <Video
                source={heroVideo}
                style={StyleSheet.absoluteFillObject}
                resizeMode={ResizeMode.COVER}
                shouldPlay
                isLooping
                isMuted
              />
            </Animated.View>
            
            {/* Dark gradient overlay that gets darker */}
            <Animated.View style={[styles.heroOverlay, overlayStyle]}>
              <LinearGradient 
                colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.4)', colors.bgBase]}
                style={StyleSheet.absoluteFillObject} 
              />
            </Animated.View>
            
            <Animated.View style={[styles.heroContent, heroContentStyle]}>
              <Text style={styles.heroTitle}>Awaken Your Senses</Text>
              <Text style={styles.heroDesc}>
                Experience the perfect blend of rich aromas, handcrafted pastries, and a breathtaking atmosphere.
              </Text>
              <PulseButton title="Discover Our Menu" />
            </Animated.View>

          </Animated.View>
        </View>

        {/* Featured Menu - 3 Column Grid */}
        <View style={styles.menuSection} onLayout={(e) => setMenuY(e.nativeEvent.layout.y)}>
          <Text style={styles.sectionTitle}>Featured Menu</Text>
          <View style={styles.menuGrid}>
            <SpecialCard sectionY={menuY} isWeb={isWeb} scrollY={scrollY} index={0} img={img1} title="Velvet Mocha" desc="Rich espresso balanced with dark cocoa." price="$5.50" />
            <SpecialCard sectionY={menuY} isWeb={isWeb} scrollY={scrollY} index={1} img={img2} title="Matcha Croissant" desc="Flaky layers with a sweet matcha glaze." price="$4.90" />
            <SpecialCard sectionY={menuY} isWeb={isWeb} scrollY={scrollY} index={2} img={img3} title="Artisan Pour-over" desc="Single-origin beans brewed to perfection." price="$6.00" />
            <SpecialCard sectionY={menuY} isWeb={isWeb} scrollY={scrollY} index={3} img={img1} title="Vanilla Cold Brew" desc="Slow-steeped over 18 hours." price="$4.50" />
            <SpecialCard sectionY={menuY} isWeb={isWeb} scrollY={scrollY} index={4} img={img2} title="Almond Danish" desc="Toasted almonds over sweet custard." price="$4.00" />
            <SpecialCard sectionY={menuY} isWeb={isWeb} scrollY={scrollY} index={5} img={img3} title="Spiced Chai" desc="Warm spices with steamed milk." price="$4.80" />
          </View>
        </View>

        {/* Visit Us - Hover Tilt Container */}
        <View style={styles.visitSection} onLayout={(e) => setVisitY(e.nativeEvent.layout.y)}>
          <FadeUpBounce scrollY={scrollY} delay={0} sectionY={visitY}>
            <Pressable 
              onHoverIn={() => setIsHovered(true)} 
              onHoverOut={() => setIsHovered(false)}
              onPressIn={() => setIsHovered(true)}
              onPressOut={() => setIsHovered(false)}
            >
              <Animated.View style={[styles.visitContainer, tiltStyle]}>
                <View style={styles.visitContent}>
                  <Text style={styles.visitTitle}>Visit Us</Text>
                  <Text style={styles.visitDesc}>123 Coffee Bean Street, Seattle, WA</Text>
                  <View style={styles.hoursRow}><Text style={styles.hoursText}>Mon - Fri:</Text><Text style={styles.hoursTime}>7AM - 8PM</Text></View>
                  <View style={styles.hoursRow}><Text style={styles.hoursText}>Weekends:</Text><Text style={styles.hoursTime}>8AM - 9PM</Text></View>
                </View>
              </Animated.View>
            </Pressable>
          </FadeUpBounce>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
           <Text style={styles.footerText}>© 2026 Bean & Bloom. All rights reserved.</Text>
        </View>

      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { paddingBottom: 0 },
  header: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: colors.glassBg,
    borderBottomWidth: 1, borderBottomColor: colors.glassBorder,
  },
  headerWeb: { paddingHorizontal: 60 },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logoTitle: { fontSize: 20, fontWeight: '800', color: colors.textPrimary, fontFamily: 'serif' },
  navLinks: { flexDirection: 'row', gap: 32 },
  navLink: { fontSize: 14, fontWeight: '500', color: colors.textPrimary, opacity: 0.8 },
  navLinkActive: { opacity: 1, borderBottomWidth: 2, borderBottomColor: colors.accent },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  heroSection: { position: 'relative', overflow: 'hidden' },
  stickyContainer: { position: 'absolute', top: 0, left: 0, right: 0, width: '100%', justifyContent: 'center', alignItems: 'center' },
  videoContainer: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  heroOverlay: { 
    ...StyleSheet.absoluteFillObject, 
  },
  heroContent: { alignItems: 'center', paddingHorizontal: 20, zIndex: 2 },
  heroTitle: { color: colors.textPrimary, fontSize: 60, fontWeight: '700', textAlign: 'center', fontFamily: 'serif', marginBottom: 16 },
  heroDesc: { color: colors.textSecondary, fontSize: 18, lineHeight: 28, marginBottom: 40, maxWidth: 600, textAlign: 'center' },
  heroBtn: { borderWidth: 1, borderColor: colors.glassBorder, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 50 },
  heroBtnText: { color: '#fff', fontWeight: '600', fontSize: 16, letterSpacing: 1 },
  menuSection: { paddingVertical: 80, paddingHorizontal: 20, maxWidth: 1200, alignSelf: 'center', width: '100%' },
  sectionTitle: { fontSize: 40, fontWeight: '700', color: colors.textPrimary, fontFamily: 'serif', textAlign: 'center', marginBottom: 60 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 24 },
  specialCard: { width: '100%', backgroundColor: colors.glassBg, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.glassBorder },
  specialCardWeb: { width: '31%', minWidth: 280 }, // 3 columns on web
  specialImg: { width: '100%', height: 220 },
  specialContent: { padding: 24 },
  specialTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  specialDesc: { fontSize: 14, color: colors.textSecondary, lineHeight: 22, marginBottom: 20 },
  specialFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  specialPrice: { fontSize: 18, fontWeight: '700', color: colors.accent },
  addBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.glassBorder },
  addBtnText: { fontSize: 20, fontWeight: '400', lineHeight: 24 },
  visitSection: { paddingVertical: 80, paddingHorizontal: 20, alignItems: 'center' },
  visitContainer: { backgroundColor: colors.glassBg, borderRadius: 24, padding: 40, borderWidth: 1, borderColor: colors.glassBorder, maxWidth: 600, width: '100%' },
  visitContent: { alignItems: 'center' },
  visitTitle: { fontSize: 32, fontWeight: '700', color: colors.textPrimary, fontFamily: 'serif', marginBottom: 16 },
  visitDesc: { fontSize: 16, color: colors.textSecondary, marginBottom: 32 },
  hoursRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.glassBorder },
  hoursText: { color: colors.textSecondary, fontSize: 16 },
  hoursTime: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
  footer: { padding: 40, alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.glassBorder, backgroundColor: 'rgba(0,0,0,0.4)' },
  footerText: { color: colors.textSecondary, fontSize: 14 },
});