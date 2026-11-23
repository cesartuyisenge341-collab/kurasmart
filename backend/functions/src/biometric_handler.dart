/// Handles biometric data extraction and validation
class BiometricHandler {
  
  /// Extract biometric data from Firestore document
  Map<String, dynamic>? extractBiometricsFromFirestore(Map<String, dynamic> firestoreData) {
    try {
      final biometrics = firestoreData['biometrics']?['mapValue']?['fields'];
      
      if (biometrics == null) return null;
      
      return {
        'childId': firestoreData['childId']?['stringValue'],
        'deviceId': firestoreData['deviceId']?['stringValue'],
        'data': {
          'heartRate': biometrics['heartRate']?['integerValue'],
          'temperature': double.tryParse(biometrics['temperature']?['doubleValue']?.toString() ?? '0'),
          'oxygenLevel': biometrics['oxygenLevel']?['integerValue'],
          'respirationRate': biometrics['respirationRate']?['integerValue'],
          'skinConductance': double.tryParse(biometrics['skinConductance']?['doubleValue']?.toString() ?? '0'),
        },
        'motion': {
          'detected': firestoreData['motion']?['mapValue']?['fields']['detected']?['booleanValue'],
          'intensity': double.tryParse(firestoreData['motion']?['mapValue']?['fields']['intensity']?['doubleValue']?.toString() ?? '0'),
        },
        'environment': {
          'ambientTemp': double.tryParse(firestoreData['environment']?['mapValue']?['fields']['ambientTemp']?['doubleValue']?.toString() ?? '0'),
          'humidity': double.tryParse(firestoreData['environment']?['mapValue']?['fields']['humidity']?['doubleValue']?.toString() ?? '0'),
        },
        'timestamp': firestoreData['timestamp']?['timestampValue'],
      };
    } catch (e) {
      print('Error extracting biometrics: $e');
      return null;
    }
  }

  /// Validate biometric data integrity
  bool validateBiometrics(Map<String, dynamic> biometrics) {
    try {
      final data = biometrics['data'];
      
      // Check required fields
      if (data['heartRate'] == null || data['temperature'] == null) {
        return false;
      }

      // Check value ranges
      final hr = data['heartRate'] as int?;
      final temp = data['temperature'] as double?;
      final o2 = data['oxygenLevel'] as int?;

      if (hr == null || temp == null) return false;
      
      // Heart rate: 0-250 bpm
      if (hr < 0 || hr > 250) return false;
      
      // Temperature: 30-42 degrees C
      if (temp < 30 || temp > 42) return false;
      
      // Oxygen: 0-100%
      if (o2 != null && (o2 < 0 || o2 > 100)) return false;

      return true;
    } catch (e) {
      print('Error validating biometrics: $e');
      return false;
    }
  }

  /// Normalize biometric data (handle variations in units)
  Map<String, dynamic> normalizeBiometrics(Map<String, dynamic> biometrics) {
    try {
      final data = biometrics['data'];
      
      return {
        ...biometrics,
        'data': {
          'heartRate': (data['heartRate'] as num).toInt(),
          'temperature': (data['temperature'] as num).toDouble(),
          'oxygenLevel': (data['oxygenLevel'] as num?)?.toInt() ?? 98,
          'respirationRate': (data['respirationRate'] as num?)?.toInt() ?? 20,
          'skinConductance': (data['skinConductance'] as num?)?.toDouble() ?? 0.0,
        }
      };
    } catch (e) {
      print('Error normalizing biometrics: $e');
      return biometrics;
    }
  }

  /// Calculate comfort score based on biometrics
  int calculateComfortScore(Map<String, dynamic> biometrics) {
    int score = 100;
    final data = biometrics['data'];
    
    // Heart rate assessment
    final hr = data['heartRate'] as int?;
    if (hr != null) {
      if (hr > 140) {
        score -= 20; // Elevated
      } else if (hr < 80) score -= 10; // Too low
    }

    // Temperature assessment
    final temp = data['temperature'] as double?;
    if (temp != null) {
      if (temp > 38) {
        score -= 25; // Fever
      } else if (temp < 36) score -= 15; // Low temp
    }

    // Oxygen assessment
    final o2 = data['oxygenLevel'] as int?;
    if (o2 != null && o2 < 95) {
      score -= 20; // Low oxygen
    }

    // Motion assessment
    final motion = biometrics['motion'];
    if (motion != null && !motion['detected']) {
      score -= 5; // No motion (could be sleeping)
    }

    // Environment assessment
    final env = biometrics['environment'];
    if (env != null) {
      final humidity = env['humidity'] as double?;
      if (humidity != null && (humidity < 30 || humidity > 70)) {
        score -= 5; // Suboptimal humidity
      }
    }

    return score.clamp(0, 100);
  }
}
