// components/books/BookCard.tsx
import { Book } from '@/types/book';
import { getRelativeDate } from '@/utils/dateHelpers';
import { router } from 'expo-router';
import { BookMarked } from 'lucide-react-native';
import { Dimensions, Image, Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const { width: SCREEN_W } = Dimensions.get('window');

export const CARD_GAP = 12;
export const CARD_H_PAD = 20;
export const CARD_W = (SCREEN_W - CARD_H_PAD * 2 - CARD_GAP) / 2;
export const COVER_H = CARD_W * 1.5;
export const COVER_H_LIBRARY = CARD_W * 1.65;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const COVER_COLORS = ['#1C1C1C', '#2C2C2C', '#3B2F2F', '#2B3A2B', '#2B2B3A', '#3A2B38', '#3A352B'];

function coverColor(id: string): string {
  let n = 0;
  for (let i = 0; i < id.length; i++) n += id.charCodeAt(i);
  return COVER_COLORS[n % COVER_COLORS.length];
}

export function BookCard({
  book,
  inLibrary,
  isLibraryView = false,
}: {
  book: Book;
  inLibrary: boolean;
  isLibraryView?: boolean;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const coverH = isLibraryView ? COVER_H_LIBRARY : COVER_H;

  return (
    <AnimatedPressable
      style={[animStyle, { width: CARD_W }]}
      onPressIn={() => { scale.value = withSpring(0.96, { damping: 14 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 14 }); }}
      onPress={() =>
        router.push({ pathname: '/(home)/book-detail', params: { book: JSON.stringify(book) } })
      }
      accessibilityRole="button"
      accessibilityLabel={`${book.title} by ${book.author}`}
    >
      {/* Cover */}
      <View style={{ width: CARD_W, height: coverH, borderRadius: 14, overflow: 'hidden', backgroundColor: coverColor(book.id) }}>
        {book.coverUrl ? (
          <Image source={{ uri: book.coverUrl }} style={{ width: CARD_W, height: coverH }} resizeMode="cover" />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 36, color: 'rgba(255,255,255,0.20)' }}>
              {book.title[0]}
            </Text>
          </View>
        )}

        {inLibrary && !isLibraryView && (
          <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: '#0A0A0A', borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
            <BookMarked size={12} color="#EDEDED" strokeWidth={2} />
          </View>
        )}

        {isLibraryView && (
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 8, paddingBottom: 7, paddingTop: 14, backgroundColor: 'rgba(10,10,10,0.5)' }}>
            <Text style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic', fontSize: 9, color: 'rgba(237,237,237,0.7)', letterSpacing: 0.3 }} numberOfLines={1}>
              {book.author}
            </Text>
          </View>
        )}
      </View>

      {/* Meta */}
      <View style={{ marginTop: 8, gap: 2 }}>
        <Text numberOfLines={2} style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 13, color: '#0A0A0A', lineHeight: 18 }}>
          {book.title}
        </Text>
        {!isLibraryView && (
          <Text numberOfLines={1} style={{ fontSize: 11, fontStyle: 'italic', color: '#6B6B6B' }}>
            {book.author}
          </Text>
        )}
        {isLibraryView && book.addedAt && (
          <Text style={{ fontFamily: 'PlayfairDisplay_400Regular', fontSize: 10, color: '#ABABAB', letterSpacing: 0.2 }}>
            Added {getRelativeDate(book.addedAt)}
          </Text>
        )}
      </View>
    </AnimatedPressable>
  );
}
