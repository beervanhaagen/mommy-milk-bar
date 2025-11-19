import React, { useEffect, useMemo, useState } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const BreathingBlob = ({ width, height, reducedMotion = false }: { width: number; height: number; reducedMotion?: boolean }) => {
  const scale = useMemo(() => new Animated.Value(1), []);
  const translateY = useMemo(() => new Animated.Value(0), []);
  const opacity = useMemo(() => new Animated.Value(0.75), []);
  const morphProgress = useMemo(() => new Animated.Value(0), []);
  const [currentPath, setCurrentPath] = useState('');

  // Second blob - darker, counter-rotating
  const scale2 = useMemo(() => new Animated.Value(1), []);
  const translateX2 = useMemo(() => new Animated.Value(0), []);
  const opacity2 = useMemo(() => new Animated.Value(0.6), []);
  const morphProgress2 = useMemo(() => new Animated.Value(0), []);
  const [currentPath2, setCurrentPath2] = useState('');

  useEffect(() => {
    if (reducedMotion) return;

    // State-of-the-art breathing animation with seamless loops - longer duration
    const createBreathingCycle = () => {
      // Main breathing cycle - 7 seconds for longer, more meditative rhythm
      const breatheIn = Animated.timing(scale, { 
        toValue: 1.12, 
        duration: 10000, 
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), // Smoother bezier for organic feel
        useNativeDriver: true 
      });

      const breatheOut = Animated.timing(scale, { 
        toValue: 0.88, 
        duration: 20000, 
        easing: Easing.bezier(0.10, 0.25, 0.46, 0.85), 
        useNativeDriver: true 
      });

      // Gentle vertical movement - very subtle for balance
      const rise = Animated.timing(translateY, { 
        toValue: -6, 
        duration: 3500, 
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), 
        useNativeDriver: true 
      });

      const fall = Animated.timing(translateY, { 
        toValue: 6, 
        duration: 3500, 
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), 
        useNativeDriver: true 
      });

      // Gentle opacity variation - very subtle
      const fadeIn = Animated.timing(opacity, { 
        toValue: 0.8, 
        duration: 3500, 
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), 
        useNativeDriver: true 
      });

      const fadeOut = Animated.timing(opacity, { 
        toValue: 0.7, 
        duration: 3500, 
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), 
        useNativeDriver: true 
      });

      // Shape morphing animation - gentle, organic transformation
      const morphIn = Animated.timing(morphProgress, { 
        toValue: 1, 
        duration: 3500, 
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), 
        useNativeDriver: false // Can't use native driver for path morphing
      });

      const morphOut = Animated.timing(morphProgress, { 
        toValue: 0, 
        duration: 3500, 
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), 
        useNativeDriver: false 
      });

      // Second blob - counter-rotating (horizontal movement)
      const breatheIn2 = Animated.timing(scale2, { 
        toValue: 1.08, 
        duration: 3500, 
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), 
        useNativeDriver: true 
      });

      const breatheOut2 = Animated.timing(scale2, { 
        toValue: 0.92, 
        duration: 3500, 
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), 
        useNativeDriver: true 
      });

      // Horizontal movement - counter to vertical
      const moveLeft = Animated.timing(translateX2, { 
        toValue: -5, 
        duration: 3500, 
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), 
        useNativeDriver: true 
      });

      const moveRight = Animated.timing(translateX2, { 
        toValue: 5, 
        duration: 3500, 
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), 
        useNativeDriver: true 
      });

      // Second blob opacity
      const fadeIn2 = Animated.timing(opacity2, { 
        toValue: 0.7, 
        duration: 3500, 
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), 
        useNativeDriver: true 
      });

      const fadeOut2 = Animated.timing(opacity2, { 
        toValue: 0.5, 
        duration: 3500, 
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), 
        useNativeDriver: true 
      });

      // Second blob morphing - offset timing
      const morphIn2 = Animated.timing(morphProgress2, { 
        toValue: 1, 
        duration: 3500, 
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), 
        useNativeDriver: false 
      });

      const morphOut2 = Animated.timing(morphProgress2, { 
        toValue: 0, 
        duration: 3500, 
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), 
        useNativeDriver: false 
      });

      // Create seamless parallel animations for both blobs
      const breatheCycle = Animated.parallel([
        // First blob
        Animated.sequence([breatheIn, breatheOut]),
        Animated.sequence([rise, fall]),
        Animated.sequence([fadeIn, fadeOut]),
        Animated.sequence([morphIn, morphOut]),
        // Second blob - counter-rotating
        Animated.sequence([breatheOut2, breatheIn2]), // Inverted for counter-rotation
        Animated.sequence([moveRight, moveLeft]), // Horizontal vs vertical
        Animated.sequence([fadeOut2, fadeIn2]), // Inverted opacity
        Animated.sequence([morphOut2, morphIn2]) // Inverted morphing
      ]);

      return breatheCycle;
    };

    // Start with gentle fade-in
    const initialFade = Animated.timing(opacity, {
      toValue: 0.75,
      duration: 800,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true
    });

    // Create infinite seamless loop
    const breathingLoop = Animated.loop(
      createBreathingCycle(),
      { iterations: -1 }
    );

    // Update path based on morph progress
    const updatePath = () => {
      const progress = (morphProgress as any)._value || 0;
      setCurrentPath(getMorphedPath(progress));
    };

    // Listen to morph progress changes for both blobs
    const morphListener = morphProgress.addListener(({ value }) => {
      setCurrentPath(getMorphedPath(value));
    });

    const morphListener2 = morphProgress2.addListener(({ value }) => {
      setCurrentPath2(getMorphedPath2(value));
    });

    // Start with natural delay and gentle fade-in
    const startDelay = Math.random() * 1200 + 300; // 300-1500ms delay
    
    setTimeout(() => {
      initialFade.start(() => {
        breathingLoop.start();
      });
    }, startDelay);
    
    return () => { 
      initialFade.stop();
      breathingLoop.stop();
      morphProgress.removeListener(morphListener);
      morphProgress2.removeListener(morphListener2);
    };
  }, [reducedMotion]);

  // Dynamic blob shapes that morph organically - always round and balanced
  const getMorphedPath = (progress: number) => {
    // Create smooth, rounded shapes that maintain balance
    const centerX = width * 0.5;
    const centerY = height * 0.5;
    
    // Base shape (progress = 0) - soft, rounded blob - LARGER
    const baseRadius = Math.min(width, height) * 0.42; // Increased from 0.35
    const baseShape = {
      top: { x: centerX, y: centerY - baseRadius * 0.8 },
      right: { x: centerX + baseRadius * 0.9, y: centerY },
      bottom: { x: centerX, y: centerY + baseRadius * 0.9 },
      left: { x: centerX - baseRadius * 0.9, y: centerY }
    };

    // Morphed shape (progress = 1) - slightly different proportions, still round - LARGER
    const morphedRadius = Math.min(width, height) * 0.38; // Increased from 0.32
    const morphedShape = {
      top: { x: centerX, y: centerY - morphedRadius * 0.9 },
      right: { x: centerX + morphedRadius * 0.85, y: centerY },
      bottom: { x: centerX, y: centerY + morphedRadius * 0.85 },
      left: { x: centerX - morphedRadius * 0.85, y: centerY }
    };

    // Smooth interpolation with easing
    const smoothInterpolate = (base: number, morphed: number, t: number) => {
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // easeInOutQuad
      return base + (morphed - base) * eased;
    };

    const currentShape = {
      top: {
        x: smoothInterpolate(baseShape.top.x, morphedShape.top.x, progress),
        y: smoothInterpolate(baseShape.top.y, morphedShape.top.y, progress)
      },
      right: {
        x: smoothInterpolate(baseShape.right.x, morphedShape.right.x, progress),
        y: smoothInterpolate(baseShape.right.y, morphedShape.right.y, progress)
      },
      bottom: {
        x: smoothInterpolate(baseShape.bottom.x, morphedShape.bottom.x, progress),
        y: smoothInterpolate(baseShape.bottom.y, morphedShape.bottom.y, progress)
      },
      left: {
        x: smoothInterpolate(baseShape.left.x, morphedShape.left.x, progress),
        y: smoothInterpolate(baseShape.left.y, morphedShape.left.y, progress)
      }
    };

    // Create smooth, rounded path with proper control points
    const controlOffset = Math.min(width, height) * 0.15;
    
    return `M${currentShape.top.x} ${currentShape.top.y} 
      C${currentShape.top.x + controlOffset} ${currentShape.top.y} ${currentShape.right.x} ${currentShape.right.y - controlOffset} ${currentShape.right.x} ${currentShape.right.y}
      C${currentShape.right.x} ${currentShape.right.y + controlOffset} ${currentShape.bottom.x + controlOffset} ${currentShape.bottom.y} ${currentShape.bottom.x} ${currentShape.bottom.y}
      C${currentShape.bottom.x - controlOffset} ${currentShape.bottom.y} ${currentShape.left.x} ${currentShape.left.y + controlOffset} ${currentShape.left.x} ${currentShape.left.y}
      C${currentShape.left.x} ${currentShape.left.y - controlOffset} ${currentShape.top.x - controlOffset} ${currentShape.top.y} ${currentShape.top.x} ${currentShape.top.y}Z`;
  };

  // Second blob - darker, counter-rotating
  const getMorphedPath2 = (progress: number) => {
    // Create smooth, rounded shapes that maintain balance
    const centerX = width * 0.5;
    const centerY = height * 0.5;
    
    // Base shape (progress = 0) - soft, rounded blob - LARGER
    const baseRadius = Math.min(width, height) * 0.45; // Slightly larger than first blob
    const baseShape = {
      top: { x: centerX, y: centerY - baseRadius * 0.8 },
      right: { x: centerX + baseRadius * 0.9, y: centerY },
      bottom: { x: centerX, y: centerY + baseRadius * 0.9 },
      left: { x: centerX - baseRadius * 0.9, y: centerY }
    };

    // Morphed shape (progress = 1) - slightly different proportions, still round - LARGER
    const morphedRadius = Math.min(width, height) * 0.41; // Slightly larger than first blob
    const morphedShape = {
      top: { x: centerX, y: centerY - morphedRadius * 0.9 },
      right: { x: centerX + morphedRadius * 0.85, y: centerY },
      bottom: { x: centerX, y: centerY + morphedRadius * 0.85 },
      left: { x: centerX - morphedRadius * 0.85, y: centerY }
    };

    // Smooth interpolation with easing
    const smoothInterpolate = (base: number, morphed: number, t: number) => {
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // easeInOutQuad
      return base + (morphed - base) * eased;
    };

    const currentShape = {
      top: {
        x: smoothInterpolate(baseShape.top.x, morphedShape.top.x, progress),
        y: smoothInterpolate(baseShape.top.y, morphedShape.top.y, progress)
      },
      right: {
        x: smoothInterpolate(baseShape.right.x, morphedShape.right.x, progress),
        y: smoothInterpolate(baseShape.right.y, morphedShape.right.y, progress)
      },
      bottom: {
        x: smoothInterpolate(baseShape.bottom.x, morphedShape.bottom.x, progress),
        y: smoothInterpolate(baseShape.bottom.y, morphedShape.bottom.y, progress)
      },
      left: {
        x: smoothInterpolate(baseShape.left.x, morphedShape.left.x, progress),
        y: smoothInterpolate(baseShape.left.y, morphedShape.left.y, progress)
      }
    };

    // Create smooth, rounded path with proper control points
    const controlOffset = Math.min(width, height) * 0.15;
    
    return `M${currentShape.top.x} ${currentShape.top.y} 
      C${currentShape.top.x + controlOffset} ${currentShape.top.y} ${currentShape.right.x} ${currentShape.right.y - controlOffset} ${currentShape.right.x} ${currentShape.right.y}
      C${currentShape.right.x} ${currentShape.right.y + controlOffset} ${currentShape.bottom.x + controlOffset} ${currentShape.bottom.y} ${currentShape.bottom.x} ${currentShape.bottom.y}
      C${currentShape.bottom.x - controlOffset} ${currentShape.bottom.y} ${currentShape.left.x} ${currentShape.left.y + controlOffset} ${currentShape.left.x} ${currentShape.left.y}
      C${currentShape.left.x} ${currentShape.left.y - controlOffset} ${currentShape.top.x - controlOffset} ${currentShape.top.y} ${currentShape.top.x} ${currentShape.top.y}Z`;
  };

  // Initialize with base paths
  useEffect(() => {
    if (!currentPath) {
      setCurrentPath(getMorphedPath(0));
    }
    if (!currentPath2) {
      setCurrentPath2(getMorphedPath2(0));
    }
  }, [currentPath, currentPath2]);

  return (
    <View style={styles.blobContainer} pointerEvents="none">
      {/* Second blob - darker, behind */}
      <Animated.View 
        style={[
          styles.blobLayer,
          {
            width,
            height,
            transform: [{ scale: scale2 }, { translateX: translateX2 }],
            opacity: opacity2,
          }
        ]}
      >
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <Path 
            d={currentPath2 || getMorphedPath2(0)} 
            fill="#E8A5A0" // Darker pink
            fillOpacity={0.6}
          />
        </Svg>
      </Animated.View>

      {/* First blob - lighter, in front */}
      <Animated.View 
        style={[
          styles.blobLayer,
          {
            width,
            height,
            transform: [{ scale }, { translateY }],
            opacity,
          }
        ]}
      >
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <Path 
            d={currentPath || getMorphedPath(0)} 
            fill="#F8C2BE"
            fillOpacity={0.75}
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

export const MimiFloatField = ({ width, height, reducedMotion = false }: { width: number; height: number; reducedMotion?: boolean }) => {
  if (reducedMotion) return null;

  return (
    <View style={styles.layer} pointerEvents="none">
      <BreathingBlob width={width} height={height} reducedMotion={reducedMotion} />
    </View>
  );
};

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0, // achter Mimi
    alignItems: 'center',
    justifyContent: 'center',
  },
  blobContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  blobLayer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
});
