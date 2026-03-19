// app/(home)/article.tsx — Article detail
import { ARTICLES } from '@/constants/articles';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const article = ARTICLES.find((a) => a.id === id) ?? ARTICLES[0];
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Back button — floats over the image */}
      <View style={[styles.navOverlay, { top: insets.top + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.navBack}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <ArrowLeft size={16} color="#EDEDED" strokeWidth={1.5} />
          <Text style={styles.navBackLabel}>Articles</Text>
        </Pressable>
        <View style={styles.categoryPill}>
          <Text style={styles.categoryPillText}>{article.category}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* ── Hero image — scrolls with content ── */}
        <Image
          source={{ uri: article.image }}
          style={styles.heroImage}
          contentFit="cover"
          transition={300}
        />

        {/* ── Content ── */}
        <View style={styles.content}>
          {/* Meta */}
          <Text style={styles.meta}>
            ravenscroft · {article.date} · {article.readTime}
          </Text>

          {/* Title */}
          <Text style={styles.title}>{article.title}</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Body */}
          {article.body.map((paragraph, i) => (
            <Text key={i} style={[styles.body, i < article.body.length - 1 && styles.bodySpacing]}>
              {paragraph}
            </Text>
          ))}

          {/* Summary */}
          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>Summary</Text>
            {article.summary.map((point, i) => (
              <View key={i} style={styles.summaryRow}>
                <View style={styles.summaryDot} />
                <Text style={styles.summaryText}>{point}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDEDED' },
  flex: { flex: 1 },

  // Floating nav over the image
  navOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  navBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  navBackLabel: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 13,
    color: '#EDEDED',
  },
  categoryPill: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  categoryPillText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 10,
    color: 'rgba(237,237,237,0.85)',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },

  // Full-width hero — top of scroll
  heroImage: {
    width: '100%',
    height: 320,
    backgroundColor: '#D4D0CA',
  },

  content: {
    padding: 24,
  },

  meta: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 11,
    color: '#ABABAB',
    letterSpacing: 0.3,
    marginTop: 20,
    marginBottom: 12,
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 24,
    color: '#0A0A0A',
    lineHeight: 32,
    marginBottom: 20,
  },
  divider: {
    width: 28,
    height: 1.5,
    backgroundColor: '#0A0A0A',
    marginBottom: 24,
  },
  body: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 15,
    color: '#1C1C1C',
    lineHeight: 27,
  },
  bodySpacing: { marginBottom: 18 },

  summarySection: {
    marginTop: 32,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  summaryTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 16,
    color: '#0A0A0A',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  summaryDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0A0A0A',
    marginTop: 8,
    flexShrink: 0,
  },
  summaryText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 14,
    color: '#1C1C1C',
    lineHeight: 22,
    flex: 1,
  },
});
