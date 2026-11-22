# Farm Helper

Aplicativo mobile para organizar recursos de jogos e acompanhar atividades que dependem desses recursos. O Farm Helper mostra o que falta no estoque, desconta os materiais ao iniciar uma construção e permite acompanhar seu término.

## Funcionalidades

- **Categorias e recursos:** organize os dados por jogo, cadastre e edite categorias e recursos e acompanhe os estoques. Recursos com o mesmo nome em categorias diferentes não compartilham quantidade.
- **Atividades:** defina uma categoria, os recursos necessários e a duração da construção. A lista mostra o progresso dos requisitos; nos detalhes, é possível registrar recursos adquiridos no estoque.
- **Construção e coleta:** confirme uma atividade quando houver recursos suficientes. Os materiais são descontados, e a atividade fica como **CONSTRUINDO** até o horário de término, depois como **PRONTA** para coleta. Duração vazia ou `00:00:00` significa conclusão imediata.
- **Notificações locais:** construções com duração podem agendar um aviso no dispositivo. A permissão é solicitada quando necessário; negar ou não conseguir agendar a notificação não cancela a construção. Tocar no aviso abre os detalhes da atividade.
- **Persistência local:** categorias, recursos, atividades e prazos das construções são salvos no dispositivo. A tela de tutoriais, seleções, filtros e formulários não alteram esses dados persistidos.
- **Backup remoto opcional:** é possível enviar ou restaurar manualmente os dados pelo Supabase. O backup não sincroniza automaticamente com o armazenamento local; restaurar substitui os dados locais após confirmação.

Na primeira execução, o app apresenta categorias e recursos de demonstração — incluindo **Madeira** em duas categorias para ilustrar estoques independentes — e nenhuma atividade cadastrada.

## Navegação e estrutura

O fluxo principal reúne as telas **Início**, **Tutoriais**, **Categorias e recursos** e **Atividades**, navegadas por uma pilha do React Navigation. A interface usa áreas seguras, modais para formulários, paginação por botões e gesto nas categorias e listas roláveis para conteúdo extenso.

O código da interface e das regras de negócio está concentrado em [App.tsx](App.tsx). O acesso ao backup Supabase está isolado em [src/services/supabaseBackup.ts](src/services/supabaseBackup.ts). A chave local `farm-helper-app-data` armazena as categorias, os recursos e as atividades em conjunto pelo AsyncStorage; a navegação aguarda o carregamento desses dados antes de montar as telas.

## Tecnologias

- React Native `0.88`, React `19.3`, Expo SDK `58` e TypeScript;
- React Navigation (`@react-navigation/native` e `@react-navigation/native-stack`);
- AsyncStorage para persistência local;
- `expo-notifications` para avisos locais;
- Supabase JavaScript SDK para backup remoto, com sessão armazenada por `expo-secure-store`.

## Executar

Pré-requisitos: Node.js e npm. Na raiz do projeto:

```bash
npm install
npx expo start --tunnel
```

Abra o projeto pelo QR code no Expo Go compatível com o SDK do projeto ou use um dispositivo/runtime compatível. Os scripts `npm run android`, `npm run ios` e `npm run web` iniciam o Expo para a plataforma indicada.

Para validar os tipos TypeScript sem gerar arquivos:

```bash
npm exec tsc -- --noEmit
```

Notificações dependem das permissões e do suporte do dispositivo/runtime; a apresentação em segundo plano pode variar conforme o sistema operacional. O backup Supabase seguro está disponível apenas no app Android ou iOS, não na versão web.

## Configurar o backup Supabase (opcional)

1. Copie `.env.example` para `.env` e preencha `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` com os valores do seu projeto Supabase.
2. Habilite o provedor de autenticação anônima e crie a tabela `app_backups` com a política de Row Level Security (RLS) descrita em [docs/etapa-06.md](docs/etapa-06.md).
3. Reinicie o Expo para carregar as variáveis de ambiente.

As ações de backup e restauração ficam no final das telas **Categorias e recursos** e **Atividades**. Na primeira operação de backup ou restauração, o app cria uma sessão anônima e a armazena no dispositivo. O backup fica associado a essa sessão/instalação; não é uma conta recuperável em outro dispositivo. Use somente a chave **Publishable** no app — nunca a chave `service_role`. O envio substitui o backup anterior da sessão; a restauração consulta esse backup e substitui os dados locais somente após confirmação.

## Documentação

- [Proposta do projeto](docs/proposta.md)
- [Etapa 02 - Interface e fluxo principal](docs/etapa-02.md)
- [Etapa 03 - Navegação, UX e acessibilidade](docs/etapa-03.md)
- [Etapa 04 - Persistência local](docs/etapa-04.md)
- [Etapa 05 - Atividades, estoque e construção](docs/etapa-05.md)
- [Etapa 06 - Backup remoto com Supabase](docs/etapa-06.md)
- [Etapa 07 - Estado compartilhado e recurso nativo](docs/etapa-07.md)
