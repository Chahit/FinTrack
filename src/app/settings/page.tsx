'use client';

import { useEffect, useState } from "react";
import { useUser } from '@clerk/clerk-react';
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (isLoaded && user) {
      setUserDetails(prev => ({
        ...prev,
        name: user.fullName || '',
        email: user.emailAddresses[0]?.emailAddress || ''
      }));
    }
  }, [isLoaded, user]);

  if (!isLoaded) return <div>Loading...</div>;

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userDetails)
      });

      if (!response.ok) throw new Error('Failed to update profile');
      setIsLoading(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch('/api/user', {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete account');
      router.push('/sign-in');
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <input
                type="text"
                value={userDetails.name}
                onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })}
                placeholder="Full Name"
                className="w-full px-3 py-2 rounded-md border bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={userDetails.email}
                onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
                placeholder="Email"
                className="w-full px-3 py-2 rounded-md border bg-background"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Password</label>
              <input
                type="password"
                value={userDetails.currentPassword}
                onChange={(e) => setUserDetails({ ...userDetails, currentPassword: e.target.value })}
                placeholder="Current Password"
                className="w-full px-3 py-2 rounded-md border bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <input
                type="password"
                value={userDetails.newPassword}
                onChange={(e) => setUserDetails({ ...userDetails, newPassword: e.target.value })}
                placeholder="New Password"
                className="w-full px-3 py-2 rounded-md border bg-background"
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Theme</div>
                <div className="text-sm text-muted-foreground">
                  Switch between light and dark mode
                </div>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between gap-4">
              <button
                onClick={handleUpdateProfile}
                disabled={isLoading}
                className="flex-1 btn-primary"
              >
                {isLoading ? 'Updating...' : 'Update Profile'}
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn-destructive"
              >
                Delete Account
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Account Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="btn-ghost"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              className="btn-destructive"
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
