import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const UploadWidget = ({ onFileUploaded, disabled }) => {
  const handleUpload = async () => {
    try {
      // Demander la permission d'accéder à la galerie
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        alert("You've refused to allow this app to access your photos and videos!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        const formData = new FormData();
        
        // Déterminer le type de fichier
        const fileType = asset.type === 'video' ? 'video' : 'image';
        const fileName = asset.uri.split('/').pop();
        
        formData.append('file', {
          uri: asset.uri,
          type: asset.type === 'video' ? 'video/mp4' : 'image/jpeg',
          name: fileName,
        });
        formData.append('upload_preset', 'ml_default');

        // Utiliser l'URL appropriée en fonction du type de fichier
        const uploadUrl = `https://api.cloudinary.com/v1_1/diujth5dh/${fileType}/upload`;

        const response = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.secure_url) {
          const newFile = {
            publicId: data.public_id,
            url: data.secure_url,
            resourceType: data.resource_type,
            format: data.format
          };
          onFileUploaded(newFile);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabledButton]}
      onPress={handleUpload}
      disabled={disabled}
    >
      <Text style={styles.buttonText}>Add evidence</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#C2002F',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#FFB3B3',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UploadWidget;