import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  Image,
  Dimensions,
  Text,
  Animated,
  PanResponder,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ReactDatePicker from 'react-datepicker';
import DatePicker from 'react-native-date-picker';
import 'react-datepicker/dist/react-datepicker.css'; 
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import ItemsPopUp from '@/components/itemsPopUp';
import WeatherWidget from '@/components/WeatherWidget';
import { apiUtils, outfitsAPI } from '@/services/api';

interface DroppedItem {
  id: string;
  itemId: string;
  image: string;
  name: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  zIndex?: number;
}

export default function Canvas() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [outfitName, setOutfitName] = useState('');
  const [outfitOccasion, setOutfitOccasion] = useState('');
  const [plannedDate, setPlannedDate] = useState('');
  const [droppedItems, setDroppedItems] = useState<DroppedItem[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [datePickerVisible, setDatePickerVisible] = useState(false); // For native platforms
  const [webDate, setWebDate] = useState<Date | null>(null); // For web

  const [cameFromCalendar, setCameFromCalendar] = useState(false);
  // Track if this is the first navigation to canvas
  const [hasInitialized, setHasInitialized] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  // Check authentication on component mount
  useEffect(() => {
    checkAuthentication();
  }, []);

  // Handle navigation and parameter processing
  useFocusEffect(
    useCallback(() => {
      console.log('Canvas focused with params:', params);
      console.log('Params plannedDate:', params.plannedDate);
      console.log('Current plannedDate state:', plannedDate);

      // Always reset these modal states when screen comes into focus
      setModalVisible(false);
      setSaveModalVisible(false);
      setSaving(false);

      // Check if there's a planned date parameter (coming from calendar)
      const incomingPlannedDate = params.plannedDate;
      const hasPlannedDateParam = incomingPlannedDate && typeof incomingPlannedDate === 'string';

      console.log('hasPlannedDateParam:', hasPlannedDateParam);
      console.log('hasInitialized:', hasInitialized);

      if (hasPlannedDateParam) {
        // Always set the planned date from params
        console.log('Setting planned date from params:', incomingPlannedDate);
        setPlannedDate(incomingPlannedDate as string);
        setCameFromCalendar(true);

        // Auto-open items popup if specified
        if (params.autoOpenItems === 'true') {
          setTimeout(() => {
            setModalVisible(true);
          }, 300);
        }

        // Clear the URL parameters after processing to prevent re-triggering
        setTimeout(() => {
          router.replace('/canvas');
        }, 100);
      } else if (hasInitialized && !hasPlannedDateParam && !cameFromCalendar) {
        // User navigated to canvas directly without date parameter (refresh, direct navigation, etc.)
        // Reset everything including planned date
        console.log('Direct navigation to canvas - resetting all data');
        setPlannedDate('');
        setDroppedItems([]);
        setOutfitName('');
        setOutfitOccasion('');
      }

      if (!hasInitialized) {
        setHasInitialized(true);
      }
    }, [params.plannedDate, params.autoOpenItems, hasInitialized, cameFromCalendar]),
  );

  const checkAuthentication = async () => {
    try {
      setAuthLoading(true);
      const authStatus = await apiUtils.isAuthenticated();
      const token = await apiUtils.getToken();

      console.log('Canvas Auth Check:', {
        authStatus,
        tokenExists: !!token,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'null',
      });

      setIsAuthenticated(authStatus && !!token);
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleItemDrag = (item: any, gestureState: any) => {
    if (!isAuthenticated) {
      Alert.alert('Authentication Required', 'Please log in to create outfits.');
      return;
    }

    const modalHeight = screenHeight * 0.5;
    const canvasArea = screenHeight - modalHeight;

    if (gestureState.absoluteY < canvasArea + 50) {
      const actualItemId = item._id || item.id || item.itemId;

      if (!actualItemId) {
        Alert.alert('Error', 'Invalid item - missing database ID.');
        return;
      }

      const itemIdString = String(actualItemId);

      if (itemIdString === 'undefined' || itemIdString.includes('undefined')) {
        Alert.alert('Error', 'Item ID is invalid. Please check the ItemsPopUp component.');
        return;
      }

      const newItem: DroppedItem = {
        id: itemIdString + '_dropped_' + Date.now(),
        itemId: itemIdString,
        image: item.image || item.image_url,
        name: item.name,
        x: Math.max(10, Math.min(gestureState.absoluteX - 30, screenWidth - 70)),
        y: Math.max(10, Math.min(gestureState.absoluteY - 30, canvasArea - 70)),
        width: 200,
        height: 200,
        rotation: 0,
        zIndex: 1,
      };

      setDroppedItems((prev) => [...prev, newItem]);
    }
  };

  const removeItem = (id: string) => {
    setDroppedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItemPosition = (id: string, newX: number, newY: number) => {
    setDroppedItems((prev) => prev.map((item) => (item.id === id ? { ...item, x: newX, y: newY } : item)));
  };

  const handleDone = async () => {
    console.log('Done button clicked');

    // Re-check authentication
    await checkAuthentication();

    if (!isAuthenticated) {
      Alert.alert('Authentication Required', 'Please log in to save outfits.');
      return;
    }

    if (droppedItems.length === 0) {
      Alert.alert('No Items', 'Please add some items to your outfit before saving.');
      return;
    }

    console.log('Opening save modal...');
    setSaveModalVisible(true);
  };

  const handleSave = async () => {
    console.log('Save function called');
    console.log('Form data:', { outfitName, outfitOccasion, itemsCount: droppedItems.length });

    // Basic validation
    if (!outfitName.trim()) {
      Alert.alert('Missing Name', 'Please enter a name for your outfit.');
      return;
    }

    // Make occasion optional or provide default
    const finalOccasion = outfitOccasion.trim() || 'General';

    // Validate items
    const invalidItems = droppedItems.filter((d) => {
      return (
        !d.itemId ||
        d.itemId.includes('undefined') ||
        d.itemId === 'undefined' ||
        typeof d.itemId !== 'string' ||
        d.itemId.trim() === ''
      );
    });

    if (invalidItems.length > 0) {
      Alert.alert('Error', `${invalidItems.length} item(s) have invalid IDs. Please remove and re-add them.`);
      return;
    }

    setSaving(true);
    console.log('Starting save process...');

    try {
      const payload = {
        name: outfitName.trim(),
        occasion: outfitOccasion.trim(),
        plannedDate: plannedDate ? plannedDate : undefined,
        items: droppedItems.map((d) => ({
          item: d.itemId,
          x: d.x,
          y: d.y,
          width: d.width || 200,
          height: d.height || 200,
          rotation: d.rotation || 0,
          zIndex: d.zIndex || 1,
        })),
      };

      console.log('Payload to send:', payload);

      const result = await outfitsAPI.createOutfit(payload);

      console.log('Save successful:', result);

      // Reset form and canvas
      setOutfitName('');
      setOutfitOccasion('');
      setPlannedDate('');
      setDroppedItems([]);
      setCameFromCalendar(false);
      setSaveModalVisible(false);

      Alert.alert('Success', 'Outfit saved successfully!');
    } catch (error: any) {
      console.error('Save error details:', error);

      if (apiUtils.handleAuthError(error)) {
        setIsAuthenticated(false);
        Alert.alert('Session Expired', 'Your session has expired. Please log in again.');
        return;
      }

      let errorMessage = 'Could not save outfit. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSave = () => {
    setOutfitName('');
    setOutfitOccasion('');
    setSaveModalVisible(false);
  };

  // Immediate clear function for testing
  const handleImmediateClear = () => {
    console.log('Immediate clear pressed');
    setDroppedItems([]);
    setOutfitName('');
    setOutfitOccasion('');
    setPlannedDate('');
    setCameFromCalendar(false);
    console.log('Canvas immediately cleared');
  };

  const handleDateChange = (selectedDate: Date) => {
    const formattedDate = selectedDate.toISOString().split('T')[0];
    setPlannedDate(formattedDate);
    setDatePickerVisible(false); // Close the date picker for native
  };

  const handleWebDateChange = (date: Date | null) => {
    if (date) {
      const formattedDate = date.toISOString().split('T')[0];
      setPlannedDate(formattedDate);
    }
  };

  const DraggableDroppedItem = ({ item }: { item: DroppedItem }) => {
    const pan = useRef(new Animated.ValueXY({ x: item.x, y: item.y })).current;
    const scale = useRef(new Animated.Value(1)).current;

    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          pan.setOffset({ x: item.x, y: item.y });
          pan.setValue({ x: 0, y: 0 });
          Animated.spring(scale, { toValue: 1.1, useNativeDriver: false }).start();
        },
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
        onPanResponderRelease: (evt, gestureState) => {
          const finalX = Math.max(10, Math.min(item.x + gestureState.dx, screenWidth - 70));
          const finalY = Math.max(10, Math.min(item.y + gestureState.dy, screenHeight * 0.5 - 70));

          updateItemPosition(item.id, finalX, finalY);

          pan.flattenOffset();
          pan.setValue({ x: finalX, y: finalY });

          Animated.spring(scale, { toValue: 1, useNativeDriver: false }).start();
        },
      }),
    ).current;

    return (
      <Animated.View
        style={[styles.droppedItem, { transform: [{ translateX: pan.x }, { translateY: pan.y }, { scale }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity style={styles.itemTouchable}>
          <Image source={{ uri: item.image }} style={styles.droppedItemImage} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.removeButton} onPress={() => removeItem(item.id)}>
          <Ionicons name="close" size={14} color="white" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <View style={styles.authContent}>
          <Ionicons name="lock-closed" size={48} color="#6c757d" />
          <Text style={styles.authTitle}>Authentication Required</Text>
          <Text style={styles.authMessage}>Please log in to create and save outfits.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={checkAuthentication}>
            <Text style={styles.retryButtonText}>Check Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          {/* Weather widget top-left */}
          <View style={styles.weatherWrap} pointerEvents="box-none">
            <WeatherWidget />
          </View>

          {/* Clear canvas button - only show if there are items or planned date */}
          {(droppedItems.length > 0 || (plannedDate && plannedDate.trim() !== '')) && (
            <View style={styles.clearButtonsContainer}>
              {/* Temporary immediate clear button for testing */}
              <TouchableOpacity style={styles.immediateClearButton} onPress={handleImmediateClear}>
                <Ionicons name="trash" size={20} color="white" />
              </TouchableOpacity>
            </View>
          )}

          {/* Canvas area with dropped items */}
          <View style={styles.canvasArea}>
            {droppedItems.length === 0 && (
              <View style={styles.dropZoneHint}>
                <Text style={styles.dropZoneText}>
                  {plannedDate
                    ? `Planning outfit for ${plannedDate}\nDrag items here from the popup below`
                    : 'Drag items here from the popup below'}
                </Text>
              </View>
            )}
            {droppedItems.map((item) => (
              <DraggableDroppedItem key={item.id} item={item} />
            ))}
          </View>

          <TouchableOpacity style={styles.add} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>

          {droppedItems.length > 0 && (
            <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
              <Ionicons name="checkmark" size={24} color="white" />
            </TouchableOpacity>
          )}

          {/* Items Modal */}
          <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="black" />
                </TouchableOpacity>
                <View style={{ paddingTop: 40, width: '100%' }}>
                  <ItemsPopUp onItemDrag={handleItemDrag} />
                </View>
              </View>
            </View>
          </Modal>

          {/* Save Modal */}
          <Modal animationType="fade" transparent visible={saveModalVisible} onRequestClose={handleCancelSave}>
            <View style={styles.saveModalOverlay}>
              <View style={styles.saveModalContent}>
                <Text style={styles.saveModalTitle}>Save Outfit</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Name *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={outfitName}
                    onChangeText={setOutfitName}
                    placeholder="Enter outfit name"
                    placeholderTextColor="#999"
                    editable={!saving}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Occasion *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={outfitOccasion}
                    onChangeText={setOutfitOccasion}
                    placeholder="e.g., Work, Party, Casual"
                    placeholderTextColor="#999"
                    editable={!saving}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Planned Date (Optional)</Text>
                  <View style={styles.datePickerRow}>
                    <TouchableOpacity
                      style={[styles.textInput, { flex: 1, justifyContent: 'center' }]}
                      onPress={() => {
                        if (Platform.OS === 'web') {
                          setWebDate(plannedDate ? new Date(plannedDate) : new Date());
                        } else {
                          setDatePickerVisible(true);
                        }
                      }}
                      disabled={saving}
                    >
                      <Text style={{ color: plannedDate ? '#000' : '#999' }}>{plannedDate || 'YYYY-MM-DD'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        if (Platform.OS === 'web') {
                          setWebDate(plannedDate ? new Date(plannedDate) : new Date());
                        } else {
                          setDatePickerVisible(true);
                        }
                      }}
                      disabled={saving}
                    >
                      <Ionicons name="calendar" size={24} color="#007AFF" style={styles.calendarIcon} />
                    </TouchableOpacity>
                  </View>

                  {/* Native Date Picker */}
                  {Platform.OS !== 'web' && (
                    <DatePicker
                      modal
                      open={datePickerVisible}
                      date={plannedDate ? new Date(plannedDate) : new Date()}
                      mode="date"
                      onConfirm={handleDateChange}
                      onCancel={() => setDatePickerVisible(false)}
                    />
                  )}

                  {/* Web Date Picker */}
                  {Platform.OS === 'web' && webDate && (
                    <ReactDatePicker selected={webDate} onChange={handleWebDateChange} inline />
                  )}
                </View>

                <View style={styles.saveModalButtons}>
                  <TouchableOpacity
                    style={[styles.cancelButton, saving && styles.disabledButton]}
                    onPress={handleCancelSave}
                    disabled={saving}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.saveButton, saving && styles.disabledButton]}
                    onPress={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.saveButtonText}>SAVE</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  canvasArea: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6c757d',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  authContent: {
    alignItems: 'center',
    padding: 40,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#495057',
    marginTop: 16,
    marginBottom: 8,
  },
  authMessage: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dropZoneHint: {
    position: 'absolute',
    top: '55%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -50 }],
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
  },
  dropZoneText: {
    marginTop: 10,
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
  },
  droppedItem: {
    position: 'absolute',
    width: 60,
    height: 60,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  droppedItemImage: {
    width: 200,
    height: 200,
    borderRadius: 6,
  },
  removeButton: {
    position: 'absolute',
    top: -70,
    right: -20,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
    zIndex: 1,
  },
  add: {
    position: 'absolute',
    bottom: 140,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#545454',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneButton: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#80AE85',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonsContainer: {
    position: 'absolute',
    top: 60,
    right: 15,
    flexDirection: 'row',
    gap: 10,
    zIndex: 15,
  },
  immediateClearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF3030',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '100%',
    height: '50%',
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  saveModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    width: '85%',
    maxWidth: 400,
  },
  saveModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  saveModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  cancelButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#80AE85',
    marginLeft: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  disabledButton: {
    opacity: 0.6,
  },
  weatherWrap: {
    position: 'absolute',
    top: 60,
    left: 12,
    zIndex: 20,
  },
  datePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIcon: {
    marginLeft: 10,
  },
});
