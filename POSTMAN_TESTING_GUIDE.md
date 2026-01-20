# QuickSeat API - Postman Testing Guide

## Prerequisites
1. Start your backend server: `cd backend && npm run dev`
2. MongoDB should be running
3. Have Postman installed

## Base URL
```
http://localhost:5000
```

---

## Step 1: Get Firebase Authentication Token

Since your backend uses Firebase Authentication, you need a valid Firebase ID token. Here are two ways to get it:

### Option A: Use Frontend to Get Token (Easiest)
1. Start your frontend: `cd frontend && npm run dev`
2. Sign up or sign in through your frontend
3. Open browser DevTools → Console
4. Run this code:
```javascript
firebase.auth().currentUser.getIdToken().then(token => console.log(token))
```
5. Copy the token

### Option B: Use Firebase REST API Directly
**Sign Up:**
```
POST https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=YOUR_FIREBASE_API_KEY

Body (raw JSON):
{
  "email": "test@example.com",
  "password": "Test123456",
  "returnSecureToken": true
}

Response will contain: idToken
```

**Sign In:**
```
POST https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=YOUR_FIREBASE_API_KEY

Body (raw JSON):
{
  "email": "test@example.com",
  "password": "Test123456",
  "returnSecureToken": true
}

Response will contain: idToken
```

---

## Step 2: Set Up Postman Environment

Create a new environment in Postman with these variables:
- `base_url` = `http://localhost:5000`
- `token` = `YOUR_FIREBASE_ID_TOKEN` (paste the token from Step 1)
- `user_uid` = (will be set after creating a user)

---

## Step 3: Test Authentication Endpoints

### 1. Verify Token (Public)
```
POST {{base_url}}/api/auth/verify

Headers:
Authorization: Bearer {{token}}

Expected Response (200):
{
  "message": "Token is valid",
  "user": {
    "uid": "firebase_uid_here",
    "email": "test@example.com"
  }
}
```

### 2. Get Current User (Protected)
```
GET {{base_url}}/api/auth/me

Headers:
Authorization: Bearer {{token}}

Expected Response (200):
{
  "user": {
    "uid": "firebase_uid_here",
    "email": "test@example.com",
    "fullName": "John Doe",
    "phone": "+1234567890",
    "photoURL": null,
    "role": "user",
    "isActive": true,
    "createdAt": "2026-01-20T...",
    "updatedAt": "2026-01-20T..."
  }
}
```

### 3. Revoke All Tokens (Protected)
```
POST {{base_url}}/api/auth/revoke

Headers:
Authorization: Bearer {{token}}

Expected Response (200):
{
  "message": "All tokens revoked successfully"
}
```

---

## Step 4: Test User CRUD Endpoints

### 1. Create User Profile (Protected)
```
POST {{base_url}}/api/users

Headers:
Authorization: Bearer {{token}}
Content-Type: application/json

Body (raw JSON):
{
  "uid": "firebase_uid_here",
  "email": "test@example.com",
  "fullName": "John Doe",
  "phone": "+1234567890"
}

Expected Response (201):
{
  "message": "User created successfully",
  "user": {
    "uid": "firebase_uid_here",
    "email": "test@example.com",
    "fullName": "John Doe",
    "phone": "+1234567890",
    "photoURL": null,
    "role": "user",
    "createdAt": "2026-01-20T...",
    "updatedAt": "2026-01-20T..."
  }
}
```

### 2. Get User by UID (Protected)
```
GET {{base_url}}/api/users/{{user_uid}}

Headers:
Authorization: Bearer {{token}}

Expected Response (200):
{
  "user": {
    "uid": "firebase_uid_here",
    "email": "test@example.com",
    "fullName": "John Doe",
    "phone": "+1234567890",
    "photoURL": null,
    "role": "user",
    "isActive": true,
    "createdAt": "2026-01-20T...",
    "updatedAt": "2026-01-20T..."
  }
}
```

### 3. Update User (Protected)
```
PUT {{base_url}}/api/users/{{user_uid}}

Headers:
Authorization: Bearer {{token}}
Content-Type: application/json

Body (raw JSON):
{
  "fullName": "John Updated Doe",
  "phone": "+9876543210",
  "photoURL": "https://example.com/photo.jpg"
}

Expected Response (200):
{
  "message": "User updated successfully",
  "user": {
    "uid": "firebase_uid_here",
    "email": "test@example.com",
    "fullName": "John Updated Doe",
    "phone": "+9876543210",
    "photoURL": "https://example.com/photo.jpg",
    "role": "user",
    "isActive": true
  }
}
```

### 4. Delete User (Protected)
```
DELETE {{base_url}}/api/users/{{user_uid}}

Headers:
Authorization: Bearer {{token}}

Expected Response (200):
{
  "message": "User deleted successfully"
}
```

### 5. Get All Users (Admin Only)
```
GET {{base_url}}/api/users

Headers:
Authorization: Bearer {{token}}

Note: This requires the user to have 'admin' role in the database.

Expected Response (200):
{
  "users": [...],
  "total": 10,
  "page": 1,
  "limit": 10
}
```

### 6. Deactivate User (Admin Only)
```
PATCH {{base_url}}/api/users/{{user_uid}}/deactivate

Headers:
Authorization: Bearer {{token}}

Expected Response (200):
{
  "message": "User deactivated successfully"
}
```

---

## Step 5: Delete Account (Protected)
```
DELETE {{base_url}}/api/auth/account/{{user_uid}}

Headers:
Authorization: Bearer {{token}}

Note: Users can only delete their own account unless they are admin.

Expected Response (200):
{
  "message": "Account deleted successfully"
}
```

---

## Common Error Responses

### 401 Unauthorized
```json
{
  "message": "No token provided"
}
```
**Solution:** Add `Authorization: Bearer YOUR_TOKEN` header

### 403 Forbidden
```json
{
  "message": "Invalid or expired token"
}
```
**Solution:** Get a new Firebase ID token (tokens expire after 1 hour)

### 403 Forbidden (Role-based)
```json
{
  "message": "Forbidden: Insufficient permissions"
}
```
**Solution:** This endpoint requires admin role

### 404 Not Found
```json
{
  "message": "User not found"
}
```
**Solution:** Make sure the user exists in the database

---

## Testing Flow Recommendation

1. **Get Firebase Token** → Use frontend or Firebase REST API
2. **Verify Token** → `POST /api/auth/verify`
3. **Create User Profile** → `POST /api/users`
4. **Get Current User** → `GET /api/auth/me`
5. **Update User** → `PUT /api/users/:uid`
6. **Get User by UID** → `GET /api/users/:uid`
7. **Test Admin Endpoints** → Change user role to 'admin' in MongoDB
8. **Delete User** → `DELETE /api/users/:uid`

---

## Tips

1. **Token Expiration:** Firebase ID tokens expire after 1 hour. Get a new token if you get 403 errors.
2. **Save Requests:** Create a Postman Collection to save all these requests.
3. **Environment Variables:** Use `{{token}}` and `{{user_uid}}` for easy testing.
4. **Check MongoDB:** Use MongoDB Compass or CLI to verify data changes.
5. **Check Server Logs:** Terminal will show request logs and any errors.

---

## How to Make a User Admin

1. Connect to MongoDB
2. Find your user document
3. Update the role field:
```javascript
db.users.updateOne(
  { uid: "your_firebase_uid" },
  { $set: { role: "admin" } }
)
```

Now you can test admin-only endpoints!
