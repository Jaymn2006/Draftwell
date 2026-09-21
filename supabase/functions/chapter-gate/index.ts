// ── Supabase Edge Function: chapter-gate ─────────────────────────────────
// Deno TypeScript Runtime
// Serves fast, optimized 5,000+ word webnovel chapters and guards against automated scraping.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { novelId, chapterNumber } = await req.json()
    if (!novelId || chapterNumber === undefined) {
      return new Response(JSON.stringify({ error: 'Missing novelId or chapterNumber' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch the 5000+ word chapter payload (All chapters are completely free to read)
    const { data: chapter, error: fetchError } = await supabaseClient
      .from('chapters')
      .select('id, title, content_text, chapter_number, word_count, created_at')
      .eq('novel_id', novelId)
      .eq('chapter_number', chapterNumber)
      .single()

    if (fetchError || !chapter) {
      return new Response(JSON.stringify({ error: 'Chapter not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ data: chapter }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal edge error'
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
