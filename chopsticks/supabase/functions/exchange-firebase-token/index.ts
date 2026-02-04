// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const FIREBASE_PROJECT_ID = Deno.env.get('FIREBASE_PROJECT_ID')!;

interface FirebaseTokenPayload {
  iss: string;
  aud: string;
  auth_time: number;
  user_id: string;
  sub: string;
  iat: number;
  exp: number;
  phone_number?: string;
  firebase: {
    identities: Record<string, unknown>;
    sign_in_provider: string;
  };
}

/**
 * Verify Firebase ID token
 * In production, use Firebase Admin SDK or verify JWT manually
 * For MVP, we'll do basic validation
 */
async function verifyFirebaseToken(idToken: string): Promise<FirebaseTokenPayload | null> {
  try {
    // Decode JWT without verification (MVP only - use proper verification in production)
    const parts = idToken.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(atob(parts[1]));

    // Basic validation
    if (payload.aud !== FIREBASE_PROJECT_ID) {
      console.error('Invalid audience');
      return null;
    }

    if (payload.exp < Date.now() / 1000) {
      console.error('Token expired');
      return null;
    }

    return payload as FirebaseTokenPayload;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { firebaseToken } = await req.json();

    if (!firebaseToken) {
      return new Response(
        JSON.stringify({ error: 'firebaseToken is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify Firebase token
    const firebasePayload = await verifyFirebaseToken(firebaseToken);
    if (!firebasePayload) {
      return new Response(
        JSON.stringify({ error: 'Invalid Firebase token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const firebaseUid = firebasePayload.user_id;
    const phoneNumber = firebasePayload.phone_number;

    if (!phoneNumber) {
      return new Response(
        JSON.stringify({ error: 'Phone number not found in Firebase token' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Find or create Supabase user by firebase_uid
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('firebase_uid', firebaseUid)
      .single();

    let supabaseUserId: string;

    if (existingUser) {
      supabaseUserId = existingUser.id;
    } else {
      // Create new Supabase auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        phone: phoneNumber,
        phone_confirm: true,
      });

      if (authError || !authData.user) {
        console.error('Supabase user creation error:', authError);
        return new Response(
          JSON.stringify({ error: 'Failed to create Supabase user' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      supabaseUserId = authData.user.id;

      // Insert into users table
      const { error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
          id: supabaseUserId,
          firebase_uid: firebaseUid,
          phone: phoneNumber,
        });

      if (insertError) {
        console.error('Users table insert error:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to create user profile' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Generate Supabase session token
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: `${firebaseUid}@chopsticks.app`, // Dummy email for session generation
    });

    if (sessionError || !sessionData) {
      console.error('Session generation error:', sessionError);

      // Fallback: Create session directly
      const { data, error } = await supabaseAdmin.auth.signInWithPassword({
        email: `${firebaseUid}@chopsticks.app`,
        password: firebaseUid, // Use firebase_uid as password
      });

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to create Supabase session' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          user: data.user,
          session: data.session,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        userId: supabaseUserId,
        accessToken: sessionData.properties.hashed_token,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Exchange token error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
