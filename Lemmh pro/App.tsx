import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Screen = 'home' | 'setup' | 'activity' | 'settings';
type SetupStep = 'discover' | 'wifi' | 'connecting' | 'success';

type Device = {
  id: number;
  name: string;
  room: string;
  kind: string;
  online: boolean;
  on: boolean;
  detail: string;
};

const initialDevices: Device[] = [
  { id: 1, name: 'Living room lights', room: 'Living room', kind: 'LIGHT', online: true, on: true, detail: 'Warm white  ·  72%' },
  { id: 2, name: 'Bedroom lamp', room: 'Bedroom', kind: 'LIGHT', online: true, on: false, detail: 'Soft white  ·  40%' },
  { id: 3, name: 'Air purifier', room: 'Living room', kind: 'AIR', online: true, on: true, detail: 'Auto mode  ·  Good air' },
];

const networks = [
  { name: 'Home Wi-Fi', signal: 'Strong', secured: true },
  { name: 'Home Wi-Fi 5G', signal: 'Good', secured: true },
  { name: 'Guest network', signal: 'Fair', secured: true },
];

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [setupStep, setSetupStep] = useState<SetupStep>('discover');
  const [devices, setDevices] = useState(initialDevices);
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [addedDevice, setAddedDevice] = useState(false);

  useEffect(() => {
    if (setupStep !== 'connecting') return;
    const timer = setTimeout(() => {
      setPassword('');
      setSetupStep('success');
    }, 1600);
    return () => clearTimeout(timer);
  }, [setupStep]);

  const beginSetup = () => {
    setSetupStep('discover');
    setSelectedNetwork('');
    setPassword('');
    setScreen('setup');
  };

  const completeSetup = () => {
    setPassword('');
    if (!addedDevice) {
      setDevices((current) => [
        ...current,
        { id: 4, name: 'Smart plug', room: 'New device', kind: 'PLUG', online: true, on: true, detail: 'Connected just now' },
      ]);
      setAddedDevice(true);
    }
    setScreen('home');
  };

  const toggleDevice = (id: number, on: boolean) => {
    setDevices((current) => current.map((device) => device.id === id ? { ...device, on } : device));
  };

  const handleSetupBack = () => {
    setPassword('');
    if (setupStep === 'wifi') {
      setSetupStep('discover');
    } else {
      setScreen('home');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />
      {screen === 'home' && (
        <HomeScreen
          devices={devices}
          onAdd={beginSetup}
          onToggle={toggleDevice}
          onNavigate={setScreen}
        />
      )}
      {screen === 'setup' && (
        <SetupScreen
          step={setupStep}
          selectedNetwork={selectedNetwork}
          password={password}
          showPassword={showPassword}
          onBack={handleSetupBack}
          onFound={() => setSetupStep('wifi')}
          onSelectNetwork={setSelectedNetwork}
          onPasswordChange={setPassword}
          onTogglePassword={() => setShowPassword((value) => !value)}
          onConnect={() => setSetupStep('connecting')}
          onFinish={completeSetup}
        />
      )}
      {screen === 'activity' && <InfoScreen title="Activity" onBack={() => setScreen('home')} />}
      {screen === 'settings' && <InfoScreen title="Settings" onBack={() => setScreen('home')} />}
    </SafeAreaView>
  );
}

function HomeScreen({
  devices,
  onAdd,
  onToggle,
  onNavigate,
}: {
  devices: Device[];
  onAdd: () => void;
  onToggle: (id: number, on: boolean) => void;
  onNavigate: (screen: Screen) => void;
}) {
  const activeCount = devices.filter((device) => device.on).length;
  return (
    <>
      <ScrollView contentContainerStyle={styles.homeContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}</Text>
            <Text style={styles.greeting}>Your connected{'\n'}home.</Text>
          </View>
          <View style={styles.avatar}><Text style={styles.avatarText}>A</Text></View>
        </View>

        <View style={styles.demoNotice}>
          <View style={styles.demoDot} />
          <Text style={styles.demoText}>DEMO MODE</Text>
          <Text style={styles.demoSubtext}>Controls are simulated</Text>
        </View>

        <View style={styles.networkCard}>
          <View style={styles.networkIcon}><Text style={styles.networkIconText}>W</Text></View>
          <View style={styles.networkCopy}>
            <Text style={styles.cardLabel}>HOME NETWORK</Text>
            <Text style={styles.networkName}>Home Wi-Fi</Text>
            <Text style={styles.onlineText}>All systems online</Text>
          </View>
          <View style={styles.onlinePill}><View style={styles.statusDot} /><Text style={styles.onlinePillText}>ONLINE</Text></View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{devices.length.toString().padStart(2, '0')}</Text>
            <Text style={styles.summaryLabel}>CONNECTED DEVICES</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{activeCount.toString().padStart(2, '0')}</Text>
            <Text style={styles.summaryLabel}>CURRENTLY ON</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Your devices</Text>
            <Text style={styles.sectionCaption}>Manage your connected devices</Text>
          </View>
          <TouchableOpacity onPress={onAdd} style={styles.addButton} accessibilityRole="button" accessibilityLabel="Add a device">
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {devices.map((device) => (
          <DeviceCard key={device.id} device={device} onToggle={(value) => onToggle(device.id, value)} />
        ))}

        <TouchableOpacity style={styles.setupBanner} onPress={onAdd} accessibilityRole="button">
          <View style={styles.setupBannerIcon}><Text style={styles.setupBannerPlus}>+</Text></View>
          <View style={styles.setupBannerCopy}>
            <Text style={styles.setupBannerTitle}>Bring another device online</Text>
            <Text style={styles.setupBannerBody}>Set it up with your Wi-Fi network</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomNav active="home" onNavigate={onNavigate} />
    </>
  );
}

function DeviceCard({ device, onToggle }: { device: Device; onToggle: (on: boolean) => void }) {
  return (
    <View style={styles.deviceCard}>
      <View style={[styles.deviceIcon, device.on && styles.deviceIconOn]}>
        <Text style={[styles.deviceIconText, device.on && styles.deviceIconTextOn]}>
          {device.kind === 'LIGHT' ? 'L' : device.kind === 'AIR' ? 'A' : 'P'}
        </Text>
      </View>
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{device.name}</Text>
        <Text style={styles.deviceRoom}>{device.room}  ·  {device.online ? 'Online' : 'Offline'}</Text>
        <Text style={styles.deviceDetail}>{device.detail}</Text>
      </View>
      <Switch
        value={device.on}
        onValueChange={onToggle}
        trackColor={{ false: colors.switchTrack, true: colors.green }}
        thumbColor={colors.white}
        accessibilityLabel={`Turn ${device.name} ${device.on ? 'off' : 'on'}`}
      />
    </View>
  );
}

function SetupScreen({
  step,
  selectedNetwork,
  password,
  showPassword,
  onBack,
  onFound,
  onSelectNetwork,
  onPasswordChange,
  onTogglePassword,
  onConnect,
  onFinish,
}: {
  step: SetupStep;
  selectedNetwork: string;
  password: string;
  showPassword: boolean;
  onBack: () => void;
  onFound: () => void;
  onSelectNetwork: (network: string) => void;
  onPasswordChange: (password: string) => void;
  onTogglePassword: () => void;
  onConnect: () => void;
  onFinish: () => void;
}) {
  const stepIndex = step === 'discover' ? 1 : step === 'wifi' ? 2 : 3;
  return (
    <ScrollView contentContainerStyle={styles.setupContent} keyboardShouldPersistTaps="handled">
      <TouchableOpacity style={styles.backButton} onPress={onBack} accessibilityRole="button">
        <Text style={styles.backButtonText}>‹  Back</Text>
      </TouchableOpacity>
      <Text style={styles.eyebrow}>DEVICE SETUP  /  STEP {stepIndex} OF 3</Text>
      <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${(stepIndex / 3) * 100}%` }]} /></View>

      {step === 'discover' && (
        <View style={styles.setupPanel}>
          <View style={styles.largeIcon}><Text style={styles.largeIconText}>+</Text></View>
          <Text style={styles.setupTitle}>Let's get you{'\n'}connected.</Text>
          <Text style={styles.setupDescription}>Make sure your new device is powered on and nearby. We'll help you connect it to your home Wi-Fi.</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipLabel}>BEFORE YOU START</Text>
            <Text style={styles.tipText}>Some smart devices only support 2.4 GHz Wi-Fi. Check your device's requirements before setup.</Text>
          </View>
          <PrimaryButton label="Search for devices" onPress={onFound} />
          <Text style={styles.simulationNote}>Demo: a sample smart plug will be found.</Text>
        </View>
      )}

      {step === 'wifi' && (
        <View style={styles.setupPanel}>
          <Text style={styles.eyebrow}>DEVICE FOUND</Text>
          <Text style={styles.setupTitle}>Connect to{'\n'}your Wi-Fi.</Text>
          <Text style={styles.setupDescription}>Choose the network you want your Smart Plug to use.</Text>
          <Text style={styles.fieldLabel}>AVAILABLE NETWORKS</Text>
          <View style={styles.networkList}>
            {networks.map((network) => (
              <TouchableOpacity
                key={network.name}
                style={[styles.networkOption, selectedNetwork === network.name && styles.networkOptionSelected]}
                onPress={() => onSelectNetwork(network.name)}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedNetwork === network.name }}
              >
                <View style={styles.networkOptionIcon}><Text style={styles.networkOptionIconText}>W</Text></View>
                <View style={styles.networkOptionCopy}>
                  <Text style={styles.networkOptionName}>{network.name}</Text>
                  <Text style={styles.networkOptionSignal}>{network.signal} signal  ·  Password protected</Text>
                </View>
                <View style={[styles.radio, selectedNetwork === network.name && styles.radioSelected]}>
                  {selectedNetwork === network.name && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.fieldLabel}>WI-FI PASSWORD</Text>
          <View style={styles.passwordBox}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter network password"
              placeholderTextColor={colors.muted}
              value={password}
              onChangeText={onPasswordChange}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Wi-Fi password"
            />
            <TouchableOpacity onPress={onTogglePassword} accessibilityRole="button">
              <Text style={styles.showPassword}>{showPassword ? 'HIDE' : 'SHOW'}</Text>
            </TouchableOpacity>
          </View>
          <PrimaryButton
            label="Connect device"
            onPress={onConnect}
            disabled={!selectedNetwork || password.length === 0}
          />
          <Text style={styles.simulationNote}>Network discovery and connection are simulated in this prototype.</Text>
        </View>
      )}

      {step === 'connecting' && (
        <View style={[styles.setupPanel, styles.centeredPanel]}>
          <View style={styles.loadingIcon}><ActivityIndicator size="large" color={colors.green} /></View>
          <Text style={styles.setupTitle}>Making the{'\n'}connection.</Text>
          <Text style={styles.setupDescription}>Connecting your Smart Plug to {selectedNetwork} and bringing it online.</Text>
          <View style={styles.connectingSteps}>
            <Text style={styles.connectingStep}>✓  Sharing Wi-Fi details</Text>
            <Text style={styles.connectingStepActive}>●  Connecting to your network</Text>
            <Text style={styles.connectingStepPending}>○  Registering device</Text>
          </View>
          <Text style={styles.simulationNote}>This usually takes a few moments.</Text>
        </View>
      )}

      {step === 'success' && (
        <View style={[styles.setupPanel, styles.centeredPanel]}>
          <View style={styles.successIcon}><Text style={styles.successCheck}>✓</Text></View>
          <Text style={styles.setupTitle}>You're connected.</Text>
          <Text style={styles.setupDescription}>Your Smart Plug is online and ready to control from anywhere.</Text>
          <View style={styles.connectedSummary}>
            <View style={styles.connectedSummaryIcon}><Text style={styles.networkOptionIconText}>P</Text></View>
            <View>
              <Text style={styles.connectedDeviceName}>Smart plug</Text>
              <Text style={styles.connectedDeviceNetwork}>{selectedNetwork}  ·  Online</Text>
            </View>
            <View style={styles.statusDot} />
          </View>
          <PrimaryButton label="Go to my devices" onPress={onFinish} />
          <Text style={styles.simulationNote}>Demo device setup complete. No credentials were sent.</Text>
        </View>
      )}
    </ScrollView>
  );
}

function PrimaryButton({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <TouchableOpacity
      style={[styles.primaryButton, disabled && styles.primaryButtonDisabled]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
    >
      <Text style={[styles.primaryButtonText, disabled && styles.primaryButtonTextDisabled]}>{label}</Text>
      <Text style={[styles.primaryButtonArrow, disabled && styles.primaryButtonTextDisabled]}>→</Text>
    </TouchableOpacity>
  );
}

function BottomNav({ active, onNavigate }: { active: Screen; onNavigate: (screen: Screen) => void }) {
  const items: { id: Screen; label: string; symbol: string }[] = [
    { id: 'home', label: 'HOME', symbol: 'H' },
    { id: 'activity', label: 'ACTIVITY', symbol: 'A' },
    { id: 'settings', label: 'SETTINGS', symbol: 'S' },
  ];
  return (
    <View style={styles.bottomNav}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.navItem}
          onPress={() => onNavigate(item.id)}
          accessibilityRole="button"
          accessibilityState={{ selected: active === item.id }}
        >
          <Text style={[styles.navSymbol, active === item.id && styles.navSymbolActive]}>{item.symbol}</Text>
          <Text style={[styles.navLabel, active === item.id && styles.navLabelActive]}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function InfoScreen({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.infoScreen}>
      <Text style={styles.eyebrow}>LEMMH  /  DEMO MODE</Text>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoBody}>
        {title === 'Activity'
          ? 'Your device activity will appear here once connected to a live IoT service.'
          : 'Account, home, and connectivity preferences will be available when a cloud service is configured.'}
      </Text>
      <TouchableOpacity style={styles.textButton} onPress={onBack} accessibilityRole="button">
        <Text style={styles.textButtonLabel}>‹  Back to home</Text>
      </TouchableOpacity>
    </View>
  );
}

const colors = {
  canvas: '#F6F7F2',
  white: '#FFFFFF',
  ink: '#17221E',
  secondary: '#59665F',
  muted: '#98A19B',
  green: '#2E795A',
  greenDark: '#245E46',
  greenPale: '#E8F1EB',
  line: '#E7EAE5',
  switchTrack: '#D5DBD6',
  amber: '#C99447',
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.canvas },
  homeContent: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  eyebrow: { color: colors.green, fontSize: 10, fontWeight: '700', letterSpacing: 1.6 },
  greeting: { marginTop: 8, color: colors.ink, fontSize: 34, lineHeight: 38, fontWeight: '600', letterSpacing: -1.1 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.greenPale, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.greenDark, fontSize: 16, fontWeight: '700' },
  demoNotice: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  demoDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.amber, marginRight: 7 },
  demoText: { color: colors.amber, fontSize: 9, fontWeight: '800', letterSpacing: 1.2, marginRight: 8 },
  demoSubtext: { color: colors.muted, fontSize: 11 },
  networkCard: { backgroundColor: colors.greenDark, borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  networkIcon: { width: 44, height: 44, borderRadius: 13, backgroundColor: '#39765A', alignItems: 'center', justifyContent: 'center' },
  networkIconText: { color: colors.white, fontSize: 14, fontWeight: '700' },
  networkCopy: { flex: 1, marginLeft: 13 },
  cardLabel: { color: '#B5D0BF', fontSize: 9, fontWeight: '700', letterSpacing: 1.2 },
  networkName: { color: colors.white, fontSize: 17, fontWeight: '600', marginTop: 3 },
  onlineText: { color: '#C4D8CB', fontSize: 11, marginTop: 3 },
  onlinePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#386D53', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#85D4A4' },
  onlinePillText: { color: '#E4F2E8', fontSize: 8, fontWeight: '800', letterSpacing: 0.7, marginLeft: 5 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 26 },
  summaryCard: { flex: 1, backgroundColor: colors.white, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14 },
  summaryNumber: { color: colors.ink, fontSize: 24, fontWeight: '600', letterSpacing: -0.5 },
  summaryLabel: { color: colors.muted, fontSize: 8, fontWeight: '700', letterSpacing: 0.9, marginTop: 5 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { color: colors.ink, fontSize: 19, fontWeight: '600', letterSpacing: -0.4 },
  sectionCaption: { color: colors.muted, fontSize: 11, marginTop: 4 },
  addButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  addButtonText: { color: colors.white, fontSize: 25, lineHeight: 28, fontWeight: '300' },
  deviceCard: { backgroundColor: colors.white, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 9 },
  deviceIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: '#F1F3F0', alignItems: 'center', justifyContent: 'center' },
  deviceIconOn: { backgroundColor: colors.greenPale },
  deviceIconText: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  deviceIconTextOn: { color: colors.green, fontSize: 13, fontWeight: '700' },
  deviceInfo: { flex: 1, marginLeft: 12 },
  deviceName: { color: colors.ink, fontSize: 13, fontWeight: '600' },
  deviceRoom: { color: colors.secondary, fontSize: 10, marginTop: 3 },
  deviceDetail: { color: colors.muted, fontSize: 10, marginTop: 3 },
  setupBanner: { backgroundColor: '#EFF3EE', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  setupBannerIcon: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: '#A8B9AC', alignItems: 'center', justifyContent: 'center' },
  setupBannerPlus: { color: colors.green, fontSize: 21, fontWeight: '300' },
  setupBannerCopy: { flex: 1, marginLeft: 11 },
  setupBannerTitle: { color: colors.ink, fontSize: 11, fontWeight: '600' },
  setupBannerBody: { color: colors.secondary, fontSize: 10, marginTop: 3 },
  chevron: { color: colors.green, fontSize: 24, marginHorizontal: 2 },
  bottomNav: { height: 68, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.line, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  navItem: { alignItems: 'center', justifyContent: 'center', width: '33%', height: '100%' },
  navSymbol: { width: 24, height: 24, textAlign: 'center', textAlignVertical: 'center', color: colors.muted, fontSize: 12, fontWeight: '700' },
  navSymbolActive: { color: colors.green },
  navLabel: { color: colors.muted, fontSize: 8, fontWeight: '700', letterSpacing: 0.8, marginTop: 4 },
  navLabelActive: { color: colors.green },
  setupContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 36 },
  backButton: { alignSelf: 'flex-start', paddingVertical: 10, paddingRight: 14, marginBottom: 20 },
  backButtonText: { color: colors.secondary, fontSize: 13, fontWeight: '600' },
  progressTrack: { height: 3, backgroundColor: '#E2E7E1', borderRadius: 2, marginTop: 12, marginBottom: 32 },
  progressFill: { height: 3, backgroundColor: colors.green, borderRadius: 2 },
  setupPanel: { flex: 1 },
  largeIcon: { width: 58, height: 58, borderRadius: 18, backgroundColor: colors.greenPale, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  largeIconText: { color: colors.green, fontSize: 34, fontWeight: '300', marginTop: -3 },
  setupTitle: { color: colors.ink, fontSize: 32, lineHeight: 36, fontWeight: '600', letterSpacing: -0.9 },
  setupDescription: { color: colors.secondary, fontSize: 13, lineHeight: 20, marginTop: 12, marginBottom: 24, maxWidth: 330 },
  tipCard: { backgroundColor: colors.white, borderRadius: 13, padding: 16, marginBottom: 22 },
  tipLabel: { color: colors.green, fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  tipText: { color: colors.secondary, fontSize: 12, lineHeight: 18, marginTop: 7 },
  primaryButton: { minHeight: 52, borderRadius: 13, backgroundColor: colors.green, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, marginTop: 4 },
  primaryButtonDisabled: { backgroundColor: '#E4E9E4' },
  primaryButtonText: { color: colors.white, fontSize: 13, fontWeight: '700' },
  primaryButtonTextDisabled: { color: '#A0AAA2' },
  primaryButtonArrow: { color: colors.white, fontSize: 17, marginLeft: 10 },
  simulationNote: { color: colors.muted, fontSize: 10, textAlign: 'center', lineHeight: 15, marginTop: 14 },
  fieldLabel: { color: colors.secondary, fontSize: 9, fontWeight: '800', letterSpacing: 1.1, marginBottom: 9, marginTop: 5 },
  networkList: { backgroundColor: colors.white, borderRadius: 13, paddingHorizontal: 12, marginBottom: 18 },
  networkOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  networkOptionSelected: { opacity: 1 },
  networkOptionIcon: { width: 33, height: 33, borderRadius: 10, backgroundColor: colors.greenPale, alignItems: 'center', justifyContent: 'center' },
  networkOptionIconText: { color: colors.green, fontSize: 11, fontWeight: '700' },
  networkOptionCopy: { flex: 1, marginLeft: 10 },
  networkOptionName: { color: colors.ink, fontSize: 12, fontWeight: '600' },
  networkOptionSignal: { color: colors.muted, fontSize: 9, marginTop: 3 },
  radio: { width: 17, height: 17, borderRadius: 9, borderWidth: 1.5, borderColor: '#C8D0C9', alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: colors.green },
  radioInner: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.green },
  passwordBox: { minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  passwordInput: { flex: 1, color: colors.ink, fontSize: 12, paddingVertical: 11 },
  showPassword: { color: colors.green, fontSize: 9, fontWeight: '800', letterSpacing: 0.7, padding: 8 },
  centeredPanel: { justifyContent: 'center', paddingBottom: 80 },
  loadingIcon: { width: 62, height: 62, borderRadius: 20, backgroundColor: colors.greenPale, alignItems: 'center', justifyContent: 'center', marginBottom: 26 },
  connectingSteps: { backgroundColor: colors.white, borderRadius: 13, paddingHorizontal: 16, paddingVertical: 14, gap: 13, marginTop: 2 },
  connectingStep: { color: colors.green, fontSize: 11, fontWeight: '600' },
  connectingStepActive: { color: colors.ink, fontSize: 11, fontWeight: '600' },
  connectingStepPending: { color: colors.muted, fontSize: 11 },
  successIcon: { width: 62, height: 62, borderRadius: 21, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center', marginBottom: 26 },
  successCheck: { color: colors.white, fontSize: 30, fontWeight: '500' },
  connectedSummary: { backgroundColor: colors.white, borderRadius: 13, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  connectedSummaryIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.greenPale, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  connectedDeviceName: { color: colors.ink, fontSize: 12, fontWeight: '600' },
  connectedDeviceNetwork: { color: colors.secondary, fontSize: 10, marginTop: 4 },
  infoScreen: { flex: 1, paddingHorizontal: 24, paddingTop: 32 },
  infoTitle: { color: colors.ink, fontSize: 32, fontWeight: '600', marginTop: 12 },
  infoBody: { color: colors.secondary, fontSize: 14, lineHeight: 22, marginTop: 12, maxWidth: 320 },
  textButton: { alignSelf: 'flex-start', paddingVertical: 14, marginTop: 16 },
  textButtonLabel: { color: colors.green, fontSize: 13, fontWeight: '700' },
});
