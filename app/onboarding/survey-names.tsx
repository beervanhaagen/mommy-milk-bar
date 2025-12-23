import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useStore } from "../../src/state/store";
import Svg, { Path } from "react-native-svg";
import { AnimatedBackground } from "../../src/components/AnimatedBackground";

const { width, height } = Dimensions.get('window');

export default function SurveyNames() {
  const [motherName, setMotherName] = useState('');
  const [babyName, setBabyName] = useState('');
  const [motherNamePrefersNot, setMotherNamePrefersNot] = useState(false);
  const [babyNamePrefersNot, setBabyNamePrefersNot] = useState(false);
  
  const router = useRouter();
  const { updateSettings } = useStore();

  const handleNext = () => {
    // Save names to store
    updateSettings({
      motherName: motherNamePrefersNot ? 'prefer_not_to_share' : motherName.trim() || 'prefer_not_to_share',
      babyName: babyNamePrefersNot ? 'prefer_not_to_share' : babyName.trim() || 'prefer_not_to_share',
    });
    
    router.replace('/onboarding/survey-you');
  };

  const handleMotherNameToggle = () => {
    setMotherNamePrefersNot(!motherNamePrefersNot);
    if (!motherNamePrefersNot) {
      setMotherName(''); // Clear name when toggling to "prefer not to share"
    }
  };

  const handleBabyNameToggle = () => {
    setBabyNamePrefersNot(!babyNamePrefersNot);
    if (!babyNamePrefersNot) {
      setBabyName(''); // Clear name when toggling to "prefer not to share"
    }
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground variant="variant1" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

      <View style={styles.content}>
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
            <View style={[styles.progressBarFill, { width: 189 }]} />
          </View>
        </View>

        {/* Title and subtitle */}
        <Text style={styles.title}>Laten we elkaar leren kennen</Text>
        <Text style={styles.subtitle}>
          We vragen je naam en die van je baby om de app persoonlijk te maken. Je kunt ook kiezen om dit niet te delen.
        </Text>

        {/* Mother's name section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hoe heet je?</Text>
          
          {!motherNamePrefersNot && (
            <TextInput
              style={styles.textInput}
              placeholder="Je naam"
              placeholderTextColor="#A8A5A2"
              value={motherName}
              onChangeText={setMotherName}
              autoCapitalize="words"
            />
          )}
          
          <TouchableOpacity 
            style={[styles.toggleButton, motherNamePrefersNot && styles.toggleButtonActive]}
            onPress={handleMotherNameToggle}
          >
            <View style={[styles.toggleCircle, motherNamePrefersNot && styles.toggleCircleActive]}>
              {motherNamePrefersNot && <View style={styles.toggleDot} />}
            </View>
            <Text style={[styles.toggleText, motherNamePrefersNot && styles.toggleTextActive]}>
              Deel ik liever niet
            </Text>
          </TouchableOpacity>
        </View>

        {/* Baby's name section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hoe heet je baby?</Text>
          
          {!babyNamePrefersNot && (
            <TextInput
              style={styles.textInput}
              placeholder="Naam van je baby"
              placeholderTextColor="#A8A5A2"
              value={babyName}
              onChangeText={setBabyName}
              autoCapitalize="words"
            />
          )}
          
          <TouchableOpacity 
            style={[styles.toggleButton, babyNamePrefersNot && styles.toggleButtonActive]}
            onPress={handleBabyNameToggle}
          >
            <View style={[styles.toggleCircle, babyNamePrefersNot && styles.toggleCircleActive]}>
              {babyNamePrefersNot && <View style={styles.toggleDot} />}
            </View>
            <Text style={[styles.toggleText, babyNamePrefersNot && styles.toggleTextActive]}>
              Deel ik liever niet
            </Text>
          </TouchableOpacity>
        </View>

        {/* Microcopy */}
        <View style={styles.microcopy}>
          <Text style={styles.microcopyText}>
            Met namen maken we de app persoonlijker. We gebruiken "mama" en "baby" als je liever geen namen deelt.
          </Text>
        </View>

        {/* Continue button */}
        <TouchableOpacity style={styles.continueButton} onPress={handleNext}>
          <Text style={styles.continueButtonText}>Doorgaan</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F3',
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: height * 0.12,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E6E6E6',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F49B9B',
    borderRadius: 2,
  },
  title: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 36,
    textAlign: 'center',
    color: '#4B3B36',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'Poppins',
    fontWeight: '300',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#7A6C66',
    marginBottom: 40,
    maxWidth: 320,
    alignSelf: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Quicksand',
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 26,
    color: '#4B3B36',
    marginBottom: 16,
  },
  textInput: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: '#4B3B36',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E6E6E6',
  },
  toggleButtonActive: {
    backgroundColor: '#FDE8E4',
    borderColor: '#F49B9B',
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#B3AFAF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleCircleActive: {
    borderColor: '#F49B9B',
  },
  toggleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F49B9B',
  },
  toggleText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: '#7A6C66',
  },
  toggleTextActive: {
    color: '#4B3B36',
    fontWeight: '500',
  },
  microcopy: {
    marginTop: 20,
    marginBottom: 40,
  },
  microcopyText: {
    fontFamily: 'Poppins',
    fontWeight: '300',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    color: '#8E8B88',
  },
  continueButton: {
    backgroundColor: '#F49B9B',
    borderRadius: 38,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 17,
    lineHeight: 26,
    textAlign: 'center',
    color: '#FFFFFF',
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
});
