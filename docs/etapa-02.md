# Etapa 02 - Interface e fluxo principal

## 1. Telas implementadas

A aplicação possui navegação local entre a tela inicial e três fluxos principais:

### Tela inicial

Apresenta a identidade do Farm Helper e cards de acesso para:

- Tutoriais;
- Categorias e recursos;
- Atividades.

### Tela de tutoriais

Explica o fluxo de uso da aplicação em três etapas:

1. Criar categorias para organizar os dados;
2. Cadastrar recursos com ícone, nome e quantidade;
3. Montar atividades usando os recursos em uma checklist.

A tela utiliza exemplos visuais placeholder para representar cada etapa.

### Tela de categorias e recursos

A tela apresenta:

- Categorias organizadas em duas colunas;
- Paginação entre duas páginas demonstrativas;
- Seleção visual de uma categoria;
- Ações de adicionar, editar e excluir categoria;
- Box de recursos associado à categoria selecionada;
- Lista de recursos com ícone, nome, quantidade, editar e excluir;
- Ações de adicionar recurso e limpar a lista;
- Rolagem limitada à lista de recursos, mantendo a barra superior do box visível.

Os dados exibidos nesta etapa são placeholders, com categorias `catg1` até `catg12` e recursos `item1` até `item20`. Quando nenhuma categoria está selecionada, a tela exibe todos os recursos; quando uma categoria é selecionada, a lista é filtrada por ela.

### Tela de atividades

A tela apresenta:

- Título e contador de atividades;
- Botão destacado para criação de uma nova atividade;
- Lista vertical de cards de atividades;
- Nome e categoria da atividade;
- Até três recursos visíveis por card;
- Indicador quando existem recursos adicionais;
- Quantidades no formato `x/y`;
- Estados visuais de atividade pendente e concluída.

Os cards de atividade são clicáveis e estão preparados para receber futuramente um modal de edição, exclusão e conclusão. Os recursos exibidos dentro do card são informativos e não interativos nesta etapa.

## 2. Principais componentes utilizados

A implementação está concentrada em `App.tsx` e utiliza componentes do React Native e do Expo:

- `SafeAreaProvider`: fornece o contexto de área segura para a aplicação.
- `SafeAreaView`: evita que o conteúdo fique sob o notch ou barras do sistema.
- `StatusBar`: configura a aparência da barra de status.
- `ScrollView`: permite a rolagem das telas e, na tela de categorias/recursos, da lista de recursos de forma independente.
- `View`: organiza os agrupamentos e estruturas visuais.
- `Text`: apresenta títulos, descrições, rótulos, quantidades e estados.
- `Pressable`: implementa navegação, seleção, botões e cards de atividades com estados de pressionado.
- `StyleSheet`: centraliza os estilos da aplicação.
- `useState`: controla a tela atual, a página de categorias e a categoria selecionada.

## 3. Componentes e estilos reutilizáveis

A aplicação ainda está concentrada em um único arquivo, mas utiliza composição de estilos para evitar repetição:

- `screenContainer`: base comum de espaçamento horizontal e superior para telas internas.
- `surface`: base visual compartilhada por cards e boxes, com fundo, borda e raio consistentes.
- `sectionHeader`: cabeçalho reutilizado nas seções de categorias e recursos.
- `iconeRecursoBase`: base compartilhada pelos ícones de recursos na tela de cadastro e nos exemplos do tutorial.
- `toolbarIcone` e `toolbarRotulo`: padrão visual para ações das barras de ferramentas.
- `backBotao` e `backBotaoTexto`: padrão de navegação de retorno.
- Estilos de estado, como seleção, pressionado, pendente e concluído, são aplicados por composição de arrays do React Native.

## 4. Elementos de entrada de dados

Nesta etapa, os elementos de entrada são demonstrativos e ainda não possuem persistência ou formulários completos:

- Categorias podem ser selecionadas tocando em um item da grade.
- O botão de editar categoria fica habilitado quando existe uma seleção.
- O botão de excluir categoria limpa a seleção visual.
- As setas alteram a página demonstrativa de categorias.
- Os botões de adicionar, editar, excluir e limpar recursos estão representados visualmente e preparados para receber lógica futura.
- Cards de atividades são clicáveis e servirão como ponto de entrada para um futuro modal de gerenciamento.
- Os recursos dentro dos cards de atividades não são interativos, conforme definido para esta etapa.

Ainda não há campos `TextInput`, modais, persistência local ou operações reais de CRUD.

## 5. Adaptação a diferentes tamanhos de tela

A aplicação foi construída considerando o uso em orientação retrato e diferentes larguras de celulares:

- `SafeAreaView` considera áreas protegidas do dispositivo.
- `ScrollView` permite que conteúdos mais longos sejam acessados em telas menores.
- As telas internas utilizam um container horizontal comum.
- A grade de categorias usa `flexDirection`, `flexWrap`, `flexBasis`, `flexGrow` e `flexShrink`, evitando larguras fixas para as colunas.
- Textos relevantes podem quebrar linha e os conteúdos internos usam `flex: 1` e `flexShrink` quando necessário.
- Os cards de atividades ocupam a largura disponível do conteúdo, mas mantêm altura mínima e espaçamento próprios para não se tornarem uma única área esticada.
- A lista de recursos possui altura máxima e rolagem própria, mantendo a barra de ações fora da área rolável.
- As áreas de toque de botões e setas possuem dimensões mínimas para facilitar a interação em telas menores.

O modo paisagem não faz parte do escopo atual, conforme a definição da interface.

## 6. Execução da aplicação (Atualmente)

O projeto atualmente não tem build APK gerada, teste e execução são feitos através do sandbox Expo Go. Na raiz do projeto, instale as dependências e inicie o Expo:

```bash
npm install
npx expo start --tunnel
```

Leia o QR code via Expo GO ou copie e cole o endereço para executar a aplicação.

Para validar o TypeScript sem gerar arquivos:

```bash
npm exec tsc -- --noEmit
```

## 7. Principais decisões de interface

- Foi adotado um tema escuro para reduzir distrações e destacar os estados e ações importantes.
- A cor roxa é usada como identidade e para ações primárias, seleção e elementos de navegação.
- Os estados de atividade usam vermelho para pendente e verde para concluída, tornando a leitura imediata.
- Categorias e recursos foram separados em boxes distintos para representar a relação entre o jogo selecionado e seus itens.
- A barra de ações de recursos permanece fixa no topo do box enquanto somente a lista rola.
- Cards de atividades têm tamanho controlado, espaçamento entre si e uma quantidade reduzida de recursos visíveis para manter a leitura rápida.
- O card inteiro da atividade é a área clicável, preparando a interface para um futuro modal.
- Os dados placeholders foram mantidos com nomes simples (`catg1`, `item1`, `nomeAtiv`) para evidenciar a estrutura sem antecipar regras de domínio.
- A navegação e os estados atuais são locais e demonstrativos; a persistência e as operações reais serão adicionadas em etapas posteriores.
