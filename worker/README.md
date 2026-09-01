# Leitor automático de fatura — passo a passo (100% grátis, sem cartão)

Essa pasta é um Worker da Cloudflare: um "servidorzinho" gratuito que existe
só pra guardar sua chave de API com segurança e repassar a leitura da
fatura para a IA. O site principal (GitHub Pages) continua exatamente onde
está — isso aqui é uma peça extra, separada.

**Tudo aqui é gratuito, sem precisar de cartão em nenhum lugar:**
- Cloudflare Workers: gratuito (até 100 mil requisições/dia).
- Google Gemini (a IA que lê a fatura): tem uma camada gratuita que não
  pede cartão — só uma conta Google. Ela tem um limite diário de uso, mas
  é bem mais do que uma pequena empresa gasta lendo fatura de cliente.

## Passo 1 — Criar a chave do Gemini (Google), sem cartão

1. Acesse https://aistudio.google.com (pode entrar com sua conta Google
   normal, a mesma do Gmail).
2. Clique em **Get API key** (ou "Criar chave de API").
3. Clique em **Create API key** → escolha "Create key in new project" se
   perguntar.
4. Copie a chave (começa com `AIza...`). Não precisa cadastrar cartão nem
   ativar cobrança pra isso funcionar no plano gratuito.

## Passo 2 — Criar o Worker na Cloudflare (sem instalar nada)

1. Acesse https://dash.cloudflare.com e crie uma conta gratuita (também
   sem pedir cartão pro plano free).
2. No menu lateral, vá em **Workers & Pages → Create → Create Worker**.
3. Dê um nome, por exemplo `nury-fatura-reader`, e clique em **Deploy**
   (ele cria um worker padrão de exemplo — vamos substituir o código).
4. Clique em **Edit code** (abre o editor online).
5. Apague todo o código de exemplo e cole o conteúdo do arquivo
   `src/index.dashboard.js` desta pasta.
6. Clique em **Deploy** (no canto superior direito do editor).

## Passo 3 — Adicionar a chave com segurança

1. Na página do Worker, vá em **Settings → Variables and Secrets**.
2. Clique em **Add**:
   - Nome: `GEMINI_API_KEY`
   - Tipo: **Secret** (importante — assim ela fica criptografada)
   - Valor: cole a chave `AIza...` do Passo 1
3. Clique em **Add** de novo (opcional, mas recomendado):
   - Nome: `GEMINI_MODEL`
   - Tipo: Text
   - Valor: `gemini-2.5-flash`
4. Salve/Deploy.

## Passo 4 — Pegar a URL pública do Worker

Na página principal do Worker (aba **Settings** ou o topo da página), tem
uma URL pública, algo como:

```
https://nury-fatura-reader.SEU-USUARIO.workers.dev
```

Essa URL não é secreta (é só um endereço, não uma senha) — copie e me
mande. Eu configuro ela no site para ligar o botão de "ler fatura
automaticamente".

## Testando por conta própria (opcional)

Se quiser testar o Worker sozinho antes de me mandar a URL, pode abrir o
terminal e rodar (trocando a URL pela sua):

```bash
curl -X POST https://nury-fatura-reader.SEU-USUARIO.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"mediaType":"image/jpeg","base64":"<base64 de uma foto de fatura>"}'
```

Deve devolver um JSON com `consumoKwh`, `tarifaMediaKwh` etc.

## Sobre o limite gratuito

O plano free do Gemini tem um teto de requisições por dia (varia por
modelo — geralmente algumas centenas por dia, dá pra ver o número exato em
https://aistudio.google.com/rate-limit depois de criar a chave). Pra uma
loja lendo fatura de cliente em atendimento, isso é bem mais do que
suficiente. Se um dia a demanda crescer muito e o limite grátis apertar, aí
sim vale considerar ativar cobrança — mas isso é opcional e só quando fizer
sentido pro negócio, não é necessário agora.

## Alternativa via linha de comando (opcional, para quem já usa terminal)

Se preferir usar o `wrangler` (CLI oficial da Cloudflare) em vez do editor
online, os arquivos `wrangler.toml` e `src/index.ts` desta pasta já estão
prontos:

```bash
cd worker
npm create cloudflare@latest -- --existing-script  # ou npm i -D wrangler
npx wrangler deploy
npx wrangler secret put GEMINI_API_KEY
```
