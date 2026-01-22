# Operator Authentication & Role Management

## Overview
This document describes how operator authentication and role management works in the QuickSeat system.

## User Roles

The system supports three user roles:
- **user** - Regular passengers (default role)
- **operator** - Bus operators who can manage buses
- **admin** - System administrators with full access

## Authentication Flow

### 1. User Registration
When users register via Firebase, they are created in MongoDB with the default `user` role.

```typescript
// Sign up creates user in Firebase
const userCredential = await signUp(email, password, fullName, phone);

// Profile is created in MongoDB with default 'user' role
await createUserProfile({
  uid: userCredential.uid,
  email: userCredential.email,
  fullName,
  phone,
  role: 'user' // default
});
```

### 2. Becoming an Operator

Users can upgrade to operator role in two ways:

#### Option A: Register Directly as Operator
```typescript
// During sign-up, specify operator role
await createUserProfile({
  uid: userCredential.uid,
  email: userCredential.email,
  fullName,
  phone,
  role: 'operator'
});
```

#### Option B: Request Operator Role Later
```typescript
// Existing user requests operator role
await userService.requestOperatorRole();
// This immediately grants operator role
```

### 3. Token Verification with Role

The authentication middleware automatically fetches the user's role from the database:

```typescript
// Backend: middleware/auth.middleware.ts
export const verifyFirebaseToken = async (req, res, next) => {
  // 1. Verify Firebase JWT token
  const decodedToken = await admin.auth().verifyIdToken(token);
  
  // 2. Fetch user from MongoDB to get role
  const user = await User.findOne({ uid: decodedToken.uid });
  
  // 3. Attach user info with role to request
  req.user = {
    uid: decodedToken.uid,
    email: decodedToken.email,
    role: user.role  // 'user', 'operator', or 'admin'
  };
  
  next();
};
```

## Protected Routes

### Operator-Only Endpoints

All bus management endpoints require operator or admin role:

```typescript
// Bus Routes - Require operator role
POST   /api/buses              - Register new bus (operator/admin)
GET    /api/buses              - Get operator's buses (operator/admin)
GET    /api/buses/:id          - Get bus details (operator/admin)
PUT    /api/buses/:id          - Update bus (operator/admin)
DELETE /api/buses/:id          - Delete bus (operator/admin)

// Public search - No authentication required
GET    /api/buses/search       - Search buses (public)
```

### Role Management Endpoints

```typescript
// Request operator role (authenticated users)
POST   /api/users/operator/request

// Update user role (admin only)
PATCH  /api/users/:uid/role

// Get all users (admin only)
GET    /api/users

// Deactivate user (admin only)
PATCH  /api/users/:uid/deactivate
```

## Implementation Details

### Backend Route Protection

Routes use two middleware functions:
1. `verifyFirebaseToken` - Validates JWT and fetches user role
2. `checkRole(['operator', 'admin'])` - Ensures user has required role

```typescript
// Example from bus.routes.ts
router.post('/buses', 
  verifyFirebaseToken,              // Authenticate and fetch role
  checkRole(['operator', 'admin']), // Check if user is operator/admin
  registerBus                       // Execute controller
);
```

### Frontend Token Handling

The frontend automatically includes the Firebase token in all API requests:

```typescript
// services/bus.service.ts
const token = localStorage.getItem('token'); // Firebase JWT token

const response = await axios.post(
  `${API_URL}/buses`,
  busData,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
```

## Authorization Matrix

| Endpoint | Public | User | Operator | Admin |
|----------|--------|------|----------|-------|
| Search buses | ✓ | ✓ | ✓ | ✓ |
| Register bus | ✗ | ✗ | ✓ | ✓ |
| View own buses | ✗ | ✗ | ✓ | ✓ |
| Update bus | ✗ | ✗ | ✓ | ✓ |
| Delete bus | ✗ | ✗ | ✓ | ✓ |
| Request operator role | ✗ | ✓ | ✓ | ✗ |
| Update any user role | ✗ | ✗ | ✗ | ✓ |
| View all users | ✗ | ✗ | ✗ | ✓ |

## Error Responses

### 401 Unauthorized
```json
{
  "message": "No token provided"
}
```
**Cause:** Missing or invalid Authorization header

### 403 Forbidden
```json
{
  "message": "Insufficient permissions"
}
```
**Cause:** User doesn't have required role (e.g., user trying to access operator endpoint)

### 404 Not Found
```json
{
  "message": "User not found in database"
}
```
**Cause:** Firebase user exists but no MongoDB profile

## Frontend Integration Examples

### Check User Role
```typescript
// In AuthContext or component
const { currentUser } = useAuth();

// After authentication, user object includes role
if (currentUser?.role === 'operator') {
  // Show operator dashboard
} else {
  // Show passenger dashboard
}
```

### Request Operator Access
```typescript
// Button click handler
const handleRequestOperatorRole = async () => {
  try {
    const result = await userService.requestOperatorRole();
    alert(result.message); // "Operator role granted successfully"
    // Update user state with new role
    setCurrentUser({ ...currentUser, role: 'operator' });
    // Redirect to operator dashboard
    navigate('/operator');
  } catch (error) {
    alert(error.message);
  }
};
```

### Register Bus (Operator)
```typescript
// OperatorDashboard component
const handleBusRegistration = async (busData) => {
  try {
    // Token automatically included by service
    const result = await registerBus(busData);
    alert('Bus registered successfully');
  } catch (error) {
    // Handle errors
    if (error.response?.status === 403) {
      alert('You need operator role to register buses');
    } else {
      alert(error.message);
    }
  }
};
```

## Security Features

1. **JWT Verification**: Every protected request validates the Firebase JWT token
2. **Database Role Check**: User role is verified from MongoDB on each request
3. **Operator Isolation**: Operators can only access/modify their own buses
4. **Account Status**: Inactive accounts are automatically rejected
5. **Role Hierarchy**: Admins can perform all operator actions

## Testing Operator Functions

### 1. Create User Account
```bash
# Sign up via frontend or API
POST /api/auth/signup
{
  "email": "operator@example.com",
  "password": "securePassword123",
  "fullName": "John Operator",
  "phone": "+94771234567"
}
```

### 2. Request Operator Role
```bash
POST /api/users/operator/request
Authorization: Bearer <firebase-jwt-token>
```

### 3. Register a Bus
```bash
POST /api/buses
Authorization: Bearer <firebase-jwt-token>
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

## Database Schema Updates

The User model includes role tracking:
```typescript
{
  uid: string;           // Firebase UID
  email: string;
  fullName: string;
  phone: string;
  photoURL?: string;
  role: 'user' | 'operator' | 'admin';  // User role
  isActive: boolean;     // Account status
  createdAt: Date;
  updatedAt: Date;
}
```

## Notes

1. **Instant Operator Access**: Requesting operator role grants it immediately (no approval needed)
2. **Role Persistence**: User role is stored in MongoDB and fetched with every authenticated request
3. **Admin Override**: Admins can change any user's role
4. **No Downgrade**: Operators and admins cannot request to become regular users
5. **Frontend Routing**: The frontend should check user role and route to appropriate dashboard

## Future Enhancements

- **Operator Verification**: Add approval process for operator role requests
- **Operator Documents**: Require license/permit uploads before granting operator role
- **Multi-tenant**: Support multiple operators with isolated data
- **Permissions**: Fine-grained permissions beyond role-based access
