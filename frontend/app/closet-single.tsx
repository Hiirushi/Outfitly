import React, { useState, useEffect } from 'react';
import { View, Text, Image, ActivityIndicator, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiUtils, itemsAPI } from '@/services/api';

// Define the Item interface
export interface Item {
  _id: string;
  name: string;
  image: string | any;
  itemType: string;
  color?: string;
  material?: string;
  brand?: string;
  dressCode?: string;
  occasion?: string;
  usageCount?: number;
}

const ClosetSingle = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log(item);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if user is authenticated
        const isAuth = await apiUtils.isAuthenticated();
        if (!isAuth) {
          setError('Please log in to view this item');
          return;
        }

        const response = await itemsAPI.getItem(id as string);
        const fetchedItem = response.data || response;
        setItem(fetchedItem);
      } catch (err: any) {
        console.error('Error fetching item:', err);

        if (apiUtils.handleAuthError(err)) {
          setError('Session expired. Please log in again.');
          return;
        }

        if (err.response?.status === 404) {
          setError("Item not found or you don't have permission to view it.");
        } else {
          setError('Failed to load item. Please try again.');
        }

        Alert.alert('Error', 'Failed to load item details. Please try again.', [{ text: 'OK' }]);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItem();
    }
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gradient-to-b from-gray-50 to-gray-100">
        <ActivityIndicator size="large" color="#ec4899" />
        <Text className="mt-4 text-base text-gray-600">Loading item details...</Text>
      </View>
    );
  }

  if (error || !item) {
    return (
      <View className="flex-1 justify-center items-center bg-gradient-to-b from-gray-50 to-gray-100">
        <Text className="text-lg text-red-500 mt-5 text-center px-6">{error || 'Item not found!'}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <View className="relative bg-white">
        <View className="absolute inset-0 bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50" />

        <View className="relative px-4">
          <View className="flex-row items-center justify-between py-3">
            <TouchableOpacity
              className="size-8 rounded-full bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center"
              style={{ marginTop: 20 }}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={16} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView>
        {/* Product Image */}
        <View className="px-6 py-6">
          <View className="bg-white rounded-xl drop-shadow-sm border border-gray-100 overflow-hidden mb-6">
            <View className="aspect-[11/12] relative">
              <Image
                source={typeof item.image === 'string' ? { uri: item.image } : item.image}
                className="w-full h-full"
                resizeMode="cover"
                onError={() => console.log('Image failed to load')}
              />
            </View>
          </View>

          {/* Product Info */}
          <View className="bg-white rounded-2xl p-6 border border-white/50 drop-shadow-sm mb-6">
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900 mb-2 capitalize">{item.name}</Text>
              {item.brand && <Text className="text-gray-500 uppercase tracking-wide text-sm mb-2">{item.brand}</Text>}
              {item.dressCode && (
                <View className="bg-gradient-to-r from-rose-100 to-pink-100 self-start px-3 py-1 rounded-full border border-rose-200/50">
                  <Text className="text-rose-800 text-sm font-medium">{item.dressCode}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Product Details */}
          <View className="bg-white rounded-2xl p-6 border border-white/50 drop-shadow-sm mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Details</Text>

            <View className="space-y-4">
              {item.color && (
                <View className="flex-row items-center justify-between py-2">
                  <View className="flex-row items-center space-x-3">
                    <View className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-white shadow-sm" />
                    <Text className="text-gray-700 font-medium">Color</Text>
                  </View>
                  <Text className="text-gray-900 font-medium">{item.color}</Text>
                </View>
              )}

              {item.material && (
                <View className="flex-row items-center justify-between py-2">
                  <View className="flex-row items-center space-x-3">
                    <View className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-100 to-emerald-200 border-2 border-white shadow-sm flex items-center justify-center">
                      <Text className="text-xs">🌿</Text>
                    </View>
                    <Text className="text-gray-700 font-medium">Material</Text>
                  </View>
                  <Text className="text-gray-900 font-medium">{item.material}</Text>
                </View>
              )}

              {(item.occasion || item.dressCode) && (
                <View className="flex-row items-center justify-between py-2">
                  <View className="flex-row items-center space-x-3">
                    <View className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-200 border-2 border-white shadow-sm flex items-center justify-center">
                      <Text className="text-xs">👔</Text>
                    </View>
                    <Text className="text-gray-700 font-medium">Occasion</Text>
                  </View>
                  <Text className="text-gray-900 font-medium">{item.occasion || item.dressCode}</Text>
                </View>
              )}
            </View>
            {/* Usage Analytics */}
          </View>
          <View className="bg-white rounded-2xl p-6 border border-white/50 drop-shadow-sm mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Usage Analytics</Text>

            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <View className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center mb-2">
                  <Ionicons name="trending-up" size={24} color="white" />
                </View>
                <Text className="text-xl font-bold text-gray-900">{item.usageCount || 0}</Text>
                <Text className="text-xs text-gray-600">Times Worn</Text>
              </View>

              <View className="items-center flex-1">
                <View className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mb-2">
                  <Ionicons name="calendar" size={24} color="white" />
                </View>
                <Text className="text-xl font-bold text-gray-900">5</Text>
                <Text className="text-xs text-gray-600">In Outfits</Text>
              </View>

              <View className="items-center flex-1">
                <View className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center mb-2">
                  <Ionicons name="color-palette" size={24} color="white" />
                </View>
                <Text className="text-xl font-bold text-gray-900">8</Text>
                <Text className="text-xs text-gray-600">Style Matches</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ClosetSingle;
