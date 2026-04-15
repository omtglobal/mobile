import { memo, useEffect, useRef } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { VideoActionBar } from './VideoActionBar';
import { ProductOverlay } from './ProductOverlay';
import { FloatingComments } from './FloatingComments';
import { Text } from '~/components/ui/Text';
import { videoApi } from '~/lib/api/video';
import type { VideoFeedItem as VideoFeedItemType } from '~/types/content';

type Props = {
  item: VideoFeedItemType;
  isActive: boolean;
  /** Create native player & buffer data even if not yet playing. */
  shouldPreload: boolean;
  height: number;
  onOpenComments?: (videoId: string) => void;
  onOpenShare?: (videoId: string) => void;
};

function VideoFeedItemInner({ item, isActive, shouldPreload, height, onOpenComments, onOpenShare }: Props) {
  const showProduct = !!item.product;
  const sellerBottom = showProduct ? 200 : 32;

  if (!shouldPreload) {
    return (
      <View style={[styles.container, { height, backgroundColor: '#000' }]}>
        <Overlays
          item={item}
          isActive={false}
          showProduct={showProduct}
          sellerBottom={sellerBottom}
          onOpenComments={onOpenComments}
          onOpenShare={onOpenShare}
        />
      </View>
    );
  }

  return (
    <ActivePlayer
      item={item}
      isActive={isActive}
      height={height}
      showProduct={showProduct}
      sellerBottom={sellerBottom}
      onOpenComments={onOpenComments}
      onOpenShare={onOpenShare}
    />
  );
}

export const VideoFeedItem = memo(VideoFeedItemInner);

type ActivePlayerProps = {
  item: VideoFeedItemType;
  isActive: boolean;
  height: number;
  showProduct: boolean;
  sellerBottom: number;
  onOpenComments?: (videoId: string) => void;
  onOpenShare?: (videoId: string) => void;
};

function ActivePlayer({
  item,
  isActive,
  height,
  showProduct,
  sellerBottom,
  onOpenComments,
  onOpenShare,
}: ActivePlayerProps) {
  const player = useVideoPlayer(item.video.url, (p) => {
    p.loop = true;
  });

  const viewLogged = useRef(false);

  useEffect(() => {
    if (!isActive || viewLogged.current) {
      return;
    }
    const timer = setTimeout(() => {
      viewLogged.current = true;
      videoApi.recordView(item.id).catch(() => {});
    }, 3000);
    return () => clearTimeout(timer);
  }, [isActive, item.id]);

  useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, player]);

  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  const togglePlayPause = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  return (
    <Pressable style={[styles.container, { height }]} onPress={togglePlayPause}>
      <VideoView
        style={StyleSheet.absoluteFill}
        player={player}
        contentFit="cover"
        nativeControls={false}
        {...(Platform.OS === 'android' ? { surfaceType: 'textureView' as const } : {})}
      />
      <Overlays
        item={item}
        isActive={isActive}
        showProduct={showProduct}
        sellerBottom={sellerBottom}
        onOpenComments={onOpenComments}
        onOpenShare={onOpenShare}
      />
    </Pressable>
  );
}

type OverlaysProps = {
  item: VideoFeedItemType;
  isActive: boolean;
  showProduct: boolean;
  sellerBottom: number;
  onOpenComments?: (videoId: string) => void;
  onOpenShare?: (videoId: string) => void;
};

function Overlays({ item, isActive, showProduct, sellerBottom, onOpenComments, onOpenShare }: OverlaysProps) {
  const router = useRouter();
  const commentsBottom = 32 + 48;
  const goToSeller = () => router.push(`/(main)/seller/${item.seller.id}`);

  return (
    <>
      <View style={[styles.rightRail, { bottom: showProduct ? 220 : 100 }]} pointerEvents="box-none">
        <VideoActionBar
          item={item}
          seller={item.seller}
          onOpenComments={() => onOpenComments?.(item.id)}
          onOpenShare={() => onOpenShare?.(item.id)}
          onSellerPress={goToSeller}
        />
      </View>

      {!showProduct ? (
        <View
          style={[styles.commentsOverlay, { bottom: commentsBottom }]}
          pointerEvents="box-none"
        >
          <FloatingComments
            videoId={item.id}
            isActive={isActive}
            onPress={() => onOpenComments?.(item.id)}
          />
        </View>
      ) : null}

      <View style={[styles.bottomLeft, { bottom: sellerBottom }]} pointerEvents="box-none">
        <Pressable
          onPress={goToSeller}
          style={{ maxWidth: '72%' }}
          accessibilityRole="button"
          accessibilityLabel={`Seller ${item.seller.name}`}
        >
          <Text variant="headingSm" style={{ color: '#FFFFFF' }} numberOfLines={2}>
            {item.seller.name}
          </Text>
        </Pressable>
      </View>

      {showProduct ? (
        <View style={styles.productWrap} pointerEvents="box-none">
          <ProductOverlay product={item.product!} />
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000',
  },
  rightRail: {
    position: 'absolute',
    right: 12,
    zIndex: 2,
  },
  bottomLeft: {
    position: 'absolute',
    left: 12,
    zIndex: 2,
  },
  commentsOverlay: {
    position: 'absolute',
    left: 12,
    right: 64,
    zIndex: 2,
  },
  productWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3,
  },
});
