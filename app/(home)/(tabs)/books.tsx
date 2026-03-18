// app/(home)/(tabs)/books.tsx — Books library with search, trending discover, and For You shelf
import { GlassBlur } from '@/components/GlassBlur';
import { TAB_BAR_BOTTOM_OFFSET } from '@/components/GlassTabBar';
import { BookCard, CARD_GAP, CARD_H_PAD } from '@/components/books/BookCard';
import { SearchDots } from '@/components/books/SearchDots';
import { ActiveTab, useOpenLibrarySearch } from '@/hooks/useOpenLibrarySearch';
import { useBooksStore } from '@/store/booksStore';
import { BookOpen, Search, Sparkles, TrendingUp, X } from 'lucide-react-native';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function BooksTab() {
  const insets = useSafeAreaInsets();
  const { isInLibrary } = useBooksStore();
  const {
    library,
    selectedInterests,
    activeTab,
    setActiveTab,
    searchOpen,
    toggleSearch,
    query,
    handleQueryChange,
    searching,
    searchError,
    loadingMore,
    handleLoadMore,
    trendingLoading,
    forYouLoading,
    showingSearch,
    hasMore,
    displayData,
  } = useOpenLibrarySearch();

  // Animation state (screen-only)
  const searchH = useSharedValue(0);
  const searchStyle = useAnimatedStyle(() => ({ height: searchH.value, overflow: 'hidden' }));
  const loadMoreScale = useSharedValue(1);
  const loadMoreStyle = useAnimatedStyle(() => ({ transform: [{ scale: loadMoreScale.value }] }));

  const handleToggleSearch = () => {
    searchH.value = withTiming(!searchOpen ? 52 : 0, { duration: 220 });
    toggleSearch();
  };

  const renderEmpty = () => {
    if (showingSearch && searching) return null;
    if (showingSearch) {
      if (searchError) {
        return (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 32 }}>
            <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 16, color: '#0A0A0A', textAlign: 'center', marginBottom: 6 }}>
              Search Unavailable
            </Text>
            <Text style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic', fontSize: 13, color: '#6B6B6B', textAlign: 'center', lineHeight: 20 }}>
              Unable to reach the books catalogue. Check your connection and try again.
            </Text>
          </View>
        );
      }
      if (activeTab === 'library') {
        return (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 32 }}>
            <Search size={28} color="#D4D4D4" strokeWidth={1} />
            <Text style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic', fontSize: 14, color: '#6B6B6B', textAlign: 'center', marginTop: 12, lineHeight: 20 }}>
              No books in your library match{'\n'}"{query.trim()}"
            </Text>
          </View>
        );
      }
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
          <Text style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic', fontSize: 14, color: '#6B6B6B' }}>No results found.</Text>
        </View>
      );
    }
    if (activeTab === 'library') {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 32 }}>
          <BookOpen size={36} color="#D4D4D4" strokeWidth={1} />
          <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: '#0A0A0A', marginTop: 16, marginBottom: 6, textAlign: 'center' }}>
            Begin Your Collection
          </Text>
          <Text style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic', fontSize: 13, color: '#6B6B6B', textAlign: 'center', lineHeight: 20 }}>
            A gentleman&apos;s library is the mirror of his mind. Discover a book and save it here.
          </Text>
        </View>
      );
    }
    if (activeTab === 'foryou') {
      if (forYouLoading) {
        return (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
            <ActivityIndicator color="#6B6B6B" />
            <Text style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic', fontSize: 13, color: '#6B6B6B', marginTop: 12 }}>
              Curating your shelf…
            </Text>
          </View>
        );
      }
      if (selectedInterests.length === 0) {
        return (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 32 }}>
            <Sparkles size={36} color="#D4D4D4" strokeWidth={1} />
            <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: '#0A0A0A', marginTop: 16, marginBottom: 6, textAlign: 'center' }}>
              No Interests Set
            </Text>
            <Text style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic', fontSize: 13, color: '#6B6B6B', textAlign: 'center', lineHeight: 20 }}>
              Visit your Profile to set your interests and unlock a personalised shelf.
            </Text>
          </View>
        );
      }
    }
    return null;
  };

  const TAB_LABELS: { id: ActiveTab; label: string }[] = [
    { id: 'library',  label: 'My Library' },
    { id: 'discover', label: 'Discover' },
    { id: 'foryou',   label: 'For You' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-ivory" edges={['top']}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 24, color: '#0A0A0A' }}>
          Library
        </Text>
        <Pressable onPress={handleToggleSearch} hitSlop={12} accessibilityRole="button" accessibilityLabel={searchOpen ? 'Close search' : 'Search books'}>
          {searchOpen
            ? <X size={20} color="#6B6B6B" strokeWidth={1.5} />
            : <Search size={20} color="#6B6B6B" strokeWidth={1.5} />}
        </Pressable>
      </View>

      {/* Animated search bar — glass pill */}
      <Animated.View style={[searchStyle, { paddingHorizontal: 20 }]}>
        <View style={booksStyles.searchBarShadow}>
          <View style={booksStyles.searchBar}>
            <GlassBlur intensity={52} />
            <View style={[StyleSheet.absoluteFill, booksStyles.searchBarFill]} pointerEvents="none" />
            <Search size={14} color="#6B6B6B" strokeWidth={1.5} />
            <TextInput
              value={query}
              onChangeText={handleQueryChange}
              placeholder={activeTab === 'library' ? 'Search your library…' : 'Search any book…'}
              placeholderTextColor="#ABABAB"
              style={{ flex: 1, marginLeft: 8, fontFamily: 'PlayfairDisplay_400Regular', fontSize: 14, color: '#0A0A0A' }}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              returnKeyType="search"
            />
            {searching && <SearchDots />}
          </View>
        </View>
      </Animated.View>

      {/* Tabs — unified glassmorphic segmented control */}
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 }}>
        <View style={booksStyles.segmentContainer}>
          <GlassBlur intensity={56} />
          <View style={[StyleSheet.absoluteFill, booksStyles.segmentFill]} pointerEvents="none" />
          {TAB_LABELS.map(({ id, label }) => {
            const active = activeTab === id;
            return (
              <Pressable
                key={id}
                onPress={() => setActiveTab(id)}
                style={booksStyles.segmentItem}
              >
                {active && <View style={booksStyles.segmentActivePill} />}
                <Text style={{
                  fontFamily: active ? 'PlayfairDisplay_700Bold' : 'PlayfairDisplay_400Regular',
                  fontSize: 12,
                  color: active ? '#0A0A0A' : '#6B6B6B',
                  letterSpacing: 0.3,
                  zIndex: 1,
                }}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {/* Metadata row below */}
        {!showingSearch && (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 8, gap: 4 }}>
            {activeTab === 'discover' && (
              trendingLoading
                ? <ActivityIndicator size="small" color="#ABABAB" />
                : <>
                    <TrendingUp size={11} color="#ABABAB" strokeWidth={1.5} />
                    <Text style={{ fontSize: 10, color: '#ABABAB', letterSpacing: 0.3 }}>This year</Text>
                  </>
            )}
            {activeTab === 'foryou' && selectedInterests.length > 0 && (
              <Text style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic', fontSize: 10, color: '#ABABAB' }} numberOfLines={1}>
                {selectedInterests.slice(0, 2).join(' · ')}
              </Text>
            )}
            {activeTab === 'library' && library.length > 0 && (
              <Text style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic', fontSize: 10, color: '#ABABAB' }}>
                {library.length} book{library.length !== 1 ? 's' : ''}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Library personal header strip */}
      {activeTab === 'library' && !showingSearch && (
        <View style={{ backgroundColor: '#0A0A0A', paddingHorizontal: 24, paddingVertical: 13 }}>
          <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 12, color: '#EDEDED', letterSpacing: 2, textTransform: 'uppercase' }}>
            My Collection
          </Text>
          <Text style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic', fontSize: 11, color: 'rgba(237,237,237,0.45)', marginTop: 2 }}>
            {library.length === 0
              ? 'No books saved yet'
              : `${library.length} book${library.length !== 1 ? 's' : ''} · personally chosen`}
          </Text>
        </View>
      )}

      {/* Grid */}
      <FlatList
        data={displayData}
        keyExtractor={(item) => item.id}
        numColumns={2}
        key="grid"
        style={{
          flex: 1,
          backgroundColor: activeTab === 'library' ? '#FAFAF8' : 'transparent',
        }}
        contentContainerStyle={{
          paddingHorizontal: CARD_H_PAD,
          paddingTop: 14,
          paddingBottom: TAB_BAR_BOTTOM_OFFSET + insets.bottom,
          gap: CARD_GAP,
          flexGrow: 1,
        }}
        columnWrapperStyle={{ gap: CARD_GAP }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={
          hasMore || loadingMore ? (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              {loadingMore ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <SearchDots />
                  <Text style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic', fontSize: 12, color: '#6B6B6B' }}>
                    Loading more…
                  </Text>
                </View>
              ) : (
                <AnimatedPressable
                  style={[loadMoreStyle, {
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: '#D4D4D4',
                    borderRadius: 20,
                    paddingHorizontal: 24,
                    paddingVertical: 10,
                    backgroundColor: 'rgba(255,255,255,0.72)',
                  }]}
                  onPressIn={() => { loadMoreScale.value = withSpring(0.95, { damping: 18, stiffness: 180 }); }}
                  onPressOut={() => { loadMoreScale.value = withSpring(1, { damping: 18, stiffness: 180 }); }}
                  onPress={handleLoadMore}
                  accessibilityRole="button"
                  accessibilityLabel="Load more books"
                >
                  <Text style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic', fontSize: 13, color: '#1C1C1C', letterSpacing: 0.3 }}>
                    Load more
                  </Text>
                </AnimatedPressable>
              )}
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <BookCard
            book={item}
            inLibrary={isInLibrary(item.id)}
            isLibraryView={activeTab === 'library'}
          />
        )}
      />
    </SafeAreaView>
  );
}

// ─── Books tab styles ─────────────────────────────────────────────────────────
const booksStyles = StyleSheet.create({
  // Glass search bar
  searchBarShadow: {
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: { elevation: 5 },
    }),
  },
  searchBar: {
    overflow: 'hidden',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.88)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 44,
    backgroundColor: Platform.select({
      ios: 'transparent',
      android: 'rgba(255,255,255,0.72)',
    }),
  },
  searchBarFill: {
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: 20,
  },
  // Segmented tab control
  segmentContainer: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: Platform.select({ android: 'rgba(255,255,255,0.55)' }),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  segmentFill: {
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderRadius: 20,
  },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
  },
  segmentActivePill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 16,
    marginHorizontal: 3,
    marginVertical: 3,
  },
});
