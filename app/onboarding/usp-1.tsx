import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path, Circle, Rect, SvgUri } from "react-native-svg";
import { AnimatedBackground } from "../../src/components/AnimatedBackground";

const babyFaceIconUri = Image.resolveAssetSource(require('../../assets/MMB_other/Babysface.svg')).uri;
const pumpIconUri = Image.resolveAssetSource(require('../../assets/MMB_other/pump.svg')).uri;
const safeIconUri = Image.resolveAssetSource(require('../../assets/MMB_other/veiligvoeden.svg')).uri;

const { width, height } = Dimensions.get('window');

type PlanningItem = {
  id: number;
  type: 'feeding' | 'drink' | 'pump' | 'safe';
  time: string;
  label: string;
  subtitle?: string;
  note?: string;
  countdown?: string;
};

export default function USP1() {
  const router = useRouter();

  const planningItems: PlanningItem[] = [
    { id: 1, type: 'feeding', time: '18:00', label: 'Laatste voeding', subtitle: 'Eerst voeden, dan drinken' },
    { id: 2, type: 'drink', time: '18:30', label: 'Drankje 1', subtitle: 'Wijn · 1 glas' },
    { id: 3, type: 'drink', time: '20:00', label: 'Drankje 2', subtitle: 'Wijn · 1 glas' },
    { id: 4, type: 'pump', time: '20:24', label: 'Kolven en flesje', subtitle: 'Je baby heeft honger' },
    { id: 5, type: 'safe', time: '22:15', label: 'Veilig voeden', subtitle: 'Alcohol volledig afgebroken' },
  ];

  const renderItemIcon = (type: PlanningItem['type']) => {
    switch (type) {
      case 'feeding':
        return (
          <SvgUri
            width={26}
            height={26}
            uri={babyFaceIconUri}
          />
        );
      case 'drink':
        return (
          <Image
            source={require('../../assets/MMB_other/Wine_png.png')}
            style={styles.itemIconImage}
            resizeMode="contain"
          />
        );
      case 'pump':
        return (
          <SvgUri
            width={26}
            height={26}
            uri={pumpIconUri}
          />
        );
      case 'safe':
        return (
          <SvgUri
            width={26}
            height={26}
            uri={safeIconUri}
          />
        );
      default:
        return null;
    }
  };

  const handleNext = () => {
    router.push('/onboarding/what-is-mmb');
  };

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      <AnimatedBackground variant="variant3" />

      {/* Fixed header with back button and progress bar */}
      <View style={styles.fixedHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24">
            <Path d="M15 18l-6-6 6-6" fill="#F49B9B"/>
          </Svg>
        </TouchableOpacity>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: 150 }]} />
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Mimi Character Icon */}
        <View style={styles.mimiIconContainer}>
          <Image
            source={require('../../assets/Mimi_karakters/2_mimi_happy_2.png')}
            style={styles.mimiIcon}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Plan met vertrouwen</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>Een duidelijke planning die vertrouwen geeft</Text>

        {/* Planning Widget - Similar to home screen */}
        <View style={styles.planningWidget}>
          <Text style={styles.widgetTitle}>Planningsoverzicht</Text>
          <Text style={styles.widgetSubtitle}>Belangrijkste momenten van je avond</Text>

          {/* Planning Items */}
          {planningItems.map((item, index) => {
            const isLastItem = index === planningItems.length - 1;
            return (
              <View
                key={item.id}
                style={[
                  styles.planningItem,
                  item.type === 'safe' && styles.safeItemBackground,
                  !isLastItem && styles.planningItemSpacing,
                ]}
              >
                <View style={styles.timeColumn}>
                  <Text style={[styles.itemTime, item.type === 'safe' && styles.safeTime]}>
                    {item.time}
                  </Text>
                </View>
                <View style={styles.iconColumn}>
                  <View
                    style={[
                      styles.itemIconBubble,
                      item.type === 'drink' && styles.drinkBubble,
                      item.type === 'feeding' && styles.feedingBubble,
                      item.type === 'pump' && styles.pumpBubble,
                      item.type === 'safe' && styles.safeBubble,
                    ]}
                  >
                    {renderItemIcon(item.type)}
                  </View>
                  {!isLastItem && <View style={styles.iconConnector} />}
                </View>
                <View style={styles.detailsColumn}>
                  <Text style={[styles.itemLabel, item.type === 'safe' && styles.safeLabel]}>
                    {item.label}
                  </Text>
                  {item.subtitle && (
                    <Text style={[styles.itemDetail, item.type === 'safe' && styles.safeDetail]}>
                      {item.subtitle}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Continue Button */}
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Doorgaan</Text>
      </TouchableOpacity>

      {/* Bottom Line */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F3',
    position: 'relative',
    width: width,
    height: height,
  },
  fixedHeader: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  progressBarTrack: {
    width: 300,
    height: 4,
    backgroundColor: '#D9D9D9',
    borderRadius: 2,
  },
  progressBarFill: {
    height: 4,
    backgroundColor: '#F49B9B',
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    marginTop: 120,
    paddingHorizontal: 24,
    paddingBottom: 120,
    alignItems: 'center',
  },
  mimiIconContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  mimiIcon: {
    width: 100,
    height: 120,
  },
  title: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 32,
    lineHeight: 42,
    textAlign: 'center',
    color: '#4B3B36',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Poppins',
    fontWeight: '300',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    color: '#8E8B88',
    marginBottom: 20,
  },
  planningWidget: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 20,
  },
  widgetTitle: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
    color: '#4B3B36',
    marginBottom: 4,
  },
  widgetSubtitle: {
    fontFamily: 'Poppins',
    fontWeight: '300',
    fontSize: 13,
    lineHeight: 18,
    color: '#8E8B88',
    marginBottom: 16,
  },
  planningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: -8,
    borderRadius: 12,
  },
  planningItemSpacing: {
    marginBottom: 4,
  },
  timeColumn: {
    width: 60,
    justifyContent: 'center',
  },
  itemTime: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 20,
    color: '#4B3B36',
  },
  iconColumn: {
    width: 42,
    alignItems: 'center',
    marginRight: 12,
    justifyContent: 'flex-start',
  },
  itemIconBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFF4F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIconImage: {
    width: 26,
    height: 26,
  },
  drinkBubble: {
    backgroundColor: '#FFF1F0',
  },
  feedingBubble: {
    backgroundColor: '#FFF1F0',
  },
  pumpBubble: {
    backgroundColor: '#FFF1F0',
  },
  iconConnector: {
    width: 2,
    flex: 1,
    backgroundColor: '#F8D9D5',
    borderRadius: 1,
  },
  detailsColumn: {
    flex: 1,
  },
  itemLabel: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 18,
    color: '#4B3B36',
    marginBottom: 4,
  },
  itemDetail: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 18,
    color: '#8E8B88',
  },
  safeItemBackground: {
    backgroundColor: '#FFF5F7',
  },
  safeTime: {
    color: '#F49B9B',
    fontWeight: '700',
  },
  safeLabel: {
    color: '#D85D7C',
    fontWeight: '600',
  },
  safeDetail: {
    color: '#F49B9B',
    fontWeight: '500',
  },
  safeBubble: {
    backgroundColor: '#FFE8EC',
  },
  button: {
    position: 'absolute',
    width: 374,
    height: 63,
    left: (width - 374) / 2,
    bottom: 40,
    backgroundColor: '#F49B9B',
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    color: '#FFFFFF',
  },
});
