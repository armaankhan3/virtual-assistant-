import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Customize = () => {
  const [formData, setFormData] = useState({
    // ...your form data states
  });

  useEffect(() => {
    // ...your fetch or any side effects
  }, []);

  const handleUpdate = async (data) => {
    try {
      const res = await axios.post(
        'https://ai-virual-backend1.onrender.com/api/user/update',
        data,
        { withCredentials: true }
      );
      // handle success response
    } catch (err) {
      // handle error
    }
  };

  return (
    <div>
      {/* ...your component JSX... */}
    </div>
  );
};

export default Customize;