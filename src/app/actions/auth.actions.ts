'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(30, 'Display name must be 30 characters or less'),
})

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function signUp(email: string, password: string, displayName: string) {
  try {
    const validated = signUpSchema.safeParse({ email, password, displayName })
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    const supabase = await createClient()

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('display_name', displayName)
      .maybeSingle()

    if (existing) {
      return { success: false, error: 'Display name already taken' }
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    })

    if (authError) {
      return { success: false, error: authError.message }
    }

    if (authData.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        user_id: authData.user.id,
        display_name: displayName,
      })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        return { success: false, error: 'Failed to create user profile' }
      }
    }

    return {
      success: true,
      data: { message: 'Account created successfully. Please check your email for verification.' },
    }
  } catch (error) {
    console.error('Sign up error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const validated = signInSchema.safeParse({ email, password })
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: { user: data.user, session: data.session } }
  } catch (error) {
    console.error('Sign in error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function signOut() {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()
    if (error) return { success: false, error: error.message }
    return { success: true, data: { message: 'Signed out successfully' } }
  } catch (error) {
    console.error('Sign out error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getSession() {
  try {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) return { success: false, error: error.message }
    return { success: true, data: { session } }
  } catch (error) {
    console.error('Get session error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getUser() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profileError) {
      return { success: false, error: 'Failed to fetch user profile' }
    }

    return { success: true, data: { user, profile } }
  } catch (error) {
    console.error('Get user error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
