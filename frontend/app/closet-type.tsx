import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import ItemCard from '@/components/itemCard';
import { itemsAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface Item {
  _id: string;
  name: string;
  image: string;
  color?: string;
  dressCode?: string;
  brand?: string;
  material?: string;
  backgroundRemoved?: boolean;
  itemType?: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

const ClosetType = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const { typeId, typeName } = params;

  // State management
  const [items, setItems] = useState<Item[]>([]);
  const [filterVisible, setFilterVisible] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter options
  const COLOR_OPTIONS = [
    'Red',
    'Blue',
    'Green',
    'Yellow',
    'Black',
    'White',
    'Gray',
    'Brown',
    'Pink',
    'Purple',
    'Orange',
    'Beige',
  ];

  const MATERIAL_OPTIONS = [
    'Cotton',
    'Linen',
    'Silk',
    'Wool',
    'Polyester',
    'Nylon',
    'Denim',
    'Leather',
    'Velvet',
    'Satin',
    'Chiffon',
    'Other',
  ];

  const SORT_OPTIONS: { key: string; label: string }[] = [
    { key: 'newest', label: 'New → Old' },
    { key: 'oldest', label: 'Old → New' },
    { key: 'name-asc', label: 'Name A → Z' },
    { key: 'name-desc', label: 'Name Z → A' },
  ];

  // Helper function to map color names to hex codes for display
  const mapColorNameToHex = (color: string): string => {
    const colorMap: { [key: string]: string } = {
      red: '#FF3B30',
      blue: '#007AFF',
      green: '#34C759',
      yellow: '#FFCC00',
      black: '#000000',
      white: '#FFFFFF',
      gray: '#8E8E93',
      brown: '#8B5A2B',
      pink: '#FF2D55',
      purple: '#5856D6',
      orange: '#FF9500',
      beige: '#F5F5DC',
    };
    return colorMap[color?.toLowerCase()] || '#CCCCCC';
  };

  // Navigation handler
  const handlePress = (itemId: string): void => {
    router.push(`/closet-single?id=${itemId}`);
  };

  // Fetch items from authenticated API - SINGLE API CALL
  const fetchItems = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      if (!isAuthenticated) {
        router.replace('/auth/login');
        return;
      }

      const apiTypeId = Array.isArray(typeId) ? typeId[0] : typeId;

      if (!apiTypeId) {
        setError('No category ID provided');
        return;
      }

      console.log(`Fetching items for type: ${typeName} (${apiTypeId})`);

      // Get ALL user items (single authenticated API call)
      const response = await itemsAPI.getItems();

      if (response.success) {
        // Filter items by the selected itemType
        const filteredItems = response.data.filter((item: Item) => {
          const itemTypeId = item.itemType && typeof item.itemType === 'object' ? item.itemType._id : item.itemType;
          return itemTypeId === apiTypeId;
        });

        console.log(`Found ${filteredItems.length} items for type ${typeName}`);
        setItems(filteredItems);
      } else {
        throw new Error(response.message || 'Failed to fetch items');
      }
    } catch (err: any) {
      console.error('Error fetching items:', err);

      if (err.response?.status === 401) {
        Alert.alert('Session Expired', 'Please log in again.', [
          {
            text: 'OK',
            onPress: () => {
              logout();
              router.replace('/auth/login');
            },
          },
        ]);
        return;
      }

      const errorMessage = err.response?.data?.message || err.message || 'Failed to load items';
      setError(errorMessage);
      Alert.alert('Error', 'Failed to load items. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // EFFICIENT FILTERING LOGIC - No additional API calls
  const getFilteredAndSortedItems = (): Item[] => {
    let filteredItems = [...items];

    // Apply color filter
    if (selectedColor) {
      filteredItems = filteredItems.filter((item) => item.color?.toLowerCase() === selectedColor.toLowerCase());
    }

    // Apply material filter
    if (selectedMaterial) {
      filteredItems = filteredItems.filter((item) => item.material?.toLowerCase() === selectedMaterial.toLowerCase());
    }

    // Apply sorting
    if (selectedSort) {
      filteredItems.sort((a, b) => {
        switch (selectedSort) {
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'oldest':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'name-asc':
            return a.name.localeCompare(b.name);
          case 'name-desc':
            return b.name.localeCompare(a.name);
          default:
            return 0;
        }
      });
    }

    return filteredItems;
  };

  // Load items when component mounts or typeId changes
  useEffect(() => {
    if (typeId && isAuthenticated) {
      fetchItems();
    } else if (!isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [typeId, isAuthenticated]);

  // Get the items to display
  const displayedItems = getFilteredAndSortedItems();

  // Clear all filters
  const clearFilters = (): void => {
    setSelectedColor(null);
    setSelectedMaterial(null);
    setSelectedSort(null);
  };

  // Check authentication first
  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-gray-100">
        <View className="flex-1 justify-center items-center p-5">
          <Text className="text-base text-red-500 text-center mb-5">Please log in to view your items</Text>
          <TouchableOpacity
            className="bg-pink-500 px-5 py-2.5 rounded-lg"
            onPress={() => router.replace('/auth/login')}
          >
            <Text className="text-white text-base font-semibold">Go to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 bg-gray-100">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#EC4899" />
          <Text className="mt-2.5 text-base text-gray-600">Loading {typeName || 'items'}...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View className="flex-1 bg-gray-100">
        <View className="flex-1 justify-center items-center p-5">
          <Text className="text-base text-red-500 text-center mb-5">{error}</Text>
          <TouchableOpacity className="bg-pink-500 px-5 py-2.5 rounded-lg" onPress={fetchItems}>
            <Text className="text-white text-base font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Main render
  return (
    <View className="flex-1 bg-gray-100">
      {/* Header with back button and filter clear*/}
      <View className="flex-col gap-y-3 bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 py-3 px-4 drop-shadow-sm rounded-b-3xl">
        <View className='flex-row items-center justify-between'>
          <TouchableOpacity
            className="size-8 rounded-full bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={16} color="#333" />
          </TouchableOpacity>

          {/* Active filters indicator */}
          {(selectedColor || selectedMaterial || selectedSort) && (
            <TouchableOpacity className="rounded-xl px-3 py-2 bg-white" onPress={clearFilters}>
              <Text className="text-pink-800 font-semibold text-xs">Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="">
          <Text className="text-3xl font-bold text-gray-900 mb-1">{typeName || 'Category'}</Text>
          <Text className="text-sm text-gray-600">
            {displayedItems.length} {displayedItems.length === 1 ? 'item' : 'items'} in your collection
          </Text>
        </View>

        {/* Filter and Sort bar */}
        <View className="flex-row items-center justify-between py-3">
          <TouchableOpacity
            className="bg-pink-500 px-4 py-2 rounded-xl flex-row items-center"
            onPress={() => setFilterVisible(!filterVisible)}
          >
            <Ionicons name="filter" size={16} color="white" style={{ marginRight: 6 }} />
            <Text className="text-white font-semibold text-sm">Filter & Sort</Text>
          </TouchableOpacity>

          <View className="flex-row items-center">
            <Text className="text-sm text-gray-600 mr-2">Sort by:</Text>
            <Text className="text-sm font-medium text-gray-900">
              {selectedSort ? SORT_OPTIONS.find((opt) => opt.key === selectedSort)?.label : 'Recently Added'}
            </Text>
          </View>
        </View>
      </View>

      {/* Title and item count */}

      {/* Filter panel */}
      {filterVisible && (
        <View className="bg-white mx-5 my-2 border border-gray-300 rounded-xl p-4 shadow-lg">
          {/* Color filter */}
          <Text className="text-base font-bold text-gray-800 mb-2">Color</Text>
          <View className="flex-row flex-wrap">
            {COLOR_OPTIONS.map((color) => (
              <TouchableOpacity
                key={color}
                className={`w-8 h-8 rounded-full border-2 mr-3 mb-2 ${
                  selectedColor === color ? 'border-pink-500 border-[3px]' : 'border-gray-300'
                }`}
                style={{ backgroundColor: mapColorNameToHex(color) }}
                onPress={() => setSelectedColor(selectedColor === color ? null : color)}
              />
            ))}
          </View>

          {/* Material filter */}
          <Text className="text-base font-bold text-gray-800 mb-2 mt-4">Material</Text>
          <View className="flex-row flex-wrap">
            {MATERIAL_OPTIONS.map((material) => (
              <TouchableOpacity
                key={material}
                className={`px-3 py-2 rounded-full mr-2 mb-2 ${
                  selectedMaterial === material ? 'bg-pink-500' : 'bg-gray-100'
                }`}
                onPress={() => setSelectedMaterial(selectedMaterial === material ? null : material)}
              >
                <Text className={`text-sm ${selectedMaterial === material ? 'text-white' : 'text-gray-800'}`}>
                  {material}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Sort options */}
          <Text className="text-base font-bold text-gray-800 mb-2 mt-4">Sort</Text>
          <View className="flex-row flex-wrap">
            {SORT_OPTIONS.map((sortOption) => (
              <TouchableOpacity
                key={sortOption.key}
                className={`px-3 py-2 rounded-full mr-2 mb-2 ${
                  selectedSort === sortOption.key ? 'bg-pink-500' : 'bg-gray-100'
                }`}
                onPress={() => setSelectedSort(selectedSort === sortOption.key ? null : sortOption.key)}
              >
                <Text className={`text-sm ${selectedSort === sortOption.key ? 'text-white' : 'text-gray-800'}`}>
                  {sortOption.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Filter actions */}
          <View className="flex-row justify-end mt-4 pt-4 border-t border-gray-200">
            <TouchableOpacity className="px-4 py-2 mr-3" onPress={clearFilters}>
              <Text className="text-pink-500 font-semibold">Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-pink-500 px-4 py-2 rounded-lg" onPress={() => setFilterVisible(false)}>
              <Text className="text-white font-bold">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Items list */}
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
        {displayedItems.length > 0 ? (
          <View className="flex-row flex-wrap justify-between">
            {displayedItems.map((item: Item) => (
              <TouchableOpacity key={item._id} className="w-[45%] mb-5" onPress={() => handlePress(item._id)}>
                <ItemCard
                  color={item.color}
                  category={item.dressCode}
                  name={item.name}
                  imageUrl={{ uri: item.image }}
                  itemId={item._id}
                />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View className="flex-1 justify-center items-center py-10">
            <Text className="text-lg text-gray-500 text-center mb-4">
              {selectedColor || selectedMaterial || selectedSort
                ? 'No items match your filters'
                : `No ${typeName?.toString().toLowerCase()} items in your closet yet`}
            </Text>
            {(selectedColor || selectedMaterial || selectedSort) && (
              <TouchableOpacity className="bg-pink-500 px-5 py-2.5 rounded-lg" onPress={clearFilters}>
                <Text className="text-white text-base font-semibold">Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ClosetType;
