import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'react-toastify';

export default function Settings() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [formData, setFormData] = useState({
    username: user.username || '',
    email: user.email || '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // This would call an API to update profile
    toast.success('Profile updated successfully');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.new_password !== formData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    // This would call an API to change password
    toast.success('Password changed successfully');
    setFormData({ ...formData, current_password: '', new_password: '', confirm_password: '' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <div className="flex h-10 w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm text-gray-600">
                {user.role}
              </div>
            </div>
            <Button type="submit" className="w-full">Update Profile</Button>
          </form>
        </div>

        {/* Password Change */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="current_password">Current Password</Label>
              <input
                id="current_password"
                type="password"
                value={formData.current_password}
                onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new_password">New Password</Label>
              <input
                id="new_password"
                type="password"
                value={formData.new_password}
                onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm_password">Confirm New Password</Label>
              <input
                id="confirm_password"
                type="password"
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <Button type="submit" className="w-full">Change Password</Button>
          </form>
        </div>

        {/* System Information */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Information</h2>
          <div className="space-y-3">
            <div>
              <Label className="text-sm text-gray-600">Application Name</Label>
              <p className="text-sm font-medium">StockMaster IMS</p>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Version</Label>
              <p className="text-sm font-medium">1.0.0</p>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Backend</Label>
              <p className="text-sm font-medium">Django 5.2.8 + DRF 3.16.1</p>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Frontend</Label>
              <p className="text-sm font-medium">React 19.2.0 + Vite 7.2.4</p>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Email Notifications</Label>
                <p className="text-xs text-gray-600">Receive email alerts for low stock</p>
              </div>
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Auto-validate Receipts</Label>
                <p className="text-xs text-gray-600">Automatically validate receipts on creation</p>
              </div>
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Dark Mode</Label>
                <p className="text-xs text-gray-600">Enable dark theme</p>
              </div>
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
