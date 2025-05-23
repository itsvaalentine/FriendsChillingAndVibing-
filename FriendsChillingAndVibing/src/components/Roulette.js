import { useMemo, useRef, useState } from 'react';
import {
  Animated, Easing, StyleSheet, Text, TouchableOpacity, View, TextInput
} from 'react-native';
import Modal from 'react-native-modal';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';

// Paleta beige
const colorPalette = [
  '#f7e6c4', '#f5e1b7', '#e5caac', '#f3d7a3', '#ecd7ba',
  '#f5e7d0', '#f7eddc', '#f5e5b8', '#f2d8b3', '#e6ceb3',
];

const WHEEL_SIZE = 300;
const CENTER = WHEEL_SIZE / 2;
const RADIUS = CENTER - 5;

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  let angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}
function describeArc(x, y, radius, startAngle, endAngle) {
  let start = polarToCartesian(x, y, radius, endAngle);
  let end = polarToCartesian(x, y, radius, startAngle);
  let largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  let d = [
    'M', x, y,
    'L', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    'Z',
  ].join(' ');
  return d;
}

export default function Roulette({ closeModal }) {
  const [movies, setMovies] = useState([]);
  const [newMovie, setNewMovie] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);

  const segments = useMemo(
    () =>
      movies.map((mov, i) => ({
        label: mov,
        color: colorPalette[i % colorPalette.length],
      })),
    [movies]
  );

  const SEGMENT_ANGLE = 360 / Math.max(segments.length, 1);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pointerAngle = 180;

  const spinRoulette = () => {
    if (isSpinning || segments.length === 0) return;
    setIsSpinning(true);

    const winnerIndex = Math.floor(Math.random() * segments.length);
    const sectorStart = winnerIndex * SEGMENT_ANGLE;
    const sectorMiddle = sectorStart + SEGMENT_ANGLE / 2;
    const targetAngle = (360 + pointerAngle - sectorMiddle) % 360;

    const currentRotation = spinAnim.__getValue() % 360;
    const extraSpins = 4;
    const totalRotation =
      currentRotation + extraSpins * 360 + targetAngle - (currentRotation % 360);

    Animated.timing(spinAnim, {
      toValue: totalRotation,
      duration: 3500,
      useNativeDriver: false,
      easing: Easing.out(Easing.cubic),
    }).start(() => {
      spinAnim.setValue(targetAngle);
      setIsSpinning(false);
      setWinner(segments[winnerIndex].label);
    });
  };

  const animatedSpin = spinAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.modalContent}>
        <View style={styles.pointer} />
        <View style={{ width: '100%', alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ color: '#6b4c3b', fontSize: 16, fontWeight: 'bold' }}>
            Añade una película
          </Text>
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            <TextInput
              value={newMovie}
              onChangeText={setNewMovie}
              placeholder="Nombre"
              placeholderTextColor="#aaa"
              style={{
                backgroundColor: '#fffdfa',
                paddingHorizontal: 10,
                borderRadius: 6,
                borderColor: '#e5caac',
                borderWidth: 1,
                width: 180,
                marginRight: 8,
                color: '#6b4c3b',
              }}
            />
            <TouchableOpacity
              onPress={() => {
                if (newMovie.trim()) {
                  setMovies([...movies, newMovie.trim()]);
                  setNewMovie('');
                }
              }}
              style={{
                backgroundColor: '#f3d7a3',
                paddingHorizontal: 14,
                justifyContent: 'center',
                borderRadius: 6,
              }}
            >
              <Text style={{ color: '#6b4c3b', fontWeight: 'bold' }}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Animated.View style={{ transform: [{ rotate: animatedSpin }] }}>
          <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
            <G origin={`${CENTER}, ${CENTER}`}>
              {segments.map((segment, i) => {
                const startAngle = i * SEGMENT_ANGLE;
                const endAngle = startAngle + SEGMENT_ANGLE;
                const arc = describeArc(
                  CENTER,
                  CENTER,
                  RADIUS,
                  startAngle,
                  endAngle
                );
                const midAngle = startAngle + SEGMENT_ANGLE / 2;
                const labelPos = polarToCartesian(
                  CENTER,
                  CENTER,
                  RADIUS * 0.65,
                  midAngle
                );
                return (
                  <G key={i}>
                    <Path
                      d={arc}
                      fill={segment.color}
                      stroke="#6b4c3b"
                      strokeWidth={3}
                    />
                    <SvgText
                      x={labelPos.x}
                      y={labelPos.y + 6}
                      fill="#6b4c3b"
                      fontSize="14"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {segment.label}
                    </SvgText>
                  </G>
                );
              })}
            </G>
          </Svg>
        </Animated.View>

        <TouchableOpacity
          style={[styles.button, isSpinning && { backgroundColor: '#aaa' }]}
          onPress={spinRoulette}
          disabled={isSpinning || segments.length === 0}
        >
          <Text style={styles.buttonText}>
            {isSpinning ? 'Girando...' : 'Girar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={closeModal}
          disabled={isSpinning}
        >
          <Text style={styles.closeButtonText}>Cerrar</Text>
        </TouchableOpacity>
      </View>

      <Modal
        isVisible={winner !== null}
        onBackdropPress={() => setWinner(null)}
        backdropOpacity={0.7}
        animationIn="zoomIn"
        animationOut="zoomOut"
        style={styles.winnerModal}
      >
        <View style={styles.winnerBox}>
          <View style={styles.confettiRow}>
            <Text style={styles.confettiText}>🎉</Text>
            <Text style={styles.confettiText}>✨</Text>
            <Text style={styles.confettiText}>🎊</Text>
          </View>
          <Text style={styles.winnerTitle}>¡GANADOR!</Text>
          <Text style={styles.winnerText}>{winner}</Text>
          <View style={styles.confettiRow}>
            <Text style={styles.confettiText}>🎊</Text>
            <Text style={styles.confettiText}>🎉</Text>
            <Text style={styles.confettiText}>✨</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: '#fffdfa',
  },
  modalContent: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 24,
  },
  pointer: {
    position: 'absolute',
    left: '50%',
    marginLeft: -15,
    top: '75%',
    zIndex: 2,
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 30,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#6b4c3b',
  },
  button: {
    backgroundColor: '#e5caac',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 30,
  },
  buttonText: {
    color: '#6b4c3b',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 18,
    backgroundColor: '#ce4257',
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  winnerModal: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
  },
  winnerBox: {
    backgroundColor: '#fffdfa',
    borderRadius: 24,
    padding: 36,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#e5caac',
    shadowColor: '#e5caac',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    minWidth: 220,
  },
  winnerTitle: {
    fontSize: 24,
    color: '#ce4257',
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 2,
    textShadowColor: '#f3d7a3',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  winnerText: {
    fontSize: 22,
    color: '#6b4c3b',
    marginBottom: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  confettiRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 4,
    marginTop: 4,
  },
  confettiText: {
    fontSize: 26,
    marginHorizontal: 4,
  },
});
