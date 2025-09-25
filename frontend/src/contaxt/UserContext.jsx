import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const UserContext = createContext();

const serverUrl = "http://localhost:8000"; // Updated backend URL to match .env port

// Ensure axios sends cookies with every request
axios.defaults.withCredentials = true;

const UserProvider = ({ children }) => {
  const [userdata, setUserdata] = useState(null);
  const [backendAvailable, setBackendAvailable] = useState(true);

  // Fetch current user data and set in context
  const handleCurrentUser = async () => {
    // Try using token first; if missing, try dev_user_id header for local dev
    const token = localStorage.getItem('token');
    const devUserId = localStorage.getItem('dev_user_id');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    else if (devUserId) headers['x-dev-user-id'] = devUserId;

    if (!token && !devUserId) {
      setUserdata(null);
      return;
    }

    try {
      const result = await axios.get(`${serverUrl}/api/user/current`, {
        withCredentials: true,
        headers,
      });
      setUserdata(result.data.user);
      setBackendAvailable(true);
    } catch (error) {
      // Distinguish between unauthenticated vs backend/network errors
      if (error.response && error.response.status === 401) {
        // Not logged in, clear user but backend is available
        setUserdata(null);
        setBackendAvailable(true);
      } else if (error.request) {
        // Request made but no response (network/server down)
        console.error('Current user network error:', error);
        setUserdata(null);
        setBackendAvailable(false);
      } else {
        console.error('Current user fetch error:', error);
        setUserdata(null);
        setBackendAvailable(false);
      }
    }
  };


  const getGeminiResponse = async (command) => {
    try {
      // Add auth headers like in handleCurrentUser
      const token = localStorage.getItem('token');
      const devUserId = localStorage.getItem('dev_user_id');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      else if (devUserId) headers['x-dev-user-id'] = devUserId;
      const result = await axios.post(
        `${serverUrl}/api/user/asktoassistant`,
        { command },
        { headers, withCredentials: true }
      );
      setBackendAvailable(true);
      return result.data;
    } catch (error) {
      console.error("Error fetching Gemini response:", error);
      // Mark backend availability
      if (error.request && !error.response) {
        setBackendAvailable(false);
      }

      // If server returned 429 or a Gemini quota error, give a helpful fallback
      if (error.response && (error.response.status === 429 || (error.response.data && typeof error.response.data.response === 'string' && error.response.data.response.toLowerCase().includes('quota')))) {
        return {
          fallback: true,
          response: 'Assistant is temporarily unavailable due to API quota limits. Here is a fallback reply: I heard you — try again in a moment or use a local assistant.'
        };
      }

      // If network or server down, return a friendly offline fallback for local dev
      if (!error.response) {
        return {
          fallback: true,
          response: 'Offline fallback: I cannot reach the remote assistant right now. Try again later or enable local dev mode.'
        };
      }
      return null;
    }
  }

  useEffect(() => {
    handleCurrentUser();
  }, []);

  // Sign out and clear all user-related state
  const signOut = async () => {
    try {
      await fetch(`${serverUrl}/api/auth/logout`, { method: 'GET', credentials: 'include' });
    } catch (error) {
      console.error("Error during sign out:", error);
    }
    setUserdata(null);
  };

  const value = {
    serverUrl,
    userdata,
    setUserdata,
    backendAvailable,
    signOut,
    getGeminiResponse,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
export { serverUrl };
