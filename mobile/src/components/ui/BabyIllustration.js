/**
 * Baby illustration drawn entirely with React Native Views — no external images needed.
 * Renders a cute sleeping baby with a blanket.
 */
import { StyleSheet, View } from 'react-native';

export default function BabyIllustration({ size = 160 }) {
  const s = size / 160; // scale factor

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      {/* Background circle */}
      <View style={[styles.bg, { width: size, height: size, borderRadius: size / 2 }]} />

      {/* Body / blanket */}
      <View style={[styles.blanket, {
        width: size * 0.72,
        height: size * 0.46,
        borderRadius: size * 0.14,
        bottom: size * 0.1,
        left: size * 0.14,
      }]} />

      {/* Blanket fold line */}
      <View style={[styles.blanketFold, {
        width: size * 0.72,
        height: size * 0.07,
        borderRadius: size * 0.035,
        bottom: size * 0.44,
        left: size * 0.14,
      }]} />

      {/* Head */}
      <View style={[styles.head, {
        width: size * 0.44,
        height: size * 0.44,
        borderRadius: size * 0.22,
        top: size * 0.08,
        left: size * 0.28,
      }]} />

      {/* Left ear */}
      <View style={[styles.ear, {
        width: size * 0.09,
        height: size * 0.14,
        borderRadius: size * 0.07,
        top: size * 0.2,
        left: size * 0.22,
      }]} />
      {/* Right ear */}
      <View style={[styles.ear, {
        width: size * 0.09,
        height: size * 0.14,
        borderRadius: size * 0.07,
        top: size * 0.2,
        left: size * 0.69,
      }]} />

      {/* Hair tufts */}
      <View style={[styles.hair, {
        width: size * 0.1,
        height: size * 0.1,
        borderRadius: size * 0.05,
        top: size * 0.07,
        left: size * 0.42,
      }]} />
      <View style={[styles.hair, {
        width: size * 0.08,
        height: size * 0.08,
        borderRadius: size * 0.04,
        top: size * 0.055,
        left: size * 0.52,
      }]} />
      <View style={[styles.hair, {
        width: size * 0.1,
        height: size * 0.1,
        borderRadius: size * 0.05,
        top: size * 0.07,
        left: size * 0.6,
      }]} />

      {/* Closed left eye (sleeping arc) */}
      <View style={[styles.eyeArcWrap, {
        width: size * 0.1,
        height: size * 0.05,
        top: size * 0.265,
        left: size * 0.355,
      }]}>
        <View style={[styles.eyeArc, { borderRadius: size * 0.05, borderBottomWidth: size * 0.025 }]} />
      </View>
      {/* Closed right eye */}
      <View style={[styles.eyeArcWrap, {
        width: size * 0.1,
        height: size * 0.05,
        top: size * 0.265,
        left: size * 0.535,
      }]}>
        <View style={[styles.eyeArc, { borderRadius: size * 0.05, borderBottomWidth: size * 0.025 }]} />
      </View>

      {/* Nose */}
      <View style={[styles.nose, {
        width: size * 0.07,
        height: size * 0.045,
        borderRadius: size * 0.035,
        top: size * 0.33,
        left: size * 0.465,
      }]} />

      {/* Smile */}
      <View style={[styles.smileWrap, {
        width: size * 0.14,
        height: size * 0.07,
        top: size * 0.375,
        left: size * 0.43,
      }]}>
        <View style={[styles.smile, { borderRadius: size * 0.07, borderBottomWidth: size * 0.03 }]} />
      </View>

      {/* Chubby cheeks */}
      <View style={[styles.cheek, {
        width: size * 0.1,
        height: size * 0.07,
        borderRadius: size * 0.05,
        top: size * 0.33,
        left: size * 0.3,
      }]} />
      <View style={[styles.cheek, {
        width: size * 0.1,
        height: size * 0.07,
        borderRadius: size * 0.05,
        top: size * 0.33,
        left: size * 0.6,
      }]} />

      {/* Little arm / hand peeking out */}
      <View style={[styles.arm, {
        width: size * 0.13,
        height: size * 0.09,
        borderRadius: size * 0.045,
        bottom: size * 0.42,
        left: size * 0.17,
      }]} />
      {/* Hand */}
      <View style={[styles.hand, {
        width: size * 0.08,
        height: size * 0.08,
        borderRadius: size * 0.04,
        bottom: size * 0.46,
        left: size * 0.14,
      }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'relative' },
  bg: {
    position: 'absolute',
    backgroundColor: '#FFF4D8',
  },
  blanket: {
    position: 'absolute',
    backgroundColor: '#A8D8F0',
  },
  blanketFold: {
    position: 'absolute',
    backgroundColor: '#7EC8E8',
  },
  head: {
    position: 'absolute',
    backgroundColor: '#FDDCB5',
  },
  ear: {
    position: 'absolute',
    backgroundColor: '#F5C99A',
  },
  hair: {
    position: 'absolute',
    backgroundColor: '#5C3D2E',
  },
  eyeArcWrap: {
    position: 'absolute',
    overflow: 'hidden',
  },
  eyeArc: {
    width: '100%',
    height: '200%',
    top: 0,
    borderColor: '#3D2B1F',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
    borderWidth: 0,
  },
  nose: {
    position: 'absolute',
    backgroundColor: '#F0A875',
  },
  smileWrap: {
    position: 'absolute',
    overflow: 'hidden',
  },
  smile: {
    width: '100%',
    height: '200%',
    top: 0,
    borderColor: '#E07040',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
    borderWidth: 0,
  },
  cheek: {
    position: 'absolute',
    backgroundColor: '#F4A3A3',
    opacity: 0.45,
  },
  arm: {
    position: 'absolute',
    backgroundColor: '#FDDCB5',
  },
  hand: {
    position: 'absolute',
    backgroundColor: '#F5C99A',
  },
});
