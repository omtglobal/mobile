import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { Text } from '~/components/ui/Text';
import type { VideoSeller } from '~/types/content';

type Props = {
  seller: VideoSeller;
  onPress?: () => void;
};

export function VideoSellerInfo({ seller, onPress }: Props) {
  const initial = seller.name.trim().charAt(0).toUpperCase() || '?';

  const inner = (
    <>
      {seller.avatarUrl ? (
        <Image
          source={{ uri: seller.avatarUrl }}
          style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)' }}
          contentFit="cover"
        />
      ) : (
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: 'rgba(255,255,255,0.25)',
            borderWidth: 2,
            borderColor: 'rgba(255,255,255,0.9)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text variant="headingSm" style={{ color: '#FFFFFF' }}>
            {initial}
          </Text>
        </View>
      )}
      <Text variant="headingSm" style={{ color: '#FFFFFF', flexShrink: 1 }} numberOfLines={2}>
        {seller.name}
      </Text>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 10, maxWidth: '72%' }}
        accessibilityRole="button"
        accessibilityLabel={`Seller ${seller.name}`}
      >
        {inner}
      </Pressable>
    );
  }

  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, maxWidth: '72%' }}>{inner}</View>;
}
