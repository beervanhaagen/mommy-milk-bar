import { useEffect, useMemo, useRef } from "react";
import { View, StyleSheet, Dimensions, Animated, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get('window');

type BlobVariant = 'default' | 'variant1' | 'variant2' | 'variant3' | 'variant4' | 'home';

interface AnimatedBackgroundProps {
  variant?: BlobVariant;
}

export function AnimatedBackground({ variant = 'default' }: AnimatedBackgroundProps = {}) {
  // Animation values for floating shapes
  const softBlobAnim = useRef(new Animated.Value(0)).current;
  const gradientAnim = useRef(new Animated.Value(0)).current;
  const ellipseAnim = useRef(new Animated.Value(0)).current;

  type ShapeLayout = Record<'softBlobTop' | 'veil', ViewStyle>;

  const baseLayout: ShapeLayout = {
    softBlobTop: {
      width: width * 1.1,
      height: width * 1.1,
      top: -width * 0.35,
      left: -width * 0.45,
    },
    veil: {
      width: width * 1.05,
      height: height * 0.45,
      top: height * 0.47,
      left: -width * 0.12,
    },
  };

  const variantOverrides: Partial<Record<BlobVariant, Partial<ShapeLayout>>> = {
    variant1: {
      softBlobTop: { top: -width * 0.46, left: -width * 0.58 },
      veil: { top: height * 0.5, left: -width * 0.02 },
    },
    variant2: {
      softBlobTop: { top: -width * 0.28, left: -width * 0.25 },
      veil: { top: height * 0.42, left: -width * 0.18 },
    },
    variant3: {
      softBlobTop: { top: -width * 0.38, left: -width * 0.1 },
      veil: { top: height * 0.6, left: -width * 0.24 },
    },
    variant4: {
      softBlobTop: { top: -width * 0.32, left: -width * 0.62 },
      veil: { top: height * 0.5, left: -width * 0.1 },
    },
    home: {
      softBlobTop: {
        width: width * 0.85,
        height: width * 0.85,
        top: -width * 0.3,
        left: -width * 0.22,
      },
      veil: {
        width: width * 0.95,
        height: height * 0.32,
        top: height * 0.52,
        left: -width * 0.05,
      },
    },
  };

  const shapeLayout = useMemo(() => {
    const overrides = variantOverrides[variant] ?? {};
    return Object.keys(baseLayout).reduce((acc, key) => {
      acc[key as keyof ShapeLayout] = {
        ...baseLayout[key as keyof ShapeLayout],
        ...(overrides[key as keyof ShapeLayout] ?? {}),
      };
      return acc;
    }, {} as ShapeLayout);
  }, [variant]);

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

    const anim1 = createFloatingAnimation(softBlobAnim, 9000, 0);
    const anim2 = createFloatingAnimation(gradientAnim, 11000, 1200);
    const anim3 = createFloatingAnimation(ellipseAnim, 13000, 2000);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, []);

  const isHomeVariant = variant === 'home';
  const opacityScale = isHomeVariant ? 0.3 : 1;
  const motionScale = isHomeVariant ? 0.6 : 1;
  const blobScaleRange = isHomeVariant ? [0.985, 1.03] : [0.96, 1.05];

  return (
    <View style={styles.backgroundContainer} pointerEvents="none">
      <View style={styles.baseLayer} />

      {/* Soft blob */}
      <Animated.View
        style={[
          styles.softBlob,
          shapeLayout.softBlobTop,
          {
            transform: [
              { rotate: '-155deg' },
              {
                translateY: softBlobAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -18 * motionScale],
                }),
              },
              {
                translateX: softBlobAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 14 * motionScale],
                }),
              },
              {
                scale: softBlobAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [blobScaleRange[0], blobScaleRange[1]],
                }),
              },
            ],
          },
          { opacity: 0.55 * opacityScale },
        ]}
      />

      {/* Veil */}
      <Animated.View
        style={[
          styles.veilWrapper,
          shapeLayout.veil,
          {
            transform: [
              { rotate: '-165deg' },
              {
                translateY: gradientAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 22 * motionScale],
                }),
              },
              {
                translateX: gradientAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 12 * motionScale],
                }),
              },
            ],
          },
          { opacity: 0.45 * opacityScale },
        ]}
      >
        <LinearGradient
          colors={['#FDE9E3', 'rgba(253, 233, 227, 0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.veil}
        />
      </Animated.View>

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
    backgroundColor: '#FEF8F6',
  },
  baseLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FEF8F6',
  },
  softBlob: {
    position: 'absolute',
    borderRadius: width * 0.5,
    backgroundColor: '#FFE6E7',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.45,
    shadowRadius: 35,
  },
  veilWrapper: {
    position: 'absolute',
  },
  veil: {
    width: '100%',
    height: '100%',
    borderRadius: width * 0.4,
  },
});
