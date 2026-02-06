import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ScanMode = 'nfc' | 'qr';

export default function ScanScreen() {
  const [scanMode, setScanMode] = useState<ScanMode>('nfc');
  const [isScanning, setIsScanning] = useState(false);

  const handleStartScan = () => {
    setIsScanning(true);

    // TODO: Implement actual NFC/QR scanning
    setTimeout(() => {
      setIsScanning(false);
      Alert.alert('스캔 완료', '태그 ID: ABC123 (개발 중)');
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>스캔</Text>
      </View>

      {/* Mode Selector */}
      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeButton, scanMode === 'nfc' && styles.modeButtonActive]}
          onPress={() => setScanMode('nfc')}
        >
          <Text style={[styles.modeButtonText, scanMode === 'nfc' && styles.modeButtonTextActive]}>
            NFC
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, scanMode === 'qr' && styles.modeButtonActive]}
          onPress={() => setScanMode('qr')}
        >
          <Text style={[styles.modeButtonText, scanMode === 'qr' && styles.modeButtonTextActive]}>
            QR 코드
          </Text>
        </TouchableOpacity>
      </View>

      {/* Scan Area */}
      <View style={styles.scanArea}>
        {scanMode === 'nfc' ? (
          <View style={styles.nfcArea}>
            <View style={[styles.nfcIcon, isScanning && styles.nfcIconScanning]}>
              <Text style={styles.nfcIconText}>NFC</Text>
            </View>
            <Text style={styles.scanInstructions}>
              {isScanning ? 'NFC 태그를 스캔하세요...' : 'NFC 태그를 스캔하려면\n아래 버튼을 누르세요'}
            </Text>
          </View>
        ) : (
          <View style={styles.qrArea}>
            <View style={styles.qrFrame}>
              <Text style={styles.qrPlaceholder}>QR 카메라 뷰</Text>
            </View>
            <Text style={styles.scanInstructions}>QR 코드를 프레임 안에 맞춰주세요</Text>
          </View>
        )}
      </View>

      {/* Action Button */}
      {scanMode === 'nfc' && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.scanButton, isScanning && styles.scanButtonScanning]}
            onPress={handleStartScan}
            disabled={isScanning}
          >
            <Text style={styles.scanButtonText}>{isScanning ? '스캔 중...' : 'NFC 스캔 시작'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Recent Scans */}
      <View style={styles.recentSection}>
        <Text style={styles.recentTitle}>최근 스캔</Text>
        <View style={styles.recentList}>
          {[
            { id: '1', name: '체크포인트 A', time: '09:30', type: 'nfc' },
            { id: '2', name: '설비 #1234', time: '09:15', type: 'qr' },
          ].map((item) => (
            <View key={item.id} style={styles.recentItem}>
              <View style={styles.recentItemLeft}>
                <Text style={styles.recentItemIcon}>{item.type === 'nfc' ? '📱' : '📷'}</Text>
                <View>
                  <Text style={styles.recentItemName}>{item.name}</Text>
                  <Text style={styles.recentItemTime}>{item.time}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C2C2C',
  },
  modeSelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#0064FF',
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6E6E6E',
  },
  modeButtonTextActive: {
    color: '#FFFFFF',
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  nfcArea: {
    alignItems: 'center',
  },
  nfcIcon: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#E6F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  nfcIconScanning: {
    backgroundColor: '#0064FF',
  },
  nfcIconText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0064FF',
  },
  scanInstructions: {
    fontSize: 16,
    color: '#6E6E6E',
    textAlign: 'center',
    lineHeight: 24,
  },
  qrArea: {
    alignItems: 'center',
    width: '100%',
  },
  qrFrame: {
    width: 250,
    height: 250,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#0064FF',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  qrPlaceholder: {
    fontSize: 14,
    color: '#8E8E8E',
  },
  actionContainer: {
    padding: 16,
  },
  scanButton: {
    height: 56,
    backgroundColor: '#0064FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButtonScanning: {
    backgroundColor: '#8E8E8E',
  },
  scanButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  recentSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 12,
  },
  recentList: {
    gap: 8,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
  },
  recentItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recentItemIcon: {
    fontSize: 20,
  },
  recentItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C2C2C',
  },
  recentItemTime: {
    fontSize: 12,
    color: '#6E6E6E',
  },
});
