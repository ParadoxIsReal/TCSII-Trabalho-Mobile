# Farm Helper

Aplicativo mobile feito com React Native e Expo para organizar recursos por jogo, criar atividades e acompanhar metas a partir do estoque disponível.

## Fluxo do aplicativo

1. **Início:** abre as áreas Tutoriais, Categorias e recursos e Atividades.
2. **Categorias e recursos:** categorias representam jogos e mantêm estoques com nomes iguais separados. Selecione uma categoria para filtrar seus recursos; use a paginação para navegar entre grupos de até seis categorias.
3. **Cadastro:** o botão flutuante `⊕` abre um único modal. As abas inferiores alternam entre Categoria e Recurso; o formulário muda conforme a aba escolhida.
4. **Atividades:** crie uma atividade pelo botão flutuante, selecione sua categoria e adicione recursos com as respectivas quantidades necessárias.
5. **Acompanhamento:** toque em uma atividade para abrir os detalhes. A lista exibe `disponível/necessário`; o botão `+` em cada recurso permite registrar unidades adquiridas e atualiza o estoque correspondente à categoria.

Editar uma categoria atualiza os recursos e atividades vinculados. Excluir uma categoria remove também esses registros; excluir recursos individualmente ou limpar a lista remove as atividades que dependem deles.

## Navegação e interface

A navegação usa `NavigationContainer` e `createNativeStackNavigator`, com rotas para Início, Tutoriais, Categorias e recursos e Atividades. Os botões de voltar permanecem no canto inferior esquerdo; os botões circulares de adicionar ficam no canto inferior direito das telas de cadastro/acompanhamento. Ambos usam posição absoluta próxima à borda inferior, mantendo as ações principais ao alcance do polegar.

As telas respeitam áreas seguras com `SafeAreaProvider`/`SafeAreaView`. Modais usam `Modal` e `KeyboardAvoidingView`; controles tocáveis usam `Pressable`. Categorias usam `Animated` e `PanResponder` para paginação por gesto. A lista detalhada de recursos usa `FlatList`, que virtualiza os itens para reduzir trabalho de renderização em listas maiores. `ScrollView` é usado em conteúdos curtos ou formulários.

## Dados de demonstração

O estado inicial contém as categorias **Fazenda** e **Aventura**, com recursos de exemplo. **Madeira** aparece nas duas para permitir testar que os estoques permanecem separados por categoria. A lista de atividades começa vazia; crie atividades pela interface.

Os dados são mantidos em estado React (`useState`) durante a execução e ainda não são persistidos. Ao reiniciar o aplicativo, os dados voltam aos exemplos iniciais.

## Tecnologias

- React Native `0.86` e React `19`
- Expo `57`
- TypeScript
- React Navigation: `@react-navigation/native` e `@react-navigation/native-stack`
- `react-native-safe-area-context`
- `expo-status-bar`

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