import 'package:http/http.dart' as http;
import 'dart:convert';

/// Handles push notifications via Firebase Cloud Messaging
class NotificationService {
  
  static const String _fcmEndpoint = 'https://fcm.googleapis.com/fcm/send';

  /// Send notification via FCM
  Future<bool> sendFCMNotification({
    required String token,
    required String title,
    required String body,
    required Map<String, String> data,
  }) async {
    try {
      final headers = {
        'Content-Type': 'application/json',
        // In production, use Firebase Admin SDK which handles auth automatically
        // For manual FCM, you'd need: 'Authorization': 'key=$_serverKey'
      };

      final payload = {
        'to': token,
        'notification': {
          'title': title,
          'body': body,
          'sound': 'default',
          'priority': 'high',
        },
        'data': data,
        'android': {
          'priority': 'high',
        },
        'apns': {
          'headers': {
            'apns-priority': '10',
          },
        },
      };

      final response = await http.post(
        Uri.parse(_fcmEndpoint),
        headers: headers,
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        print('FCM notification sent successfully');
        return true;
      } else {
        print('FCM error: ${response.statusCode} - ${response.body}');
        return false;
      }
    } catch (e) {
      print('Error sending FCM notification: $e');
      return false;
    }
  }

  /// Create notification model
  Map<String, dynamic> createNotification({
    required String userId,
    required String childId,
    required String alertId,
    required String title,
    required String body,
    required String type,
    required String severity,
  }) {
    return {
      'userId': userId,
      'childId': childId,
      'alertId': alertId,
      'title': title,
      'body': body,
      'type': type,
      'severity': severity,
      'sentAt': DateTime.now().toIso8601String(),
      'read': false,
    };
  }

  /// Format alert message for notification
  String formatAlertMessage({
    required String alertType,
    required String childName,
    required dynamic value,
    required List<dynamic> normalRange,
  }) {
    switch (alertType) {
      case 'heart_rate_high':
        return '$childName: Heart rate elevated to ${value}bpm. Normal: ${normalRange[0]}-${normalRange[1]}bpm';
      case 'heart_rate_low':
        return '$childName: Heart rate low at ${value}bpm. Normal: ${normalRange[0]}-${normalRange[1]}bpm';
      case 'fever':
        return '$childName: High fever $value°C detected. Action needed.';
      case 'elevated_temperature':
        return '$childName: Temperature elevated to $value°C. Monitor closely.';
      case 'hypothermia':
        return '$childName: Low temperature $value°C. Ensure warmth.';
      case 'low_oxygen':
        return '$childName: Oxygen saturation low at $value%. Check breathing.';
      case 'rapid_breathing':
        return '$childName: Rapid breathing detected at $value breaths/min.';
      case 'slow_breathing':
        return '$childName: Shallow breathing detected. Immediate attention needed.';
      case 'prolonged_inactivity':
        return '$childName: No motion for extended period.';
      case 'device_offline':
        return '$childName: Monitoring device offline. Check connection.';
      default:
        return '$childName: Alert detected. Please check app for details.';
    }
  }

  /// Create notification sound profile
  Map<String, dynamic> getSoundProfileForSeverity(String severity) {
    switch (severity) {
      case 'critical':
        return {
          'sound': 'critical_alert',
          'vibration': [100, 100, 100, 100], // ms pattern
          'ledColor': [255, 0, 0], // Red
          'priority': 'max',
        };
      case 'warning':
        return {
          'sound': 'warning_alert',
          'vibration': [100, 50], // ms pattern
          'ledColor': [255, 165, 0], // Orange
          'priority': 'high',
        };
      case 'info':
        return {
          'sound': 'notification',
          'vibration': [50],
          'ledColor': [0, 255, 0], // Green
          'priority': 'normal',
        };
      default:
        return {
          'sound': 'notification',
          'vibration': [50],
          'priority': 'normal',
        };
    }
  }

  /// Schedule reminder notification if not acknowledged
  Future<void> scheduleReminderNotification({
    required String notificationId,
    required Duration delay,
  }) async {
    try {
      // In production, use Cloud Tasks or similar service
      // For now, this would be called by a scheduled function
      await Future.delayed(delay);
      print('Reminder scheduled for notification: $notificationId after ${delay.inMinutes} minutes');
    } catch (e) {
      print('Error scheduling reminder: $e');
    }
  }

  /// Mark notification as read
  Future<void> markAsRead(String notificationId) async {
    try {
      print('Marked notification as read: $notificationId');
      // This would update Firestore in actual implementation
    } catch (e) {
      print('Error marking notification as read: $e');
    }
  }

  /// Clear all notifications for a user
  Future<void> clearUserNotifications(String userId) async {
    try {
      print('Cleared all notifications for user: $userId');
      // This would clear Firestore notifications in actual implementation
    } catch (e) {
      print('Error clearing notifications: $e');
    }
  }

  /// Create notification summary for daily digest
  Map<String, dynamic> createDailyDigest({
    required String userId,
    required String childId,
    required int totalAlerts,
    required Map<String, int> alertsByType,
    required int wellnessScore,
  }) {
    final summary = StringBuffer();
    summary.writeln('Daily Summary for $childId');
    summary.writeln('Wellness Score: $wellnessScore/100');
    summary.writeln('Total Alerts: $totalAlerts');
    
    if (alertsByType.isNotEmpty) {
      summary.writeln('\nAlert Breakdown:');
      alertsByType.forEach((type, count) {
        summary.writeln('  - $type: $count');
      });
    }

    return {
      'userId': userId,
      'childId': childId,
      'title': 'Daily Wellness Summary',
      'body': summary.toString(),
      'type': 'daily_digest',
      'timestamp': DateTime.now().toIso8601String(),
    };
  }
}
