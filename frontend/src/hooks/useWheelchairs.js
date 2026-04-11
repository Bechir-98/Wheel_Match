import { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl } from '../config/api.js';

export const useWheelchairs = (filters) => {
  const [wheelchairs, setWheelchairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWheelchairs = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams(filters);
        const response = await axios.get(`${apiUrl('/wheelchairs')}?${params}`);
        setWheelchairs(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch wheelchairs. Please try again later.');
        console.error('Error fetching wheelchairs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWheelchairs();
  }, [filters]);

  return { wheelchairs, loading, error };
};