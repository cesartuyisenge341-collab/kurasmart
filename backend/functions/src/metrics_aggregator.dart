/// Aggregates sensor readings into daily metrics
class MetricsAggregator {
  
  /// Aggregate readings for a specific day
  Map<String, dynamic> aggregateReadings({
    required List<Map<String, dynamic>> readings,
    required DateTime date,
  }) {
    if (readings.isEmpty) {
      return _emptyMetrics(date);
    }

    final biometrics = readings.map((r) => r['biometrics']).whereType<Map<String, dynamic>>().toList();
    
    if (biometrics.isEmpty) {
      return _emptyMetrics(date);
    }

    // Extract all heart rates
    final heartRates = biometrics
        .map((b) => b['heartRate'] as int?)
        .whereType<int>()
        .toList();

    // Extract all temperatures
    final temperatures = biometrics
        .map((b) => b['temperature'] as double?)
        .whereType<double>()
        .toList();

    // Extract all oxygen levels
    final oxygenLevels = biometrics
        .map((b) => b['oxygenLevel'] as int?)
        .whereType<int>()
        .toList();

    // Extract respiration rates
    final respirationRates = biometrics
        .map((b) => b['respirationRate'] as int?)
        .whereType<int>()
        .toList();

    // Count motion occurrences
    int motionCount = 0;
    int noMotionCount = 0;
    for (final reading in readings) {
      final motion = reading['motion'];
      if (motion != null && motion is Map) {
        if (motion['detected'] == true) {
          motionCount++;
        } else {
          noMotionCount++;
        }
      }
    }

    // Calculate metrics
    return {
      'date': date.toIso8601String().split('T')[0],
      'totalReadings': readings.length,
      'metrics': {
        'heartRate': {
          'average': _calculateAverage(heartRates),
          'max': _calculateMax(heartRates),
          'min': _calculateMin(heartRates),
          'samples': heartRates.length,
        },
        'temperature': {
          'average': _calculateAverage(temperatures),
          'max': _calculateMax(temperatures),
          'min': _calculateMin(temperatures),
          'samples': temperatures.length,
        },
        'oxygenLevel': {
          'average': _calculateAverage(oxygenLevels),
          'max': _calculateMax(oxygenLevels),
          'min': _calculateMin(oxygenLevels),
          'samples': oxygenLevels.length,
        },
        'respirationRate': {
          'average': _calculateAverage(respirationRates),
          'max': _calculateMax(respirationRates),
          'min': _calculateMin(respirationRates),
          'samples': respirationRates.length,
        },
        'motion': {
          'detectedCount': motionCount,
          'noMotionCount': noMotionCount,
          'motionPercentage': motionCount > 0 
              ? (motionCount / (motionCount + noMotionCount) * 100).toStringAsFixed(1)
              : '0.0',
        },
      },
      'timestamp': DateTime.now().toIso8601String(),
    };
  }

  /// Get empty metrics template
  Map<String, dynamic> _emptyMetrics(DateTime date) {
    return {
      'date': date.toIso8601String().split('T')[0],
      'totalReadings': 0,
      'metrics': {
        'heartRate': {'average': 0, 'max': 0, 'min': 0, 'samples': 0},
        'temperature': {'average': 0, 'max': 0, 'min': 0, 'samples': 0},
        'oxygenLevel': {'average': 0, 'max': 0, 'min': 0, 'samples': 0},
        'respirationRate': {'average': 0, 'max': 0, 'min': 0, 'samples': 0},
        'motion': {'detectedCount': 0, 'noMotionCount': 0, 'motionPercentage': '0.0'},
      },
      'timestamp': DateTime.now().toIso8601String(),
    };
  }

  /// Calculate average
  double _calculateAverage(List<num> values) {
    if (values.isEmpty) return 0.0;
    return values.reduce((a, b) => a + b) / values.length;
  }

  /// Calculate maximum
  num _calculateMax(List<num> values) {
    if (values.isEmpty) return 0;
    return values.reduce((a, b) => a > b ? a : b);
  }

  /// Calculate minimum
  num _calculateMin(List<num> values) {
    if (values.isEmpty) return 0;
    return values.reduce((a, b) => a < b ? a : b);
  }

  /// Group alerts by type for report
  Map<String, dynamic> groupAlertsByType({
    required List<Map<String, dynamic>> alerts,
  }) {
    final grouped = <String, Map<String, dynamic>>{};

    for (final alert in alerts) {
      final type = alert['type'] ?? 'unknown';
      
      if (grouped[type] == null) {
        grouped[type] = {
          'type': type,
          'count': 0,
          'severity': alert['severity'],
          'examples': [],
        };
      }

      final group = grouped[type]!;
      group['count'] = (group['count'] as int) + 1;
      
      // Store first few examples
      final examples = group['examples'] as List;
      if (examples.length < 3) {
        examples.add({
          'message': alert['message'],
          'triggeredAt': alert['triggeredAt'],
          'value': alert['biometricValue'],
        });
      }
    }

    return grouped;
  }

  /// Calculate wellness score for the day
  int calculateWellnessScore(Map<String, dynamic> aggregatedMetrics) {
    int score = 100;
    final metrics = aggregatedMetrics['metrics'];

    try {
      // Penalize for abnormal heart rate
      final avgHR = metrics['heartRate']['average'] as num;
      if (avgHR > 150 || avgHR < 80) {
        score -= 10;
      }

      // Penalize for abnormal temperature
      final avgTemp = metrics['temperature']['average'] as num;
      if (avgTemp > 37.8 || avgTemp < 36.2) {
        score -= 15;
      }

      // Penalize for low oxygen
      final avgO2 = metrics['oxygenLevel']['average'] as num;
      if (avgO2 < 96) {
        score -= 20;
      }

      // Reward for good motion pattern (healthy activity)
      final motionPercentage = double.parse(metrics['motion']['motionPercentage']);
      if (motionPercentage < 10 || motionPercentage > 70) {
        score -= 5;
      }
    } catch (e) {
      print('Error calculating wellness score: $e');
    }

    return score.clamp(0, 100);
  }

  /// Generate wellness report text
  String generateWellnessReport(
    Map<String, dynamic> aggregatedMetrics,
    String childName,
  ) {
    final metrics = aggregatedMetrics['metrics'];
    final date = aggregatedMetrics['date'];
    
    final buffer = StringBuffer();
    buffer.writeln('=== Daily Wellness Report ===');
    buffer.writeln('Child: $childName');
    buffer.writeln('Date: $date');
    buffer.writeln('');
    
    // Heart rate summary
    final avgHR = metrics['heartRate']['average'];
    buffer.writeln('Heart Rate: Avg $avgHR bpm');
    
    // Temperature summary
    final avgTemp = metrics['temperature']['average'];
    buffer.writeln('Temperature: Avg ${avgTemp.toStringAsFixed(1)}°C');
    
    // Oxygen summary
    final avgO2 = metrics['oxygenLevel']['average'];
    buffer.writeln('Oxygen Saturation: Avg $avgO2%');
    
    // Motion summary
    final motionPercent = metrics['motion']['motionPercentage'];
    buffer.writeln('Activity Level: $motionPercent% motion detected');
    
    // Wellness score
    final score = calculateWellnessScore(aggregatedMetrics);
    buffer.writeln('');
    buffer.writeln('Overall Wellness Score: $score/100');
    
    return buffer.toString();
  }
}
