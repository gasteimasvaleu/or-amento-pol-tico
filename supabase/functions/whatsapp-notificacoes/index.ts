import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/twilio'

interface NotificationData {
  despesasAmanha: Array<{ responsavel: string; valor: number; cargo: string; municipio: string }>
  despesasAtrasadas: Array<{ responsavel: string; valor: number; cargo: string; dias_atraso: number }>
  lembretes: Array<{ titulo: string; prioridade: string }>
  compromissos: Array<{ titulo: string; data_inicio: string; local: string | null; tipo: string }>
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function buildMessage(data: NotificationData): string | null {
  const sections: string[] = []

  if (data.lembretes.length > 0) {
    const items = data.lembretes.map(l => `• ${l.titulo} (${l.prioridade})`).join('\n')
    sections.push(`📋 *Lembretes para amanhã:*\n${items}`)
  }

  if (data.compromissos.length > 0) {
    const items = data.compromissos.map(c => {
      const hora = new Date(c.data_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
      const local = c.local ? `, ${c.local}` : ''
      return `• ${c.titulo} - ${hora}${local}`
    }).join('\n')
    sections.push(`📅 *Compromissos amanhã:*\n${items}`)
  }

  if (data.despesasAmanha.length > 0) {
    const items = data.despesasAmanha.map(d => `• ${d.responsavel} - ${formatCurrency(d.valor)} (${d.cargo}, ${d.municipio})`).join('\n')
    sections.push(`💰 *Despesas com vencimento amanhã:*\n${items}`)
  }

  if (data.despesasAtrasadas.length > 0) {
    const items = data.despesasAtrasadas.map(d => `• ${d.responsavel} - ${formatCurrency(d.valor)} (venceu há ${d.dias_atraso} dias)`).join('\n')
    sections.push(`⚠️ *Despesas pendentes (atrasadas):*\n${items}`)
  }

  return sections.length > 0 ? sections.join('\n\n') : null
}

async function sendWhatsApp(phone: string, message: string) {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
  if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured')

  const TWILIO_API_KEY = Deno.env.get('TWILIO_API_KEY')
  if (!TWILIO_API_KEY) throw new Error('TWILIO_API_KEY is not configured')

  const TWILIO_CONTENT_SID = Deno.env.get('TWILIO_CONTENT_SID')
  if (!TWILIO_CONTENT_SID) throw new Error('TWILIO_CONTENT_SID is not configured')

  const rawFrom = Deno.env.get('TWILIO_WHATSAPP_FROM') || '+14155238886'
  const TWILIO_WHATSAPP_FROM = rawFrom.startsWith('whatsapp:') ? rawFrom : `whatsapp:${rawFrom}`

  const response = await fetch(`${GATEWAY_URL}/Messages.json`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'X-Connection-Api-Key': TWILIO_API_KEY,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      To: `whatsapp:${phone}`,
      From: TWILIO_WHATSAPP_FROM,
      ContentSid: TWILIO_CONTENT_SID,
      ContentVariables: JSON.stringify({ "1": message }),
    }),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(`Twilio API error [${response.status}]: ${JSON.stringify(data)}`)
  }
  return data
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Calculate dates in São Paulo timezone
    const now = new Date()
    const spFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' })
    const todayStr = spFormatter.format(now)
    
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const tomorrowStr = spFormatter.format(tomorrow)

    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
    const fiveDaysAgoStr = spFormatter.format(fiveDaysAgo)

    // Get all users with notification config and a phone number
    const { data: configs, error: configError } = await supabase
      .from('notificacao_config')
      .select('*')
      .not('whatsapp_phone', 'is', null)

    if (configError) throw configError
    if (!configs || configs.length === 0) {
      return new Response(JSON.stringify({ message: 'No users configured for notifications' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const results: Array<{ user_id: string; status: string; error?: string }> = []

    for (const config of configs) {
      try {
        const notifData: NotificationData = {
          despesasAmanha: [],
          despesasAtrasadas: [],
          lembretes: [],
          compromissos: [],
        }

        // Despesas com vencimento amanhã (sem pagamento feito)
        if (config.notif_despesas) {
          const { data: despAmanha } = await supabase
            .from('despesas_politicas')
            .select('responsavel, valor, cargo, municipio')
            .eq('user_id', config.user_id)
            .eq('pagamento_agendado', tomorrowStr)
            .is('pagamento_feito_em', null)

          if (despAmanha) notifData.despesasAmanha = despAmanha

          // Despesas atrasadas (vencidas há 5+ dias sem pagamento)
          const { data: despAtrasadas } = await supabase
            .from('despesas_politicas')
            .select('responsavel, valor, cargo, pagamento_agendado')
            .eq('user_id', config.user_id)
            .lte('pagamento_agendado', fiveDaysAgoStr)
            .is('pagamento_feito_em', null)

          if (despAtrasadas) {
            notifData.despesasAtrasadas = despAtrasadas.map(d => ({
              responsavel: d.responsavel,
              valor: d.valor,
              cargo: d.cargo,
              dias_atraso: Math.floor((now.getTime() - new Date(d.pagamento_agendado).getTime()) / (1000 * 60 * 60 * 24)),
            }))
          }
        }

        // Lembretes para amanhã (não concluídos)
        if (config.notif_lembretes) {
          const tomorrowStart = `${tomorrowStr}T00:00:00`
          const tomorrowEnd = `${tomorrowStr}T23:59:59`

          const { data: lembretes } = await supabase
            .from('lembretes')
            .select('titulo, prioridade')
            .eq('user_id', config.user_id)
            .eq('concluido', false)
            .gte('data_lembrete', tomorrowStart)
            .lte('data_lembrete', tomorrowEnd)

          if (lembretes) notifData.lembretes = lembretes
        }

        // Compromissos amanhã
        if (config.notif_agenda) {
          const tomorrowStart = `${tomorrowStr}T00:00:00`
          const tomorrowEnd = `${tomorrowStr}T23:59:59`

          const { data: compromissos } = await supabase
            .from('compromissos')
            .select('titulo, data_inicio, local, tipo')
            .eq('user_id', config.user_id)
            .gte('data_inicio', tomorrowStart)
            .lte('data_inicio', tomorrowEnd)

          if (compromissos) notifData.compromissos = compromissos
        }

        const message = buildMessage(notifData)
        if (message) {
          await sendWhatsApp(config.whatsapp_phone, message)
          results.push({ user_id: config.user_id, status: 'sent' })
        } else {
          results.push({ user_id: config.user_id, status: 'no_notifications' })
        }
      } catch (err: any) {
        console.error(`Error for user ${config.user_id}:`, err.message)
        results.push({ user_id: config.user_id, status: 'error', error: err.message })
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Error in whatsapp-notificacoes:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
