import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/twilio'
const AI_GATEWAY_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions'

// ─── Tool Definitions ───

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'criar_eleitor',
      description: 'Cadastrar um novo eleitor no sistema',
      parameters: {
        type: 'object',
        properties: {
          nome: { type: 'string', description: 'Nome completo do eleitor' },
          cidade: { type: 'string', description: 'Cidade do eleitor' },
          bairro: { type: 'string', description: 'Bairro do eleitor' },
          telefone: { type: 'string', description: 'Telefone do eleitor' },
          classificacao: { type: 'string', enum: ['positivo', 'neutro', 'negativo'], description: 'Classificação do eleitor' },
        },
        required: ['nome'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'criar_lembrete',
      description: 'Criar um novo lembrete/tarefa',
      parameters: {
        type: 'object',
        properties: {
          titulo: { type: 'string', description: 'Título do lembrete' },
          data_lembrete: { type: 'string', description: 'Data do lembrete no formato YYYY-MM-DD' },
          prioridade: { type: 'string', enum: ['alta', 'media', 'baixa'], description: 'Prioridade' },
          descricao: { type: 'string', description: 'Descrição opcional' },
        },
        required: ['titulo', 'data_lembrete'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'criar_compromisso',
      description: 'Criar um novo compromisso na agenda',
      parameters: {
        type: 'object',
        properties: {
          titulo: { type: 'string', description: 'Título do compromisso' },
          data_inicio: { type: 'string', description: 'Data e hora no formato YYYY-MM-DDTHH:MM:SS' },
          tipo: { type: 'string', enum: ['reuniao', 'audiencia', 'evento', 'visita', 'outro'], description: 'Tipo do compromisso' },
          local: { type: 'string', description: 'Local do compromisso' },
          descricao: { type: 'string', description: 'Descrição opcional' },
        },
        required: ['titulo', 'data_inicio'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'criar_apoiador',
      description: 'Cadastrar um novo apoiador político',
      parameters: {
        type: 'object',
        properties: {
          nome: { type: 'string', description: 'Nome do apoiador' },
          cidade: { type: 'string', description: 'Cidade' },
          telefone: { type: 'string', description: 'Telefone' },
          partido: { type: 'string', description: 'Partido político' },
        },
        required: ['nome'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'criar_despesa',
      description: 'Cadastrar uma nova despesa política',
      parameters: {
        type: 'object',
        properties: {
          responsavel: { type: 'string', description: 'Nome do responsável' },
          municipio: { type: 'string', description: 'Município' },
          cargo: { type: 'string', description: 'Cargo do responsável' },
          valor: { type: 'number', description: 'Valor da despesa em reais' },
          tipo: { type: 'string', enum: ['Recorrente', 'Extra'], description: 'Tipo da despesa' },
          conta_pix: { type: 'string', description: 'Chave PIX para pagamento' },
        },
        required: ['responsavel', 'municipio', 'cargo', 'valor'],
      },
    },
  },
]

// ─── System Prompt ───

const SYSTEM_PROMPT = `Você é o assistente virtual de um político brasileiro. Você ajuda a consultar e cadastrar dados do sistema de gestão política via WhatsApp.

## Suas capacidades:

### Consultas (use os dados de contexto fornecidos):
- Total de eleitores, filtrados por cidade, bairro ou classificação (positivo/neutro/negativo)
- Resumo de despesas do mês: total, pendentes, atrasadas
- Compromissos dos próximos dias
- Lembretes pendentes
- Total de apoiadores e assessores
- Resumo geral (dashboard)

### Cadastros (use as ferramentas/tools):
- Cadastrar eleitor: nome obrigatório, cidade/bairro/telefone/classificação opcionais
- Criar lembrete: título e data obrigatórios, prioridade e descrição opcionais
- Criar compromisso: título e data/hora obrigatórios, tipo/local/descrição opcionais
- Cadastrar apoiador: nome obrigatório, cidade/telefone/partido opcionais
- Cadastrar despesa: responsável, município, cargo e valor obrigatórios, tipo e conta_pix opcionais

## Regras:
- Responda SEMPRE em português brasileiro
- Seja conciso e profissional
- Use emojis moderadamente (1-2 por mensagem)
- Se faltar informação obrigatória para um cadastro, pergunte antes de cadastrar
- Para datas relativas ("amanhã", "segunda"), converta para a data real baseada na data atual fornecida
- Você NÃO pode editar ou excluir registros existentes. Se pedirem, explique que por enquanto essa função só está disponível no app.
- Formate valores monetários em BRL (R$ 1.234,56)
- Mantenha respostas curtas para WhatsApp (máximo ~500 caracteres)`

// ─── Helper Functions ───

function cleanPhone(phone: string): string {
  return phone.replace(/^whatsapp:/, '').replace(/\D/g, '')
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

async function transcribeAudio(audioUrl: string, mediaContentType: string): Promise<string> {
  const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY')
  if (!ELEVENLABS_API_KEY) throw new Error('ELEVENLABS_API_KEY not configured')

  // Download audio from Twilio (via gateway for auth)
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!
  const TWILIO_API_KEY = Deno.env.get('TWILIO_API_KEY')!

  // Extract relative path: strip /2010-04-01/Accounts/{AccountSid} since gateway adds it automatically
  const urlObj = new URL(audioUrl)
  const pathMatch = urlObj.pathname.match(/\/2010-04-01\/Accounts\/[^/]+\/(.+)/)
  const relativePath = pathMatch ? `/${pathMatch[1]}` : urlObj.pathname
  const gatewayAudioUrl = `https://connector-gateway.lovable.dev/twilio${relativePath}${urlObj.search}`
  console.log('Downloading audio via gateway:', gatewayAudioUrl)
  const audioResponse = await fetch(gatewayAudioUrl, {
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'X-Connection-Api-Key': TWILIO_API_KEY,
    },
  })
  if (!audioResponse.ok) {
    const errBody = await audioResponse.text().catch(() => 'no body')
    console.error(`Audio download failed [${audioResponse.status}]: ${errBody.substring(0, 300)}`)
    throw new Error(`Failed to download audio: ${audioResponse.status}`)
  }
  const audioBuffer = await audioResponse.arrayBuffer()

  // Send to ElevenLabs STT
  const formData = new FormData()
  const ext = mediaContentType.includes('ogg') ? 'ogg' : 'mp3'
  formData.append('file', new Blob([audioBuffer], { type: mediaContentType }), `audio.${ext}`)
  formData.append('model_id', 'scribe_v2')
  formData.append('language_code', 'por')

  const sttResponse = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
    method: 'POST',
    headers: { 'xi-api-key': ELEVENLABS_API_KEY },
    body: formData,
  })
  if (!sttResponse.ok) throw new Error(`ElevenLabs STT error: ${sttResponse.status}`)
  const sttResult = await sttResponse.json()
  return sttResult.text || ''
}

async function loadUserContext(supabase: any, userId: string): Promise<string> {
  const now = new Date()
  const spFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' })
  const todayStr = spFormatter.format(now)
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  // Parallel queries
  const [
    eleitoresRes,
    eleitoresCidadeRes,
    despesasRes,
    compromissosRes,
    lembretesRes,
    apoiadoresRes,
    assessoresRes,
  ] = await Promise.all([
    supabase.from('eleitores').select('classificacao', { count: 'exact' }).eq('user_id', userId),
    supabase.from('eleitores').select('cidade, classificacao').eq('user_id', userId),
    supabase.from('despesas_politicas').select('valor, pagamento_agendado, pagamento_feito_em').eq('user_id', userId),
    supabase.from('compromissos').select('titulo, data_inicio, local, tipo').eq('user_id', userId).gte('data_inicio', `${todayStr}T00:00:00`).order('data_inicio').limit(15),
    supabase.from('lembretes').select('titulo, data_lembrete, prioridade').eq('user_id', userId).eq('concluido', false).order('data_lembrete').limit(15),
    supabase.from('apoiadores').select('id', { count: 'exact' }).eq('user_id', userId),
    supabase.from('assessores').select('id', { count: 'exact' }).eq('user_id', userId),
  ])

  // Process eleitores by classification
  const eleitores = eleitoresCidadeRes.data || []
  const totalEleitores = eleitores.length
  const positivos = eleitores.filter((e: any) => e.classificacao === 'positivo').length
  const neutros = eleitores.filter((e: any) => e.classificacao === 'neutro').length
  const negativos = eleitores.filter((e: any) => e.classificacao === 'negativo').length

  // Eleitores por cidade
  const cidadeMap: Record<string, { total: number; positivo: number; neutro: number; negativo: number }> = {}
  for (const e of eleitores) {
    const c = e.cidade || 'Sem cidade'
    if (!cidadeMap[c]) cidadeMap[c] = { total: 0, positivo: 0, neutro: 0, negativo: 0 }
    cidadeMap[c].total++
    if (e.classificacao === 'positivo') cidadeMap[c].positivo++
    else if (e.classificacao === 'neutro') cidadeMap[c].neutro++
    else if (e.classificacao === 'negativo') cidadeMap[c].negativo++
  }
  const cidadeLines = Object.entries(cidadeMap)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 10)
    .map(([c, v]) => `  ${c}: ${v.total} (${v.positivo}+, ${v.neutro}~, ${v.negativo}-)`)
    .join('\n')

  // Process despesas - mirror useDespesas logic
  const despesas = despesasRes.data || []
  const endOfMonth = new Date(currentYear, currentMonth, 0) // last day of current month
  const startOfMonth = new Date(currentYear, currentMonth - 1, 1)
  const endOfMonthStr = endOfMonth.toISOString().split('T')[0]
  const startOfMonthStr = startOfMonth.toISOString().split('T')[0]

  const despesasMes = despesas.filter((d: any) => {
    if (d.tipo === 'Recorrente') {
      // Recorrentes appear every month from their registration date onwards
      return d.ultimo_pagamento <= endOfMonthStr
    } else {
      // Extra: only if pagamento_agendado falls within current month
      return d.pagamento_agendado >= startOfMonthStr && d.pagamento_agendado <= endOfMonthStr
    }
  })
  const totalDespesasMes = despesasMes.reduce((s: number, d: any) => s + Number(d.valor), 0)
  const pendentes = despesasMes.filter((d: any) => !d.pagamento_feito_em)
  const totalPendente = pendentes.reduce((s: number, d: any) => s + Number(d.valor), 0)
  const atrasadas = pendentes.filter((d: any) => new Date(d.pagamento_agendado) < now)
  const totalAtrasado = atrasadas.reduce((s: number, d: any) => s + Number(d.valor), 0)

  // Build detailed expense list for AI context
  const despesaLines = despesasMes
    .sort((a: any, b: any) => Number(b.valor) - Number(a.valor))
    .map((d: any) => `  ${d.responsavel} (${d.municipio}/${d.cargo}) - ${formatCurrency(Number(d.valor))} [${d.tipo}] ${d.pagamento_feito_em ? '✅ Pago' : '⏳ Pendente'}`)
    .join('\n')

  // Compromissos
  const compromissos = compromissosRes.data || []
  const compLines = compromissos.map((c: any) => {
    const dt = new Date(c.data_inicio)
    const dia = dt.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit' })
    const hora = dt.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })
    return `  ${dia} ${hora} - ${c.titulo}${c.local ? ` (${c.local})` : ''}`
  }).join('\n')

  // Lembretes
  const lembretes = lembretesRes.data || []
  const lembLines = lembretes.map((l: any) => {
    const dt = new Date(l.data_lembrete)
    const dia = dt.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit' })
    return `  ${dia} - ${l.titulo} (${l.prioridade})`
  }).join('\n')

  const spTimeFormatter = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'full', timeStyle: 'short' })

  return `## Data/Hora atual: ${spTimeFormatter.format(now)}

## Eleitores: ${totalEleitores} total (${positivos} positivos, ${neutros} neutros, ${negativos} negativos)
Por cidade:
${cidadeLines || '  Nenhum cadastrado'}

## Despesas do mês (${currentMonth}/${currentYear}):
- Total: ${formatCurrency(totalDespesasMes)} (${despesasMes.length} despesas)
- Pendentes: ${pendentes.length} (${formatCurrency(totalPendente)})
- Atrasadas: ${atrasadas.length} (${formatCurrency(totalAtrasado)})
Detalhamento:
${despesaLines || '  Nenhuma despesa no mês'}

## Próximos compromissos:
${compLines || '  Nenhum agendado'}

## Lembretes pendentes:
${lembLines || '  Nenhum pendente'}

## Equipe: ${apoiadoresRes.count || 0} apoiadores, ${assessoresRes.count || 0} assessores`
}

async function executeToolCall(supabase: any, userId: string, toolName: string, args: any): Promise<string> {
  switch (toolName) {
    case 'criar_eleitor': {
      const { error } = await supabase.from('eleitores').insert({
        user_id: userId,
        nome: args.nome,
        cidade: args.cidade || '',
        bairro: args.bairro || '',
        telefone: args.telefone || '',
        classificacao: args.classificacao || 'neutro',
      })
      if (error) throw error
      return `Eleitor "${args.nome}" cadastrado com sucesso.`
    }
    case 'criar_lembrete': {
      const { error } = await supabase.from('lembretes').insert({
        user_id: userId,
        titulo: args.titulo,
        data_lembrete: `${args.data_lembrete}T09:00:00`,
        prioridade: args.prioridade || 'media',
        descricao: args.descricao || null,
      })
      if (error) throw error
      return `Lembrete "${args.titulo}" criado para ${args.data_lembrete}.`
    }
    case 'criar_compromisso': {
      const { error } = await supabase.from('compromissos').insert({
        user_id: userId,
        titulo: args.titulo,
        data_inicio: args.data_inicio,
        tipo: args.tipo || 'outro',
        local: args.local || null,
        descricao: args.descricao || null,
      })
      if (error) throw error
      return `Compromisso "${args.titulo}" agendado com sucesso.`
    }
    case 'criar_apoiador': {
      const { error } = await supabase.from('apoiadores').insert({
        user_id: userId,
        nome: args.nome,
        cidade: args.cidade || '',
        telefone: args.telefone || '',
        partido: args.partido || '',
      })
      if (error) throw error
      return `Apoiador "${args.nome}" cadastrado com sucesso.`
    }
    case 'criar_despesa': {
      const today = new Date().toISOString().split('T')[0]
      const { error } = await supabase.from('despesas_politicas').insert({
        user_id: userId,
        responsavel: args.responsavel,
        municipio: args.municipio,
        cargo: args.cargo,
        valor: args.valor,
        tipo: args.tipo || 'Extra',
        conta_pix: args.conta_pix || '',
        ultimo_pagamento: today,
        pagamento_agendado: today,
      })
      if (error) throw error
      return `Despesa de ${formatCurrency(args.valor)} para ${args.responsavel} cadastrada.`
    }
    default:
      return `Ferramenta "${toolName}" não reconhecida.`
  }
}

async function sendWhatsAppReply(phone: string, message: string) {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!
  const TWILIO_API_KEY = Deno.env.get('TWILIO_API_KEY')!
  const TWILIO_CONTENT_SID = Deno.env.get('TWILIO_CONTENT_SID')
  const rawFrom = Deno.env.get('TWILIO_WHATSAPP_FROM') || '+14155238886'
  const from = rawFrom.startsWith('whatsapp:') ? rawFrom : `whatsapp:${rawFrom}`
  const to = phone.startsWith('whatsapp:') ? phone : `whatsapp:${phone}`

  // Sanitize for Twilio Content API
  const sanitized = message
    .replace(/\n\n/g, ' — ')
    .replace(/\n/g, ' | ')
    .replace(/\t/g, ' ')
    .replace(/ {4,}/g, '   ')

  const bodyParams: Record<string, string> = {
    To: to,
    From: from,
  }

  if (TWILIO_CONTENT_SID) {
    bodyParams.ContentSid = TWILIO_CONTENT_SID
    bodyParams.ContentVariables = JSON.stringify({ "1": sanitized.substring(0, 1600) })
  } else {
    bodyParams.Body = sanitized.substring(0, 1600)
  }

  const response = await fetch(`${GATEWAY_URL}/Messages.json`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'X-Connection-Api-Key': TWILIO_API_KEY,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(bodyParams),
  })

  const data = await response.json()
  if (!response.ok) {
    console.error('Twilio send error:', JSON.stringify(data))
    throw new Error(`Twilio error [${response.status}]: ${JSON.stringify(data)}`)
  }
  return data
}

// ─── Main Handler ───

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
      params.forEach((value, key) => { body[key] = value })
    } else {
      body = await req.json().catch(() => ({}))
    }

    // Determine if this is an inbound message vs a status callback.
    // Twilio sends SmsStatus=received on INBOUND messages too, so we check
    // for the presence of From + (Body or NumMedia) to identify real messages.
    const hasFrom = !!body.From
    const hasBody = !!body.Body
    const hasMedia = parseInt(body.NumMedia || '0', 10) > 0
    const isInbound = hasFrom && (hasBody || hasMedia)

    if (!isInbound && (body.MessageStatus || body.SmsStatus)) {
      console.log('Status callback:', body.MessageStatus || body.SmsStatus, body.MessageSid)
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        { headers: { ...corsHeaders, 'Content-Type': 'text/xml' } }
      )
    }

    const messageBody = body.Body || ''
    const from = body.From || ''
    const numMedia = parseInt(body.NumMedia || '0', 10)
    const mediaUrl0 = body.MediaUrl0 || ''
    const mediaContentType0 = body.MediaContentType0 || ''

    if (!from) {
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        { headers: { ...corsHeaders, 'Content-Type': 'text/xml' } }
      )
    }

    console.log('Incoming message from:', from, '| Body:', messageBody?.substring(0, 100), '| Media:', numMedia)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Identify user by phone — normalize Brazilian numbers (12 vs 13 digits)
    const phone = cleanPhone(from)
    const variants = new Set<string>()
    variants.add(`+${phone}`)
    variants.add(phone)

    // Brazilian mobile: +55 + DDD(2) + 9 + number(8) = 13 digits
    // Some carriers/Twilio omit the 9: +55 + DDD(2) + number(8) = 12 digits
    if (phone.startsWith('55') && phone.length === 12) {
      // 12 digits → add variant with 9 after DDD
      const withNine = `55${phone.substring(2, 4)}9${phone.substring(4)}`
      variants.add(`+${withNine}`)
      variants.add(withNine)
    } else if (phone.startsWith('55') && phone.length === 13) {
      // 13 digits → add variant without 9 after DDD
      const withoutNine = `55${phone.substring(2, 4)}${phone.substring(5)}`
      variants.add(`+${withoutNine}`)
      variants.add(withoutNine)
    }

    console.log('Phone variants for lookup:', Array.from(variants))

    const { data: config } = await supabase
      .from('notificacao_config')
      .select('user_id')
      .in('whatsapp_phone', Array.from(variants))
      .maybeSingle()

    if (!config) {
      await sendWhatsAppReply(from, '❌ Número não cadastrado. Configure seu WhatsApp no app para usar o assistente.')
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        { headers: { ...corsHeaders, 'Content-Type': 'text/xml' } }
      )
    }

    return await processMessage(supabase, config.user_id, from, messageBody, numMedia, mediaUrl0, mediaContentType0)
  } catch (error: any) {
    console.error('Error in whatsapp-webhook:', error)
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { headers: { ...corsHeaders, 'Content-Type': 'text/xml' } }
    )
  }
})

async function processMessage(
  supabase: any,
  userId: string,
  from: string,
  messageBody: string,
  numMedia: number,
  mediaUrl0: string,
  mediaContentType0: string,
) {
  // Rate limiting: max 30 msgs/hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count: msgCount } = await supabase
    .from('whatsapp_conversas')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('role', 'user')
    .gte('created_at', oneHourAgo)

  if ((msgCount || 0) >= 30) {
    await sendWhatsAppReply(from, '⏳ Limite de mensagens atingido. Aguarde alguns minutos e tente novamente.')
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { headers: { ...corsHeaders, 'Content-Type': 'text/xml' } }
    )
  }

  // Transcribe audio if present
  let userText = messageBody
  const isAudio = numMedia > 0 && (
    mediaContentType0.startsWith('audio/') ||
    mediaContentType0 === 'application/ogg' ||
    mediaContentType0.includes('opus') ||
    mediaContentType0.includes('ogg')
  )
  console.log('Media check — NumMedia:', numMedia, '| ContentType:', mediaContentType0, '| isAudio:', isAudio)
  if (isAudio) {
    try {
      const transcribed = await transcribeAudio(mediaUrl0, mediaContentType0)
      userText = transcribed || messageBody
      console.log('Transcribed audio:', userText?.substring(0, 100))
    } catch (err: any) {
      console.error('STT error:', err.message)
      // Don't silently mask the error — inform user and stop processing
      await sendWhatsAppReply(from, '⚠️ Não consegui processar seu áudio agora. Tente reenviar em 1 minuto ou envie como texto.')
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        { headers: { ...corsHeaders, 'Content-Type': 'text/xml' } }
      )
    }
  }

  if (!userText || userText.trim() === '') {
    await sendWhatsAppReply(from, '🤔 Não consegui entender sua mensagem. Tente enviar texto ou áudio.')
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { headers: { ...corsHeaders, 'Content-Type': 'text/xml' } }
    )
  }

  // Save user message
  await supabase.from('whatsapp_conversas').insert({
    user_id: userId,
    role: 'user',
    content: userText,
  })

  // Load context and history in parallel
  const [context, historyRes] = await Promise.all([
    loadUserContext(supabase, userId),
    supabase
      .from('whatsapp_conversas')
      .select('role, content')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const history = (historyRes.data || []).reverse()

  // Build messages for AI
  const messages = [
    { role: 'system', content: `${SYSTEM_PROMPT}\n\n## Contexto atual do banco de dados:\n${context}` },
    ...history.map((h: any) => ({ role: h.role === 'user' ? 'user' : 'assistant', content: h.content })),
  ]

  // If last message in history isn't the current one, add it
  const lastHistoryMsg = history[history.length - 1]
  if (!lastHistoryMsg || lastHistoryMsg.content !== userText) {
    messages.push({ role: 'user', content: userText })
  }

  // Call AI Gateway
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!
  const aiResponse = await fetch(AI_GATEWAY_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-3-flash-preview',
      messages,
      tools: TOOLS,
      tool_choice: 'auto',
      max_tokens: 1024,
    }),
  })

  if (!aiResponse.ok) {
    const errText = await aiResponse.text()
    console.error('AI Gateway error:', aiResponse.status, errText)
    await sendWhatsAppReply(from, '⚠️ Erro ao processar sua mensagem. Tente novamente em instantes.')
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { headers: { ...corsHeaders, 'Content-Type': 'text/xml' } }
    )
  }

  const aiResult = await aiResponse.json()
  const choice = aiResult.choices?.[0]
  const assistantMessage = choice?.message

  let replyText = ''

  if (assistantMessage?.tool_calls && assistantMessage.tool_calls.length > 0) {
    // Execute tool calls
    const toolResults: string[] = []
    for (const tc of assistantMessage.tool_calls) {
      const fnName = tc.function.name
      let fnArgs: any
      try {
        fnArgs = typeof tc.function.arguments === 'string' ? JSON.parse(tc.function.arguments) : tc.function.arguments
      } catch {
        fnArgs = {}
      }
      console.log('Tool call:', fnName, JSON.stringify(fnArgs))
      try {
        const result = await executeToolCall(supabase, userId, fnName, fnArgs)
        toolResults.push(result)
      } catch (err: any) {
        console.error('Tool execution error:', err.message)
        toolResults.push(`Erro ao executar ${fnName}: ${err.message}`)
      }
    }

    // If AI also provided text content, use it; otherwise use tool results
    replyText = assistantMessage.content || toolResults.join('\n')

    // If AI only returned tool calls without text, call AI again with tool results for a natural response
    if (!assistantMessage.content) {
      const followUpMessages = [
        ...messages,
        assistantMessage,
        ...assistantMessage.tool_calls.map((tc: any, i: number) => ({
          role: 'tool',
          tool_call_id: tc.id,
          content: toolResults[i],
        })),
      ]

      const followUpRes = await fetch(AI_GATEWAY_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
          messages: followUpMessages,
          max_tokens: 512,
        }),
      })

      if (followUpRes.ok) {
        const followUpResult = await followUpRes.json()
        replyText = followUpResult.choices?.[0]?.message?.content || toolResults.join('\n')
      }
    }
  } else {
    replyText = assistantMessage?.content || 'Desculpe, não consegui processar sua solicitação.'
  }

  // Save assistant response
  await supabase.from('whatsapp_conversas').insert({
    user_id: userId,
    role: 'assistant',
    content: replyText,
  })

  // Send via Twilio
  await sendWhatsAppReply(from, replyText)

  return new Response(
    '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
    { headers: { ...corsHeaders, 'Content-Type': 'text/xml' } }
  )
}
