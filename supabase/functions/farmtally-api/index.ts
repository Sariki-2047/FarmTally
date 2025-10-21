import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { create, verify, getNumericDate } from "https://deno.land/x/djwt@v3.0.1/mod.ts"

// Simple password hashing using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'farmtally-salt')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname
    const method = req.method

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Route handling - Remove function name from path
    const cleanPath = path.replace('/farmtally-api', '') || '/'
    
    if (cleanPath === '/health' && method === 'GET') {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'FarmTally API is running on Supabase Edge Functions',
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // System Admin Setup
    if (cleanPath === '/system-admin/setup' && method === 'POST') {
      const body = await req.json()
      const { email, password, firstName, lastName } = body
      
      if (!email || !password || !firstName || !lastName) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Email, password, first name, and last name are required'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        )
      }

      try {
        // Check if system admin already exists
        const { data: existingAdmin } = await supabaseClient
          .from('users')
          .select('id')
          .eq('role', 'APPLICATION_ADMIN')
          .maybeSingle()

        if (existingAdmin) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'System admin already exists'
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400 
            }
          )
        }

        // Hash password
        const passwordHash = await hashPassword(password)

        // Create system admin
        const { data: newAdmin, error } = await supabaseClient
          .from('users')
          .insert({
            email: email.toLowerCase(),
            password_hash: passwordHash,
            role: 'APPLICATION_ADMIN',
            status: 'APPROVED',
            profile: {
              firstName,
              lastName
            }
          })
          .select('id, email, role, status, profile, created_at')
          .single()

        if (error) {
          throw error
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'System admin created successfully',
            data: newAdmin
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 201 
          }
        )
      } catch (error) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        )
      }
    }

    // Authentication endpoints
    if (cleanPath === '/auth/login' && method === 'POST') {
      const body = await req.json()
      const { email, password } = body
      
      if (!email || !password) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Email and password are required'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        )
      }

      try {
        // Find user
        const { data: user, error } = await supabaseClient
          .from('users')
          .select('id, email, password_hash, role, status, profile, organization_id')
          .eq('email', email.toLowerCase())
          .single()

        if (error || !user) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Invalid credentials'
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 401 
            }
          )
        }

        // Check user status
        if (user.status === 'PENDING') {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Account is pending approval. Please wait for admin approval.'
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 401 
            }
          )
        }

        if (user.status !== 'APPROVED') {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Account is not active'
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 401 
            }
          )
        }

        // Verify password
        const isPasswordValid = await verifyPassword(password, user.password_hash)
        if (!isPasswordValid) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Invalid credentials'
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 401 
            }
          )
        }

        // Generate JWT token
        const jwtSecret = Deno.env.get('JWT_SECRET') || 'farmtally-production-secret-2024-secure-key-for-jwt-tokens'
        const key = await crypto.subtle.importKey(
          "raw",
          new TextEncoder().encode(jwtSecret),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign", "verify"]
        )

        const payload = {
          userId: user.id,
          email: user.email,
          role: user.role,
          organizationId: user.organization_id,
          exp: getNumericDate(60 * 60 * 24) // 24 hours
        }

        const accessToken = await create({ alg: "HS256", typ: "JWT" }, payload, key)

        // Update last login
        await supabaseClient
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', user.id)

        // Remove password hash from response
        const { password_hash, ...userResponse } = user

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Login successful',
            data: {
              user: userResponse,
              tokens: {
                accessToken,
                refreshToken: accessToken // For now, using same token
              }
            }
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      } catch (error) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        )
      }
    }

    // Default 404 response
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Endpoint not found',
        path,
        cleanPath,
        method
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})