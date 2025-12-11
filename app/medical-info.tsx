import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Linking } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";

const BackIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18l-6-6 6-6" stroke="#4B3B36" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function MedicalInfo() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.title}>Berekeningen & Medische Informatie</Text>
        </View>

        {/* How Calculations Work */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hoe werken de berekeningen?</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🔬 Wetenschappelijke basis</Text>
            <Text style={styles.infoText}>
              Onze app gebruikt het LactMed-nomogram, een wetenschappelijk model ontwikkeld door het National Institutes of Health (NIH) en de National Library of Medicine (NLM). Dit model is gebaseerd op uitgebreid onderzoek naar alcoholafbraak in moedermelk.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>⚖️ Gewichtsaanpassing</Text>
            <Text style={styles.infoText}>
              De berekeningen worden aangepast aan jouw lichaamsgewicht. Over het algemeen geldt: hoe zwaarder je bent, hoe sneller je lichaam alcohol afbreekt. We gebruiken specifieke meetpunten:
            </Text>
            <Text style={styles.infoBullet}>• Bij 54 kg: ongeveer 2,5 uur per standaardglas</Text>
            <Text style={styles.infoBullet}>• Bij 68 kg: ongeveer 2,25 uur per standaardglas</Text>
            <Text style={styles.infoBullet}>• Bij 82 kg: ongeveer 2,0 uur per standaardglas</Text>
            <Text style={styles.infoText}>
              Tussen deze punten gebruiken we lineaire interpolatie voor nauwkeurige berekeningen.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🛡️ Veiligheidsmarge</Text>
            <Text style={styles.infoText}>
              We voegen automatisch ongeveer 15% extra wachttijd toe bovenop de wetenschappelijke richtlijnen. Dit zorgt voor een extra veiligheidsbuffer, omdat individuele factoren (zoals metabolisme, voedselinname, en algemene gezondheid) kunnen variëren.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🍷 Standaardglazen</Text>
            <Text style={styles.infoText}>
              We berekenen op basis van standaardglazen (10 gram pure alcohol per glas, conform Nederlandse/Europese normen). Verschillende dranktypes worden omgerekend:
            </Text>
            <Text style={styles.infoBullet}>• Bier: 0,8x (meestal minder alcohol)</Text>
            <Text style={styles.infoBullet}>• Wijn: 1,2x (meestal meer alcohol)</Text>
            <Text style={styles.infoBullet}>• Cocktails: 1,5x (meestal veel alcohol)</Text>
          </View>
        </View>

        {/* Medical Disclaimer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medische disclaimer</Text>
          
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>⚠️ Belangrijke informatie</Text>
            <Text style={styles.warningText}>
              Deze app geeft alleen algemene richtlijnen en indicaties op basis van wetenschappelijke modellen. De berekeningen zijn indicatief en niet bedoeld als vervanging van medisch advies. Mama Milk Bar geeft geen medisch advies en alle keuzes die je maakt zijn volledig je eigen verantwoordelijkheid.
            </Text>
          </View>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Individuele variaties:</Text> De werkelijke tijd die nodig is voor alcoholafbraak kan variëren per persoon, afhankelijk van factoren zoals:
          </Text>
          <Text style={styles.bullet}>• Stofwisseling en leverfunctie</Text>
          <Text style={styles.bullet}>• Of je gegeten hebt tijdens het drinken</Text>
          <Text style={styles.bullet}>• Algemene gezondheid en medicijngebruik</Text>
          <Text style={styles.bullet}>• Genetische factoren</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Raadpleeg een zorgverlener:</Text> Bij twijfel over de veiligheid van borstvoeding na alcoholgebruik, raadpleeg altijd een zorgverlener (bijvoorbeeld je verloskundige, lactatiekundige, huisarts of kinderarts).
          </Text>
        </View>

        {/* Liability Disclaimer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aansprakelijkheid & Juridische Disclaimer</Text>
          
          <View style={styles.liabilityCard}>
            <Text style={styles.liabilityTitle}>⚠️ Belangrijke Juridische Informatie</Text>
            <Text style={styles.liabilityText}>
              <Text style={styles.bold}>Geen medisch advies:</Text> Mama Milk Bar (MMB) is uitsluitend een informatief hulpmiddel en biedt geen medisch advies, diagnose of behandeling. Alle informatie, berekeningen en indicaties die door deze app worden verstrekt, zijn bedoeld voor algemene informatieve doeleinden en vormen geen vervanging voor professioneel medisch advies van een gekwalificeerde zorgverlener.
            </Text>
            <Text style={styles.liabilityText}>
              <Text style={styles.bold}>Indicatief karakter:</Text> De berekeningen en tijdsindicaties die deze app verstrekt, zijn uitsluitend indicatief en gebaseerd op algemene wetenschappelijke modellen. Deze kunnen niet worden gebruikt als absolute waarheid en zijn niet gegarandeerd nauwkeurig voor individuele situaties. Alcoholafbraak varieert per persoon en kan worden beïnvloed door tal van factoren die niet door deze app kunnen worden voorspeld of gemeten.
            </Text>
            <Text style={styles.liabilityText}>
              <Text style={styles.bold}>Eigen verantwoordelijkheid:</Text> Als gebruiker van deze app aanvaard je volledige verantwoordelijkheid voor alle beslissingen die je neemt met betrekking tot borstvoeding en alcoholgebruik. Je erkent dat deze beslissingen persoonsgebonden zijn en volledig op jouw eigen oordeel, kennis en risico zijn gebaseerd.
            </Text>
            <Text style={styles.liabilityText}>
              <Text style={styles.bold}>Geen aansprakelijkheid:</Text> Mama Milk Bar, haar eigenaren, ontwikkelaars, medewerkers en gelieerde partijen zijn op geen enkele wijze aansprakelijk voor enige directe, indirecte, incidentele, gevolg- of strafschade, inclusief maar niet beperkt tot letsel, verlies of schade aan jezelf, je baby of derden, voortvloeiend uit of gerelateerd aan het gebruik van of het vertrouwen op de informatie, berekeningen of functionaliteiten van deze app.
            </Text>
            <Text style={styles.liabilityText}>
              <Text style={styles.bold}>Geen rechtsvordering:</Text> Door gebruik te maken van deze app, ga je ermee akkoord dat je Mama Milk Bar of haar gelieerde partijen niet zult aanklagen, aansprakelijk zult stellen of op andere wijze juridische stappen zult ondernemen voor enige beslissing die je neemt op basis van de informatie of berekeningen van deze app. Alle keuzes die je maakt zijn onherroepelijk persoonlijk en kunnen niet worden teruggevoerd op Mama Milk Bar.
            </Text>
            <Text style={styles.liabilityText}>
              <Text style={styles.bold}>Raadpleeg altijd een professional:</Text> Bij twijfel, vragen of zorgen over borstvoeding en alcoholgebruik, raadpleeg altijd een gekwalificeerde zorgverlener (zoals je verloskundige, lactatiekundige, huisarts of kinderarts). Deze app is geen vervanging voor professioneel medisch advies en mag niet worden gebruikt als enige basis voor medische beslissingen.
            </Text>
          </View>
        </View>

        {/* Sources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bronnen</Text>
          
          <Text style={styles.paragraph}>
            Onze berekeningen zijn gebaseerd op de volgende wetenschappelijke bronnen:
          </Text>

          <TouchableOpacity
            style={styles.sourceLink}
            onPress={() => Linking.openURL('https://www.ncbi.nlm.nih.gov/books/NBK501469/')}
          >
            <Text style={styles.sourceTitle}>1. LactMed - Drugs and Lactation Database</Text>
            <Text style={styles.sourceSubtitle}>National Library of Medicine (NLM), National Institutes of Health (NIH)</Text>
            <Text style={styles.sourceArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sourceLink}
            onPress={() => Linking.openURL('https://www.cdc.gov/breastfeeding/breastfeeding-special-circumstances/vaccinations-medications-drugs/alcohol.html')}
          >
            <Text style={styles.sourceTitle}>2. CDC - Alcohol and Breastfeeding</Text>
            <Text style={styles.sourceSubtitle}>Centers for Disease Control and Prevention</Text>
            <Text style={styles.sourceArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sourceLink}
            onPress={() => Linking.openURL('https://www.healthychildren.org/English/ages-stages/baby/breastfeeding/Pages/Drinking-Alcohol-and-Breastfeeding.aspx')}
          >
            <Text style={styles.sourceTitle}>3. AAP - Drinking Alcohol and Breastfeeding</Text>
            <Text style={styles.sourceSubtitle}>American Academy of Pediatrics</Text>
            <Text style={styles.sourceArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Contact */}
        <View style={styles.contactSection}>
          <Text style={styles.contactText}>
            Vragen over de berekeningen of medische informatie? Neem contact met ons op:
          </Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => Linking.openURL('mailto:info@mommymilkbar.nl')}
          >
            <Text style={styles.contactButtonText}>info@mommymilkbar.nl</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F3',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4B3B36',
    fontFamily: 'Quicksand',
    flex: 1,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4B3B36',
    marginBottom: 16,
    fontFamily: 'Quicksand',
  },
  infoCard: {
    backgroundColor: '#FDF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F49B9B',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B3B36',
    marginBottom: 8,
    fontFamily: 'Poppins',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#7A6C66',
    fontFamily: 'Poppins',
    marginBottom: 8,
  },
  infoBullet: {
    fontSize: 14,
    lineHeight: 20,
    color: '#7A6C66',
    fontFamily: 'Poppins',
    marginLeft: 8,
    marginBottom: 4,
  },
  warningCard: {
    backgroundColor: '#FFF3F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#E74C3C',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C0392B',
    marginBottom: 8,
    fontFamily: 'Poppins',
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#7A6C66',
    fontFamily: 'Poppins',
  },
  liabilityCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6E6E6',
  },
  liabilityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C0392B',
    marginBottom: 12,
    fontFamily: 'Poppins',
  },
  liabilityText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#7A6C66',
    fontFamily: 'Poppins',
    marginBottom: 14,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    color: '#7A6C66',
    fontFamily: 'Poppins',
    marginBottom: 12,
  },
  bold: {
    fontWeight: '600',
    color: '#4B3B36',
  },
  bullet: {
    fontSize: 14,
    lineHeight: 20,
    color: '#7A6C66',
    fontFamily: 'Poppins',
    marginLeft: 8,
    marginBottom: 4,
  },
  sourceLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2E7E2',
    marginBottom: 8,
  },
  sourceTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B3B36',
    fontFamily: 'Poppins',
    flex: 1,
    marginRight: 8,
  },
  sourceSubtitle: {
    fontSize: 12,
    color: '#8E8B88',
    fontFamily: 'Poppins',
    marginTop: 4,
  },
  sourceArrow: {
    fontSize: 16,
    color: '#F49B9B',
    fontFamily: 'Poppins',
  },
  contactSection: {
    backgroundColor: '#FDF2F2',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  contactText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#7A6C66',
    fontFamily: 'Poppins',
    textAlign: 'center',
    marginBottom: 12,
  },
  contactButton: {
    backgroundColor: '#F49B9B',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Poppins',
  },
});

