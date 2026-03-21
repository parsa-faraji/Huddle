import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { logOut, onAuthChange } from '../services/authService';
import type { ProfileResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export default function Dashboard() {
  const [profileData, setProfileData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (!user) {
        navigate('/signin');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchProfile = async () => {
    if (!auth.currentUser) {
      setProfileData('No user logged in!');
      return;
    }

    setLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();

      const res = await fetch(`${API_BASE_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data: ProfileResponse = await res.json();
        setProfileData(data.message);
      } else {
        const errorText = await res.text();
        setProfileData(`Error fetching profile: ${res.status} ${errorText}`);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to fetch profile', error);
      setProfileData(`Network error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogOut = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to your protected dashboard!</p>

      <button onClick={fetchProfile} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch My Profile from Backend'}
      </button>

      {profileData && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#eee' }}>
          <strong>Backend Response:</strong> {profileData}
        </div>
      )}

      <br /><br />
      <button onClick={handleLogOut}>Log Out</button>
    </div>
  );
}
