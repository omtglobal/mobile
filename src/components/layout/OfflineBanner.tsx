import { View, Text, StyleSheet } from 'react-native';
import { useNetworkStatus } from '~/lib/hooks/useNetworkStatus';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { WifiOff } from 'lucide-react-native';

export function OfflineBanner() {
  const { isConnected } = useNetworkStatus();
  const { colors } = useTheme();

  if (isConnected) return null;

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: colors.warning,
        },
      ]}
    >
      <WifiOff color="#000" size={18} />
      <Text style={styles.text}>No internet connection</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
});
