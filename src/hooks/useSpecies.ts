import { useEffect, useState } from 'react';
import supabase from '../lib/supabase';
import type { Species } from '../lib/database.types';

export function useSpecies() {
  const [species, setSpecies] = useState<Species[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchSpecies = async () => {
      setIsLoading(true);
      const { data, error: err } = await supabase
        .from('species')
        .select('*')
        .order('species_code');

      if (!mounted) return;
      if (err) { setError(err.message); setIsLoading(false); return; }
      setSpecies((data ?? []) as Species[]);
      setIsLoading(false);
    };

    fetchSpecies();
    return () => { mounted = false; };
  }, []);

  return { species, isLoading, error };
}
