
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'admin' | 'cashier';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  created_at: string;
}

// Helper functions for auth
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  // Get the user's profile with role information
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
    
  return data as User | null;
};

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const createUser = async (email: string, password: string, name: string, role: UserRole = 'cashier') => {
  // Create the auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (authError || !authData.user) {
    return { error: authError };
  }
  
  // Create the user profile with role
  const { error: profileError } = await supabase
    .from('users')
    .insert([
      { 
        id: authData.user.id,
        email,
        name,
        role,
      }
    ]);
    
  if (profileError) {
    return { error: profileError };
  }
  
  return { user: authData.user };
};
