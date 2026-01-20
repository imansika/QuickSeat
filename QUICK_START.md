# QuickSeat - Quick Start Guide

## 🚀 Testing Your Full-Stack Application

Your frontend and backend are now fully connected! Follow these steps to test everything.

### Step 1: Start the Backend Server

Open a terminal and run:

```powershell
cd backend
npm run dev
```

You should see:
```
Server running on port 5000
MongoDB connected
```

### Step 2: Start the Frontend Server

Open a **NEW** terminal and run:

```powershell
cd frontend
npm run dev
```

You should see:
```
VITE ready in XXX ms
Local: http://localhost:5173/
```

### Step 3: Test the Application

1. **Open your browser** and go to: `http://localhost:5173/`

2. **Click "Get Started" or "Sign In"**

3. **Create a new account:**
   - Fill in your details (Full Name, Email, Phone, Password)
   - Click "Create Account"
   - Wait for the registration to complete

4. **You should see a success dashboard** with:
   - Your user profile information
   - Backend connection status (all green!)
   - Confirmation that data is synced with MongoDB

### What Happens Behind the Scenes?

When you sign up:

1. ✅ **Frontend** → Sends credentials to Firebase Authentication
2. ✅ **Firebase** → Creates user account and returns auth token
3. ✅ **Frontend** → Sends user profile data + token to your backend API
4. ✅ **Backend** → Verifies Firebase token with Firebase Admin SDK
5. ✅ **Backend** → Saves user profile to MongoDB
6. ✅ **Frontend** → Displays authenticated dashboard with user data

### Test Sign In

1. Click "Sign Out" in the dashboard
2. Click "Sign In" from the landing page
3. Enter your email and password
4. You should be redirected to the dashboard again

### Test Google Sign In (Optional)

1. Click "Sign Out"
2. Click "Sign In" 
3. Click the "Google" button
4. Follow Google's authentication flow
5. You'll be automatically registered and logged in

---

## ✅ What's Working Now

- [x] Firebase Authentication
- [x] Backend API with Express & MongoDB
- [x] Frontend React app with Vite
- [x] User registration (Sign Up)
- [x] User login (Sign In)
- [x] JWT token verification
- [x] User profile management
- [x] Protected routes
- [x] Google Sign In
- [x] Facebook Sign In (if configured)

---

## 🔍 Verify Data in MongoDB

You can verify your user data is saved in MongoDB:

1. Open MongoDB Compass
2. Connect to your database
3. Navigate to the `users` collection
4. You should see your user profile with all fields

---

## 🎉 Next Steps

Now that authentication is working, you can:

1. Build the bus booking system
2. Create seat selection UI
3. Add payment integration
4. Build operator dashboard
5. Add booking history
6. Implement real-time updates

---

## ⚠️ Troubleshooting

### "Failed to create account" error
- Check that both backend and frontend servers are running
- Verify `.env` files have correct values
- Check browser console for detailed error messages

### "No token provided" error
- Clear browser cache and try again
- Check that Firebase configuration is correct

### Backend connection errors
- Make sure MongoDB is running
- Verify `MONGO_URI` in backend `.env` file
- Check backend terminal for error messages

### Firebase errors
- Verify Firebase configuration in frontend `.env`
- Check Firebase Console for any restrictions
- Ensure Firebase Authentication is enabled

---

## 📝 Important Notes

- Firebase ID tokens expire after 1 hour (auto-refreshed)
- User profiles are automatically created on first sign-up
- Google/Facebook sign-in creates profiles automatically
- All API endpoints require valid authentication token

---

Enjoy building your bus booking system! 🚌✨
