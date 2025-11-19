import { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal, Dimensions, TextInput, Platform } from "react-native";
import { useStore } from "../../src/state/store";
import { exportUserData, deleteAllUserData } from "../../src/lib/dataExport";
import Svg, { Path } from "react-native-svg";
import Slider from '@react-native-community/slider';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width, height } = Dimensions.get('window');

// Helper function to calculate baby age from birthdate
const calculateBabyAge = (birthdate?: string) => {
  if (!birthdate) return 'Niet ingevuld';

  const birth = new Date(birthdate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - birth.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(diffDays / 7);
  const months = Math.floor(diffDays / 30);
  const years = Math.floor(months / 12);

  if (years >= 1) {
    const remainingMonths = months - (years * 12);
    if (remainingMonths > 0) {
      return `${years} jaar, ${remainingMonths} ${remainingMonths === 1 ? 'maand' : 'maanden'}`;
    }
    return `${years} ${years === 1 ? 'jaar' : 'jaar'}`;
  } else if (months >= 1) {
    return `${months} ${months === 1 ? 'maand' : 'maanden'}`;
  } else {
    return `${weeks} ${weeks === 1 ? 'week' : 'weken'}`;
  }
};

// Helper function to calculate mother age from birthdate
const calculateMotherAge = (birthdate?: string) => {
  if (!birthdate) return 'Niet ingevuld';

  const birth = new Date(birthdate);
  const today = new Date();
  const years = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25));

  return `${years} jaar`;
};

// Format birthdate
const formatBirthdate = (birthdate?: string) => {
  if (!birthdate) return 'Niet ingevuld';
  const date = new Date(birthdate);
  return date.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

// Inline SVG icons
const UserIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="none" stroke="#F49B9B" strokeWidth={2}/>
    <Path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" fill="none" stroke="#F49B9B" strokeWidth={2}/>
  </Svg>
);

const BabyIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path d="M9 12l2 2 4-4" fill="none" stroke="#F49B9B" strokeWidth={2}/>
    <Path d="M21 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z" fill="#F49B9B"/>
    <Path d="M3 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z" fill="#F49B9B"/>
    <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="none" stroke="#F49B9B" strokeWidth={2}/>
  </Svg>
);

const BottleIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path d="M10 2h4v3l2 2v3H8V7l2-2V2z" fill="none" stroke="#F49B9B" strokeWidth={2}/>
    <Path d="M8 10h8v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10z" fill="none" stroke="#F49B9B" strokeWidth={2}/>
  </Svg>
);

const EditIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" fill="none" stroke="#7A6C66" strokeWidth={2}/>
    <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" fill="none" stroke="#7A6C66" strokeWidth={2}/>
  </Svg>
);

const SettingsIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" fill="none" stroke="#7A6C66" strokeWidth={2}/>
    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" fill="none" stroke="#7A6C66" strokeWidth={2}/>
  </Svg>
);

type EditModalType = 'mother' | 'baby' | 'feeding' | 'names' | null;

export default function Profile() {
  const { settings, updateSettings } = useStore();
  const [editModal, setEditModal] = useState<EditModalType>(null);

  // Mother data
  const [motherWeight, setMotherWeight] = useState(settings.weightKg ?? 65);
  const [motherHeight, setMotherHeight] = useState(settings.heightCm ?? 170);
  const [motherBirthdate, setMotherBirthdate] = useState<Date>(
    settings.motherBirthdate ? new Date(settings.motherBirthdate) : new Date(new Date().setFullYear(new Date().getFullYear() - 30))
  );
  const [showMotherDatePicker, setShowMotherDatePicker] = useState(false);

  // Baby data
  const [babyBirthdate, setBabyBirthdate] = useState<Date>(
    settings.babyBirthdate ? new Date(settings.babyBirthdate) : new Date()
  );
  const [showBabyDatePicker, setShowBabyDatePicker] = useState(false);
  const [babyWeight, setBabyWeight] = useState(settings.babyWeightKg ?? 4.0);
  const [babyLength, setBabyLength] = useState(settings.babyLengthCm ?? 54);

  // Feeding data
  const [feedingType, setFeedingType] = useState(settings.feedingType ?? 'breast');
  const [pumpPref, setPumpPref] = useState(settings.pumpPreference ?? 'yes');
  const [feedsPerDay, setFeedsPerDay] = useState(settings.feedsPerDay ?? 8);
  const [typicalAmount, setTypicalAmount] = useState(settings.typicalAmountMl ?? 120);

  // Names
  const [motherName, setMotherName] = useState(
    settings.motherName === 'prefer_not_to_share' ? '' : settings.motherName ?? ''
  );
  const [babyName, setBabyName] = useState(
    settings.babyName === 'prefer_not_to_share' ? '' : settings.babyName ?? ''
  );
  const [preferNotToShareMother, setPreferNotToShareMother] = useState(
    settings.motherName === 'prefer_not_to_share'
  );
  const [preferNotToShareBaby, setPreferNotToShareBaby] = useState(
    settings.babyName === 'prefer_not_to_share'
  );


  const formatFeedingType = (type?: string) => {
    if (!type) return 'Niet ingevuld';
    const typeMap: { [key: string]: string } = {
      'breast': 'Borstvoeding',
      'formula': 'Kunstvoeding',
      'mix': 'Mix'
    };
    return typeMap[type] || type;
  };

  const formatPumpPreference = (pref?: string) => {
    if (!pref) return 'Niet ingevuld';
    const prefMap: { [key: string]: string } = {
      'yes': 'Ja, ik kolf ook melk',
      'no': 'Nee, ik geef alleen direct uit borst',
      'later': 'Nog niet zeker'
    };
    return prefMap[pref] || pref;
  };

  const handleSaveMotherData = () => {
    updateSettings({
      weightKg: motherWeight,
      heightCm: motherHeight,
      motherBirthdate: motherBirthdate.toISOString(),
    });
    setEditModal(null);
    setShowMotherDatePicker(false);
  };

  const handleSaveBabyData = () => {
    updateSettings({
      babyBirthdate: babyBirthdate.toISOString(),
      babyWeightKg: babyWeight,
      babyLengthCm: babyLength,
    });
    setEditModal(null);
  };

  const handleSaveFeedingData = () => {
    updateSettings({
      feedingType: feedingType as any,
      pumpPreference: pumpPref as any,
      feedsPerDay,
      typicalAmountMl: pumpPref === 'yes' ? typicalAmount : undefined,
    });
    setEditModal(null);
  };

  const handleSaveNames = () => {
    updateSettings({
      motherName: preferNotToShareMother ? 'prefer_not_to_share' : (motherName || undefined),
      babyName: preferNotToShareBaby ? 'prefer_not_to_share' : (babyName || undefined),
    });
    setEditModal(null);
  };

  const handleMotherDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowMotherDatePicker(false);
    }
    if (selectedDate) {
      setMotherBirthdate(selectedDate);
    }
  };

  const handleBabyDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowBabyDatePicker(false);
    }
    if (selectedDate) {
      setBabyBirthdate(selectedDate);
    }
  };

  const handleExportData = async () => {
    try {
      await exportUserData(settings);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAllUserData(() => {
        // Clear all settings
        updateSettings({
          motherBirthdate: undefined,
          motherName: undefined,
          babyBirthdate: undefined,
          babyName: undefined,
          weightKg: undefined,
          heightCm: undefined,
          babyWeightKg: undefined,
          babyLengthCm: undefined,
          feedingType: undefined,
          pumpPreference: undefined,
          feedsPerDay: undefined,
          typicalAmountMl: undefined,
          hasCompletedOnboarding: false,
        });
      });
    } catch (error) {
      // User cancelled or error occurred
      console.log('Delete cancelled or failed:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Profiel</Text>
            <Text style={styles.subtitle}>
              {settings.motherName === 'prefer_not_to_share' ? 'Mama' : settings.motherName || 'Mama'} & {settings.babyName === 'prefer_not_to_share' ? 'baby' : settings.babyName || 'baby'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setEditModal('names')}
          >
            <SettingsIcon />
          </TouchableOpacity>
        </View>

        {/* Mother Data Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <UserIcon />
              <Text style={styles.cardTitle}>Over jou</Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditModal('mother')}
            >
              <EditIcon />
            </TouchableOpacity>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Geboortedatum:</Text>
            <Text style={styles.dataValue}>{formatBirthdate(settings.motherBirthdate)}</Text>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Leeftijd:</Text>
            <Text style={styles.dataValue}>{calculateMotherAge(settings.motherBirthdate)}</Text>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Gewicht:</Text>
            <Text style={styles.dataValue}>
              {settings.weightKg === undefined ? 'Niet ingevuld' : `${settings.weightKg} kg`}
            </Text>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Lengte:</Text>
            <Text style={styles.dataValue}>
              {settings.heightCm === undefined ? 'Niet ingevuld' : `${settings.heightCm} cm`}
            </Text>
          </View>

          <View style={styles.microcopy}>
            <Text style={styles.microcopyText}>
              💡 Deze data helpt ons je veilige voedmomenten te berekenen na een drankje.
            </Text>
          </View>
        </View>

        {/* Baby Data Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <BabyIcon />
              <Text style={styles.cardTitle}>Over je baby</Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditModal('baby')}
            >
              <EditIcon />
            </TouchableOpacity>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Geboortedatum:</Text>
            <Text style={styles.dataValue}>{formatBirthdate(settings.babyBirthdate)}</Text>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Leeftijd:</Text>
            <Text style={styles.dataValue}>{calculateBabyAge(settings.babyBirthdate)}</Text>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Gewicht:</Text>
            <Text style={styles.dataValue}>
              {settings.babyWeightKg === undefined ? 'Niet ingevuld' : `${settings.babyWeightKg} kg`}
            </Text>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Lengte:</Text>
            <Text style={styles.dataValue}>
              {settings.babyLengthCm === undefined ? 'Niet ingevuld' : `${settings.babyLengthCm} cm`}
            </Text>
          </View>

          <View style={styles.microcopy}>
            <Text style={styles.microcopyText}>
              💡 Bijhouden hoe je baby groeit helpt bij voedingsschema.
            </Text>
          </View>
        </View>

        {/* Feeding Preferences Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <BottleIcon />
              <Text style={styles.cardTitle}>Voeding</Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditModal('feeding')}
            >
              <EditIcon />
            </TouchableOpacity>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Type:</Text>
            <Text style={styles.dataValue}>{formatFeedingType(settings.feedingType)}</Text>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Afkolven:</Text>
            <Text style={styles.dataValue}>{formatPumpPreference(settings.pumpPreference)}</Text>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Voedingen/dag:</Text>
            <Text style={styles.dataValue}>
              {settings.feedsPerDay === undefined ? 'Niet ingevuld' : `${settings.feedsPerDay} keer`}
            </Text>
          </View>

          {settings.pumpPreference === 'yes' && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Hoeveelheid:</Text>
              <Text style={styles.dataValue}>
                {settings.typicalAmountMl === undefined ? 'Niet ingevuld' : `${settings.typicalAmountMl} ml`}
              </Text>
            </View>
          )}

          <View style={styles.microcopy}>
            <Text style={styles.microcopyText}>
              💡 Dit bepaalt wanneer je weer veilig kunt voeden.
            </Text>
          </View>
        </View>

        {/* Account & Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account & Privacy</Text>

          <TouchableOpacity style={styles.sectionItem}>
            <Text style={styles.sectionItemText}>Account instellingen</Text>
            <Text style={styles.sectionItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sectionItem}>
            <Text style={styles.sectionItemText}>Notificaties</Text>
            <Text style={styles.sectionItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sectionItem}>
            <Text style={styles.sectionItemText}>Privacy & data</Text>
            <Text style={styles.sectionItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sectionItem}>
            <Text style={styles.sectionItemText}>Help & ondersteuning</Text>
            <Text style={styles.sectionItemArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.bottomAction} onPress={handleExportData}>
            <Text style={styles.bottomActionText}>Data exporteren</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomAction} onPress={handleDeleteAccount}>
            <Text style={[styles.bottomActionText, styles.dangerText]}>Account verwijderen</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>Versie 1.0.0</Text>
        </View>
      </ScrollView>

      {/* Names Edit Modal */}
      <Modal
        visible={editModal === 'names'}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Namen aanpassen</Text>

            <Text style={styles.inputLabel}>Jouw naam</Text>
            <TextInput
              style={styles.textInput}
              value={motherName}
              onChangeText={setMotherName}
              placeholder="Bijv. Sarah"
              placeholderTextColor="#B3AFAF"
              editable={!preferNotToShareMother}
            />
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setPreferNotToShareMother(!preferNotToShareMother)}
            >
              <View style={[styles.checkbox, preferNotToShareMother && styles.checkboxChecked]}>
                {preferNotToShareMother && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Liever niet delen</Text>
            </TouchableOpacity>

            <Text style={[styles.inputLabel, { marginTop: 16 }]}>Naam van je baby</Text>
            <TextInput
              style={styles.textInput}
              value={babyName}
              onChangeText={setBabyName}
              placeholder="Bijv. Emma"
              placeholderTextColor="#B3AFAF"
              editable={!preferNotToShareBaby}
            />
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setPreferNotToShareBaby(!preferNotToShareBaby)}
            >
              <View style={[styles.checkbox, preferNotToShareBaby && styles.checkboxChecked]}>
                {preferNotToShareBaby && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Liever niet delen</Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditModal(null)}
              >
                <Text style={styles.cancelButtonText}>Annuleren</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveNames}
              >
                <Text style={styles.saveButtonText}>Opslaan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Mother Data Edit Modal */}
      <Modal
        visible={editModal === 'mother'}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModal(null)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Over jou bewerken</Text>

              <Text style={styles.inputLabel}>Geboortedatum</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowMotherDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {motherBirthdate.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>
                <Text style={styles.dateButtonSubtext}>{calculateMotherAge(motherBirthdate.toISOString())}</Text>
              </TouchableOpacity>

              {showMotherDatePicker && (
                <>
                  <DateTimePicker
                    value={motherBirthdate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleMotherDateChange}
                    maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
                    minimumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 60))}
                  />
                  {Platform.OS === 'ios' && (
                    <TouchableOpacity
                      style={styles.doneButton}
                      onPress={() => setShowMotherDatePicker(false)}
                    >
                      <Text style={styles.doneButtonText}>Klaar</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

              <Text style={[styles.inputLabel, { marginTop: 16 }]}>Gewicht: {motherWeight} kg</Text>
              <Slider
                style={styles.slider}
                minimumValue={40}
                maximumValue={120}
                step={1}
                value={motherWeight}
                onValueChange={setMotherWeight}
                minimumTrackTintColor="#F49B9B"
                maximumTrackTintColor="#E6E6E6"
                thumbTintColor="#F49B9B"
              />

              <Text style={styles.inputLabel}>Lengte: {motherHeight} cm</Text>
              <Slider
                style={styles.slider}
                minimumValue={140}
                maximumValue={200}
                step={1}
                value={motherHeight}
                onValueChange={setMotherHeight}
                minimumTrackTintColor="#F49B9B"
                maximumTrackTintColor="#E6E6E6"
                thumbTintColor="#F49B9B"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setEditModal(null);
                    setShowMotherDatePicker(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Annuleren</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveMotherData}
                >
                  <Text style={styles.saveButtonText}>Opslaan</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Baby Data Edit Modal */}
      <Modal
        visible={editModal === 'baby'}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModal(null)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Over je baby bewerken</Text>

              <Text style={styles.inputLabel}>Geboortedatum</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowBabyDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {babyBirthdate.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>
                <Text style={styles.dateButtonSubtext}>{calculateBabyAge(babyBirthdate.toISOString())}</Text>
              </TouchableOpacity>

              {showBabyDatePicker && (
                <>
                  <DateTimePicker
                    value={babyBirthdate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleBabyDateChange}
                    maximumDate={new Date()}
                    minimumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 3))}
                  />
                  {Platform.OS === 'ios' && (
                    <TouchableOpacity
                      style={styles.doneButton}
                      onPress={() => setShowBabyDatePicker(false)}
                    >
                      <Text style={styles.doneButtonText}>Klaar</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

              <Text style={[styles.inputLabel, { marginTop: 16 }]}>Gewicht: {babyWeight.toFixed(1)} kg</Text>
              <Slider
                style={styles.slider}
                minimumValue={2.0}
                maximumValue={16.0}
                step={0.1}
                value={babyWeight}
                onValueChange={setBabyWeight}
                minimumTrackTintColor="#F49B9B"
                maximumTrackTintColor="#E6E6E6"
                thumbTintColor="#F49B9B"
              />

              <Text style={styles.inputLabel}>Lengte: {babyLength} cm</Text>
              <Slider
                style={styles.slider}
                minimumValue={45}
                maximumValue={95}
                step={1}
                value={babyLength}
                onValueChange={setBabyLength}
                minimumTrackTintColor="#F49B9B"
                maximumTrackTintColor="#E6E6E6"
                thumbTintColor="#F49B9B"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setEditModal(null);
                    setShowBabyDatePicker(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Annuleren</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => {
                    handleSaveBabyData();
                    setShowBabyDatePicker(false);
                  }}
                >
                  <Text style={styles.saveButtonText}>Opslaan</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Feeding Data Edit Modal */}
      <Modal
        visible={editModal === 'feeding'}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModal(null)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Voedingsvoorkeuren bewerken</Text>

              <Text style={styles.inputLabel}>Type voeding</Text>
              <View style={styles.optionsColumn}>
                {[
                  { value: 'breast', label: 'Borstvoeding' },
                  { value: 'formula', label: 'Kunstvoeding' },
                  { value: 'mix', label: 'Mix' }
                ].map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.optionButton, feedingType === opt.value && styles.optionButtonActive]}
                    onPress={() => setFeedingType(opt.value as any)}
                  >
                    <Text style={[styles.optionButtonText, feedingType === opt.value && styles.optionButtonTextActive]}>
                      {opt.label}
                    </Text>
                    <View style={[styles.radio, feedingType === opt.value && styles.radioActive]} />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { marginTop: 16 }]}>Kolven</Text>
              <View style={styles.optionsColumn}>
                {[
                  { value: 'yes', label: 'Ja, ik kolf ook melk' },
                  { value: 'no', label: 'Nee, alleen direct uit borst' },
                  { value: 'later', label: 'Nog niet zeker' }
                ].map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.optionButton, pumpPref === opt.value && styles.optionButtonActive]}
                    onPress={() => setPumpPref(opt.value as any)}
                  >
                    <Text style={[styles.optionButtonText, pumpPref === opt.value && styles.optionButtonTextActive]}>
                      {opt.label}
                    </Text>
                    <View style={[styles.radio, pumpPref === opt.value && styles.radioActive]} />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { marginTop: 16 }]}>Voedingen per dag: {feedsPerDay}</Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={14}
                step={1}
                value={feedsPerDay}
                onValueChange={setFeedsPerDay}
                minimumTrackTintColor="#F49B9B"
                maximumTrackTintColor="#E6E6E6"
                thumbTintColor="#F49B9B"
              />

              {pumpPref === 'yes' && (
                <>
                  <Text style={styles.inputLabel}>Hoeveelheid per sessie: {typicalAmount} ml</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={50}
                    maximumValue={400}
                    step={10}
                    value={typicalAmount}
                    onValueChange={setTypicalAmount}
                    minimumTrackTintColor="#F49B9B"
                    maximumTrackTintColor="#E6E6E6"
                    thumbTintColor="#F49B9B"
                  />
                </>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setEditModal(null)}
                >
                  <Text style={styles.cancelButtonText}>Annuleren</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveFeedingData}
                >
                  <Text style={styles.saveButtonText}>Opslaan</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF4',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 36,
    color: '#4B3B36',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Poppins',
    fontWeight: '300',
    fontSize: 14,
    lineHeight: 20,
    color: '#7A6C66',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 16,
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: 'Quicksand',
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 26,
    color: '#4B3B36',
    marginLeft: 8,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  dataLabel: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    color: '#7A6C66',
    flex: 1,
  },
  dataValue: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: '#4B3B36',
    textAlign: 'right',
    flex: 1,
  },
  microcopy: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  microcopyText: {
    fontFamily: 'Poppins',
    fontWeight: '300',
    fontSize: 12,
    lineHeight: 18,
    color: '#8E8B88',
  },
  section: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Quicksand',
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 26,
    color: '#4B3B36',
    marginBottom: 16,
  },
  sectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  sectionItemText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: '#4B3B36',
  },
  sectionItemArrow: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 18,
    lineHeight: 24,
    color: '#B3AFAF',
  },
  bottomSection: {
    marginHorizontal: 24,
    marginBottom: 40,
  },
  bottomAction: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  bottomActionText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: '#B3AFAF',
  },
  dangerText: {
    color: '#D95F61',
  },
  versionText: {
    fontFamily: 'Poppins',
    fontWeight: '300',
    fontSize: 12,
    lineHeight: 18,
    color: '#A8A5A2',
    textAlign: 'center',
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    maxHeight: height * 0.85,
  },
  modalTitle: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 20,
    lineHeight: 28,
    color: '#4B3B36',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 14,
    color: '#4B3B36',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontFamily: 'Poppins',
    fontSize: 16,
    color: '#4B3B36',
    marginBottom: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#F49B9B',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#F49B9B',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#7A6C66',
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 16,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#F49B9B',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FDF2F2',
    marginBottom: 16,
  },
  dateButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    color: '#4B3B36',
    marginBottom: 4,
  },
  dateButtonSubtext: {
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#F49B9B',
  },
  doneButton: {
    backgroundColor: '#F49B9B',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  doneButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 14,
    color: '#FFFFFF',
  },
  optionsColumn: {
    gap: 8,
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  optionButtonActive: {
    borderColor: '#F49B9B',
    backgroundColor: '#FDF2F2',
  },
  optionButtonText: {
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#7A6C66',
    flex: 1,
  },
  optionButtonTextActive: {
    color: '#4B3B36',
    fontWeight: '500',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#F49B9B',
    backgroundColor: '#FFFFFF',
  },
  radioActive: {
    backgroundColor: '#F49B9B',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F9',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1E1E6',
  },
  cancelButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 16,
    color: '#7A6C66',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#F49B9B',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
