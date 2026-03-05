import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { logOut, onAuthChange } from '../services/authService';

export default function Dashboard() {
  const [profileData, setProfileData] = useState<string | null>(null);
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
    try {
      // 1. Check if user is logged in
      if (!auth.currentUser) {
        setProfileData("No user logged in!");
        return;
      }

      // 2. Grab the secret ID token from Firebase Auth
      const token = await auth.currentUser.getIdToken();

      // 3. Make the API call to your Node.js backend
      const res = await fetch('http://localhost:5000/profile', {
        headers: {
          // 4. Send the token in the Authorization header
          Authorization: `Bearer ${token}`,
        },
      });

      // 5. Read the response
      if (res.ok) {
        const data = await res.json();
        setProfileData(data.message); // Will set "Hello user [UID]"
      } else {
        setProfileData("Error fetching profile: " + res.statusText);
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to your protected dashboard!</p>
      
      <button onClick={fetchProfile}>Fetch My Profile from Backend</button>
      
      {profileData && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#eee' }}>
          <strong>Backend Response:</strong> {profileData}
        </div>
      )}

      <br /><br />
      <button onClick={logOut}>Log Out</button>
    </div>
  );
}
