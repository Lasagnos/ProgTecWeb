import React from 'react';
import axios from 'axios';

function TestButton() {
  const handleClick = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/test', { withCredentials: true });
      console.log(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return <button onClick={handleClick}>Test Authentication</button>;
}

export default TestButton;