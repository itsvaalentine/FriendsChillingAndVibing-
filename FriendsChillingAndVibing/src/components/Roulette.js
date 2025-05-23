import { useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';

// <<<<<<<<<<<  CAMBIA ESTO PARA TUS PELÍCULAS  >>>>>>>>>>>>>
const MOVIES = [
  { label: 'Until Dawn' },
  { label: 'Destino final' },
  { label: 'Loco por ella' },
  { label: 'ThunderBolt' },
  { label: 'Karate Kid' },
];
// <<<<<<<<<<<  FIN DE CAMBIA ESTO PARA TUS PELÍCULAS  >>>>>>>>>>>>>

// Paleta beige, si quieres más, agrega aquí
const colorPalette = [
  '#f7e6c4', // beige claro
  '#f5e1b7',
  '#e5caac',
  '#f3d7a3',
  '#ecd7ba',
  '#f5e7d0',
  '#f7eddc',
  '#f5e5b8',
  '#f2d8b3',
  '#e6ceb3',
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

export default function Roulette() {
  // Toma las películas del array MOVIES y les asigna color si no tienen
  const segments = useMemo(
    () =>
      MOVIES.map((mov, i) => ({
        label: mov.label || mov,
        color: mov.color || colorPalette[i % colorPalette.length],
      })),
    []
  );
  const SEGMENT_ANGLE = 360 / segments.length;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const [isSpinning, setIsSpinning] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [winner, setWinner] = useState(null); // Para modal ganador

  // El puntero está centrado en el eje X abajo
  const pointerAngle = 180;

  const spinRoulette = () => {
    if (isSpinning) return;
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
      setWinner(segments[winnerIndex].label); // Solo el nombre
    });
  };

  const animatedSpin = spinAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

return (
    <View style={styles.container}>
        <TouchableOpacity
        style={styles.openButton}
        onPress={() => setModalVisible(true)}
        >
        <Text style={styles.openButtonText}>ABRIR RULETA</Text>
        </TouchableOpacity>

        <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        style={styles.modal}
        >
        <View style={styles.modalContent}>
          {/* PUNTERO CENTRADO EN EJE X */}
            <View style={styles.pointer} />
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
            disabled={isSpinning}
        >
            <Text style={styles.buttonText}>
                {isSpinning ? 'Girando...' : 'Girar'}
            </Text>
        </TouchableOpacity>
            <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
                disabled={isSpinning}
            >
            <Text style={styles.closeButtonText}>Cerrar</Text>
        </TouchableOpacity>
        </View>
        {/* MODAL GANADOR SOLO NOMBRE */}
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
            {/* <TouchableOpacity
                style={styles.buttonWinner}
                onPress={() => setWinner(null)}
            >
                <Text style={styles.buttonTextWinner}>OK</Text>
            </TouchableOpacity> */}
            </View>
        </Modal>
        </Modal>
    </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
    },
    openButton: {
        backgroundColor: '#e5caac',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        marginBottom: 20,
    },
    openButtonText: {
        color: '#6b4c3b',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modal: {
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
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
        top: '62%',
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
    buttonWinner: {
        backgroundColor: '#e5caac',
        paddingVertical: 10,
        paddingHorizontal: 36,
        borderRadius: 8,
        marginTop: 10,
    },
    buttonTextWinner: {
        color: '#6b4c3b',
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: 1,
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