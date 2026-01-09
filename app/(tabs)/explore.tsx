import { StyleSheet, View } from 'react-native';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

export default function ExploreScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#41E2BA', dark: '#040D12' }}
      headerImage={
        <IconSymbol
          size={310}
          color="rgba(255,255,255,0.3)"
          name="magnifyingglass"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Explore Miufy
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.contentContainer}>
        <ThemedText>
          Welcome to the Explore tab! Soon, you can discover new cat videos and note-taking tips here.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  contentContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
});