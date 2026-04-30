import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Star } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Button, Input, Text } from '~/components/ui';
import { useToast } from '~/components/ui/Toast';
import { useCreateReview } from '~/lib/hooks/useReviews';
import { useAuth } from '~/lib/hooks/useAuth';
import { useTheme } from '~/lib/contexts/ThemeContext';

const MIN_CONTENT = 10;
const MAX_CONTENT = 1000;

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
}

function StarRatingInput({ value, onChange }: StarRatingInputProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= value;
        return (
          <Pressable
            key={n}
            onPress={() => onChange(n)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityState={{ selected: filled }}
            accessibilityLabel={`${n}`}
          >
            <Star
              size={30}
              color={filled ? colors.ratingStar : colors.textTertiary}
              fill={filled ? colors.ratingStar : 'transparent'}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

interface ProductReviewFormProps {
  productId: string;
}

export function ProductReviewForm({ productId }: ProductReviewFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();
  const toast = useToast();
  const { isAuthenticated, isHydrated } = useAuth();
  const createReview = useCreateReview(productId);

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState<{ rating?: string; content?: string }>({});

  const resetForm = () => {
    setRating(0);
    setTitle('');
    setContent('');
    setErrors({});
  };

  const validate = (): boolean => {
    const e: { rating?: string; content?: string } = {};
    if (rating < 1) e.rating = t('product.review_rating_required');
    const trimmed = content.trim();
    if (trimmed.length < MIN_CONTENT) {
      e.content = t('product.review_content_too_short', { min: MIN_CONTENT });
    } else if (trimmed.length > MAX_CONTENT) {
      e.content = t('product.review_content_too_long', { max: MAX_CONTENT });
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await createReview.mutateAsync({
        rating,
        title: title.trim() || undefined,
        content: content.trim(),
      });
      toast.show(t('product.review_submitted'), 'success');
      resetForm();
    } catch (err: unknown) {
      const res =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: { message?: string; details?: Record<string, string[]> } } } })
              .response
          : null;
      const details = res?.data?.error?.details;
      if (details?.content?.[0]) {
        setErrors((prev) => ({ ...prev, content: details.content![0] }));
      } else if (details?.rating?.[0]) {
        setErrors((prev) => ({ ...prev, rating: details.rating![0] }));
      } else {
        toast.show(res?.data?.error?.message ?? t('product.review_submit_failed'), 'error');
      }
    }
  };

  if (!isHydrated) {
    return (
      <View style={{ paddingVertical: spacing.lg, alignItems: 'center' }}>
        <ActivityIndicator color={colors.brandPrimary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View
        style={[
          styles.guestCard,
          {
            backgroundColor: colors.bgPrimary,
            borderColor: colors.borderDefault,
            borderRadius: radius.lg,
            padding: spacing.lg,
          },
        ]}
      >
        <Text variant="bodyMd" color="secondary" style={{ marginBottom: spacing.md }}>
          {t('product.review_login_hint')}
        </Text>
        <View style={styles.guestActions}>
          <Button variant="primary" onPress={() => router.push('/(auth)/login')}>
            {t('auth.login')}
          </Button>
          <Button variant="outline" onPress={() => router.push('/(auth)/register')}>
            {t('auth.register')}
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.formCard,
        {
          backgroundColor: colors.bgPrimary,
          borderColor: colors.borderDefault,
          borderRadius: radius.lg,
          padding: spacing.lg,
        },
      ]}
    >
      <Text variant="bodyMd" color="secondary" style={{ marginBottom: spacing.sm }}>
        {t('product.review_your_rating')}
      </Text>
      <StarRatingInput value={rating} onChange={setRating} />
      {errors.rating ? (
        <Text variant="bodySm" style={{ color: colors.error, marginTop: spacing.xs }}>
          {errors.rating}
        </Text>
      ) : null}

      <Input
        label={t('product.review_title_optional')}
        placeholder={t('product.review_title_placeholder')}
        value={title}
        onChangeText={setTitle}
        style={{ marginTop: spacing.md }}
      />
      <Input
        label={t('product.review_comment')}
        placeholder={t('product.review_comment_placeholder')}
        value={content}
        onChangeText={setContent}
        error={errors.content}
        multiline
        numberOfLines={5}
        style={{ height: 120, textAlignVertical: 'top', paddingTop: 12 }}
      />
      <Text variant="caption" color="tertiary" style={{ marginBottom: spacing.sm }}>
        {t('product.review_char_hint', { min: MIN_CONTENT, max: MAX_CONTENT })}
      </Text>
      <Button
        variant="primary"
        onPress={() => void handleSubmit()}
        disabled={createReview.isPending}
        loading={createReview.isPending}
      >
        {t('product.review_submit')}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  formCard: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  guestCard: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  guestActions: {
    gap: 10,
  },
});
