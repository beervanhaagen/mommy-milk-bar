import { useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions, Animated } from "react-native";

const { width, height } = Dimensions.get('window');

type BlobVariant = 'default' | 'variant1' | 'variant2' | 'variant3' | 'variant4';

interface AnimatedBackgroundProps {
  variant?: BlobVariant;
}

export function AnimatedBackground({ variant = 'default' }: AnimatedBackgroundProps = {}) {
  // Animation values for floating blobs
  const blob1Anim = useRef(new Animated.Value(0)).current;
  const blob2Anim = useRef(new Animated.Value(0)).current;
  const blob3Anim = useRef(new Animated.Value(0)).current;

  // Get blob configuration based on variant
  const getBlobConfig = () => {
    switch (variant) {
      case 'variant1':
        return {
          blob1: { top: -width * 0.35, right: -width * 0.15, scale: 0.9 },
          blob2: { top: height * 0.35, left: -width * 0.3, scale: 0.75 },
          blob3: { bottom: height * 0.05, right: -width * 0.2, scale: 0.7 },
        };
      case 'variant2':
        return {
          blob1: { top: -width * 0.25, right: -width * 0.25, scale: 1.0 },
          blob2: { top: height * 0.4, left: -width * 0.25, scale: 0.85 },
          blob3: { bottom: -width * 0.1, right: -width * 0.1, scale: 0.8 },
        };
      case 'variant3':
        return {
          blob1: { top: -width * 0.4, right: -width * 0.1, scale: 0.85 },
          blob2: { top: height * 0.3, left: -width * 0.35, scale: 0.7 },
          blob3: { bottom: height * 0.08, right: width * 0.05, scale: 0.65 },
        };
      case 'variant4':
        return {
          blob1: { top: -width * 0.3, right: -width * 0.3, scale: 1.1 },
          blob2: { top: height * 0.35, left: -width * 0.2, scale: 0.8 },
          blob3: { bottom: -width * 0.05, right: -width * 0.25, scale: 0.75 },
        };
      default:
        return {
          blob1: { top: -width * 0.3, right: -width * 0.2, scale: 1.0 },
          blob2: { top: height * 0.3, left: -width * 0.25, scale: 0.8 },
          blob3: { bottom: height * 0.02, right: -width * 0.15, scale: 0.75 },
        };
    }
  };

  const blobConfig = getBlobConfig();

  // Start floating animations
  useEffect(() => {
    const createFloatingAnimation = (animValue: Animated.Value, duration: number, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const anim1 = createFloatingAnimation(blob1Anim, 8000, 0);
    const anim2 = createFloatingAnimation(blob2Anim, 10000, 1000);
    const anim3 = createFloatingAnimation(blob3Anim, 12000, 2000);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, []);

  return (
    <View style={styles.backgroundContainer}>
      {/* Large subtle organic blob - top right */}
      <Animated.View
        style={[
          styles.organicBlob,
          styles.blob1,
          {
            top: blobConfig.blob1.top,
            right: blobConfig.blob1.right,
            transform: [
              { scale: blobConfig.blob1.scale },
              { scaleX: 1.3 },
              { scaleY: 0.7 },
              {
                translateY: blob1Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -20],
                }),
              },
              {
                translateX: blob1Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 15],
                }),
              },
            ],
          },
        ]}
      />

      {/* Medium subtle organic blob - left */}
      <Animated.View
        style={[
          styles.organicBlob,
          styles.blob2,
          {
            top: blobConfig.blob2.top,
            left: blobConfig.blob2.left,
            transform: [
              { scale: blobConfig.blob2.scale },
              { scaleX: 1.2 },
              { scaleY: 0.8 },
              {
                translateY: blob2Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 25],
                }),
              },
              {
                translateX: blob2Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -10],
                }),
              },
            ],
          },
        ]}
      />

      {/* Small accent blob - bottom */}
      <Animated.View
        style={[
          styles.organicBlob,
          styles.blob3,
          {
            bottom: blobConfig.blob3.bottom,
            right: blobConfig.blob3.right,
            transform: [
              { scale: blobConfig.blob3.scale },
              { scaleX: 1.4 },
              { scaleY: 0.6 },
              {
                translateY: blob3Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -15],
                }),
              },
              {
                translateX: blob3Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 20],
                }),
              },
            ],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  organicBlob: {
    position: 'absolute',
    opacity: 0.15,
  },
  blob1: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: '#F49B9B',
  },
  blob2: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: '#FFB4A8',
  },
  blob3: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: '#FDD0C7',
  },
});
