# Nury Energia — Simulador Solar

Ferramenta comercial mobile-first para simular, em cerca de 1-2 minutos, o potencial de economia de um sistema fotovoltaico a partir dos dados de uma conta de energia. O projeto tem **duas versões das mesmas telas**, controladas por rota:

- **App do vendedor** (`/`) — usado pelo vendedor durante a prospecção/negociação: tem configuração técnica avançada, histórico ("Minhas simulações") e CTAs para enviar a simulação ao cliente.
- **Simulador público** (`/simule`) — pensado para ser linkado/embutido no site institucional (nuryenergia.com.br) e captar lead orgânico: o próprio visitante preenche os dados e recebe o resultado na hora, sem histórico nem configuração técnica visível, e o CTA final ("QUERO MINHA PROPOSTA") fala em 1ª pessoa e abre o WhatsApp comercial da Nury.

> Toda simulação é apresentada como **estimativa comercial preliminar**, nunca como projeto técnico definitivo. Isso está reforçado em vários pontos da interface e do PDF (ver `src/config/solarConfig.ts` → `TEXTOS_LEGAIS`).

## Rodando o projeto

```bash
npm install
npm run dev      # ambiente de desenvolvimento (Vite)
npm run build    # build de produção em /dist
npm run preview  # servir o build de produção localmente
```

Requer Node 18+.

## Deploy (GitHub Pages)

O repositório já vem com um workflow (`.github/workflows/deploy.yml`) que builda e publica o site automaticamente no GitHub Pages a cada push na branch `main`. Só falta um passo manual, uma vez só: em **Settings → Pages** do repositório no GitHub, mudar "Source" para **GitHub Actions** (em vez de "Deploy from a branch"). Depois disso todo push em `main` já atualiza o site sozinho.

Duas decisões técnicas por causa do GitHub Pages ser hospedagem estática (sem servidor por trás):
- `vite.config.ts` tem `base: '/nury-energia-simulador/'` — precisa bater com o nome do repositório. Se o repositório for renomeado, esse valor tem que ser atualizado junto.
- As rotas usam `HashRouter` (em vez de `BrowserRouter`) — por isso as URLs ficam com `#` (ex.: `.../#/simule`). Isso evita erro 404 ao dar refresh numa rota como `/resultado`, que o GitHub Pages não sabe redirecionar sozinho.

## Stack

React 19 + TypeScript + Vite + Tailwind CSS v4 (tokens de marca via `@theme` em `src/index.css`) + React Router (`HashRouter`) + lucide-react + jsPDF.

## Fluxo do vendedor (`/`)

1. **Home** (`/`) — tela de abertura comercial, CTA "COMEÇAR SIMULAÇÃO".
2. **Simulador** (`/simulador`) — 2 etapas: dados do cliente → conta de energia (consumo em kWh **ou** valor da conta, com opção "não sei meu consumo" e configuração avançada de potência do módulo). Uma breve animação de "análise" antecede o resultado.
3. **Resultado** (`/resultado`) — cards de sistema estimado, economia mensal/anual, comparativo visual da conta antes/depois, projeção acumulada (1 a 25 anos), payback opcional, simulador de financiamento (modular, desativado por padrão), CTAs comerciais ("Quero uma proposta" / "Falar com um consultor" / "Enviar simulação pelo WhatsApp") e PDF/link.
4. **Minhas simulações** (`/simulacoes`) — histórico local (localStorage) com status de funil (Simulação → Proposta enviada → Em negociação → Vendido/Perdido) e filtro por origem (Site vs. Vendedor — ver seção abaixo). Base para uma futura ferramenta de CRM/dashboard comercial.

## Fluxo público / site (`/simule`)

Mesmas telas (Home, Simulador, Resultado), mesmo motor de cálculo — só o texto e os CTAs mudam, controlados por `src/context/AudienceContext.tsx`:

1. **`/simule`** — mesma headline, badge trocado para "Simulador oficial Nury Energia" e subtexto em 1ª pessoa.
1.1. **Vídeo de fundo** — só na Home pública (`/simule`): um vídeo em loop (imagens aéreas de painéis solares, fornecidas pelo cliente) toca silenciosamente atrás do conteúdo, com um overlay de gradiente por cima para manter o contraste do texto branco. Cai automaticamente para uma imagem estática (`poster`) se o navegador bloquear o autoplay ou se o visitante tiver "reduzir movimento" ativado no sistema. A Home do app do vendedor (`/`) continua só com o gradiente, sem vídeo — decisão de manter a ferramenta de trabalho mais leve/rápida; ver `src/components/BackgroundVideo.tsx` e os arquivos em `public/video/`.
2. **`/simule/simulador`** — mesmo formulário, mas sem a seção "Configurações avançadas" (potência do módulo fica no padrão de 550 Wp, decisão técnica que não precisa aparecer para o visitante).
3. **`/simule/resultado`** — mesmos cards/gráficos/economia acumulada/payback/financiamento. O bloco de CTA final fica só com **"QUERO UMA PROPOSTA"** e **"FALAR COM UM CONSULTOR"** — os dois abrem o WhatsApp comercial da Nury (`EMPRESA.telefoneComercial`) com uma mensagem pronta em 1ª pessoa (o visitante "se apresentando"). Sem "Enviar pelo WhatsApp" duplicado, sem PDF, sem compartilhar e sem link para histórico — só as duas chamadas de WhatsApp.

Para embutir no site: basta linkar um botão ("Simule sua economia") para a URL pública `.../#/simule` (ex.: em um iframe, ou como um link normal que abre em nova aba). O `#` faz parte da URL por causa do `HashRouter` (ver seção "Deploy" acima).

### Sobre os leads vindos do site

Cada simulação salva no histórico agora carrega um campo `origem: 'site' | 'vendedor'` (ver `types/client.ts`), e a tela "Minhas simulações" tem filtros para ver só os leads vindos do `/simule`. **Importante:** como o histórico usa `localStorage`, cada registro fica salvo apenas no navegador onde a simulação foi feita — uma simulação feita por um visitante no celular dele não aparece automaticamente no painel de outra pessoa. O campo `origem` já deixa o modelo de dados pronto para isso; para captar esses leads de verdade (notificar a equipe, cair numa planilha/CRM), falta plugar em `historyService.ts` uma chamada a um backend real. Enquanto isso não existe, o WhatsApp automático do botão "Quero minha proposta" já garante que nenhum lead do site se perde — o próprio visitante manda a mensagem com os dados da simulação para o WhatsApp comercial da Nury.

## Arquitetura

Nenhum componente de UI faz conta de dimensionamento diretamente — tudo passa pelo motor de cálculo:

```
src/
  config/solarConfig.ts     → única fonte de "números mágicos" (tarifa padrão, perdas do sistema,
                               HSP por cidade, módulos disponíveis, textos legais, etc.)
  types/solar.ts, client.ts → tipos do domínio
  services/
    solarCalculator.ts      → motor de cálculo (dimensionamento, geração, economia, acumulado, payback, financiamento)
    whatsappService.ts      → mensagem + link wa.me
    pdfService.ts           → PDF vetorial (jsPDF) com aparência de proposta comercial
    historyService.ts       → persistência local do histórico de simulações
  utils/                    → formatação (moeda/números) e matemática pura (payback, Price, projeções)
  context/SimuladorContext.tsx → estado do fluxo (cliente, conta, resultado), com persistência em sessionStorage
  context/AudienceContext.tsx  → diferencia app do vendedor ('/') vs. simulador público ('/simule') — mesmas
                                  telas, texto/CTA/basePath variam conforme a audiência (useAudience())
  components/                → Header, ClientForm, EnergyForm, SolarSystemCard, SavingsCard, EconomyChart,
                                AccumulatedSavings, PaybackCard, FinancingSimulator, WhatsAppButton, PdfGenerator,
                                ShareSheet, StatusBadge, StepIndicator, CalculatingOverlay, BackgroundVideo (vídeo de
                                fundo em loop, só na Home pública), ícone SolarIllustration (SVG próprio)
  pages/                    → Home, Simulator, Result, History
  public/video/              → solar-hero.mp4 (H.264, 960px, ~1.6 MB) + solar-hero-poster.jpg — vídeo de fundo
                                comprimido para web a partir do arquivo original enviado pelo cliente
```

## Identidade visual

Referência: site e posicionamento públicos da Nury Energia (Osório/RS) — paleta em azul-marinho/petróleo profundo (tecnologia, confiança) combinada com dourado-solar (energia, otimismo) e verde para as chamadas de WhatsApp. Tipografia Poppins (display) + Manrope (texto). Nenhum asset, imagem ou texto de terceiros foi copiado; a ilustração da casa com painéis solares é um SVG desenhado do zero para este projeto.

## O que já está pronto vs. preparado para evoluir

**Pronto:** identidade visual completa, UX mobile-first, formulário em etapas, motor de cálculo, tela de resultado com micro-animações, comparação visual da conta, economia acumulada, payback, financiamento (modular), envio por WhatsApp com mensagem automática, geração de PDF, histórico local de simulações com origem (site/vendedor), versão pública do simulador para o site institucional, vídeo de fundo em loop na Home pública, responsividade testada de 320px a 1440px+ sem overflow horizontal.

**Estrutura pronta para evoluir (próximos passos sugeridos):**
- `INDICE_SOLAR_POR_CIDADE` em `solarConfig.ts` hoje é uma tabela estática — `buscarIndiceSolarPorCidade` (em `utils/solarUtils.ts`) é o único ponto de integração a trocar por uma API/base de irradiância real (ex.: CRESESB).
- Link compartilhável (`nuryenergia.com.br/simulacao/ABC123`) hoje é apenas uma prévia visual no `ShareSheet` — falta um backend para persistir e servir simulações por código.
- `historyService.ts` usa `localStorage` (ver nota sobre leads do site acima); é o ponto de troca por uma API real quando o histórico virar CRM/dashboard comercial (seção 25 do briefing) e quando quiser captar de fato os leads gerados em `/simule`.
- `FinancingSimulator` já calcula parcela (tabela Price) mas com taxas ilustrativas — pronto para receber condições reais de parceiros financeiros.
- `EMPRESA.telefoneComercial` em `solarConfig.ts` está com um número de exemplo — trocar pelo WhatsApp comercial real antes de publicar (esse é o número que recebe as mensagens de "Quero minha proposta" do simulador público).

<!-- redeploy trigger -->
