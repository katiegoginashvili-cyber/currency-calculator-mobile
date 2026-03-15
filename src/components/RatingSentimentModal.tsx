import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

type RatingSentimentModalProps = {
  visible: boolean;
  onPositive: () => void;
  onNegative: () => void;
  onClose: () => void;
};

export const RatingSentimentModal: React.FC<RatingSentimentModalProps> = ({
  visible,
  onPositive,
  onNegative,
  onClose,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <BlurView intensity={26} tint="dark" style={styles.card}>
          <Text style={styles.title}>Enjoying Currency PRO?</Text>
          <Text style={styles.subtitle}>Your feedback matters.</Text>
          <Text style={styles.subtitle}>Please take a moment to rate us</Text>

          <TouchableOpacity style={styles.actionButton} onPress={onPositive}>
            <Text style={styles.positiveText}>🔥 Absolutely</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.bottomAction]} onPress={onNegative}>
            <Text style={styles.negativeText}>😔 Not really</Text>
          </TouchableOpacity>
        </BlurView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.36)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '86%',
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: 'rgba(30,30,36,0.78)',
    paddingTop: 24,
  },
  title: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 21,
  },
  actionButton: {
    height: 64,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },
  bottomAction: {
    marginTop: 0,
  },
  positiveText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  negativeText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '500',
  },
});
