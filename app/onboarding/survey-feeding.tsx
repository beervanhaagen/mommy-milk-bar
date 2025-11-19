import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import Slider from '@react-native-community/slider';
import { useStore } from "../../src/state/store";

const { width, height } = Dimensions.get('window');

export default function SurveyFeeding() {
  const router = useRouter();
  const { settings, updateSettings } = useStore();
  const [feedingType, setFeedingType] = useState<typeof settings.feedingType>(settings.feedingType ?? 'breast');
  const [pumpPref, setPumpPref] = useState<typeof settings.pumpPreference>(settings.pumpPreference ?? 'later');
  const [feedsPerDay, setFeedsPerDay] = useState<number>(settings.feedsPerDay ?? 6);
  const [amountMl, setAmountMl] = useState<number>(settings.typicalAmountMl ?? 90);
  const [feedsUnknown, setFeedsUnknown] = useState(settings.feedsPerDay === undefined);
  const [amountUnknown, setAmountUnknown] = useState(settings.typicalAmountMl === undefined);

  const handleNext = () => {
    updateSettings({
      feedingType,
      pumpPreference: pumpPref,
      feedsPerDay: feedsUnknown ? undefined : feedsPerDay,
      typicalAmountMl: amountUnknown ? undefined : amountMl
    });
    router.replace('/onboarding/completion');
  };

  const Option = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
    <TouchableOpacity style={[styles.option, active && styles.optionActive]} onPress={onPress}>
      <Text style={styles.optionText}>{label}</Text>
      <View style={[styles.radio, active && styles.radioActive]} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Svg width={width} height={504} style={styles.onboardingShape} viewBox="0 0 414 504" preserveAspectRatio="xMinYMin slice">
        <Path d="M0 -1V381.053C0 381.053 32.2351 449.788 115.112 441.811C197.989 433.835 215.177 390.876 315.243 470.049C315.243 470.049 350.543 503.185 415 501.967V-1H0Z" fill="#FFE2D8"/>
      </Svg>

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
          <View style={[styles.progressBarFill, { width: 270 }]} />
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Over voeding</Text>
        <Text style={styles.subtitle}>We personaliseren je advies rondom voedingsmomenten en plannen.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Krijgt je baby borstvoeding, kunstvoeding of een mix?</Text>
          <Option label="Alleen borstvoeding" active={feedingType === 'breast'} onPress={() => setFeedingType('breast')} />
          <Option label="Alleen kunstvoeding" active={feedingType === 'formula'} onPress={() => setFeedingType('formula')} />
          <Option label="Mix (beide)" active={feedingType === 'mix'} onPress={() => setFeedingType('mix')} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Wil je rekening houden met afgekolfde melk?</Text>
          <Option label="Ja, ik kolf ook melk" active={pumpPref === 'yes'} onPress={() => setPumpPref('yes')} />
          <Option label="Nee, ik geef alleen direct uit borst" active={pumpPref === 'no'} onPress={() => setPumpPref('no')} />
          <Option label="Nog niet zeker / later instellen" active={pumpPref === 'later'} onPress={() => setPumpPref('later')} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hoe vaak voed je gemiddeld per dag?</Text>
          <Text style={styles.metricLabel}>Voedingen per dag: {feedsUnknown ? 'Ik weet het niet' : feedsPerDay}</Text>
          <Slider style={styles.slider} minimumValue={0} maximumValue={14} step={1} value={feedsPerDay} onValueChange={(v) => { setFeedsPerDay(v); setFeedsUnknown(false); }} minimumTrackTintColor="#F49B9B" maximumTrackTintColor="#E6E6E6" thumbTintColor="#F49B9B" />
          <TouchableOpacity style={[styles.pill, feedsUnknown && styles.pillActive, { alignSelf: 'flex-start', marginTop: 10 }]} onPress={() => setFeedsUnknown(true)}>
            <Text style={[styles.pillText, feedsUnknown && styles.pillTextActive]}>Ik weet het niet</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hoeveel drinkt je baby per voeding?</Text>
          <Text style={styles.metricLabel}>Hoeveelheid: {amountUnknown ? 'Ik weet het niet' : `${amountMl} ml`}</Text>
          <Slider style={styles.slider} minimumValue={30} maximumValue={180} step={10} value={amountMl} onValueChange={(v) => { setAmountMl(v); setAmountUnknown(false); }} minimumTrackTintColor="#F49B9B" maximumTrackTintColor="#E6E6E6" thumbTintColor="#F49B9B" />
          <TouchableOpacity style={[styles.pill, amountUnknown && styles.pillActive, { alignSelf: 'flex-start', marginTop: 10 }]} onPress={() => setAmountUnknown(true)}>
            <Text style={[styles.pillText, amountUnknown && styles.pillTextActive]}>Ik weet het niet</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={handleNext}><Text style={styles.buttonText}>Doorgaan</Text></TouchableOpacity>
      <View style={styles.bottomLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFCF4', position: 'relative', width, height },
  onboardingShape: { position: 'absolute', width: '100%', height: 504, left: 0, top: 0 },
  fixedHeader: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  progressBarTrack: { width: 300, height: 4, backgroundColor: '#D9D9D9', borderRadius: 2 },
  progressBarFill: { height: 4, backgroundColor: '#F49B9B', borderRadius: 2 },
  content: { flex: 1, marginTop: 120 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 160, alignItems: 'center' },
  title: { fontFamily: 'Quicksand', fontWeight: '700', fontSize: 28, lineHeight: 36, textAlign: 'center', color: '#4B3B36', marginBottom: 8 },
  subtitle: { fontFamily: 'Poppins', fontWeight: '300', fontSize: 14, lineHeight: 22, textAlign: 'center', color: '#8E8B88', marginBottom: 14 },
  card: { width: '100%', maxWidth: 340, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, shadowColor: '#F49B9B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, marginTop: 14 },
  cardTitle: { fontFamily: 'Poppins', fontWeight: '600', fontSize: 16, lineHeight: 24, textAlign: 'center', color: '#4B3B36', marginBottom: 12 },
  option: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#C7CED9', borderRadius: 16, paddingVertical: 18, paddingHorizontal: 16, marginBottom: 12 },
  optionActive: { borderColor: '#A7B4C7', backgroundColor: '#F9FBFF' },
  optionText: { fontFamily: 'Poppins', fontWeight: '500', fontSize: 16, color: '#4B3B36', flexShrink: 1, paddingRight: 12 },
  radio: { marginLeft: 'auto', width: 28, height: 28, borderRadius: 14, borderWidth: 3, borderColor: '#F49B9B', backgroundColor: '#FFFCF4' },
  radioActive: { backgroundColor: '#FAD2D2' },
  metricLabel: { fontFamily: 'Poppins', fontWeight: '500', fontSize: 16, color: '#4B3B36' },
  slider: { width: '100%', height: 40 },
  row: { flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  pill: { borderWidth: 1, borderColor: '#C7CED9', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 10, backgroundColor: '#FFFFFF' },
  pillActive: { borderColor: '#F49B9B', backgroundColor: '#F9FBFF' },
  pillText: { fontFamily: 'Poppins', fontWeight: '500', fontSize: 14, color: '#4B3B36' },
  pillTextActive: { color: '#E47C7C' },
  button: { position: 'absolute', width: 374, height: 63, left: (width - 374) / 2, bottom: 40, backgroundColor: '#F49B9B', borderRadius: 38, justifyContent: 'center', alignItems: 'center' },
  buttonText: { fontFamily: 'Poppins', fontWeight: '400', fontSize: 16, lineHeight: 26, textAlign: 'center', color: '#FFFFFF' },
  bottomLine: { position: 'absolute', width: 143, height: 5, left: (width - 143) / 2, bottom: 14, backgroundColor: '#E6E6E6' },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
});


