import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ItemTypeCardProps {
  category: string;
  itemCount: number;
  imageUrl: any;
  onPress?: () => void;
}

const ItemTypeCard: React.FC<ItemTypeCardProps> = ({ category, itemCount, imageUrl, onPress }) => {
  const [isPressed, setIsPressed] = useState(false);

  // Different gradient colors for variety
  const gradients = [
    ['#667eea', '#764ba2'], // Purple-blue
    ['#f093fb', '#f5576c'], // Pink-red
    ['#4facfe', '#00f2fe'], // Blue-cyan
    ['#43e97b', '#38f9d7'], // Green-teal
    ['#ffecd2', '#fcb69f'], // Orange-peach
    ['#a8edea', '#fed6e3'], // Mint-pink
  ] as const;

  // Simple hash function to consistently assign colors based on category
  const getGradientForCategory = (category: string) => {
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
  };

  const selectedGradient = getGradientForCategory(category);

  return (
    <TouchableOpacity
      className={`relative overflow-hidden rounded-xl bg-white drop-shadow-sm mb-3 ${isPressed ? 'transform -translate-y-1' : ''}`}
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      activeOpacity={0.95}
      style={{

        elevation: isPressed ? 6 : 2,
      }}
    >
      {/* Gradient overlay */}
      <LinearGradient
        colors={[...selectedGradient, 'transparent'] as const}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className={`absolute rounded-xl inset-0 ${isPressed ? 'opacity-20' : 'opacity-10'}`}
      />

      <View className="relative p-3 flex-row items-center space-x-4">
        {/* Image container */}
        <View className="relative w-12 h-12 rounded-xl overflow-hidden drop-shadow-sm">
          {imageUrl ? (
            <>
              <Image
                source={typeof imageUrl === 'string' ? { uri: imageUrl } : imageUrl}
                className={`w-full h-full ${isPressed ? 'transform scale-110' : ''}`}
                resizeMode="cover"
              />
              {/* Overlay for better contrast */}
              <View className={`absolute inset-0 ${isPressed ? 'bg-black/0' : 'bg-black/10'}`} />
            </>
          ) : (
            <View className="w-full h-full bg-gray-200 items-center justify-center">
              <LinearGradient
                colors={selectedGradient}
                className="w-full h-full items-center justify-center"
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="shirt-outline" size={24} color="rgba(255,255,255,0.8)" />
              </LinearGradient>
            </View>
          )}
        </View>

        {/* Content */}
        <View className="flex-1 min-w-0">
          <Text className="text-gray-900 font-semibold text-lg leading-tight mb-1">{category}</Text>
          <Text className="text-gray-500 text-sm">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </Text>
        </View>

        {/* Arrow indicator */}
        <View
          className={`w-8 h-8 rounded-full ${isPressed ? 'bg-gray-100' : 'bg-gray-50'} items-center justify-center`}
        >
          <Ionicons
            name="chevron-forward"
            size={16}
            color={isPressed ? '#4B5563' : '#9CA3AF'}
            style={{
              transform: isPressed ? [{ translateX: 2 }] : [{ translateX: 0 }],
            }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ItemTypeCard;
