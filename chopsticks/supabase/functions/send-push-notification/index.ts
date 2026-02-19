import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushPayload {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const payload: PushPayload | PushPayload[] = await req.json();
    const payloads = Array.isArray(payload) ? payload : [payload];

    // Collect all user IDs to fetch tokens in one query
    const userIds = [...new Set(payloads.map((p) => p.userId))];

    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, expo_push_token')
      .in('id', userIds)
      .not('expo_push_token', 'is', null);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return new Response(JSON.stringify({ error: 'Failed to fetch push tokens' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const tokenMap = new Map(users?.map((u) => [u.id, u.expo_push_token]) ?? []);

    // Build Expo push messages
    const messages = payloads
      .map((p) => {
        const token = tokenMap.get(p.userId);
        if (!token) return null;
        return {
          to: token,
          sound: 'default' as const,
          title: p.title,
          body: p.body,
          data: p.data ?? {},
        };
      })
      .filter(Boolean);

    if (messages.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Send via Expo Push API (batches of 100)
    let totalSent = 0;
    for (let i = 0; i < messages.length; i += 100) {
      const batch = messages.slice(i, i + 100);
      const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(batch),
      });

      if (!expoResponse.ok) {
        console.error('Expo push error:', await expoResponse.text());
      } else {
        totalSent += batch.length;
      }
    }

    return new Response(JSON.stringify({ sent: totalSent }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in send-push-notification:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
