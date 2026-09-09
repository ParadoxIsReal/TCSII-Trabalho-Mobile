# Farm Helper

Aplicativo mobile desenvolvido com React Native e Expo para organização de recursos e acompanhamento de atividades em jogos.

## Status da etapa 02

A interface principal está implementada com dados placeholder para demonstração do fluxo. As telas possuem navegação local, seleção visual, paginação e checklists demonstrativas. A persistência de dados, criação real de registros e modais de edição ainda serão implementadas nas próximas etapas.

## Telas

- **Início:** acesso aos fluxos de tutoriais, categorias/recursos e atividades.
- **Tutoriais:** explica o fluxo da aplicação com exemplos visuais de categorias, recursos e atividades.
- **Categorias e recursos:** exibe categorias em duas colunas, paginação, ações de categoria e uma lista rolável de recursos.
- **Atividades:** exibe atividades em cards, checklist resumida de recursos, quantidades `x/y` e estados pendente/concluída.

## Tecnologias

- React Native `0.86`
- Expo `57`
- React `19`
- TypeScript
- `react-native-safe-area-context`

## Execução

Pré-requisitos: Node.js, npm e Expo disponíveis no ambiente.

```bash
npm install
npm start
```

Depois de iniciar o Expo, escolha o destino desejado no terminal ou no Expo DevTools. Também estão disponíveis:

```bash
npm run android
npm run ios
npm run web
```

Para verificar os tipos sem gerar arquivos:

```bash
npm exec tsc -- --noEmit
```

## Documentação

- [Proposta do projeto](docs/proposta.md)
- [Etapa 02](docs/etapa-02.md)
