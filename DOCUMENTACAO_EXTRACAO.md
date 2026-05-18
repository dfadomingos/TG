# Documentação: Arquitetura de Extração de Eventos

Este documento detalha o funcionamento do sistema automatizado de integração de eventos desenvolvido para alimentar o banco de dados da aplicação **Eventos Franca**.

Atualmente, o sistema extrai dados de duas grandes plataformas de venda de ingressos: **Q2 Ingressos** e **Sympla**.

---

## 1. O Desafio: Por que usamos o Puppeteer?
Ambas as plataformas utilizam arquiteturas modernas focadas no front-end (Single Page Applications - SPAs) com renderização no lado do cliente (Client-Side Rendering). Isso significa que, se usarmos ferramentas comuns de raspagem (como Cheerio ou cURL), o código-fonte HTML recebido estará vazio, sem nenhum dado dos eventos listados.

Para resolver isso, implementamos o **Puppeteer**. O Puppeteer levanta um navegador Google Chrome "invisível" (headless), que processa o JavaScript das plataformas reais, aguarda os cards de eventos serem desenhados na tela e, em seguida, varre o Document Object Model (DOM) resultante para ler as informações com precisão.

---

## 2. A Camada de Extração (`app/services/`)

Cada plataforma possui o seu próprio arquivo de serviço (`q2Service.ts` e `symplaService.ts`), pois a estrutura HTML de ambas é radicalmente diferente. O fluxo básico consiste em três etapas:

### 2.1 Leitura do DOM e Regex Avançado
O robô busca elementos essenciais dentro dos *cards* de eventos:
- **Título**: Tag `<h1>`, `<h2>` ou `<h3>` dependendo da plataforma.
- **Link e Imagem**: Capturados via atributos `href` e `src`.
- **Data e Horário**: Este é o maior desafio técnico. Como os textos variam (ex: `"Segunda-feira, 18 de Maio"` na Q2 vs `"Sexta, 22 de Mai às 20:00"` no Sympla), desenvolvemos expressões regulares (Regex) extremamente robustas e customizadas para buscar e isolar essas datas no meio do texto não formatado.

### 2.2 Tratamento e Normalização (Parsers)
Uma vez que o texto da data é isolado, os parsers (`parseDataQ2` e `parseDataSympla`) traduzem nomes abreviados de meses ("MAI", "AGO") para índices numéricos do JavaScript e assumem conversões lógicas de anos baseados numa margem temporal de carência de 7 dias (para lidar com a virada do ano). O resultado é sempre um objeto estrito `Date`.

### 2.3 Inferência de Categoria e Resolução de Endereços
Através do título do evento, a aplicação busca palavras-chave (ex: "Stand-up", "Humor") e infere a Categoria (ex: "Teatro").
Em paralelo, a aplicação possui um dicionário interno mapeando nomes amigáveis de locais (ex: "Ginásio Pedrocão", "Villa Eventos") para endereços físicos completos (rua, bairro, cep), normalizando também a localização para exibição em mapas.

---

## 3. A Camada de Sincronização (`scripts/sync-*.ts`)

Os scripts executáveis (`sync-q2-to-db.ts` e `sync-sympla-to-db.ts`) são os maestros do processo. Eles unem a extração com o Banco de Dados.

O fluxo de sincronização é o seguinte:

1. **Garantia de Organizador**: Cria ou atualiza um perfil "Dummy" (fictício) de Organizador no banco de dados para representar a plataforma de origem (com CNPJs reservados, ex: `00.000.000/0001-00` para Q2 e `00.000.000/0002-00` para Sympla).
2. **Download Seguro de Mídia (`downloadImage`)**: O script intercepta a URL das imagens de capa e faz o download binário. Há travas de segurança que ignoram imagens menores de 5KB (para evitar ícones/tracking pixels). A imagem real (webp/jpg) é então armazenada de forma estática no nosso servidor em `/public/uploads/eventos-externos`.
3. **Curadoria por Inteligência Artificial (Gemini)**:
   - Os textos brutos de descrição (quando existem) ou os títulos são enviados à API do **Google Gemini**.
   - Existe um *prompt* engessado com Regras Críticas que proíbe o LLM de usar jargões conversacionais (ex: "Aqui está o resumo...").
   - O Gemini devolve exclusivamente os 2 melhores parágrafos que destacam o tom do evento, removendo burocracias de leis de meia-entrada e políticas de reembolso.
4. **Upsert no Banco (Prisma)**:
   - A aplicação verifica no banco de dados se já existe um evento idêntico (usando o `link_compra` como chave absoluta, ou a combinação de Título + Data).
   - Se o evento for inédito, ele é cadastrado com o status padrão de `"Publicado"`.
   - Se já existir, as informações são apenas atualizadas para refletir possíveis mudanças da fonte oficial, impedindo eventos duplicados.

---

Este fluxo garante que a listagem de eventos em Destaque da Home Page — que sempre exibe os eventos Publicados com a data mais próxima da atual — seja alimentada 100% no "piloto automático", mantendo uma vitrine rica, atualizada e com descrições polidas e atrativas geradas por Inteligência Artificial.
