import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { horizontalScale, verticalScale, moderateScale } from '@/lib/utilities/Metrics';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';

interface EventImageSectionProps {
  imageUri: string | null;
  onImageChange: (uri: string | null, file?: { uri: string; type: string; name: string }) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB в байтах

export const EventImageSection: React.FC<EventImageSectionProps> = ({ imageUri, onImageChange }) => {
  const placeholderColor = useThemeColor({}, 'placeholder');
  const sectionBackground = useThemeColor({}, 'sectionBackground');
  const borderColor = useThemeColor({}, 'divider');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Need access', 'Allow access to the photo gallery to select images');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    console.log('Image picker result:', result);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0];
      console.log('Selected image:', selectedImage);

      // Проверяем размер файла
      try {
        const fileInfo = await FileSystem.getInfoAsync(selectedImage.uri);
        if (fileInfo.exists && fileInfo.size) {
          if (fileInfo.size > MAX_FILE_SIZE) {
            Alert.alert('Error', 'Image size should not exceed 5MB');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking file size:', error);
        Alert.alert('Error', 'Failed to check image size');
        return;
      }
      
      // Создаем объект файла для отправки
      const file = {
        uri: selectedImage.uri,
        type: 'image/jpeg',
        name: `image-${Date.now()}.jpg`
      };
      
      onImageChange(selectedImage.uri, file);
    }
  };

  const styles = StyleSheet.create({
    section: {
      marginTop: moderateScale(8),
      marginBottom: moderateScale(8),
      flex: 1,
    },
    imageContainer: {
      alignItems: 'flex-start',
      aspectRatio: 1,
    },
    imagePlaceholder: {
      width: moderateScale(170),
      height: moderateScale(170),
      borderRadius: moderateScale(8),
      backgroundColor: sectionBackground,
      borderWidth: 1,
      borderColor: borderColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectedImage: {
      width: moderateScale(170),
      height: moderateScale(170),
      borderRadius: moderateScale(8),
      borderWidth: 1,
      borderColor: borderColor,
    },
    imageText: {
      fontSize: moderateScale(14),
      color: placeholderColor,
      marginTop: moderateScale(8),
    },
  });

  //console.log('Current imageUri:', imageUri);

  return (
    <View style={styles.section}>
      <View style={styles.imageContainer}>
        <TouchableOpacity onPress={pickImage}>
          {imageUri ? (
            <Image 
              source={{ uri: imageUri }} 
              style={styles.selectedImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <IconSymbol name="photo" size={40} color={placeholderColor} />
            </View>
          )}
          <ThemedText style={styles.imageText}>
            {imageUri ? "Click to change" : "Click to choose image"}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}; 