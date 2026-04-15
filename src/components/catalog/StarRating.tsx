import { View } from 'react-native';
import { Star } from 'lucide-react-native';
import { useTheme } from '~/lib/contexts/ThemeContext';

interface StarRatingProps {
  rating: number | null;
  size?: number;
  showValue?: boolean;
}

/** Read-only star rating display */
export function StarRating({ rating, size = 14, showValue = false }: StarRatingProps) {
  const { colors } = useTheme();
  const value = rating ?? 0;
  const filled = Math.round(Math.min(5, Math.max(0, value)));
  const empty = 5 - filled;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      {Array.from({ length: filled }).map((_, i) => (
        <Star key={`f-${i}`} color={colors.ratingStar} size={size} fill={colors.ratingStar} />
      ))}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e-${i}`} color={colors.textTertiary} size={size} />
      ))}
      {showValue && value > 0 && (
        <View style={{ marginLeft: 4 }}>
          {/* Value shown by parent via Text if needed */}
        </View>
      )}
    </View>
  );
}
