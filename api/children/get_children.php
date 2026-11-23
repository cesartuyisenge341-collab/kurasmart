<?php
/**
 * KuraSmart Get Children API
 * Returns list of children for a parent/user
 * 
 * Request:
 * GET /api/children/get_children.php?user_id=1
 * Content-Type: application/json
 * 
 * Response (Success):
 * {
 *   "success": true,
 *   "message": "Children retrieved successfully",
 *   "data": [
 *     {
 *       "id": 1,
 *       "name": "Baby John",
 *       "date_of_birth": "2024-01-15",
 *       "gender": "male",
 *       "temperature_c": 22.5,
 *       "humidity_pct": 55.0,
 *       "comfort_score": 85
 *     }
 *   ]
 * }
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Get user_id from query parameter
$userId = $_GET['user_id'] ?? null;

if (!$userId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'user_id parameter required']);
    exit();
}

// For demo purposes, return mock children data
// In production, you would:
// 1. Verify authentication token
// 2. Query database for children by user_id
// 3. Return actual child records

$mockChildren = [
    [
        'id' => 1,
        'name' => 'Baby John',
        'date_of_birth' => '2024-01-15',
        'gender' => 'male',
        'temperature_c' => 22.5,
        'humidity_pct' => 55.0,
        'comfort_score' => 85,
    ],
    [
        'id' => 2,
        'name' => 'Baby Sarah',
        'date_of_birth' => '2023-06-20',
        'gender' => 'female',
        'temperature_c' => 23.1,
        'humidity_pct' => 48.0,
        'comfort_score' => 92,
    ],
];

http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Children retrieved successfully',
    'data' => $mockChildren,
]);
?>
