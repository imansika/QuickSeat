# Bus Management API Documentation

## Overview
This document describes the API endpoints for managing buses in the QuickSeat system.

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication using Firebase JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your-firebase-token>
```

## Endpoints

### 1. Register a New Bus
**POST** `/buses`

Register a new bus with route and schedule information.

**Authentication:** Required

**Request Body:**
```json
{
  "busNumber": "EL-2456",
  "origin": "Colombo",
  "destination": "Kandy",
  "seatCapacity": "40",
  "departureTime": "08:00",
  "arrivalTime": "11:30",
  "operatingDays": "daily",
  "ratePerKm": "12"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Bus registered successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "busNumber": "EL-2456",
    "operatorId": "firebase-uid-123",
    "origin": "Colombo",
    "destination": "Kandy",
    "seatCapacity": 40,
    "departureTime": "08:00",
    "arrivalTime": "11:30",
    "operatingDays": "daily",
    "ratePerKm": 12,
    "isActive": true,
    "createdAt": "2026-01-21T10:30:00.000Z",
    "updatedAt": "2026-01-21T10:30:00.000Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Bus number already exists"
}
```

---

### 2. Get All Operator's Buses
**GET** `/buses`

Retrieve all buses owned by the authenticated operator.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "busNumber": "EL-2456",
      "operatorId": "firebase-uid-123",
      "origin": "Colombo",
      "destination": "Kandy",
      "seatCapacity": 40,
      "departureTime": "08:00",
      "arrivalTime": "11:30",
      "operatingDays": "daily",
      "ratePerKm": 12,
      "isActive": true,
      "createdAt": "2026-01-21T10:30:00.000Z",
      "updatedAt": "2026-01-21T10:30:00.000Z"
    }
  ]
}
```

---

### 3. Get Single Bus by ID
**GET** `/buses/:id`

Retrieve details of a specific bus.

**Authentication:** Required

**URL Parameters:**
- `id` - Bus MongoDB ObjectId

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "busNumber": "EL-2456",
    "operatorId": "firebase-uid-123",
    "origin": "Colombo",
    "destination": "Kandy",
    "seatCapacity": 40,
    "departureTime": "08:00",
    "arrivalTime": "11:30",
    "operatingDays": "daily",
    "ratePerKm": 12,
    "isActive": true,
    "createdAt": "2026-01-21T10:30:00.000Z",
    "updatedAt": "2026-01-21T10:30:00.000Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Bus not found"
}
```

---

### 4. Update Bus Details
**PUT** `/buses/:id`

Update details of an existing bus.

**Authentication:** Required

**URL Parameters:**
- `id` - Bus MongoDB ObjectId

**Request Body:** (all fields optional)
```json
{
  "seatCapacity": "45",
  "departureTime": "09:00",
  "arrivalTime": "12:30",
  "ratePerKm": "15"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Bus updated successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "busNumber": "EL-2456",
    "operatorId": "firebase-uid-123",
    "origin": "Colombo",
    "destination": "Kandy",
    "seatCapacity": 45,
    "departureTime": "09:00",
    "arrivalTime": "12:30",
    "operatingDays": "daily",
    "ratePerKm": 15,
    "isActive": true,
    "createdAt": "2026-01-21T10:30:00.000Z",
    "updatedAt": "2026-01-21T11:45:00.000Z"
  }
}
```

---

### 5. Delete (Deactivate) Bus
**DELETE** `/buses/:id`

Deactivate a bus (soft delete - sets isActive to false).

**Authentication:** Required

**URL Parameters:**
- `id` - Bus MongoDB ObjectId

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Bus deactivated successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "busNumber": "EL-2456",
    "isActive": false,
    ...
  }
}
```

---

### 6. Search Buses (Public)
**GET** `/buses/search`

Search for available buses by origin and/or destination. This endpoint is public and does not require authentication.

**Authentication:** Not Required

**Query Parameters:**
- `origin` (optional) - Origin city name
- `destination` (optional) - Destination city name
- `date` (optional) - Travel date (for future use)

**Example:**
```
GET /buses/search?origin=Colombo&destination=Kandy
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "busNumber": "EL-2456",
      "origin": "Colombo",
      "destination": "Kandy",
      "seatCapacity": 40,
      "departureTime": "08:00",
      "arrivalTime": "11:30",
      "operatingDays": "daily",
      "ratePerKm": 12,
      "isActive": true
    }
  ]
}
```

---

## Data Models

### Bus Schema
```typescript
{
  busNumber: string;        // Unique bus registration number (uppercase)
  operatorId: string;       // Firebase UID of the operator
  origin: string;           // Starting city
  destination: string;      // Destination city
  seatCapacity: number;     // Number of available seats
  departureTime: string;    // Departure time (HH:MM format)
  arrivalTime: string;      // Arrival time (HH:MM format)
  operatingDays: string;    // 'daily' | 'weekdays' | 'weekends'
  ratePerKm: number;        // Rate per kilometer in LKR
  isActive: boolean;        // Whether the bus is currently active
  createdAt: Date;          // Creation timestamp
  updatedAt: Date;          // Last update timestamp
}
```

## Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (in development mode)"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `404` - Not Found
- `500` - Internal Server Error

## Frontend Integration

The frontend uses the bus service located at `/frontend/src/services/bus.service.ts` to interact with these endpoints. 

Example usage:
```typescript
import { registerBus, getOperatorBuses } from '@/services/bus.service';

// Register a new bus
const newBus = await registerBus({
  busNumber: 'EL-2456',
  origin: 'Colombo',
  destination: 'Kandy',
  seatCapacity: '40',
  departureTime: '08:00',
  arrivalTime: '11:30',
  operatingDays: 'daily',
  ratePerKm: '12'
});

// Get all operator's buses
const buses = await getOperatorBuses();
```

## Notes

1. **Authentication Token**: The auth token is stored in localStorage after Firebase authentication and automatically included in API requests.

2. **Bus Number Uniqueness**: Bus numbers are automatically converted to uppercase and must be unique across the system.

3. **Soft Delete**: Deleting a bus doesn't remove it from the database; it sets `isActive` to `false`.

4. **Operator Isolation**: Operators can only view and manage their own buses. The system automatically filters by `operatorId`.

5. **Rate Calculation**: The `ratePerKm` field stores the rate per kilometer. Total fare should be calculated as: `distance * ratePerKm` on the frontend.
