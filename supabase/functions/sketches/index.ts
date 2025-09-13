import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { corsHeaders } from '../_shared/cors.ts'

interface Database {
  public: {
    Tables: {
      sketches: {
        Row: {
          id: string
          user_id: string | null
          title: string
          content: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          title?: string
          content: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string
          content?: any
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const method = req.method
    
    // Get user from Authorization header
    const authHeader = req.headers.get('Authorization')
    let user = null
    
    if (authHeader) {
      const { data: { user: authUser }, error } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      )
      if (!error) {
        user = authUser
      }
    }

    console.log(`${method} request to sketches API, user: ${user?.id || 'anonymous'}`)

    switch (method) {
      case 'GET': {
        // GET /sketches/:id or GET /sketches (for user's sketches)
        const id = pathParts[pathParts.length - 1]
        
        if (id && id !== 'sketches') {
          // Get specific sketch
          let query = supabase
            .from('sketches')
            .select('*')
            .eq('id', id)
            .single()

          const { data, error } = await query
          
          if (error) {
            console.error('Error fetching sketch:', error)
            return new Response(
              JSON.stringify({ error: 'Sketch not found' }),
              { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify(data),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } else {
          // Get user's sketches (only if authenticated)
          if (!user) {
            return new Response(
              JSON.stringify({ error: 'Authentication required' }),
              { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          const { data, error } = await supabase
            .from('sketches')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

          if (error) {
            console.error('Error fetching sketches:', error)
            return new Response(
              JSON.stringify({ error: 'Failed to fetch sketches' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify(data),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }

      case 'POST': {
        // Create new sketch
        const body = await req.json()
        const { title, content } = body

        if (!content) {
          return new Response(
            JSON.stringify({ error: 'Content is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const insertData: any = {
          title: title || 'Untitled Sketch',
          content,
        }

        // If user is authenticated, associate sketch with user
        if (user) {
          insertData.user_id = user.id
        }

        const { data, error } = await supabase
          .from('sketches')
          .insert(insertData)
          .select()
          .single()

        if (error) {
          console.error('Error creating sketch:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to create sketch' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify(data),
          { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'PUT': {
        // Update sketch
        const id = pathParts[pathParts.length - 1]
        const body = await req.json()
        const { title, content } = body

        if (!user) {
          return new Response(
            JSON.stringify({ error: 'Authentication required' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const updateData: any = {}
        if (title !== undefined) updateData.title = title
        if (content !== undefined) updateData.content = content

        const { data, error } = await supabase
          .from('sketches')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', user.id) // Ensure user can only update their own sketches
          .select()
          .single()

        if (error) {
          console.error('Error updating sketch:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to update sketch or sketch not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify(data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'DELETE': {
        // Delete sketch
        const id = pathParts[pathParts.length - 1]

        if (!user) {
          return new Response(
            JSON.stringify({ error: 'Authentication required' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { error } = await supabase
          .from('sketches')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id) // Ensure user can only delete their own sketches

        if (error) {
          console.error('Error deleting sketch:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to delete sketch or sketch not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ message: 'Sketch deleted successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Unhandled error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})