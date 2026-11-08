/**
 * Photo and location helpers that talk to the device (camera, gallery, GPS).
 * Each function returns null when the user cancels and throws an Error with a
 * friendly message when permission is denied or the hardware fails.
 */
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import {Platform} from 'react-native';

import type {GeoPoint} from './types';

const PHOTO_DIR = `${FileSystem.documentDirectory ?? ''}report-photos/`;

/**
 * Image picker results live in a temporary cache folder that the OS can clear.
 * Copy the photo into the app's permanent document folder so the saved report
 * still shows its photo after restarts (part of the persistence requirement).
 */
async function persistPhoto(tempUri: string): Promise<string> {
  if (Platform.OS === 'web' || !FileSystem.documentDirectory) {
    return tempUri; // no file system on web; keep the blob URL
  }
  await FileSystem.makeDirectoryAsync(PHOTO_DIR, {intermediates: true}).catch(
    () => {},
  );
  const ext = tempUri.split('.').pop()?.split('?')[0] || 'jpg';
  const dest = `${PHOTO_DIR}${Date.now()}.${ext}`;
  await FileSystem.copyAsync({from: tempUri, to: dest});
  return dest;
}

export async function pickPhoto(
  source: 'camera' | 'library',
): Promise<string | null> {
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    quality: 0.6, // smaller files, still clear enough for a report
    allowsEditing: true,
  };

  let result: ImagePicker.ImagePickerResult;
  if (source === 'camera') {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      throw new Error(
        'Camera permission is needed to take a photo. You can enable it in Settings.',
      );
    }
    result = await ImagePicker.launchCameraAsync(options);
  } else {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      throw new Error('Photo library permission is needed to choose a photo.');
    }
    result = await ImagePicker.launchImageLibraryAsync(options);
  }

  if (result.canceled || !result.assets?.[0]?.uri) {
    return null;
  }
  return persistPhoto(result.assets[0].uri);
}

export async function getCurrentLocation(): Promise<GeoPoint> {
  const perm = await Location.requestForegroundPermissionsAsync();
  if (!perm.granted) {
    throw new Error(
      'Location permission was denied. Add a landmark instead so staff can find it.',
    );
  }
  const pos = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  return {latitude: pos.coords.latitude, longitude: pos.coords.longitude};
}
