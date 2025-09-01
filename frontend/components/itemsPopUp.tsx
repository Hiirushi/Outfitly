import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  PanResponder,
  Animated,
  ScrollView,
} from 'react-native';
import { itemsAPI } from '@/services/api';
import { itemTypesAPI } from '@/services/itemTypesAPI';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import PopupScreenButton from './buttons/PopupScreenButton';

interface Item {
  _id: string;
  name: string;
  image: string;
  color?: string;
  brand?: string;
  itemType?: {
    _id: string;
    name: string;
  } | string;
}

interface ItemType {
  _id: string;
  name: string;
  itemCount?: number;
}

interface ItemsPopUpProps {
  onItemDrag: (item: Item, gestureState: any) => void;
}

const ItemsPopUp: React.FC<ItemsPopUpProps> = ({ onItemDrag }) => {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // EFFICIENT DATA FETCHING - Only 2 API calls total
  const fetchData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      if (!isAuthenticated) {
        router.replace('/auth/login');
        return;
      }

      console.log('Fetching data for outfit creation...');

      // Step 1: Fetch item types (single API call - global data)
      const itemTypesResponse = await itemTypesAPI.getTypes();
      console.log('Item types fetched:', itemTypesResponse.length);

      // Step 2: Fetch ALL user items (single API call - user-specific data)
      const userItemsResponse = await itemsAPI.getItems();
      const userItems: Item[] = userItemsResponse.success ? userItemsResponse.data : [];
      
      console.log('User items fetched:', userItems.length);

      // Step 3: Calculate item counts for each type (client-side filtering)
      const typesWithCounts: ItemType[] = [];

      itemTypesResponse.forEach((itemType: any) => {
        // Count items for this type
        const itemsForThisType = userItems.filter(item => {
          const itemTypeId = item.itemType && typeof item.itemType === 'object' 
            ? item.itemType._id 
            : item.itemType;
          return itemTypeId === itemType._id;
        });

        // Only include types that have items
        if (itemsForThisType.length > 0) {
          typesWithCounts.push({
            _id: itemType._id,
            name: itemType.name,
            itemCount: itemsForThisType.length,
          });
        }
      });

      // Set state with fetched data
      setAllItems(userItems);
      setFilteredItems(userItems); // Show all items initially
      setItemTypes(typesWithCounts);
      
      console.log('Data loading completed:', {
        totalItems: userItems.length,
        availableTypes: typesWithCounts.length
      });

    } catch (err: any) {
      console.error('Error fetching data:', err);
      
      if (err.response?.status === 401) {
        Alert.alert('Session Expired', 'Please log in again.', [
          { text: 'OK', onPress: () => {
            logout();
            router.replace('/auth/login');
          }}
        ]);
        return;
      }
      
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load items';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // CLIENT-SIDE FILTERING - No additional API calls needed
  const handleTypeSelect = (typeId: string) => {
    console.log('Filtering items by type:', typeId);
    setSelectedTypeId(typeId);

    if (typeId === 'All') {
      setFilteredItems(allItems);
    } else {
      const filtered = allItems.filter(item => {
        const itemTypeId = item.itemType && typeof item.itemType === 'object' 
          ? item.itemType._id 
          : item.itemType;
        return itemTypeId === typeId;
      });
      setFilteredItems(filtered);
    }
    
    console.log(`Showing ${typeId === 'All' ? allItems.length : filteredItems.length} items`);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const DraggableItem = ({ item }: { item: Item }) => {
    const pan = useRef(new Animated.ValueXY()).current;
    const scale = useRef(new Animated.Value(1)).current;

    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          // Scale up the item when drag starts
          Animated.spring(scale, {
            toValue: 1.2,
            useNativeDriver: false,
          }).start();
        },
        onPanResponderMove: Animated.event(
          [null, { dx: pan.x, dy: pan.y }],
          { useNativeDriver: false }
        ),
        onPanResponderRelease: (evt, gestureState) => {
          // Reset scale and position
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: false,
          }).start();
          
          pan.setValue({ x: 0, y: 0 });

          // Call the parent's onItemDrag function
          onItemDrag(item, {
            translationX: gestureState.dx,
            translationY: gestureState.dy,
            absoluteX: evt.nativeEvent.pageX,
            absoluteY: evt.nativeEvent.pageY,
          });
        },
      })
    ).current;

    return (
      <Animated.View
        style={[
          styles.item,
          {
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
              { scale },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Image source={{ uri: item.image }} style={styles.itemImage} />
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        {item.color && (
          <Text style={styles.itemDetail}>{item.color}</Text>
        )}
        {item.brand && (
          <Text style={styles.itemDetail}>{item.brand}</Text>
        )}
      </Animated.View>
    );
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.authContainer}>
          <Text style={styles.authText}>Please log in to access your items</Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading your items...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (allItems.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Items Available</Text>
          <Text style={styles.emptyText}>
            Add some items to your closet first to create outfits.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Items</Text>
        <Text style={styles.headerSubtitle}>
          Drag items to the canvas above • {filteredItems.length} of {allItems.length} shown
        </Text>
      </View>

      {/* Filter Section */}
      {itemTypes.length > 0 && (
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContentContainer}
          >
            {/* All button */}
            <PopupScreenButton
              type="All"
              isSelected={selectedTypeId === 'All'}
              onPress={() => handleTypeSelect('All')}
            />
            {/* Item type buttons */}
            {itemTypes.map((itemType) => (
              <PopupScreenButton
                key={itemType._id}
                type={itemType.name}
                isSelected={selectedTypeId === itemType._id}
                onPress={() => handleTypeSelect(itemType._id)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Items Grid */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <DraggableItem item={item} />}
        numColumns={3}
        columnWrapperStyle={filteredItems.length > 0 ? styles.row : undefined}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyFilterContainer}>
            <Text style={styles.emptyFilterText}>
              No items in this category
            </Text>
            <TouchableOpacity 
              style={styles.showAllButton} 
              onPress={() => handleTypeSelect('All')}
            >
              <Text style={styles.showAllButtonText}>Show All Items</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  filterSection: {
    backgroundColor: '#f8f8f8',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  scrollContentContainer: {
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 10,
  },
  listContainer: {
    padding: 15,
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-around',
  },
  item: {
    alignItems: 'center',
    width: 100,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 15,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  itemName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  itemDetail: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyFilterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyFilterText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  showAllButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  showAllButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  authText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default ItemsPopUp;