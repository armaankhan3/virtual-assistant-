import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  const handleCurrentUser = async () => {
    try {
      const res = await axios.get(
        'https://ai-virual-backend1.onrender.com/api/user/current',
        { withCredentials: true }
      );
      setCurrentUser(res.data.user);
      localStorage.setItem('userdata', JSON.stringify(res.data.user));
    } catch (err) {
      setCurrentUser(null);
      localStorage.removeItem('userdata');
    }
  };

  useEffect(() => {
    handleCurrentUser();
  }, []);

  return (
    <UserContext.Provider value={{ currentUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  return useContext(UserContext);
};