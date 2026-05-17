import { useState, useEffect } from 'react';

export const useCompany = () => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCompany = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/company');
      if (response.ok) {
        const data = await response.json();
        setCompany(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  return { company, loading, error, refetch: fetchCompany };
};

export const useParties = (search) => {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchParties = async () => {
      setLoading(true);
      try {
        const query = search ? `?search=${search}` : '';
        const response = await fetch(`http://localhost:5000/api/parties${query}`);
        if (response.ok) {
          const data = await response.json();
          setParties(data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchParties();
  }, [search]);

  return { parties, loading };
};

export const useGoods = (search) => {
  const [goods, setGoods] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGoods = async () => {
      setLoading(true);
      try {
        const query = search ? `?search=${search}` : '';
        const response = await fetch(`http://localhost:5000/api/goods${query}`);
        if (response.ok) {
          const data = await response.json();
          setGoods(data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGoods();
  }, [search]);

  return { goods, loading };
};
