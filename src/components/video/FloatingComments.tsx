import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Text } from '~/components/ui/Text';
import { queryKeys } from '~/constants/queryKeys';
import { videoApi, type VideoCommentDto } from '~/lib/api/video';

const VISIBLE_COUNT = 2;
const ROTATE_INTERVAL = 4000;
const ANIM_DURATION = 600;
const ROW_HEIGHT = 30;

type Props = {
  videoId: string;
  isActive: boolean;
  onPress?: () => void;
};

export function FloatingComments({ videoId, isActive, onPress }: Props) {
  const { data } = useQuery({
    queryKey: queryKeys.video.comments(videoId),
    queryFn: () => videoApi.getComments(videoId, { per_page: 20, page: 1 }),
    enabled: isActive,
    staleTime: 60_000,
  });

  const comments = useMemo(() => {
    return data?.data ?? [];
  }, [data]);

  if (comments.length === 0) return null;

  return (
    <Pressable onPress={onPress} style={{ width: '100%' }}>
      <CommentCarousel comments={comments} isActive={isActive} />
    </Pressable>
  );
}

function CommentCarousel({ comments, isActive }: { comments: VideoCommentDto[]; isActive: boolean }) {
  const [offset, setOffset] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const visiblePair = useMemo(() => {
    const result: VideoCommentDto[] = [];
    for (let i = 0; i < VISIBLE_COUNT; i++) {
      result.push(comments[(offset + i) % comments.length]);
    }
    return result;
  }, [comments, offset]);

  useEffect(() => {
    if (!isActive || comments.length <= VISIBLE_COUNT) return;

    const timer = setInterval(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -ROW_HEIGHT,
          duration: ANIM_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: ANIM_DURATION,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setOffset((prev) => (prev + VISIBLE_COUNT) % comments.length);
        slideAnim.setValue(ROW_HEIGHT * 0.3);
        fadeAnim.setValue(0);
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: ANIM_DURATION * 0.6,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: ANIM_DURATION * 0.6,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, ROTATE_INTERVAL);

    return () => clearInterval(timer);
  }, [isActive, comments.length, fadeAnim, slideAnim]);

  useEffect(() => {
    fadeAnim.setValue(1);
    slideAnim.setValue(0);
  }, [offset, fadeAnim, slideAnim]);

  return (
    <View style={{ overflow: 'hidden', maxHeight: ROW_HEIGHT * VISIBLE_COUNT }}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {visiblePair.map((c) => (
          <View key={c.id} style={{ height: ROW_HEIGHT, justifyContent: 'center' }}>
            <Text
              variant="caption"
              style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, lineHeight: 16 }}
              numberOfLines={2}
            >
              <Text
                variant="caption"
                style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 12 }}
              >
                {c.user.name}
              </Text>
              {'  '}
              {c.body}
            </Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}
