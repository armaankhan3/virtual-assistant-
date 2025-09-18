import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const UserContext = createContext();

const serverUrl = "http://localhost:8000"; // Updated backend URL to match .env port

// Ensure axios sends cookies with every request
axios.defaults.withCredentials = true;

const UserProvider = ({ children }) => {
  const [userdata, setUserdata] = useState(null);

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
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Not logged in, don't show alert
        setUserdata(null);
      } else {
        console.error('Current user fetch error:', error);
        setUserdata(null);
        if (error.response && error.response.data && error.response.data.message) {
          alert('Authentication error: ' + error.response.data.message);
        }
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
      return result.data;
    } catch (error) {
      console.error("Error fetching Gemini response:", error);
      if (error.response) {
        // Server responded with a status other than 2xx
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      } else if (error.request) {
        // Request was made but no response received
        console.error("No response received:", error.request);
      } else {
        // Something else happened
        console.error("Error message:", error.message);
      }
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
