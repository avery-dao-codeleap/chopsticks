import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client with user's auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const { requestId } = await req.json();

    if (!requestId) {
      return new Response(JSON.stringify({ error: 'Missing requestId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user is the requester
    const { data: request, error: fetchError } = await supabaseClient
      .from('meal_requests')
      .select('id, requester_id')
      .eq('id', requestId)
      .single();

    if (fetchError || !request) {
      return new Response(JSON.stringify({ error: 'Request not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (request.requester_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Only the host can cancel this request' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get all participants to notify (excluding requester)
    const { data: participants, error: participantsError } = await supabaseClient
      .from('request_participants')
      .select('user_id, users!inner(name)')
      .eq('request_id', requestId)
      .eq('status', 'joined')
      .neq('user_id', user.id);

    if (participantsError) {
      console.error('Error fetching participants:', participantsError);
    }

    // Update chat to expire in 24 hours (if exists)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const { error: chatUpdateError } = await supabaseClient
      .from('chats')
      .update({ expires_at: expiresAt })
      .eq('request_id', requestId);

    if (chatUpdateError) {
      console.error('Error updating chat expiry:', chatUpdateError);
    }

    // Create notifications for all participants
    if (participants && participants.length > 0) {
      const notifications = participants.map((p) => ({
        user_id: p.user_id,
        type: 'request_cancelled',
        title: 'Request Cancelled',
        body: 'The meal request has been cancelled by the host.',
        data: { request_id: requestId },
      }));

      const { error: notifError } = await supabaseClient
        .from('notifications')
        .insert(notifications);

      if (notifError) {
        console.error('Error creating notifications:', notifError);
      }
    }

    // Delete the request (cascade will handle participants)
    const { error: deleteError } = await supabaseClient
      .from('meal_requests')
      .delete()
      .eq('id', requestId);

    if (deleteError) {
      return new Response(JSON.stringify({ error: deleteError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Request cancelled successfully',
        notifiedCount: participants?.length || 0,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in handle-request-cancel:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
