import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  ClipPath,
  Defs,
  Ellipse,
  G,
  LinearGradient as SvgGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

type Props = {
  progress: number;
  palette: readonly [string, string, ...string[]];
  completed?: boolean;
  size?: number;
};

const BOTTLE_PATH =
  'M82 42 L138 42 L138 86 C138 100 151 108 163 119 C184 138 194 166 194 198 L194 352 C194 381 175 400 147 404 L73 404 C45 400 26 381 26 352 L26 198 C26 166 36 138 57 119 C69 108 82 100 82 86 Z';

export function WaterBottle({ progress, palette, completed, size = 286 }: Props) {
  const fill = useSharedValue(Math.max(0, Math.min(progress, 1)));
  const float = useSharedValue(0);
  const glow = useSharedValue(0.25);

  useEffect(() => {
    fill.value = withTiming(Math.max(0, Math.min(progress, 1)), {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [fill, progress]);

  useEffect(() => {
    float.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(4, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [float]);

  useEffect(() => {
    glow.value = completed
      ? withRepeat(withSequence(withTiming(0.7, { duration: 700 }), withTiming(0.3, { duration: 900 })), -1)
      : withTiming(0.25);
  }, [completed, glow]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: float.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: 0.94 + glow.value * 0.12 }],
  }));

  const waterProps = useAnimatedProps(() => {
    const waterHeight = 318 * fill.value;
    return {
      y: 404 - waterHeight,
      height: waterHeight + 8,
    };
  });

  const surfaceProps = useAnimatedProps(() => ({
    cy: 404 - 318 * fill.value,
  }));

  return (
    <View style={[styles.frame, { width: size, height: size * 1.55 }]}>
      <Animated.View style={[styles.glow, glowStyle, { backgroundColor: palette[0] }]} />
      <Animated.View style={[styles.bottle, containerStyle]}>
        <Svg viewBox="0 0 220 430" width={size} height={size * 1.55}>
          <Defs>
            <ClipPath id="bottleClip">
              <Path d={BOTTLE_PATH} />
            </ClipPath>
            <SvgGradient id="glass" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.78" />
              <Stop offset="0.52" stopColor={palette[2] ?? palette[0]} stopOpacity="0.23" />
              <Stop offset="1" stopColor={palette[1]} stopOpacity="0.14" />
            </SvgGradient>
            <SvgGradient id="water" x1="0" y1="0" x2="0.8" y2="1">
              <Stop offset="0" stopColor={palette[0]} stopOpacity="0.9" />
              <Stop offset="1" stopColor={palette[1]} stopOpacity="0.96" />
            </SvgGradient>
            <SvgGradient id="cap" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={palette[0]} />
              <Stop offset="1" stopColor={palette[1]} />
            </SvgGradient>
          </Defs>

          <Ellipse cx="110" cy="413" rx="67" ry="10" fill={palette[1]} opacity="0.13" />

          <G clipPath="url(#bottleClip)">
            <Path d={BOTTLE_PATH} fill="url(#glass)" />
            <AnimatedRect
              animatedProps={waterProps}
              x="20"
              width="180"
              fill="url(#water)"
            />
            <AnimatedEllipse
              animatedProps={surfaceProps}
              cx="110"
              rx="83"
              ry="8"
              fill={palette[0]}
              opacity="0.88"
            />
            <Path
              d="M55 130 C38 190 40 300 58 359"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="10"
              strokeLinecap="round"
              opacity="0.42"
            />
            <Path
              d="M165 155 C178 216 176 298 164 338"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.25"
            />
          </G>

          <Path
            d={BOTTLE_PATH}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="4"
            opacity="0.92"
          />
          <Path
            d={BOTTLE_PATH}
            fill="none"
            stroke={palette[1]}
            strokeWidth="1.5"
            opacity="0.23"
          />

          <Rect x="78" y="18" width="64" height="32" rx="11" fill="url(#cap)" />
          <Rect x="83" y="23" width="54" height="5" rx="2.5" fill="#FFFFFF" opacity="0.42" />
          <Path
            d="M88 52 L132 52"
            stroke={palette[1]}
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.28"
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottle: {
    position: 'absolute',
    inset: 0,
  },
  glow: {
    position: 'absolute',
    width: '72%',
    height: '70%',
    top: '20%',
    borderRadius: 999,
    shadowColor: '#45C9DF',
    shadowOpacity: 0.42,
    shadowRadius: 48,
    shadowOffset: { width: 0, height: 0 },
  },
});
