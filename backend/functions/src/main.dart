import 'package:functions_framework/functions_framework.dart';
import 'package:firebase_admin/firebase_admin.dart' as admin;
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

import 'biometric_handler.dart';
import 'alert_processor.dart';
import 'metrics_aggregator.dart';
import 'notification_service.dart';

// Initialize Firebase Admin SDK
void main() {
  admin.initializeApp();
  
  // Register Cloud Functions
  functions['onBiometricDataReceived'] = onBiometricDataReceived;
  functions['detectAnomalies'] = detectAnomalies;
  functions['aggregateDailyMetrics'] = aggregateDailyMetrics;
  functions['sendAlertNotifications'] = sendAlertNotifications;
  functions['deviceHealthCheck'] = deviceHealthCheck;
  functions['archiveOldReadings'] = archiveOldReadings;
}

/// Function 1: Process incoming biometric data
/// Triggered when new sensor reading is written to Firestore
@CloudFunction()
Future<void> onBiometricDataReceived(CloudEvent event) async {
  try {
    final message = event.data;
    if (message == null) {
      print('Error: Message is null');
      return;
    }

    // Parse the document from the trigger
    final decodedData = base64Decode(message['data']);
    final Map<String, dynamic> firestoreEvent = jsonDecode(utf8.decode(decodedData));
    
    final documentId = firestoreEvent['document'].split('/').last;
    final newValue = firestoreEvent['value']['fields'];
    
    print('Processing biometric data: $documentId');
    
    // Extract biometric data
    final handler = BiometricHandler();
    final biometrics = handler.extractBiometricsFromFirestore(newValue);
    
    if (biometrics == null) {
      print('Failed to extract biometrics');
      return;
    }

    // Validate data integrity
    if (!handler.validateBiometrics(biometrics)) {
      print('Biometric validation failed: $biometrics');
      return;
    }

    // Update real-time database for live monitoring
    final database = admin.database();
    final childId = biometrics['childId'];
    final deviceId = biometrics['deviceId'];
    
    await database
        .ref('children/$childId/realtime/latest')
        .set({
          'deviceId': deviceId,
          'biometrics': biometrics['data'],
          'timestamp': DateTime.now().millisecondsSinceEpoch,
        });

    // Update device last seen
    await admin.firestore()
        .collection('devices')
        .where('id', isEqualTo: deviceId)
        .limit(1)
        .get()
        .then((querySnapshot) {
          if (querySnapshot.docs.isNotEmpty) {
            querySnapshot.docs.first.reference.update({
              'lastSeen': DateTime.now(),
            });
          }
        });

    print('Biometric data processed successfully');
  } catch (e) {
    print('Error in onBiometricDataReceived: $e');
    rethrow;
  }
}

/// Function 2: Detect anomalies and generate alerts
/// Triggered by scheduled task (every 5 seconds) or on demand
@CloudFunction()
Future<void> detectAnomalies(CloudEvent event) async {
  try {
    print('Running anomaly detection...');
    
    final processor = AlertProcessor();
    final firestore = admin.firestore();
    final database = admin.database();
    
    // Get all active children
    final childrenSnapshot = await firestore
        .collection('children')
        .where('isActive', isEqualTo: true)
        .get();

    for (final childDoc in childrenSnapshot.docs) {
      final childId = childDoc.id;
      final childData = childDoc.data();
      
      // Get latest sensor reading
      final latestReading = await firestore
          .collection('sensorReadings')
          .where('childId', isEqualTo: childId)
          .orderBy('timestamp', descending: true)
          .limit(1)
          .get();

      if (latestReading.docs.isEmpty) continue;

      final readingData = latestReading.docs.first.data();
      
      // Detect anomalies
      final alerts = processor.detectAnomalies(
        childData: childData,
        readingData: readingData,
        childId: childId,
      );

      // Save alerts to Firestore
      for (final alert in alerts) {
        final alertId = admin.firestore().collection('alerts').doc().id;
        
        await firestore
            .collection('alerts')
            .doc(alertId)
            .set({
              'id': alertId,
              'childId': childId,
              'deviceId': readingData['deviceId'],
              'type': alert['type'],
              'severity': alert['severity'],
              'message': alert['message'],
              'biometricValue': alert['value'],
              'normalRange': alert['range'],
              'triggeredAt': DateTime.now(),
              'acknowledged': false,
            });

        // Send push notification
        await sendAlertNotifications(event);
      }
    }
    
    print('Anomaly detection completed');
  } catch (e) {
    print('Error in detectAnomalies: $e');
    rethrow;
  }
}

/// Function 3: Aggregate daily metrics
/// Scheduled task: Daily at 23:59 UTC
@CloudFunction()
Future<void> aggregateDailyMetrics(CloudEvent event) async {
  try {
    print('Starting daily metrics aggregation...');
    
    final aggregator = MetricsAggregator();
    final firestore = admin.firestore();
    
    // Get all active children
    final childrenSnapshot = await firestore
        .collection('children')
        .where('isActive', isEqualTo: true)
        .get();

    for (final childDoc in childrenSnapshot.docs) {
      final childId = childDoc.id;
      
      // Get yesterday's readings
      final yesterday = DateTime.now().subtract(const Duration(days: 1));
      final startOfDay = DateTime(yesterday.year, yesterday.month, yesterday.day);
      final endOfDay = startOfDay.add(const Duration(days: 1));

      final readingsSnapshot = await firestore
          .collection('sensorReadings')
          .where('childId', isEqualTo: childId)
          .where('timestamp', isGreaterThanOrEqualTo: startOfDay)
          .where('timestamp', isLessThan: endOfDay)
          .get();

      if (readingsSnapshot.docs.isEmpty) continue;

      // Calculate aggregates
      final metrics = aggregator.aggregateReadings(
        readings: readingsSnapshot.docs.map((d) => d.data()).toList(),
        date: startOfDay,
      );

      // Get alerts for the day
      final alertsSnapshot = await firestore
          .collection('alerts')
          .where('childId', isEqualTo: childId)
          .where('triggeredAt', isGreaterThanOrEqualTo: startOfDay)
          .where('triggeredAt', isLessThan: endOfDay)
          .get();

      metrics['alerts'] = aggregator.groupAlertsByType(
        alerts: alertsSnapshot.docs.map((d) => d.data()).toList(),
      );

      // Save aggregated data
      await firestore
          .collection('biometricHistory')
          .doc('${childId}_${startOfDay.toIso8601String().split('T')[0]}')
          .set(metrics);

      print('Aggregated metrics for child: $childId');
    }
    
    print('Daily metrics aggregation completed');
  } catch (e) {
    print('Error in aggregateDailyMetrics: $e');
    rethrow;
  }
}

/// Function 4: Send alert notifications
/// Triggered when new alert is created
@CloudFunction()
Future<void> sendAlertNotifications(CloudEvent event) async {
  try {
    print('Sending alert notifications...');
    
    final notificationService = NotificationService();
    final firestore = admin.firestore();

    // Get all unacknowledged alerts from the last 5 minutes
    final fiveMinutesAgo = DateTime.now().subtract(const Duration(minutes: 5));
    
    final alertsSnapshot = await firestore
        .collection('alerts')
        .where('acknowledged', isEqualTo: false)
        .where('triggeredAt', isGreaterThan: fiveMinutesAgo)
        .get();

    for (final alertDoc in alertsSnapshot.docs) {
      final alertData = alertDoc.data();
      final childId = alertData['childId'];

      // Get child's parent/caregiver
      final childSnapshot = await firestore
          .collection('children')
          .doc(childId)
          .get();

      if (!childSnapshot.exists) continue;

      final childData = childSnapshot.data();
      final userId = childData?['userId'];

      // Get user's FCM tokens
      final userSnapshot = await firestore
          .collection('users')
          .doc(userId)
          .get();

      if (!userSnapshot.exists) continue;

      final userData = userSnapshot.data();
      final fcmTokens = userData?['fcmTokens'] ?? [];

      // Send notification via FCM
      for (final token in fcmTokens) {
        await notificationService.sendFCMNotification(
          token: token,
          title: 'Alert: ${alertData['message']}',
          body: 'Child: ${childData?['name']}',
          data: {
            'alertId': alertDoc.id,
            'childId': childId,
            'type': alertData['type'],
            'severity': alertData['severity'],
          },
        );
      }

      // Store notification record
      await firestore
          .collection('notifications')
          .add({
            'userId': userId,
            'alertId': alertDoc.id,
            'childId': childId,
            'title': 'Alert: ${alertData['message']}',
            'body': 'Child: ${childData?['name']}',
            'type': alertData['type'],
            'severity': alertData['severity'],
            'sentAt': DateTime.now(),
            'read': false,
          });
    }

    print('Alert notifications sent');
  } catch (e) {
    print('Error in sendAlertNotifications: $e');
    rethrow;
  }
}

/// Function 5: Check device health and connectivity
/// Scheduled task: Every 5 minutes
@CloudFunction()
Future<void> deviceHealthCheck(CloudEvent event) async {
  try {
    print('Running device health check...');
    
    final firestore = admin.firestore();
    final database = admin.database();
    
    // Get all active devices
    final devicesSnapshot = await firestore
        .collection('devices')
        .where('isActive', isEqualTo: true)
        .get();

    for (final deviceDoc in devicesSnapshot.docs) {
      final deviceData = deviceDoc.data();
      final deviceId = deviceData['deviceId'];
      
      // Check if device has recent data (within 5 minutes)
      final fiveMinutesAgo = DateTime.now().subtract(const Duration(minutes: 5));
      final lastReading = await firestore
          .collection('sensorReadings')
          .where('deviceId', isEqualTo: deviceId)
          .orderBy('timestamp', descending: true)
          .limit(1)
          .get();

      if (lastReading.docs.isEmpty || 
          DateTime.parse(lastReading.docs.first['timestamp']).isBefore(fiveMinutesAgo)) {
        
        // Device is offline
        print('Device offline: $deviceId');
        
        // Update device status
        await deviceDoc.reference.update({
          'isActive': false,
          'lastSeen': DateTime.now(),
        });

        // Create offline alert
        final childId = deviceData['childId'];
        if (childId != null) {
          await firestore
              .collection('alerts')
              .add({
                'childId': childId,
                'deviceId': deviceId,
                'type': 'device_offline',
                'severity': 'warning',
                'message': 'Device ${deviceData['deviceName']} is offline',
                'triggeredAt': DateTime.now(),
                'acknowledged': false,
              });
        }
      } else {
        // Device is online
        await deviceDoc.reference.update({
          'isActive': true,
          'lastSeen': DateTime.now(),
        });
        
        // Update realtime database
        await database
            .ref('devices/$deviceId/status')
            .set({
              'online': true,
              'lastUpdate': DateTime.now().millisecondsSinceEpoch,
            });
      }
    }

    print('Device health check completed');
  } catch (e) {
    print('Error in deviceHealthCheck: $e');
    rethrow;
  }
}

/// Function 6: Archive old sensor readings
/// Scheduled task: Weekly, Monday at 02:00 UTC
@CloudFunction()
Future<void> archiveOldReadings(CloudEvent event) async {
  try {
    print('Archiving old sensor readings...');
    
    final firestore = admin.firestore();
    
    // Archive readings older than 90 days
    final ninetyDaysAgo = DateTime.now().subtract(const Duration(days: 90));
    
    final oldReadingsSnapshot = await firestore
        .collection('sensorReadings')
        .where('timestamp', isLessThan: ninetyDaysAgo)
        .get();

    // Move to archive collection
    final batch = firestore.batch();
    
    for (final doc in oldReadingsSnapshot.docs) {
      final archiveRef = firestore
          .collection('archived_sensorReadings')
          .doc(doc.id);
      
      batch.set(archiveRef, doc.data());
      batch.delete(doc.reference);
    }

    if (oldReadingsSnapshot.docs.isNotEmpty) {
      await batch.commit();
      print('Archived ${oldReadingsSnapshot.docs.length} old readings');
    }

    print('Archival completed');
  } catch (e) {
    print('Error in archiveOldReadings: $e');
    rethrow;
  }
}
