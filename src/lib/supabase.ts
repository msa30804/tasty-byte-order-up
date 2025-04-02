import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nphhfguutnhlcunamqty.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5waGhmZ3V1dG5obGN1bmFtcXR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MzQzNTEsImV4cCI6MjA1OTExMDM1MX0.z_Pr8E7klLDhEwAefvcANSUYFgATIOxDO-UXJFxgxqU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'admin' | 'cashier';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  created_at: string;
}

// Hardcoded user data
const hardcodedUsers = {
  'admin@tastybyte.com': {
    name: 'Admin User',
    role: 'admin' as UserRole
  },
  'cashier@tastybyte.com': {
    name: 'Cashier User',
    role: 'cashier' as UserRole
  }
};

// Helper functions for auth
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  // Check for hardcoded users first
  if (hardcodedUsers[user.email as keyof typeof hardcodedUsers]) {
    const userData = hardcodedUsers[user.email as keyof typeof hardcodedUsers];
    
    return {
      id: user.id,
      email: user.email as string,
      name: userData.name,
      role: userData.role,
      created_at: user.created_at
    } as User;
  }
  
  // Get the user's profile from DB as a fallback
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

// Still keeping this function but it's not used in the app anymore
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
