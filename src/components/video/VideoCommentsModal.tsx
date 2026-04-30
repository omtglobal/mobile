import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { Text } from '~/components/ui/Text';
import { useToast } from '~/components/ui/Toast';
import { queryKeys } from '~/constants/queryKeys';
import { useAuth } from '~/lib/hooks/useAuth';
import { videoApi, type VideoCommentDto } from '~/lib/api/video';
import { patchVideoFeedItemInCache } from '~/lib/utils/videoFeedQuery';
import type { VideoFeedItem } from '~/types/content';

type Props = {
  videoId: string | null;
  onClose: () => void;
  onCommentCountChange?: (videoId: string, delta: number) => void;
};

export function VideoCommentsModal({ videoId, onClose, onCommentCountChange }: Props) {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState('');

  const open = videoId != null;

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: videoId ? queryKeys.video.comments(videoId) : ['video', 'comments', 'closed'],
    queryFn: () => videoApi.getComments(videoId!, { per_page: 50, page: 1 }),
    enabled: open,
  });

  const comments: VideoCommentDto[] = data?.data ?? [];

  const postMutation = useMutation({
    mutationFn: (body: string) => videoApi.postComment(videoId!, body),
    onSuccess: () => {
      setDraft('');
      if (videoId) {
        onCommentCountChange?.(videoId, 1);
        patchVideoFeedItemInCache(queryClient, videoId, (item: VideoFeedItem) => ({
          ...item,
          stats: { ...item.stats, comments: item.stats.comments + 1 },
        }));
      }
      refetch();
      toast.show('Comment posted', 'success');
    },
    onError: () => {
      toast.show('Could not post comment. Sign in and try again.', 'error');
    },
  });

  const handleSubmit = useCallback(() => {
    if (!isAuthenticated) {
      onClose();
      router.push('/(auth)/login');
      return;
    }
    const body = draft.trim();
    if (!body || !videoId) return;
    postMutation.mutate(body);
  }, [draft, isAuthenticated, onClose, postMutation, router, videoId]);

  const renderItem = useCallback(
    ({ item }: { item: VideoCommentDto }) => (
      <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' }}>
        <Text variant="caption" style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
          {item.user.name}
        </Text>
        <Text variant="bodyMd" style={{ color: '#FFFFFF' }}>
          {item.body}
        </Text>
      </View>
    ),
    []
  );

  const goToLogin = useCallback(() => {
    onClose();
    router.push('/(auth)/login');
  }, [onClose, router]);

  return (
    <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#111' }}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: insets.top + 8,
              paddingHorizontal: 16,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(255,255,255,0.1)',
            }}
          >
            <Text variant="headingSm" style={{ color: '#FFFFFF' }}>
              Comments
            </Text>
            <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
              <X size={24} color="#FFFFFF" />
            </Pressable>
          </View>

          {isLoading && comments.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator color="#fff" />
            </View>
          ) : (
            <FlatList
              style={{ flex: 1 }}
              data={comments}
              keyExtractor={(c) => c.id}
              renderItem={renderItem}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              refreshing={isFetching && !isLoading}
              onRefresh={() => refetch()}
              ListEmptyComponent={
                <Text variant="bodyMd" style={{ color: 'rgba(255,255,255,0.6)', marginTop: 24 }}>
                  No comments yet.
                </Text>
              }
            />
          )}

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              gap: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              paddingBottom: Math.max(insets.bottom, 10),
              borderTopWidth: 1,
              borderTopColor: 'rgba(255,255,255,0.1)',
            }}
          >
            {isAuthenticated ? (
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Add a comment..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                multiline
                maxLength={2000}
                showSoftInputOnFocus
                blurOnSubmit={false}
                style={{
                  flex: 1,
                  minHeight: 40,
                  maxHeight: 120,
                  color: '#FFFFFF',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                }}
              />
            ) : (
              <Pressable
                onPress={goToLogin}
                style={{
                  flex: 1,
                  minHeight: 40,
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                }}
                accessibilityRole="button"
                accessibilityLabel="Sign in to comment"
              >
                <Text variant="bodyMd" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Sign in to comment...
                </Text>
              </Pressable>
            )}
            <Pressable
              onPress={handleSubmit}
              disabled={postMutation.isPending || !draft.trim() || !isAuthenticated}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: draft.trim() && isAuthenticated ? '#FF3B5C' : 'rgba(255,255,255,0.2)',
              }}
            >
              {postMutation.isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text variant="button" style={{ color: '#FFFFFF' }}>
                  Send
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
