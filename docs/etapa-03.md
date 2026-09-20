# Etapa 03 - Navegação, UX e acessibilidade

## 1. Estrutura de navegação implementada

A aplicação utiliza `@react-navigation/native` e `@react-navigation/native-stack` para controlar a navegação entre as telas. O `NavigationContainer` envolve um navegador do tipo Stack, com o cabeçalho nativo oculto para manter a identidade visual própria da aplicação.

A pilha possui as seguintes rotas:

- `home`: tela inicial;
- `tutorials`: tela de tutoriais;
- `setup`: tela de categorias e recursos;
- `tracking`: tela de atividades.

A tela inicial é a rota inicial da aplicação. Os cards principais utilizam `navigation.navigate()` para abrir os fluxos de tutoriais, organização de categorias/recursos e acompanhamento de atividades.

As telas internas possuem um botão textual `Voltar`, que utiliza `navigation.goBack()`. O botão físico de voltar do Android e o mecanismo nativo de retorno também utilizam o histórico da pilha.

Além do botão `Voltar`, as telas internas exibem um botão circular flutuante com ícone de casa. Esse botão utiliza `navigation.reset()` para substituir a pilha atual pela rota `home`, evitando o acúmulo de telas e loops ao retornar para a tela principal.

## 2. Telas e mecanismos de acesso

### Tela inicial

A tela inicial é acessada ao iniciar o aplicativo ou pelo botão flutuante de casa. Ela apresenta três cards de acesso:

- **Ver tutoriais:** abre a rota `tutorials`;
- **Categorias e recursos:** abre a rota `setup`;
- **Atividades:** abre a rota `tracking`.

Os cards possuem área de toque ampla, texto descritivo e indicação visual de direção.

### Tela de tutoriais

É acessada pelo card **Ver tutoriais**. Apresenta o fluxo conceitual do aplicativo em etapas: categorias, recursos e atividades. O retorno ocorre pelo botão `Voltar` ou pelo botão flutuante de casa.

### Tela de categorias e recursos

É acessada pelo card **Categorias e recursos**. A tela reúne:

- Box de categorias;
- Paginação entre as categorias;
- Seleção de uma categoria;
- Filtro visual dos recursos relacionados;
- Box de recursos;
- Modais para cadastro e edição de categorias e recursos.

A seleção de uma categoria atualiza a lista de recursos exibida. A paginação pode ser feita pelos botões anterior/próxima ou por gesto horizontal de arrastar.

### Tela de atividades

É acessada pelo card **Atividades**. A tela apresenta o contador, o botão **Nova atividade** e os cards das atividades cadastradas.

O botão **Nova atividade** abre um modal para informar o nome da atividade, escolher a categoria, adicionar recursos e definir as quantidades necessárias.

## 3. Menus e mecanismos de navegação

O projeto não utiliza abas inferiores nem menu lateral. Como a aplicação possui poucos fluxos principais, foram utilizados mecanismos mais diretos:

- Cards da tela inicial para acesso às funcionalidades;
- Stack Navigator para manter o histórico das telas;
- Botão `Voltar` para retorno à tela anterior;
- Botão flutuante de casa para retorno direto à tela inicial com reset da pilha;
- Botões de paginação no box de categorias;
- Gesto horizontal de arrastar no box de categorias;
- Seleção visual de categorias;
- Dropdowns dentro dos modais para escolha de categorias e recursos;
- Rolagem vertical das telas e das listas internas.

Durante o gesto de paginação, a faixa de categorias acompanha o deslocamento do dedo. Ao soltar, a página é concluída ou retorna à posição original com animação.

## 4. Modais e operações disponíveis

### Modal de categorias

O modal é aberto pelo botão **Adicionar** ou pelo botão **Editar** após selecionar uma categoria. Ele possui:

- Campo de nome;
- Botão **Cancelar**;
- Botão **Salvar**;
- Adição de novas categorias;
- Alteração do nome de categorias existentes.

Quando uma nova categoria é adicionada e a página atual está cheia, uma nova página é criada e exibida automaticamente.

### Modal de recursos

O modal é aberto pelo botão **Adicionar** da box de recursos ou pelo botão de edição de um recurso. Ele possui:

- Campo de nome;
- Campo de quantidade com entrada numérica;
- Dropdown para escolher a categoria relacionada;
- Botões **Cancelar** e **Salvar**.

A lista de recursos é atualizada após o cadastro ou alteração, e continua sendo filtrada pela categoria selecionada.

### Modal de atividades

O modal é aberto pelo botão **Nova atividade** da tela de atividades. Ele possui:

- Campo de nome da atividade;
- Dropdown para selecionar a categoria;
- Dropdown para selecionar recursos da categoria;
- Campo numérico para quantidade necessária;
- Botão **Adicionar recurso**;
- Lista de recursos selecionados;
- Ação para remover um recurso selecionado;
- Botões **Cancelar** e **Salvar**.

Quando a categoria da atividade é alterada, os recursos selecionados são limpos. Recursos já adicionados deixam de aparecer no dropdown, impedindo que o mesmo recurso seja incluído mais de uma vez.

## 5. Feedback visual implementado

A aplicação utiliza diferentes estados visuais para tornar as ações compreensíveis:

- Botões alteram fundo, borda e escala enquanto estão pressionados;
- Cards alteram a aparência ao serem pressionados;
- Categorias selecionadas recebem fundo, borda e indicador visual diferentes;
- Botões indisponíveis utilizam um vermelho escuro e não vibrante;
- Botões de paginação são desabilitados nas extremidades;
- Atividades exibem os estados `PENDENTE` e `CONCLUIDA`;
- Recursos completos exibem caixa verde, marca de conclusão, texto riscado e quantidade destacada;
- Recursos pendentes permanecem com caixa vazia e texto normal;
- Operações de categoria, recurso e atividade exibem pop-ups temporários no topo da tela;
- O pop-up informa mensagens como `Operação cancelada`, `Categoria adicionada com sucesso`, `Categoria alterada com sucesso`, `Recurso adicionado com sucesso` e `Atividade adicionada com sucesso`;
- O campo Salvar fica visualmente inativo até que os dados obrigatórios sejam preenchidos.

## 6. Principais decisões de UX

- Foi utilizado um Stack Navigator porque os fluxos possuem relação clara de entrada e retorno e precisam respeitar o histórico de navegação do dispositivo.
- O cabeçalho nativo foi ocultado para manter o layout visual consistente com o tema do aplicativo.
- O botão flutuante de casa fica disponível nas telas internas para reduzir o esforço de retorno à tela principal.
- O reset da pilha no botão de casa evita que o usuário precise voltar por várias telas até chegar ao início.
- As ações de criação e edição são realizadas em modais sobrepostos, mantendo o contexto da tela de origem.
- Os modais utilizam `KeyboardAvoidingView` para reduzir conflitos entre o formulário e o teclado do telefone.
- Os formulários são compactos, com os botões principais lado a lado e posicionados ao final do modal.
- A paginação por botões é mantida junto com o gesto horizontal, oferecendo alternativa para diferentes preferências de interação.
- A troca de categoria na atividade limpa os recursos anteriores para evitar associação incorreta entre categorias.
- Recursos já escolhidos são removidos das opções disponíveis para evitar duplicidade.
- O tema escuro com roxo é mantido nos componentes principais, enquanto vermelho escuro e verde são usados para estados de erro, cancelamento ou conclusão.
- Os dados ainda são mantidos em estado local com `useState`. A alteração de categorias, recursos e atividades não sobrevive ao encerramento completo do aplicativo.

## 7. Medidas de acessibilidade

Foram adotadas as seguintes medidas:

- Uso de `accessibilityRole="button"` nos elementos interativos;
- Uso de `accessibilityLabel` em ações de edição, exclusão, retorno, paginação e remoção de recursos;
- Uso de `accessibilityState` para informar seleção, desabilitação e expansão de dropdowns;
- Textos visíveis para identificar ações importantes, como `Voltar`, `Adicionar`, `Editar`, `Excluir`, `Cancelar` e `Salvar`;
- Campos de entrada com rótulos acessíveis, incluindo nome, quantidade e quantidade necessária;
- Teclado numérico nos campos de quantidade;
- Áreas de toque com dimensões adequadas para botões e linhas interativas;
- Estados de pressionado, selecionado, concluído e desabilitado representados visualmente;
- `SafeAreaView` para evitar que o conteúdo fique sob áreas protegidas do dispositivo;
- `ScrollView` para permitir o acesso a conteúdos maiores em telas menores;
- Contraste reforçado entre o fundo escuro e os textos principais;
- Feedback textual após operações de cancelamento e salvamento.

## 8. Execução e teste da navegação

Na raiz do projeto, instale as dependências e inicie o Expo:

```bash
npm install
npx expo start --tunnel
```

Abra o projeto pelo Expo Go usando o QR code ou o endereço exibido pelo Expo.

Para testar a navegação básica:

1. Inicie na tela principal;
2. Toque em **Ver tutoriais**, **Categorias e recursos** e **Atividades**;
3. Em cada tela interna, teste o botão `Voltar`;
4. Teste o botão físico de voltar do Android;
5. Teste o botão flutuante de casa e confirme que ele retorna diretamente à tela inicial;
6. Entre em categorias e teste os botões de paginação e o gesto de arrastar para os lados;
7. Adicione uma categoria e confirme a criação de uma nova página quando necessário;
8. Selecione uma categoria e teste o modal de edição;
9. Cadastre um recurso, informe uma quantidade e selecione sua categoria;
10. Acesse **Atividades** e toque em **Nova atividade**;
11. Informe o nome, selecione uma categoria, adicione recursos e quantidades;
12. Troque a categoria durante o cadastro e confirme que os recursos selecionados foram limpos;
13. Tente adicionar o mesmo recurso novamente e confirme que ele não aparece entre as opções;
14. Salve a atividade e confirme sua inclusão na lista;
15. Teste cancelar operações e observe os pop-ups de feedback.

Para verificar os tipos sem gerar arquivos:

```bash
npm exec tsc -- --noEmit
```

As alterações realizadas durante a execução são temporárias. Como ainda não há persistência local, fechar e reiniciar o aplicativo restaura os dados placeholder iniciais.
