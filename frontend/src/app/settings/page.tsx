'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/lib/store/auth';
import { Container, Input, Button, Avatar, LoadingSpinner } from '@/components/ui';
import { userAPI } from '@/lib/api';
import { Camera, Save, User, Bell, Shield, Palette } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, updateUser, token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });

  const handleProfileUpdate = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await userAPI.updateProfile({
        username: profileData.username,
      }, token);

      if (response.success && response.data) {
        updateUser(response.data);
        toast.success('Profile updated successfully!');
      } else {
        const errorResponse = response as { error?: string };
        toast.error(errorResponse.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('An error occurred while updating profile');
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !token) return;

    setLoading(true);
    try {
      const response = await userAPI.uploadAvatar(file, token);
      
      if (response.success && response.data) {
        const avatarData = response.data as { avatar: string };
        updateUser({ ...user!, avatar: avatarData.avatar });
        toast.success('Avatar updated successfully!');
      } else {
        const errorResponse = response as { error?: string };
        toast.error(errorResponse.error || 'Failed to upload avatar');
      }
    } catch (error) {
      toast.error('An error occurred while uploading avatar');
      console.error('Avatar upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield size={16} /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette size={16} /> },
  ];

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <Avatar
            src={user?.avatar}
            alt={user?.username || 'User'}
            size="xl"
          />
          <label
            htmlFor="avatar-upload"
            className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
          >
            <Camera size={16} />
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
              disabled={loading}
            />
          </label>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Profile Picture</h3>
          <p className="text-gray-400 text-sm">
            Click the camera icon to upload a new avatar
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <div className="space-y-4">
        <Input
          label="Username"
          value={profileData.username}
          onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
          placeholder="Enter your username"
          disabled={loading}
        />

        <Input
          label="Email"
          value={profileData.email}
          disabled
          placeholder="Email cannot be changed"
        />

        <Button
          onClick={handleProfileUpdate}
          disabled={loading || !profileData.username.trim()}
          className="flex items-center space-x-2"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Updating...</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>Save Changes</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Notification Preferences</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
          <div>
            <h4 className="text-white font-medium">Message Notifications</h4>
            <p className="text-gray-400 text-sm">Get notified when you receive new messages</p>
          </div>
          <input type="checkbox" defaultChecked className="toggle" />
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
          <div>
            <h4 className="text-white font-medium">Call Notifications</h4>
            <p className="text-gray-400 text-sm">Get notified for incoming calls</p>
          </div>
          <input type="checkbox" defaultChecked className="toggle" />
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
          <div>
            <h4 className="text-white font-medium">Music Updates</h4>
            <p className="text-gray-400 text-sm">Get notified about new music recommendations</p>
          </div>
          <input type="checkbox" className="toggle" />
        </div>
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Privacy Settings</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
          <div>
            <h4 className="text-white font-medium">Online Status</h4>
            <p className="text-gray-400 text-sm">Show when you&apos;re online to friends</p>
          </div>
          <input type="checkbox" defaultChecked className="toggle" />
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
          <div>
            <h4 className="text-white font-medium">Music Activity</h4>
            <p className="text-gray-400 text-sm">Share what you&apos;re listening to</p>
          </div>
          <input type="checkbox" defaultChecked className="toggle" />
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
          <div>
            <h4 className="text-white font-medium">Profile Visibility</h4>
            <p className="text-gray-400 text-sm">Allow others to find and view your profile</p>
          </div>
          <input type="checkbox" defaultChecked className="toggle" />
        </div>
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Appearance Settings</h3>
      <div className="space-y-4">
        <div className="p-4 bg-gray-800 rounded-lg">
          <h4 className="text-white font-medium mb-2">Theme</h4>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input type="radio" name="theme" value="dark" defaultChecked />
              <span className="text-gray-300">Dark Theme</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="radio" name="theme" value="light" />
              <span className="text-gray-300">Light Theme</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="radio" name="theme" value="auto" />
              <span className="text-gray-300">System Theme</span>
            </label>
          </div>
        </div>
        <div className="p-4 bg-gray-800 rounded-lg">
          <h4 className="text-white font-medium mb-2">Music Player Size</h4>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input type="radio" name="player-size" value="compact" />
              <span className="text-gray-300">Compact</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="radio" name="player-size" value="normal" defaultChecked />
              <span className="text-gray-300">Normal</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="radio" name="player-size" value="large" />
              <span className="text-gray-300">Large</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'privacy':
        return renderPrivacyTab();
      case 'appearance':
        return renderAppearanceTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Container className="py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-gray-900 rounded-lg p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
