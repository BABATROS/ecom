import axios from 'axios';

const API = axios.create({
  baseURL: 'https://ecom-ghqt.onrender.com'
});

export default API;