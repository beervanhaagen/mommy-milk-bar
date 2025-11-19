import { useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

const { width } = Dimensions.get('window');

const PLANNING_TIPS = [
  {
    id: 1,
    title: 'Melk op voorraad?',
    content: 'Gebruik het als luxe, niet als verplichting. Een voorraad kan stress verminderen, maar verse melk is altijd het beste.',
  },
  {
    id: 2,
    title: 'Kolfpomp meenemen',
    content: 'Als je van plan bent om buiten de deur te drinken, neem een handkolf mee. Klein, stil, en houdt je comfortabel.',
  },
  {
    id: 3,
    title: 'Geniet zonder schuldgevoel',
    content: 'Een avondje ontspannen is belangrijk voor je mentale gezondheid. Geniet ervan, zolang je veilig plant.',
  },
  {
    id: 4,
    title: 'Kolven tijdens drinken',
    content: 'Volle borsten? Kolven en de melk weggooien (pump & dump) voorkomt verstopte melkkanalen en houdt je productie op peil.',
  },
];

export function PlanningTipCarousel() {
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const cardWidth = width - 48;
  const cardGap = 16;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / (cardWidth + cardGap));
    setActiveIndex(index);
  };

  const scrollToIndex = (index: number) => {
    const scrollPosition = index * (cardWidth + cardGap);
    scrollRef.current?.scrollTo({
      x: scrollPosition,
      animated: true,
    });
    setActiveIndex(index);
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled={false}
        snapToInterval={cardWidth + cardGap}
        decelerationRate="fast"
        snapToAlignment="start"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.carouselScroll}
        contentContainerStyle={styles.carousel}
      >
        {PLANNING_TIPS.map((tip, index) => (
          <View
            key={tip.id}
            style={[
              styles.card,
              {
                width: cardWidth,
                marginRight: index === PLANNING_TIPS.length - 1 ? 0 : cardGap,
                borderColor: index % 2 === 0 ? '#F7C9D1' : '#F5A7B8'
              }
            ]}
          >
            <View style={[styles.blobLarge, index % 2 === 0 ? styles.blobPositionVariantA : styles.blobPositionVariantB]} />
            <View style={[styles.blobSmall, index % 2 === 0 ? styles.blobSmallVariantA : styles.blobSmallVariantB]} />
            <View style={styles.textContent}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipContent}>{tip.content}</Text>
              <Text style={styles.tipHeader}>#tipvanmimi</Text>
            </View>
            {/* <Image
              source={require('../../assets/Mimi_karakters/2_mimi_happy_1.png')}
              style={styles.mimiSticker}
            /> */}
          </View>
        ))}
      </ScrollView>

      <View style={styles.pagination}>
        {PLANNING_TIPS.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => scrollToIndex(index)}
            style={[
              styles.paginationDot,
              activeIndex === index && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: width - 48,
    alignSelf: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  carouselScroll: {
    overflow: 'hidden',
  },
  carousel: {
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 4,
    paddingBottom: 12,
  },
  card: {
    backgroundColor: '#FFF9F5',
    borderRadius: 16,
    borderWidth: 1,
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 20,
    minHeight: 85,
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  blobPositionVariantA: {
    top: 10,
    left: 25,
  },
  blobPositionVariantB: {
    top: 4,
    left: 60,
  },
  blobSmallVariantA: {
    bottom: 18,
    right: 78,
  },
  blobSmallVariantB: {
    bottom: 24,
    right: 40,
  },
  blobLarge: {
    position: 'absolute',
    top: 8,
    left: 20,
    width: 60,
    height: 60,
    backgroundColor: '#FFEFEF',
    opacity: 0.6,
    borderRadius: 30,
  },
  blobSmall: {
    position: 'absolute',
    bottom: 10,
    right: 55,
    width: 55,
    height: 55,
    backgroundColor: '#FFE1E7',
    opacity: 0.4,
    borderRadius: 27.5,
  },
  textContent: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    paddingRight: 12,
    flex: 1,
    position: 'relative',
    zIndex: 2,
    justifyContent: 'space-between',
  },
  tipHeader: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 9,
    color: '#E8797A',
    marginTop: 6,
    opacity: 0.85,
  },
  tipTitle: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: 14,
    color: '#4B3B36',
    marginBottom: 5,
  },
  tipContent: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 17,
    color: '#4B3B36',
  },
  mimiSticker: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 80,
    height: 80,
    resizeMode: 'contain',
    shadowColor: '#F49B9B',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    zIndex: 1,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: '#F6C2C5',
    opacity: 0.5,
  },
  paginationDotActive: {
    width: 18,
    borderRadius: 9,
    opacity: 1,
    backgroundColor: '#F49B9B',
  },
});
