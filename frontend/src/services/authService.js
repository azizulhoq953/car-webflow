
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;  // Update with your backend URL

const signup = async (username, password) => {
  const response = await axios.post(`${API_URL}/signup`, { username, password });
  return response.data;
};



const signing = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/signin`, { username, password });
    const { token, isAdmin } = response.data;

    // Store both token and isAdmin in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('isAdmin', isAdmin);

    return { token, isAdmin };
  } catch (error) {
    throw new Error('Login failed');
  }
};


export default { signup, signing };
