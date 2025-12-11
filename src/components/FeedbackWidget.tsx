import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path } from 'react-native-svg';

interface FeedbackData {
  rating: 'positive' | 'negative';
  comment: string;
  timestamp: string;
}

// Thumb icons
const ThumbUpIcon = ({ color = '#F49B9B' }: { color?: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path
      d="M7 22H4C3.46957 22 2.96086 21.7893 2.58579 21.4142C2.21071 21.0391 2 20.5304 2 20V13C2 12.4696 2.21071 11.9609 2.58579 11.5858C2.96086 11.2107 3.46957 11 4 11H7M14 9V5C14 4.20435 13.6839 3.44129 13.1213 2.87868C12.5587 2.31607 11.7956 2 11 2L7 11V22H18.28C18.7623 22.0055 19.2304 21.8364 19.5979 21.524C19.9654 21.2116 20.2077 20.7769 20.28 20.3L21.66 11.3C21.7035 11.0134 21.6842 10.7207 21.6033 10.4423C21.5225 10.1638 21.3821 9.90629 21.1919 9.68751C21.0016 9.46873 20.7661 9.29393 20.5016 9.17522C20.2371 9.0565 19.9499 8.99672 19.66 9H14Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

const ThumbDownIcon = ({ color = '#F49B9B' }: { color?: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path
      d="M17 2H20C20.5304 2 21.0391 2.21071 21.4142 2.58579C21.7893 2.96086 22 3.46957 22 4V11C22 11.5304 21.7893 12.0391 21.4142 12.4142C21.0391 12.7893 20.5304 13 20 13H17M10 15V19C10 19.7956 10.3161 20.5587 10.8787 21.1213C11.4413 21.6839 12.2044 22 13 22L17 13V2H5.72C5.23773 1.99455 4.76958 2.16359 4.40208 2.47599C4.03458 2.78839 3.79227 3.22305 3.72 3.7L2.34 12.7C2.29647 12.9866 2.31578 13.2793 2.39667 13.5577C2.47757 13.8362 2.61791 14.0937 2.80814 14.3125C2.99837 14.5313 3.23395 14.7061 3.49843 14.8248C3.76291 14.9435 4.05014 15.0033 4.34 15H10Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

const CloseIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path
      d="M18 6L6 18M6 6L18 18"
      stroke="#7A6C66"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const FeedbackWidget: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [rating, setRating] = useState<'positive' | 'negative' | null>(null);
  const [comment, setComment] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));

  const handleRating = (selectedRating: 'positive' | 'negative') => {
    setRating(selectedRating);

    if (selectedRating === 'positive') {
      // For positive feedback, just show a thank you message
      setExpanded(true);
    } else {
      // For negative feedback, open the full modal
      setShowModal(true);
    }
  };

  const handleSubmit = async () => {
    if (!rating) return;

    const feedbackData: FeedbackData = {
      rating,
      comment,
      timestamp: new Date().toISOString(),
    };

    try {
      // Get existing feedback
      const existingData = await AsyncStorage.getItem('mmb:user_feedback');
      const feedbackList = existingData ? JSON.parse(existingData) : [];

      // Add new feedback
      feedbackList.push(feedbackData);

      // Save back to storage
      await AsyncStorage.setItem('mmb:user_feedback', JSON.stringify(feedbackList));

      setSubmitted(true);

      // Close modal after a delay
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          setShowModal(false);
          setExpanded(false);
          setRating(null);
          setComment('');
          setSubmitted(false);
          fadeAnim.setValue(1);
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to save feedback:', error);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setExpanded(false);
    setRating(null);
    setComment('');
    setSubmitted(false);
  };

  // Don't show if already submitted in this session
  if (submitted && !showModal && !expanded) {
    return null;
  }

  return (
    <>
      {/* Main Compact Widget */}
      {!expanded && !showModal && (
        <View style={styles.container}>
          <View style={styles.questionContainer}>
            <Text style={styles.question}>Geniet je van de app?</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.thumbButton}
                onPress={() => handleRating('positive')}
                activeOpacity={0.7}
              >
                <ThumbUpIcon color="#F49B9B" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.thumbButton}
                onPress={() => handleRating('negative')}
                activeOpacity={0.7}
              >
                <ThumbDownIcon color="#F49B9B" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Expanded state for positive feedback */}
      {expanded && rating === 'positive' && !showModal && (
        <View style={styles.container}>
          <View style={styles.expandedContainer}>
            <Text style={styles.thankYouTitle}>Dankjewel!</Text>
            <Text style={styles.thankYouText}>
              Je feedback helpt ons de app te verbeteren voor alle mama's
            </Text>
            <TextInput
              style={styles.optionalInput}
              placeholder="Wil je nog iets delen? (optioneel)"
              placeholderTextColor="#B3AFAF"
              multiline
              numberOfLines={3}
              value={comment}
              onChangeText={setComment}
              textAlignVertical="top"
            />
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleClose}
              >
                <Text style={styles.skipButtonText}>Sluiten</Text>
              </TouchableOpacity>
              {comment.trim().length > 0 && (
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}
                >
                  <Text style={styles.submitButtonText}>Versturen</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Modal for negative feedback */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={handleClose}
          />
          <Animated.View style={[styles.modalContent, { opacity: fadeAnim }]}>
            {!submitted ? (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Help ons verbeteren</Text>
                  <TouchableOpacity onPress={handleClose}>
                    <CloseIcon />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.modalSubtitle}>
                    Wat kunnen we beter doen?
                  </Text>

                  <TextInput
                    style={styles.feedbackInput}
                    placeholder="Deel je suggestie of waar je tegenaan loopt..."
                    placeholderTextColor="#B3AFAF"
                    multiline
                    numberOfLines={6}
                    value={comment}
                    onChangeText={setComment}
                    textAlignVertical="top"
                    autoFocus
                  />

                  <Text style={styles.privacyNote}>
                    Je feedback helpt ons de app te verbeteren. We behandelen je input vertrouwelijk.
                  </Text>
                </ScrollView>

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    comment.trim().length === 0 && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={comment.trim().length === 0}
                >
                  <Text style={styles.submitButtonText}>Versturen</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.submittedContainer}>
                <Text style={styles.submittedTitle}>Bedankt voor je feedback!</Text>
                <Text style={styles.submittedText}>
                  We waarderen je input en gebruiken dit om de app te verbeteren
                </Text>
              </View>
            )}
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  questionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F9EFEF',
  },
  question: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 15,
    color: '#4B3B36',
    marginBottom: 12,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  thumbButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FAF7F3',
    borderWidth: 1.5,
    borderColor: '#F49B9B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  expandedContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F9EFEF',
  },
  thankYouTitle: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 20,
    color: '#F49B9B',
    marginBottom: 8,
    textAlign: 'center',
  },
  thankYouText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    color: '#7A6C66',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  optionalInput: {
    backgroundColor: '#FAF7F3',
    borderRadius: 12,
    padding: 12,
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#4B3B36',
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#F0EDED',
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  skipButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 14,
    color: '#7A6C66',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#F49B9B',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#F49B9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#E0D5D5',
    shadowOpacity: 0,
  },
  submitButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 14,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FAF7F3',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 22,
    color: '#4B3B36',
  },
  modalSubtitle: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 15,
    color: '#7A6C66',
    marginBottom: 16,
    lineHeight: 22,
  },
  feedbackInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#4B3B36',
    minHeight: 140,
    borderWidth: 1,
    borderColor: '#F0EDED',
    marginBottom: 16,
  },
  privacyNote: {
    fontFamily: 'Poppins',
    fontWeight: '300',
    fontSize: 12,
    color: '#A8A5A2',
    marginBottom: 20,
    lineHeight: 18,
  },
  submittedContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  submittedTitle: {
    fontFamily: 'Quicksand',
    fontWeight: '700',
    fontSize: 24,
    color: '#F49B9B',
    marginBottom: 12,
    textAlign: 'center',
  },
  submittedText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 15,
    color: '#7A6C66',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
});
