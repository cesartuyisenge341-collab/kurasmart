/// Processes biometric data and generates alerts
class AlertProcessor {
  
  // Age-based normal ranges (for infants)
  static final Map<String, Map<String, dynamic>> ageNormalRanges = {
    '0-3m': {
      'heartRate': {'min': 100, 'max': 160},
      'temperature': {'min': 36.5, 'max': 37.5},
      'oxygenLevel': {'min': 95, 'max': 100},
      'respirationRate': {'min': 30, 'max': 60},
    },
    '3-6m': {
      'heartRate': {'min': 90, 'max': 150},
      'temperature': {'min': 36.5, 'max': 37.5},
      'oxygenLevel': {'min': 95, 'max': 100},
      'respirationRate': {'min': 25, 'max': 50},
    },
    '6-12m': {
      'heartRate': {'min': 80, 'max': 140},
      'temperature': {'min': 36.5, 'max': 37.5},
      'oxygenLevel': {'min': 95, 'max': 100},
      'respirationRate': {'min': 20, 'max': 40},
    },
    '12-24m': {
      'heartRate': {'min': 75, 'max': 130},
      'temperature': {'min': 36.5, 'max': 37.5},
      'oxygenLevel': {'min': 95, 'max': 100},
      'respirationRate': {'min': 20, 'max': 35},
    },
  };

  /// Detect anomalies in biometric data
  List<Map<String, dynamic>> detectAnomalies({
    required Map<String, dynamic> childData,
    required Map<String, dynamic> readingData,
    required String childId,
  }) {
    final alerts = <Map<String, dynamic>>[];

    try {
      final biometrics = readingData['biometrics'];
      if (biometrics == null) return alerts;

      final ageGroup = _getAgeGroup(childData['dateOfBirth']);
      final normalRanges = ageNormalRanges[ageGroup] ?? ageNormalRanges['0-3m']!;

      // Check Heart Rate
      final hr = biometrics['heartRate'] as int?;
      if (hr != null) {
        final hrRange = normalRanges['heartRate'] as Map;
        if (hr < hrRange['min']) {
          alerts.add({
            'type': 'heart_rate_low',
            'severity': 'warning',
            'message': 'Heart rate low: $hr bpm',
            'value': hr,
            'range': [hrRange['min'], hrRange['max']],
          });
        } else if (hr > hrRange['max']) {
          alerts.add({
            'type': 'heart_rate_high',
            'severity': 'critical',
            'message': 'Heart rate elevated: $hr bpm',
            'value': hr,
            'range': [hrRange['min'], hrRange['max']],
          });
        }
      }

      // Check Temperature
      final temp = biometrics['temperature'] as double?;
      if (temp != null) {
        final tempRange = normalRanges['temperature'] as Map;
        if (temp > 38.5) {
          alerts.add({
            'type': 'fever',
            'severity': 'critical',
            'message': 'High fever detected: ${temp.toStringAsFixed(1)}°C',
            'value': temp,
            'range': [tempRange['min'], tempRange['max']],
          });
        } else if (temp > 38.0) {
          alerts.add({
            'type': 'elevated_temperature',
            'severity': 'warning',
            'message': 'Elevated temperature: ${temp.toStringAsFixed(1)}°C',
            'value': temp,
            'range': [tempRange['min'], tempRange['max']],
          });
        } else if (temp < 36.0) {
          alerts.add({
            'type': 'hypothermia',
            'severity': 'warning',
            'message': 'Low body temperature: ${temp.toStringAsFixed(1)}°C',
            'value': temp,
            'range': [tempRange['min'], tempRange['max']],
          });
        }
      }

      // Check Oxygen Level
      final o2 = biometrics['oxygenLevel'] as int?;
      if (o2 != null) {
        if (o2 < 92) {
          alerts.add({
            'type': 'low_oxygen',
            'severity': 'critical',
            'message': 'Oxygen saturation critically low: $o2%',
            'value': o2,
            'range': [95, 100],
          });
        } else if (o2 < 95) {
          alerts.add({
            'type': 'low_oxygen',
            'severity': 'warning',
            'message': 'Oxygen saturation low: $o2%',
            'value': o2,
            'range': [95, 100],
          });
        }
      }

      // Check Respiration Rate
      final rr = biometrics['respirationRate'] as int?;
      if (rr != null) {
        final rrRange = normalRanges['respirationRate'] as Map;
        if (rr > (rrRange['max'] as int) * 1.2) {
          alerts.add({
            'type': 'rapid_breathing',
            'severity': 'warning',
            'message': 'Rapid breathing detected: $rr breaths/min',
            'value': rr,
            'range': [rrRange['min'], rrRange['max']],
          });
        } else if (rr < (rrRange['min'] as int) * 0.5) {
          alerts.add({
            'type': 'slow_breathing',
            'severity': 'critical',
            'message': 'Shallow breathing: $rr breaths/min',
            'value': rr,
            'range': [rrRange['min'], rrRange['max']],
          });
        }
      }

      // Check Environment
      final environment = readingData['environment'];
      if (environment != null) {
        final humidity = environment['humidity'] as double?;
        if (humidity != null) {
          if (humidity > 80) {
            alerts.add({
              'type': 'high_humidity',
              'severity': 'warning',
              'message': 'High humidity: ${humidity.toStringAsFixed(1)}%',
              'value': humidity,
              'range': [30, 70],
            });
          } else if (humidity < 20) {
            alerts.add({
              'type': 'low_humidity',
              'severity': 'warning',
              'message': 'Low humidity: ${humidity.toStringAsFixed(1)}%',
              'value': humidity,
              'range': [30, 70],
            });
          }
        }
      }

      // Check Motion (no movement for extended period)
      final motion = readingData['motion'];
      if (motion != null && motion['detected'] == false) {
        final noMotionDuration = _getNoMotionDuration(childId);
        if (noMotionDuration > 1800) { // 30 minutes
          alerts.add({
            'type': 'prolonged_inactivity',
            'severity': 'warning',
            'message': 'No motion detected for ${(noMotionDuration / 60).toStringAsFixed(0)} minutes',
            'value': noMotionDuration,
            'range': [0, 1800],
          });
        }
      }

    } catch (e) {
      print('Error detecting anomalies: $e');
    }

    return alerts;
  }

  /// Get age group from date of birth
  String _getAgeGroup(String? dateOfBirth) {
    if (dateOfBirth == null) return '0-3m';
    
    try {
      final dob = DateTime.parse(dateOfBirth);
      final now = DateTime.now();
      final ageInMonths = (now.year - dob.year) * 12 + (now.month - dob.month);

      if (ageInMonths <= 3) return '0-3m';
      if (ageInMonths <= 6) return '3-6m';
      if (ageInMonths <= 12) return '6-12m';
      return '12-24m';
    } catch (e) {
      return '0-3m';
    }
  }

  /// Get duration of no motion (simplified - would use database in production)
  int _getNoMotionDuration(String childId) {
    // In production, query database for motion history
    // For now, return 0 (no prolonged inactivity)
    return 0;
  }

  /// Group alerts by type for daily report
  Map<String, dynamic> groupAlertsByType(List<Map<String, dynamic>> alerts) {
    final grouped = <String, Map<String, dynamic>>{};

    for (final alert in alerts) {
      final type = alert['type'];
      if (grouped[type] == null) {
        grouped[type] = {
          'type': type,
          'count': 0,
          'maxValue': 0,
          'minValue': double.infinity,
        };
      }

      final group = grouped[type]!;
      group['count'] = (group['count'] as int) + 1;
      
      final value = alert['biometricValue'];
      if (value is num) {
        if (value > (group['maxValue'] as num)) {
          group['maxValue'] = value;
        }
        if (value < (group['minValue'] as double)) {
          group['minValue'] = value;
        }
      }
    }

    return grouped;
  }
}
