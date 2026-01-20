'use server';

/**
 * Server Actions for Authentication
 * Secure server-side auth operations
 */

import { createServerSupabaseClient } from '@/lib/supabase';
import { ApiResponse, Profile, LoginFormData, SignUpFormData } from '@/lib/types';
import { isValidEmail, isStrongPassword } from '@/lib/utils';

/**
 * Sign up new user
 */
export async function signUp(
  data: SignUpFormData
): Promise<ApiResponse<{ user: any; profile: Profile }>> {
  try {
    // Validate input
    if (!isValidEmail(data.email)) {
      return {
        success: false,
        error: 'Invalid email format',
      };
    }

    if (!isStrongPassword(data.password)) {
      return {
        success: false,
        error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
      };
    }

    if (data.password !== data.confirm_password) {
      return {
        success: false,
        error: 'Passwords do not match',
      };
    }

    const supabase = createServerSupabaseClient();

    // Create user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser(
      {
        email: data.email,
        password: data.password,
        email_confirm: false,
      }
    );

    if (authError || !authData.user) {
      return {
        success: false,
        error: authError?.message || 'Failed to create user',
      };
    }

    // Create profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: data.email,
        full_name: data.full_name,
        role: 'cashier', // Default role
      })
      .select()
      .single();

    if (profileError) {
      // Clean up user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return {
        success: false,
        error: 'Failed to create user profile',
      };
    }

    return {
      success: true,
      data: {
        user: authData.user,
        profile: profileData,
      },
      message: 'User created successfully',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'An unexpected error occurred',
    };
  }
}

/**
 * Sign in user
 */
export async function signIn(
  data: LoginFormData
): Promise<ApiResponse<{ user: any; profile: Profile }>> {
  try {
    // Use regular client for auth
    const supabase = createServerSupabaseClient();

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword(
      {
        email: data.email,
        password: data.password,
      }
    );

    if (authError || !authData.user) {
      return {
        success: false,
        error: authError?.message || 'Invalid credentials',
      };
    }

    // Use service role client to bypass RLS for profile operations
    const supabaseAdmin = createServerSupabaseClient();

    // Fetch user profile
    let { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    // If profile doesn't exist, create it automatically
    if (profileError && profileError.code === 'PGRST116') {
      // Profile doesn't exist, create one
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            email: authData.user.email,
            full_name: authData.user.user_metadata?.full_name || authData.user.email?.split('@')[0] || 'User',
            role: 'admin', // Default to admin for first-time users
            is_active: true,
          },
        ])
        .select('*')
        .single();

      if (createError) {
        console.error('Profile creation error:', createError);
        return {
          success: false,
          error: 'Failed to create user profile: ' + createError.message,
        };
      }

      profileData = newProfile;
    } else if (profileError) {
      console.error('Profile fetch error:', profileError);
      return {
        success: false,
        error: 'Failed to load user profile: ' + profileError.message,
      };
    }

    return {
      success: true,
      data: {
        user: authData.user,
        profile: profileData,
      },
      message: 'Signed in successfully',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'An unexpected error occurred',
    };
  }
}

/**
 * Sign out user
 */
export async function signOut(): Promise<ApiResponse<null>> {
  try {
    const supabase = createServerSupabaseClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      message: 'Signed out successfully',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'An unexpected error occurred',
    };
  }
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  updates: Partial<Profile>
): Promise<ApiResponse<Profile>> {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data,
      message: 'Profile updated successfully',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'An unexpected error occurred',
    };
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<ApiResponse<Profile>> {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'An unexpected error occurred',
    };
  }
}

/**
 * List all users (Admin only)
 */
export async function listUsers(): Promise<ApiResponse<Profile[]>> {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'An unexpected error occurred',
    };
  }
}

/**
 * Update user role (Admin only)
 */
export async function updateUserRole(
  userId: string,
  role: 'admin' | 'cashier'
): Promise<ApiResponse<Profile>> {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data,
      message: `User role updated to ${role}`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'An unexpected error occurred',
    };
  }
}

/**
 * Deactivate user account (Admin only)
 */
export async function deactivateUser(userId: string): Promise<ApiResponse<Profile>> {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('profiles')
      .update({ is_active: false })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data,
      message: 'User account deactivated',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'An unexpected error occurred',
    };
  }
}
