import { View } from 'react-native';
import { Text } from '@/components/StyledText';

interface UserAvatarProps {
  name?: string | null;
  size?: number;
}

/** Shared placeholder for user avatar (profile, reviews, messenger). */
export function UserAvatar({ name, size = 40 }: UserAvatarProps) {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#e5e5ea',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: size * 0.45, fontWeight: '600' }}>{initial}</Text>
    </View>
  );
}
