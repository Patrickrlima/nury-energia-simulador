/**
 * "Leitor de fatura" — versão para colar direto no editor do site da
 * Cloudflare (dashboard → Workers & Pages → seu Worker → Edit code), sem
 * precisar instalar nada no computador.
 *
 * É a MESMA lógica de src/index.ts, só que em JavaScript puro (sem tipos),
 * porque o editor online da Cloudflare não aceita TypeScript.
 *
 * Usa a API do Gemini (Google) — gratuita, sem cartão de crédito.
 *
 * Depois de colar e clicar em "Deploy": vá em Settings → Variables and
 * Secrets → Add:
 *   - GEMINI_API_KEY   (tipo: Secret) → cole sua chave do Google AI Studio
 *   - GEMINI_MODEL     (tipo: Text, opcional) → gemini-2.5-flash
 */

const PROMPT_EXTRACAO = `Você vai analisar a imagem ou PDF de uma fatura de energia elétrica brasileira e extrair alguns números dela.

Preste atenção especial nestes pontos, comuns em faturas brasileiras (grupo B, tarifa convencional ou branca):

1. CONSUMO (kWh): normalmente aparece como "Consumo" ou em linhas separadas "Consumo TE (kWh)" e "Consumo TU (kWh)" — quando existem as duas linhas, é a MESMA quantidade de energia (não some as duas), pegue esse valor de kWh uma única vez.

2. TARIFA MÉDIA (R$/kWh): quando a fatura mostra "Tarifa TE" e "Tarifa TU" separadas (R$/kWh, já com tributos, geralmente colunas como "Preço unitário c/ tributos"), SOME as duas para chegar na tarifa efetiva de energia. Se a fatura já mostra uma tarifa única de energia, use ela. NÃO inclua na tarifa itens que não são por kWh de energia consumida, como "Contrib Ilum Publica Municipal" / "CIP" (taxa fixa municipal) ou taxas de outra natureza — esses ficam de fora do cálculo de tarifa.

3. Se houver "Adicional Bandeira" (bandeira tarifária amarela/vermelha), pode mencionar isso em observações, mas não precisa incluir no valor de tarifaMediaKwh (é um adicional variável, não parte da tarifa-base).

4. CIDADE e ESTADO (UF) do endereço de fornecimento na fatura.

5. VALOR TOTAL da fatura (o valor a pagar).

Se algum valor não estiver visível ou você não tiver certeza, retorne null nesse campo (não invente números) e marque confiancaBaixa como true, explicando o motivo em observacoes.`;

const ESQUEMA_RESPOSTA = {
  type: 'OBJECT',
  properties: {
    consumoKwh: { type: 'NUMBER', nullable: true },
    tarifaMediaKwh: { type: 'NUMBER', nullable: true },
    cidade: { type: 'STRING', nullable: true },
    estado: { type: 'STRING', nullable: true },
    valorTotalFatura: { type: 'NUMBER', nullable: true },
    confiancaBaixa: { type: 'BOOLEAN' },
    observacoes: { type: 'STRING' },
  },
  required: ['confiancaBaixa', 'observacoes'],
};

const TAMANHO_MAXIMO_BASE64 = 11 * 1024 * 1024;

function respostaCors(env, corpo, init = {}) {
  const headers = new Headers(init.headers);
  headers.set('Access-Control-Allow-Origin', env.ALLOWED_ORIGIN || '*');
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  headers.set('Content-Type', 'application/json; charset=utf-8');
  return new Response(corpo, { ...init, headers });
}

function interpretarJsonDaIa(texto) {
  const inicio = texto.indexOf('{');
  const fim = texto.lastIndexOf('}');
  if (inicio === -1 || fim === -1 || fim < inicio) return null;
  try {
    const json = JSON.parse(texto.slice(inicio, fim + 1));
    return {
      consumoKwh: typeof json.consumoKwh === 'number' ? json.consumoKwh : null,
      tarifaMediaKwh: typeof json.tarifaMediaKwh === 'number' ? json.tarifaMediaKwh : null,
      cidade: typeof json.cidade === 'string' ? json.cidade : null,
      estado: typeof json.estado === 'string' ? json.estado : null,
      valorTotalFatura: typeof json.valorTotalFatura === 'number' ? json.valorTotalFatura : null,
      confiancaBaixa: Boolean(json.confiancaBaixa),
      observacoes: typeof json.observacoes === 'string' ? json.observacoes : '',
    };
  } catch {
    return null;
  }
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return respostaCors(env, null, { status: 204 });
    }
    if (request.method !== 'POST') {
      return respostaCors(env, JSON.stringify({ erro: 'Método não permitido.' }), { status: 405 });
    }
    if (!env.GEMINI_API_KEY) {
      return respostaCors(env, JSON.stringify({ erro: 'Worker sem GEMINI_API_KEY configurada.' }), { status: 500 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return respostaCors(env, JSON.stringify({ erro: 'JSON inválido no corpo da requisição.' }), { status: 400 });
    }
    if (!body?.base64 || !body?.mediaType) {
      return respostaCors(env, JSON.stringify({ erro: 'Envie { mediaType, base64 }.' }), { status: 400 });
    }
    if (body.base64.length > TAMANHO_MAXIMO_BASE64) {
      return respostaCors(env, JSON.stringify({ erro: 'Arquivo muito grande.' }), { status: 413 });
    }

    const modelo = env.GEMINI_MODEL || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${env.GEMINI_API_KEY}`;

    let respostaGemini;
    try {
      respostaGemini = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ inlineData: { mimeType: body.mediaType, data: body.base64 } }, { text: PROMPT_EXTRACAO }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: ESQUEMA_RESPOSTA,
          },
        }),
      });
    } catch {
      return respostaCors(env, JSON.stringify({ erro: 'Falha ao contatar a API de IA.' }), { status: 502 });
    }

    if (!respostaGemini.ok) {
      const detalhe = await respostaGemini.text().catch(() => '');
      return respostaCors(
        env,
        JSON.stringify({ erro: `API de IA retornou erro (${respostaGemini.status}).`, detalhe: detalhe.slice(0, 500) }),
        { status: 502 }
      );
    }

    const dadosResposta = await respostaGemini.json();
    const textoBruto = dadosResposta.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const extraido = interpretarJsonDaIa(textoBruto);

    if (!extraido) {
      return respostaCors(
        env,
        JSON.stringify({
          consumoKwh: null,
          tarifaMediaKwh: null,
          cidade: null,
          estado: null,
          valorTotalFatura: null,
          confiancaBaixa: true,
          observacoes: 'Não consegui interpretar a resposta da IA para essa fatura.',
        })
      );
    }

    return respostaCors(env, JSON.stringify(extraido));
  },
};
