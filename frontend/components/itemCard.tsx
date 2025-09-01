import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface ItemCardProps {
  name: string;
  imageUrl: any;
  itemId: string;
  brand?: string;
  category?: string;
  color?: string;
  material?: string;
}

const ItemCard: React.FC<ItemCardProps> = ({ 
  name, 
  imageUrl, 
  itemId, 
  brand, 
  category, 
  color,
  material,
}) => {
  const router = useRouter();
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = () => {
    router.push(`/closet-single?id=${itemId}`);
  };

  // Map color names to actual colors for the color indicators
  const getColorValue = (colorName: string) => {
    const colorMap: { [key: string]: string } = {
      red: '#ef4444',
      blue: '#3b82f6',
      green: '#10b981',
      yellow: '#f59e0b',
      black: '#1f2937',
      white: '#ffffff',
      gray: '#6b7280',
      brown: '#92400e',
      pink: '#ec4899',
      purple: '#8b5cf6',
      orange: '#f97316',
      beige: '#d6d3d1',
    };
    return colorMap[colorName?.toLowerCase()] || '#9ca3af';
  };

  return (
    <Pressable 
      onPress={handlePress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      className={`relative bg-white rounded-2xl drop-shadow-sm border border-gray-100 overflow-hidden ${
        isPressed ? 'scale-95' : 'scale-100'
      } transition-transform duration-200`}
      style={{
        transform: [{ scale: isPressed ? 0.95 : 1 }],
        elevation: 3,
      }}
    >
      {/* Image container */}
      <View className="relative bg-gray-50" style={{ aspectRatio: 3/4 }}>
        <Image 
          source={imageUrl} 
          className="w-full h-full"
          style={{ 
            resizeMode: 'cover',
          }}
        />
        
        {/* Overlay gradient */}
        <LinearGradient
          colors={['transparent', 'transparent', 'rgba(0,0,0,0.2)']}
          className="absolute inset-0"
          pointerEvents="none"
        />
        
        {/* Category badge */}
        {category && (
          <View className="absolute top-3 left-3">
            <View className="inline-block bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-xs font-medium border border-white/50">
              <Text className="text-gray-800 text-xs font-medium">
                {category}
              </Text>
            </View>
          </View>
        )}
      </View>
      
      {/* Content */}
      <View className="p-4">
        {brand && (
          <Text className="text-gray-500 text-sm mb-1 uppercase tracking-wide">
            {brand}
          </Text>
        )}
        
        <Text 
          className="text-gray-900 font-semibold capitalize leading-tight mb-2"
          numberOfLines={2}
        >
          {name}
        </Text>
        
        {/* Material info */}
        {material && (
          <Text className="text-gray-500 text-xs mb-2">
            {material}
          </Text>
        )}
        
        {/* Action row */}
        <View className="flex-row items-center justify-between pt-2">
          {/* Color indicators */}
          <View className="flex-row items-center space-x-2">
            {color && (
              <View 
                className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: getColorValue(color) }}
              />
            )}

          </View>
          
          {/* View button */}
          <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.7}
          >
            <Text className="text-rose-600 text-xs font-medium">
              View
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
};

export default ItemCard;