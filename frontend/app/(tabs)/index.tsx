import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, ActivityIndicator, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OutfitTypeCard from '../../components/ItemTypesCard';
import { itemsAPI } from '../../services/api';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { itemTypesAPI } from '@/services/itemTypesAPI';
import { AddItemModal } from '@/components/AddItemModal';

interface ClosetCategory {
  id: string;
  type: string;
  items_available: number;
  imageUrl?: string;
}

interface Item {
  _id: string;
  name: string;
  image: string;
  itemType?:
    | {
        _id: string;
        name: string;
      }
    | string;
}

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, token, logout } = useAuth();
  const [categories, setCategories] = useState<ClosetCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);
  const [totalItems, setTotalItems] = useState<number>(0);

  const fetchCategoriesWithItems = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      if (!isAuthenticated) {
        Alert.alert('Authentication Required', 'Please log in to view your items.', [
          { text: 'OK', onPress: () => router.replace('/auth/login') },
        ]);
        return;
      }

      console.log('Fetching categories with authentication...');

      // Fetch item types (single API call - global data)
      const itemTypesResponse = await itemTypesAPI.getTypes();
      console.log('Item types fetched:', itemTypesResponse.length);

      // Fetch ALL user items (single API call - user-specific data)
      const userItemsResponse = await itemsAPI.getItems();
      const userItems: Item[] = userItemsResponse.success ? userItemsResponse.data : [];

      console.log('User items fetched:', userItems.length);
      setTotalItems(userItems.length); // Set total items count

      console.log(
        'Sample items with types:',
        userItems.slice(0, 3).map((item) => ({
          name: item.name,
          itemType: item.itemType,
        })),
      );

      // Group user items by itemType to create categories
      const categoriesWithItems: ClosetCategory[] = [];

      itemTypesResponse.forEach((itemType: any) => {
        console.log(`Processing item type: ${itemType.name} (ID: ${itemType._id})`);

        // Filter user's items that belong to this item type
        const itemsForThisType = userItems.filter((item) => {
          // Handle both populated and non-populated itemType references
          const itemTypeId = item.itemType && typeof item.itemType === 'object' ? item.itemType._id : item.itemType;

          const matches = itemTypeId === itemType._id;
          if (matches) {
            console.log(`Item "${item.name}" matches type "${itemType.name}"`);
          }
          return matches;
        });

        console.log(`Found ${itemsForThisType.length} items for type "${itemType.name}"`);

        // Only include categories that have items
        if (itemsForThisType.length > 0) {
          categoriesWithItems.push({
            id: itemType._id,
            type: itemType.name,
            items_available: itemsForThisType.length,
            imageUrl: itemsForThisType[0]?.image || undefined,
          });
        }
      });

      // Sort categories by item count (most items first)
      const sortedCategories = categoriesWithItems.sort((a, b) => b.items_available - a.items_available);

      console.log('Final categories with items:', sortedCategories);
      setCategories(sortedCategories);
    } catch (err: any) {
      console.error('Error fetching categories:', err);

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

      const errorMessage = err.response?.data?.message || err.message || 'Failed to load categories';
      setError(errorMessage);
      Alert.alert('Error', 'Failed to load categories. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        fetchCategoriesWithItems();
      } else {
        setLoading(false);
        router.replace('/auth/login');
      }
    }, [isAuthenticated]),
  );

  const handleRetry = (): void => {
    fetchCategoriesWithItems();
  };

  const handleRefresh = (): void => {
    fetchCategoriesWithItems();
  };

  const handleAddItem = () => {
    if (!isAuthenticated) {
      Alert.alert('Authentication Required', 'Please log in to add items.');
      return;
    }
    setIsAddModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsAddModalVisible(false);
  };

  const handleItemAdded = () => {
    setIsAddModalVisible(false);
    fetchCategoriesWithItems(); // Refresh the list after adding item
  };

  const handleCategoryPress = (categoryId: string, categoryName: string) => {
    if (!categoryId) {
      Alert.alert('Error', 'Unable to navigate to this category.');
      return;
    }

    console.log(`Navigating to category: ${categoryName} (${categoryId})`);

    // Navigate with both ID and name for better UX
    router.push(`/closet-type?typeId=${categoryId}&typeName=${encodeURIComponent(categoryName)}`);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning!';
    if (hour < 17) return 'Good afternoon!';
    return 'Good evening!';
  };

  // Header component
  const renderHeader = () => (
    <View className="pb-5">
      {/* Top header with title and icons */}
      <View className="flex-row items-center justify-center mb-5 h-40 bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 rounded-b-3xl drop-shadow-sm">
        <View className="items-center flex-1">
          <Text className="text-2xl font-bold text-[#B91C7C] mb-0.5">My Closet</Text>
          <Text className="text-sm text-gray-600">Create stunning outfits</Text>
        </View>
      </View>

      <View className='px-4'>
        {/* Greeting section */}
        <View className="flex-row justify-between items-center bg-[#FCFDFD] p-4 rounded-xl mb-5 drop-shadow-sm">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-800 mb-1">{getGreeting()} ✨</Text>
            <Text className="text-sm text-gray-600">Ready to create amazing outfits?</Text>
          </View>
        </View>

        {/* Stats section */}
        <View className="flex-row gap-4 justify-around ">
          <View className="items-center flex-1 py-3 rounded-xl bg-[#FCFCFD]">
            <Text className="text-2xl font-bold text-gray-800 mb-1">{totalItems}</Text>
            <Text className="text-xs text-gray-600 font-medium tracking-wide">TOTAL ITEMS</Text>
          </View>

          <View className="items-center flex-1 py-3 rounded-xl bg-[#FCFCFD]">
            <Text className="text-2xl font-bold text-[#E91E63] mb-1">12</Text>
            <Text className="text-xs text-gray-600 font-medium tracking-wide">OUTFITS</Text>
          </View>

          <View className="items-center flex-1 py-3 rounded-xl bg-[#FCFCFD]">
            <Text className="text-2xl font-bold text-[#9C27B0] mb-1">5</Text>
            <Text className="text-xs text-gray-600 font-medium tracking-wide">THIS WEEK</Text>
          </View>
        </View>
      </View>
    </View>
  );

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-[#f8f9fa]">
        <View className="flex-1 justify-center items-center p-5">
          <Ionicons name="lock-closed-outline" size={64} color="#666" />
          <Text className="text-xl font-semibold text-gray-800 mt-5 mb-2.5">Authentication Required</Text>
          <Text className="text-base text-gray-600 text-center mb-8">Please log in to view your closet items.</Text>
          <TouchableOpacity className="bg-blue-500 px-8 py-3 rounded-lg" onPress={() => router.replace('/auth/login')}>
            <Text className="text-white text-base font-semibold">Go to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 bg-[#f8f9fa]">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text className="mt-2.5 text-base text-gray-600">Loading your closet...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-[#f8f9fa]">
        <View className="flex-1 justify-center items-center p-5">
          <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
          <Text className="text-base text-red-500 text-center my-4 leading-6">{error}</Text>
          <TouchableOpacity className="bg-blue-500 px-5 py-3 rounded-lg" onPress={handleRetry}>
            <Text className="text-white text-base font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
  <View className="flex-1 bg-[#F6F7F9]">
    {renderHeader()}
    
    <View className="flex-1 flex-col gap-4 px-4">
      <Text className="text-base font-semibold text-gray-800">Categories</Text>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OutfitTypeCard
            category={item.type}
            itemCount={item.items_available}
            imageUrl={item.imageUrl}
            onPress={() => handleCategoryPress(item.id, item.type)}
          />
        )}
        refreshing={loading}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}

      />
    </View>

    <TouchableOpacity
      className="absolute bottom-4 right-4 w-12 h-12 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full shadow-lg flex items-center justify-center"
      onPress={handleAddItem}
    >
      <Ionicons name="add" size={28} color="#fff" />
    </TouchableOpacity>

    <AddItemModal visible={isAddModalVisible} onClose={handleCloseModal} onItemAdded={handleItemAdded} />
  </View>
);
}
