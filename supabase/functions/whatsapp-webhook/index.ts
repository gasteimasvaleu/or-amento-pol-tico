const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const contentType = req.headers.get('content-type') || ''
    let body: Record<string, string> = {}

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.text()
      const params = new URLSearchParams(formData)
      params.forEach((value, key) => {
        body[key] = value
      })
    } else {
      body = await req.json().catch(() => ({}))
    }

    console.log('WhatsApp webhook received:', JSON.stringify({
      from: body.From,
      to: body.To,
      body: body.Body,
      status: body.MessageStatus || body.SmsStatus,
      messageSid: body.MessageSid || body.SmsSid,
      timestamp: new Date().toISOString(),
    }))

    // Return TwiML empty response
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        headers: { ...corsHeaders, 'Content-Type': 'text/xml' },
      }
    )
  } catch (error: any) {
    console.error('Error in whatsapp-webhook:', error)
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        headers: { ...corsHeaders, 'Content-Type': 'text/xml' },
      }
    )
  }
})
