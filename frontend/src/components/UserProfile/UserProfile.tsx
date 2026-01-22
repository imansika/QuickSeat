import { useState } from 'react';
import { Bus, User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, LogOut, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface UserData {
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  imageUrl: string;
}

export function UserProfile() {
  const navigate = useNavigate();
  const { userProfile, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  const [userData, setUserData] = useState<UserData>({
    name: userProfile?.fullName || 'Kasun Perera',
    email: userProfile?.email || 'kasun.perera@example.com',
    phone: userProfile?.phone || '+94 77 123 4567',
    address: '123 Galle Road, Colombo 03, Sri Lanka',
    dateOfBirth: '1990-05-15',
    imageUrl: userProfile?.photoURL || '',
  });

  const [editedData, setEditedData] = useState<UserData>(userData);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedData({ ...editedData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData(userData);
  };

  const handleSave = () => {
    setUserData(editedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedData(userData);
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-200">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/passenger')}
                className="flex items-center gap-2 text-slate-600 hover:text-[#264b8d] transition-colors font-medium"
              >
                ← Back
              </button>
              <div className="flex items-center gap-3">
                <div className="bg-[#264b8d] p-2.5 rounded-xl">
                  <Bus className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-[#264b8d]">QuickSeat</span>
              </div>
            </div>
            
            {/* Profile Icon and Logout */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-red-600 transition-colors font-medium"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Large Gradient Background Container */}
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-[#264b8d]/5 via-slate-50 to-[#dfae6b]/5 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
            <p className="text-slate-600 mt-1">Manage your personal information</p>
          </div>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-6 py-3 bg-[#264b8d] text-white rounded-xl font-semibold hover:bg-[#1e3a6d] transition-all shadow-sm hover:shadow-md"
            >
              <Edit2 className="w-5 h-5" />
              Edit Profile
            </button>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-[#264b8d] to-[#1e3a6d] h-32"></div>
          
          {/* Profile Content */}
          <div className="px-8 pb-8">
            {/* Avatar */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 mb-6">
              <div className="flex items-end gap-4">
                <div className="relative w-32 h-32 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br from-[#264b8d] to-[#1e3a6d]">
                  {userData.imageUrl ? (
                    <img
                      src={userData.imageUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}
                  {isEditing && (
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer hover:bg-black/60 transition-colors">
                      <Camera className="w-8 h-8 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div className="pb-2">
                  <h2 className="text-2xl font-bold text-slate-900">{userData.name}</h2>
                  <p className="text-slate-600">{userData.email}</p>
                </div>
              </div>
              {isEditing && (
                <div className="flex gap-3 mt-4 sm:mt-0">
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-3 bg-[#dfae6b] text-white rounded-xl font-semibold hover:bg-[#c99a5a] transition-all shadow-sm hover:shadow-md"
                  >
                    <Save className="w-5 h-5" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            {/* Profile Information */}
            <div className="space-y-6">
              {/* Full Name */}
              <div className={`p-6 rounded-xl border-2 transition-all ${
                isEditing ? 'border-[#dfae6b] bg-[#dfae6b]/5' : 'border-slate-200'
              }`}>
                <div className="flex items-start gap-3">
                  <User className={`w-5 h-5 mt-1 ${isEditing ? 'text-[#dfae6b]' : 'text-slate-600'}`} />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-slate-600 block mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedData.name}
                        onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dfae6b] focus:border-transparent"
                      />
                    ) : (
                      <p className="text-lg font-semibold text-slate-900">{userData.name}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Email (Read-only) */}
              <div className="p-6 rounded-xl border-2 border-slate-200 bg-slate-50">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 mt-1 text-slate-400" />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-slate-600 block mb-2">
                      Email Address
                      <span className="ml-2 text-xs text-slate-500">(Cannot be changed)</span>
                    </label>
                    <p className="text-lg font-semibold text-slate-500">{userData.email}</p>
                  </div>
                </div>
              </div>

              {/* Phone Number */}
              <div className={`p-6 rounded-xl border-2 transition-all ${
                isEditing ? 'border-[#dfae6b] bg-[#dfae6b]/5' : 'border-slate-200'
              }`}>
                <div className="flex items-start gap-3">
                  <Phone className={`w-5 h-5 mt-1 ${isEditing ? 'text-[#dfae6b]' : 'text-slate-600'}`} />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-slate-600 block mb-2">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editedData.phone}
                        onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dfae6b] focus:border-transparent"
                      />
                    ) : (
                      <p className="text-lg font-semibold text-slate-900">{userData.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className={`p-6 rounded-xl border-2 transition-all ${
                isEditing ? 'border-[#dfae6b] bg-[#dfae6b]/5' : 'border-slate-200'
              }`}>
                <div className="flex items-start gap-3">
                  <MapPin className={`w-5 h-5 mt-1 ${isEditing ? 'text-[#dfae6b]' : 'text-slate-600'}`} />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-slate-600 block mb-2">
                      Address
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editedData.address}
                        onChange={(e) => setEditedData({ ...editedData, address: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dfae6b] focus:border-transparent resize-none"
                      />
                    ) : (
                      <p className="text-lg font-semibold text-slate-900">{userData.address}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Date of Birth */}
              <div className={`p-6 rounded-xl border-2 transition-all ${
                isEditing ? 'border-[#dfae6b] bg-[#dfae6b]/5' : 'border-slate-200'
              }`}>
                <div className="flex items-start gap-3">
                  <Calendar className={`w-5 h-5 mt-1 ${isEditing ? 'text-[#dfae6b]' : 'text-slate-600'}`} />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-slate-600 block mb-2">
                      Date of Birth
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editedData.dateOfBirth}
                        onChange={(e) => setEditedData({ ...editedData, dateOfBirth: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dfae6b] focus:border-transparent"
                      />
                    ) : (
                      <p className="text-lg font-semibold text-slate-900">
                        {new Date(userData.dateOfBirth).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-16 mt-12">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[#264b8d] p-2 rounded-xl">
                  <Bus className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">QuickSeat</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Making bus travel simple, comfortable and accessible for everyone.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">Support</h4>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">Contact</h4>
              <ul className="space-y-3 text-slate-400">
                <li>support@quickseat.com</li>
                <li>1-800-QUICKSEAT</li>
                <li>Available 24/7</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-slate-400">
                © 2026 QuickSeat. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">Twitter</a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">Facebook</a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">Instagram</a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">LinkedIn</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
