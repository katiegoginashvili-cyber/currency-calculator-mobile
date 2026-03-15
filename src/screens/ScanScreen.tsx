import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import { useTheme } from '../theme/ThemeContext';
import { currencies, getCurrencyByCode, getFlagBackground } from '../data/currencies';
import { getConvertedAmount, useCurrencyStore } from '../store/currencyStore';
import { analyzePriceFromPhotoWithAI } from '../services/aiPriceScan';
import type { RootStackParamList } from '../navigation/types';
import { PaywallModal } from '../components/PaywallModal';
import { purchaseAdaptyPlan, restoreAdaptyPurchases } from '../services/adapty';
import { trackRatingSuccessEvent } from '../services/ratingPrompt';

const isExpoGo = Constants.appOwnership === 'expo';
const FIAT_CURRENCIES = currencies.filter((item) => item.category === 'fiat');
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ScanScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { rates, isPro } = useCurrencyStore();
  const [permission, requestPermission] = useCameraPermissions();

  const cameraRef = useRef<any>(null);

  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('GEL');
  const [detectedAmount, setDetectedAmount] = useState<number | null>(null);
  const [detectedText, setDetectedText] = useState('');
  const [zoomLevel, setZoomLevel] = useState(0.16);
  const zoomStartRef = useRef(0.16);
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [aiHint, setAiHint] = useState('');

  const [showPicker, setShowPicker] = useState(false);
  const [pickingFor, setPickingFor] = useState<'from' | 'to'>('from');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPaywall, setShowPaywall] = useState(false);

  const fromCurrencyData = getCurrencyByCode(fromCurrency);
  const toCurrencyData = getCurrencyByCode(toCurrency);

  const inputAmount = detectedAmount ?? 1;
  const convertedAmount = useMemo(() => {
    return getConvertedAmount(inputAmount, fromCurrency, toCurrency, rates);
  }, [inputAmount, fromCurrency, toCurrency, rates]);

  const filteredCurrencies = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return FIAT_CURRENCIES;
    return FIAT_CURRENCIES.filter(
      (item) =>
        item.code.toLowerCase().includes(normalizedQuery) ||
        item.name.toLowerCase().includes(normalizedQuery),
    );
  }, [searchQuery]);


  const openPicker = (type: 'from' | 'to') => {
    setPickingFor(type);
    setShowPicker(true);
  };

  const handleSelectCurrency = (code: string) => {
    if (pickingFor === 'from') {
      if (code === toCurrency) {
        setToCurrency(fromCurrency);
      }
      setFromCurrency(code);
    } else {
      if (code === fromCurrency) {
        setFromCurrency(toCurrency);
      }
      setToCurrency(code);
    }
    setSearchQuery('');
    setShowPicker(false);
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const renderPermissionState = () => {
    if (!permission) {
      return (
        <View style={styles.cameraFallback}>
          <Text style={[styles.permissionText, { color: colors.textSecondary }]}>
            Checking camera permissions...
          </Text>
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View style={styles.cameraFallback}>
          <MaterialIcons name="photo-camera" size={38} color={colors.primary} />
          <Text style={[styles.permissionTitle, { color: colors.text }]}>Camera access needed</Text>
          <Text style={[styles.permissionText, { color: colors.textSecondary }]}>
            Enable camera permission to recognize prices and convert instantly.
          </Text>
          <TouchableOpacity
            style={[styles.permissionButton, { backgroundColor: colors.primary }]}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Allow camera access</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <PinchGestureHandler
        onBegan={() => {
          zoomStartRef.current = zoomLevel;
        }}
        onGestureEvent={(event: any) => {
          const scale = event?.nativeEvent?.scale ?? 1;
          const nextZoom = zoomStartRef.current + (scale - 1) * 0.3;
          setZoomLevel(Math.max(0, Math.min(0.8, Number(nextZoom.toFixed(2)))));
        }}
        onHandlerStateChange={(event: any) => {
          if (event?.nativeEvent?.oldState === State.ACTIVE) {
            zoomStartRef.current = zoomLevel;
          }
        }}
      >
        <View style={StyleSheet.absoluteFillObject}>
          <CameraView
            ref={cameraRef as any}
            style={StyleSheet.absoluteFillObject}
            facing="back"
            zoom={zoomLevel}
          />
        </View>
      </PinchGestureHandler>
    );
  };

  const handleAiScan = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7248/ingest/30933eef-a3b4-4469-b38d-b3c1692116d3',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0c8447'},body:JSON.stringify({sessionId:'0c8447',runId:'scan-pre-fix',hypothesisId:'H4',location:'src/screens/ScanScreen.tsx:158',message:'handleAiScan invoked',data:{isPro,cameraReady:Boolean(cameraRef.current),isAiScanning,appOwnership:Constants.appOwnership},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (!isPro) {
      setShowPaywall(true);
      return;
    }

    if (!cameraRef.current || isAiScanning) {
      return;
    }

    setIsAiScanning(true);
    setAiHint('');
    try {

      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.4,
        skipProcessing: false,
      });

      if (!photo?.base64) {
        throw new Error('AI scan photo missing base64');
      }
      // #region agent log
      fetch('http://127.0.0.1:7248/ingest/30933eef-a3b4-4469-b38d-b3c1692116d3',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0c8447'},body:JSON.stringify({sessionId:'0c8447',runId:'scan-pre-fix',hypothesisId:'H5',location:'src/screens/ScanScreen.tsx:182',message:'photo captured for AI scan',data:{hasBase64:Boolean(photo?.base64),base64Length:photo?.base64?.length ?? 0},timestamp:Date.now()})}).catch(()=>{});
      // #endregion


      const aiResult = await analyzePriceFromPhotoWithAI(photo.base64);


      if (aiResult.currencyCode && aiResult.currencyCode !== fromCurrency) {
        setFromCurrency(aiResult.currencyCode);
        if (aiResult.currencyCode === toCurrency) {
          setToCurrency(fromCurrency);
        }
      }
      if (aiResult.amount && aiResult.confidence >= 0.45) {
        setDetectedAmount(aiResult.amount);
      }
      if (aiResult.amount && aiResult.confidence >= 0.45) {
        setDetectedText(
          `${aiResult.currencyCode ?? fromCurrency} ${aiResult.amount.toFixed(2)} (AI ${Math.round(
            aiResult.confidence * 100,
          )}%)`,
        );
        void trackRatingSuccessEvent('scan_success');
      }
      setAiHint(
        aiResult.amount
          ? `AI: ${aiResult.reason || 'Price recognized'}`
          : 'AI could not detect the main price. Try moving closer and improving focus.',
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      // #region agent log
      fetch('http://127.0.0.1:7248/ingest/30933eef-a3b4-4469-b38d-b3c1692116d3',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0c8447'},body:JSON.stringify({sessionId:'0c8447',runId:'scan-pre-fix',hypothesisId:'H2',location:'src/screens/ScanScreen.tsx:210',message:'handleAiScan caught error',data:{errorMessage:message.slice(0,220)},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      setAiHint(`AI scan failed: ${message}`);
    } finally {
      setIsAiScanning(false);
    }
  };

  const handlePurchase = async (planId: string) => {
    const result = await purchaseAdaptyPlan(planId);
    if (result.success) {
      setShowPaywall(false);
      return;
    }
    if (!result.cancelled) {
      Alert.alert('Purchase failed', result.message);
    }
  };

  const handleRestore = async () => {
    const result = await restoreAdaptyPurchases();
    if (result.success) {
      setShowPaywall(false);
      Alert.alert('Restored', 'Your subscription has been restored.');
      return;
    }
    Alert.alert('Restore', result.message);
  };

  return (
    <View style={styles.container}>
      {renderPermissionState()}
      {permission?.granted && <View pointerEvents="none" style={styles.cameraOverlay} />}

      <View pointerEvents="none" style={styles.scanFrame}>
        <View style={[styles.scanCorner, styles.cornerTopLeft, { borderColor: colors.primary }]} />
        <View style={[styles.scanCorner, styles.cornerTopRight, { borderColor: colors.primary }]} />
        <View style={[styles.scanCorner, styles.cornerBottomLeft, { borderColor: colors.primary }]} />
        <View style={[styles.scanCorner, styles.cornerBottomRight, { borderColor: colors.primary }]} />
      </View>

      <View style={[styles.topCloseArea, { paddingTop: insets.top + 8 }]}>
        <BlurView intensity={34} tint="dark" style={styles.closeBlur}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="close" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </BlurView>
      </View>

      <View style={styles.bottomOverlay}>
        <BlurView intensity={28} tint="dark" style={styles.bottomBlur}>
          <Text style={styles.rateInlineText}>
            {inputAmount.toFixed(2)} {fromCurrency} = {convertedAmount.toFixed(2)} {toCurrency}
          </Text>

          <View style={styles.currencySelectorsWrapper}>
            <View style={styles.currencySelectorsRow}>
              <TouchableOpacity
                style={[styles.currencySelector, styles.currencySelectorLeft]}
                onPress={() => openPicker('from')}
              >
                <View style={[styles.flagCircle, { backgroundColor: getFlagBackground(fromCurrency) }]}>
                  <Text style={styles.flagEmoji}>{fromCurrencyData?.flag}</Text>
                </View>
                <Text style={styles.currencyCode}>{fromCurrency}</Text>
                <MaterialIcons name="keyboard-arrow-down" size={20} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.currencySelector, styles.currencySelectorRight]}
                onPress={() => openPicker('to')}
              >
                <View style={[styles.flagCircle, styles.flagCircleRight, { backgroundColor: getFlagBackground(toCurrency) }]}>
                  <Text style={styles.flagEmoji}>{toCurrencyData?.flag}</Text>
                </View>
                <Text style={styles.currencyCode}>{toCurrency}</Text>
                <MaterialIcons name="keyboard-arrow-down" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View pointerEvents="none" style={styles.currencyDivider} />

            <View style={styles.swapButtonContainer}>
              <BlurView intensity={32} tint="dark" style={styles.swapButtonBlur}>
                <TouchableOpacity style={styles.swapButton} onPress={handleSwap}>
                  <MaterialIcons name="swap-horiz" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </BlurView>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.aiScanButton, { opacity: isAiScanning ? 0.7 : 1 }]}
            onPress={handleAiScan}
            disabled={isAiScanning || !permission?.granted}
          >
            <MaterialIcons name="document-scanner" size={20} color="#FFFFFF" />
            <Text style={styles.aiScanButtonText}>{isAiScanning ? 'Analyzing...' : 'Scan and Convert'}</Text>
          </TouchableOpacity>
          <Text style={styles.zoomHint}>Pinch to zoom ({zoomLevel.toFixed(2)}x)</Text>
          <Text style={styles.helperText}>
            {detectedText
              ? `Detected: ${detectedText}`
              : isExpoGo
                ? 'AI scan works in development builds and Expo Go when key is provided.'
                : 'Tap "Scan and Convert" to analyze current frame.'}
          </Text>
          {!!aiHint && <Text style={styles.aiHintText}>{aiHint}</Text>}
        </BlurView>
      </View>

      <Modal
        visible={showPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.searchHeader, { backgroundColor: colors.surfaceSecondary }]}>
            <View style={[styles.searchBar, { backgroundColor: colors.inputBackground }]}>
              <MaterialIcons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search currency"
                placeholderTextColor={colors.textTertiary}
                autoFocus
              />
            </View>
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setShowPicker(false);
              }}
            >
              <Text style={[styles.cancelButton, { color: colors.primary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={filteredCurrencies}
            keyExtractor={(item) => item.code}
            contentContainerStyle={styles.pickerList}
            ItemSeparatorComponent={() => (
              <View style={{ height: 1, backgroundColor: colors.separator, marginLeft: 78 }} />
            )}
            renderItem={({ item }) => {
              const selectedCode = pickingFor === 'from' ? fromCurrency : toCurrency;
              const isSelected = selectedCode === item.code;
              return (
                <TouchableOpacity
                  style={[styles.pickerItem, { backgroundColor: colors.surface }]}
                  onPress={() => handleSelectCurrency(item.code)}
                >
                  <View style={[styles.flagCircleLarge, { backgroundColor: getFlagBackground(item.code) }]}>
                    <Text style={styles.flagEmojiLarge}>{item.flag}</Text>
                  </View>
                  <View style={styles.pickerTextWrap}>
                    <Text style={[styles.pickerName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.pickerCode, { color: colors.textSecondary }]}>{item.code}</Text>
                  </View>
                  {isSelected && <MaterialIcons name="check" size={22} color={colors.primary} />}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>

      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPurchase={handlePurchase}
        onRestore={handleRestore}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.10)',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  topCloseArea: {
    position: 'absolute',
    right: 14,
    top: 0,
  },
  closeBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  controlsRow: {
    display: 'none',
  },
  currencySelectorsWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  currencySelectorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  currencyDivider: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
    marginLeft: -0.5,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  iconButtonSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  zoomBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cameraFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 28,
  },
  permissionTitle: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: '700',
  },
  permissionText: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
  permissionButton: {
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  scanFrame: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 210,
    height: 210,
    marginLeft: -105,
    marginTop: -105,
  },
  scanCorner: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderWidth: 3,
    borderRadius: 10,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  bottomOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomBlur: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingTop: 30,
    paddingBottom: 36,
  },
  rateInlineText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  helperText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
    color: '#FFFFFF',
    opacity: 0.92,
  },
  aiHintText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    minHeight: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  aiScanButton: {
    height: 58,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(25,118,255,0.92)',
    marginBottom: 10,
  },
  aiScanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  currencySelectorRow: {
    display: 'none',
  },
  currencySelector: {
    flex: 1,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  currencySelectorLeft: {
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    paddingLeft: 24,
    paddingRight: 24,
  },
  currencySelectorRight: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    paddingLeft: 24,
    paddingRight: 24,
  },
  swapButtonContainer: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -18,
    marginTop: -18,
    zIndex: 2,
  },
  swapButtonBlur: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  swapButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  flagCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  flagCircleRight: {
    marginLeft: 8,
  },
  flagEmoji: {
    fontSize: 18,
  },
  currencyCode: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  zoomHint: {
    fontSize: 12,
    textAlign: 'center',
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 7,
  },
  modalContainer: {
    flex: 1,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  cancelButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  pickerList: {
    paddingHorizontal: 16,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  flagCircleLarge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagEmojiLarge: {
    fontSize: 24,
  },
  pickerTextWrap: {
    flex: 1,
  },
  pickerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  pickerCode: {
    fontSize: 14,
    marginTop: 2,
  },
});
