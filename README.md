# Farm Helper

Aplicativo mobile feito com React Native e Expo para organizar recursos por jogo, criar atividades e acompanhar metas a partir do estoque disponível.

## Fluxo do aplicativo

1. **Início:** abre as áreas Tutoriais, Categorias e recursos e Atividades.
2. **Categorias e recursos:** categorias representam jogos e mantêm estoques com nomes iguais separados. Selecione uma categoria para filtrar seus recursos; use a paginação para navegar entre grupos de até seis categorias.
3. **Cadastro:** o botão flutuante `⊕` abre um único modal. As abas inferiores alternam entre Categoria e Recurso; o formulário muda conforme a aba escolhida.
4. **Atividades:** crie uma atividade pelo botão flutuante, selecione sua categoria, adicione recursos e informe o tempo de construção em `HH:MM:SS` (`00:00:00` significa instantâneo).
5. **Acompanhamento:** toque em uma atividade para abrir os detalhes. A lista exibe `disponível/necessário`; o botão `+` em cada recurso permite registrar unidades adquiridas. Quando todos os recursos estiverem disponíveis, confirme a atividade para consumi-los e iniciar a construção. Ao terminar, colete a atividade; construções com duração enviam uma notificação local que abre seus detalhes.

Editar uma categoria atualiza os recursos e atividades vinculados. Excluir uma categoria remove também esses registros; excluir recursos individualmente ou limpar a lista remove as atividades que dependem deles.

## Navegação e interface

A navegação usa `NavigationContainer` e `createNativeStackNavigator`, com rotas para Início, Tutoriais, Categorias e recursos e Atividades. Os botões de voltar permanecem no canto inferior esquerdo; os botões circulares de adicionar ficam no canto inferior direito das telas de cadastro/acompanhamento. Ambos usam posição absoluta próxima à borda inferior, mantendo as ações principais ao alcance do polegar.

As telas respeitam áreas seguras com `SafeAreaProvider`/`SafeAreaView`. Modais usam `Modal` e `KeyboardAvoidingView`; controles tocáveis usam `Pressable`. Categorias usam `Animated` e `PanResponder` para paginação por gesto. A lista detalhada de recursos usa `FlatList`, que virtualiza os itens para reduzir trabalho de renderização em listas maiores. `ScrollView` é usado em conteúdos curtos ou formulários.

## Dados de demonstração

O estado inicial contém as categorias **Fazenda** e **Aventura**, com recursos de exemplo. **Madeira** aparece nas duas para permitir testar que os estoques permanecem separados por categoria. A lista de atividades começa vazia; crie atividades pela interface.

Categorias, recursos, atividades e os prazos das construções em andamento são salvos localmente no dispositivo com AsyncStorage e restaurados ao abrir o aplicativo. Filtros, seleções e formulários são temporários e não são persistidos. As notificações de conclusão exigem permissão do dispositivo. Na primeira execução, o app inicia com os dados de demonstração.

## Tecnologias

- React Native `0.88` e React `19.3`
- Expo SDK `58`
- TypeScript
- React Navigation: `@react-navigation/native` e `@react-navigation/native-stack`
- `react-native-safe-area-context`
- `@react-native-async-storage/async-storage` para persistência local
- `expo-status-bar`
- `expo-notifications` para avisos locais de conclusão de construção

## Executar

Pré-requisitos: Node.js e npm.

```bash
npm install
npx expo start --tunnel
```

Atalhos disponíveis:

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
- [Etapa 03](docs/etapa-03.md)
- [Etapa 05 - Atividades, estoque e construção](docs/etapa-05.md)