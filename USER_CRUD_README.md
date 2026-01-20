# QuickSeat User CRUD with Firebase Authentication

## Project Structure

### Frontend Structure
```
frontend/src/
├── types/
│   └── user.ts                  # User type definitions
├── services/
│   ├── auth.service.ts          # Firebase authentication service
│   └── user.service.ts          # User API service
├── contexts/
│   └── AuthContext.tsx          # Authentication context provider
├── hooks/
│   └── useAuth.ts               # Custom authentication hook
└── firebase.ts                  # Firebase configuration
```

### Backend Structure
```
backend/src/
├── models/
│   └── User.model.ts            # User MongoDB model
├── controllers/
│   └── user.controller.ts       # User CRUD controller
├── routes/
│   └── user.routes.ts           # User API routes
├── middleware/
│   └── auth.middleware.ts       # Firebase token verification
├── config/
│   └── firebase.admin.ts        # Firebase Admin SDK config
└── server.ts                    # Express server setup
```

## Setup Instructions

### Backend Setup

1. Install dependencies:
```bash
cd backend
npm install firebase-admin
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Configure Firebase Admin SDK:
   - Go to Firebase Console > Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Copy the values to your `.env` file

4. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Firebase is already installed. Create `.env` file:
```bash
cd frontend
cp .env.example .env
```

2. Wrap your app with AuthProvider in `main.tsx`:
```tsx
import { AuthProvider } from './contexts/AuthContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
```

## API Endpoints

### User Routes

- **POST** `/api/users` - Create user profile
- **GET** `/api/users/:uid` - Get user by UID
- **PUT** `/api/users/:uid` - Update user profile
- **DELETE** `/api/users/:uid` - Delete user
- **GET** `/api/users` - Get all users (admin only)
- **PATCH** `/api/users/:uid/deactivate` - Deactivate user (admin only)

## Usage Examples

### Using Authentication in Components

```tsx
import { useAuth } from '../hooks/useAuth';

function ProfileComponent() {
  const { currentUser, userProfile, signOut, updateProfile } = useAuth();

  const handleUpdateProfile = async () => {
    await updateProfile({
      fullName: 'New Name',
      phone: '+94 71 234 5678',
    });
  };

  return (
    <div>
      <h1>Welcome, {userProfile?.fullName}</h1>
      <button onClick={handleUpdateProfile}>Update Profile</button>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### Sign Up Example

```tsx
import { useAuth } from '../hooks/useAuth';

function SignUpForm() {
  const { signUp, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signUp({
        email: 'user@example.com',
        password: 'password123',
        fullName: 'John Doe',
        phone: '+94 71 234 5678',
      });
      // Redirect to dashboard
    } catch (err) {
      console.error('Sign up failed:', err);
    }
  };

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>;
}
```

## Features

### Authentication Service
- ✅ Email/Password sign up and sign in
- ✅ Google OAuth sign in
- ✅ Facebook OAuth sign in
- ✅ Password reset
- ✅ Profile update
- ✅ Email update
- ✅ Password update

### User Service (API)
- ✅ Create user profile in database
- ✅ Get user profile
- ✅ Update user profile
- ✅ Delete user profile
- ✅ Get all users (admin)
- ✅ Role-based access control

### Security
- ✅ Firebase token verification
- ✅ Role-based middleware
- ✅ User authorization checks
- ✅ Secure password handling by Firebase

## Next Steps

1. Install backend dependencies: `cd backend && npm install firebase-admin`
2. Configure Firebase Admin SDK in `.env`
3. Update `main.tsx` to include AuthProvider
4. Integrate authentication in SignUp and SignIn components
5. Test the authentication flow
