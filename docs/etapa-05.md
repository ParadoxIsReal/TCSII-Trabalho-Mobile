# Etapa 05 - Atividades, estoque e construção

## 1. Objetivo e fluxo de negócio

Esta etapa integra o cadastro de categorias e recursos ao acompanhamento de atividades. O usuário organiza o estoque por categoria (por exemplo, um jogo), define os materiais e quantidades necessários para cada atividade e acompanha o processo até a coleta.

O fluxo completo é:

1. Criar uma categoria e cadastrar nela recursos com suas quantidades iniciais.
2. Abrir **Atividades** e criar uma atividade, informando nome, categoria, recursos necessários e tempo de construção.
3. Abrir os detalhes da atividade. A tela compara a quantidade necessária com o estoque da mesma categoria.
4. Se faltar estoque, registrar as unidades obtidas pelo botão `+` de cada recurso. A quantidade informada é somada ao recurso no inventário.
5. Quando todos os requisitos estiverem atendidos, tocar em **Confirmar**. O app desconta do estoque as quantidades definidas e inicia a construção.
6. A atividade permanece em **CONSTRUINDO** até o horário final, calculado e persistido no dispositivo. Ao concluir, passa a **PRONTA** e pode ser coletada.
7. Tocar em **Coletar** remove a atividade da lista. Em construções com duração, uma notificação local também avisa o usuário; ao tocar nela, o app abre Atividades e os detalhes da atividade correspondente.

Uma duração vazia ou `00:00:00` é instantânea: ao confirmar, os recursos são consumidos e a atividade fica pronta para coleta imediatamente, sem agendar uma notificação.

## 2. Passo a passo para executar o fluxo

1. Na tela inicial, acesse **Categorias e recursos**.
2. Use o botão `+` para cadastrar uma categoria ou selecionar uma existente.
3. Na aba **Recurso** do cadastro, informe nome, quantidade e categoria. Repita para os materiais que serão usados.
4. Acesse **Atividades** pelo botão de navegação da tela inicial.
5. Toque no botão flutuante `+` e preencha o nome da atividade, a categoria e os recursos necessários. Para cada recurso, escolha-o, informe a quantidade e toque em **Adicionar recurso**.
6. Informe a duração em `HH:MM:SS`. Os campos podem ser deixados vazios para uma construção instantânea.
7. Toque em **Salvar**. A atividade passa a aparecer na lista com categoria, requisitos, estado e duração.
8. Toque no cartão para abrir os detalhes. Se necessário, use `+` para acrescentar ao estoque a quantidade obtida de cada material.
9. Quando todos os indicadores de quantidade estiverem completos, toque em **Confirmar**.
10. Aguarde o contador terminar. Com permissão de notificações, o dispositivo recebe um aviso local de conclusão. Abra a atividade pela notificação ou pelo cartão na lista e toque em **Coletar**.

## 3. Funcionalidades integradas

- Cadastro, edição e exclusão de categorias e recursos.
- Separação do estoque por categoria; recursos com o mesmo nome em categorias diferentes não compartilham quantidade.
- Exclusão em cascata: excluir uma categoria remove seus recursos e atividades; excluir um recurso remove as atividades que dependem dele.
- Criação de atividades com vários recursos e duração configurável.
- Seletor de recursos que lista os recursos da categoria escolhida e permite rolagem quando há muitas opções.
- Progresso por recurso no formato `disponível/necessário` e adição de unidades obtidas ao estoque.
- Desconto do estoque ao confirmar a construção.
- Estados **PENDENTE**, **CONCLUIDA**, **CONSTRUINDO** e **PRONTA**, com contador de tempo restante.
- Persistência local de categorias, recursos, atividades, término de construção e identificador de notificação por AsyncStorage.
- Notificação local para construções com duração, com abertura direta dos detalhes da atividade.
- Tutorial atualizado com a criação, confirmação, construção e coleta.

## 4. Tratamento de entradas inválidas

- Nome de categoria e nome de atividade não podem ficar vazios ou conter apenas espaços.
- A atividade precisa ter uma categoria e pelo menos um recurso selecionado.
- Cada recurso adicionado à atividade exige uma quantidade inteira maior que zero. O mesmo recurso não pode ser incluído duas vezes na atividade.
- A quantidade de estoque adquirida deve ser um inteiro positivo. Campos numéricos removem caracteres que não sejam dígitos.
- Horas de construção aceitam valores de `00` a `99`; minutos e segundos devem estar entre `00` e `59`.
- Os campos de duração vazios são convertidos para zero segundos. Valores de minutos ou segundos acima de `59` exibem um aviso e desabilitam **Salvar**.
- **Confirmar** só é disponibilizado quando todos os recursos necessários estão no estoque. A regra é verificada novamente ao executar a operação para evitar consumir quantidades insuficientes.
- Durante uma construção iniciada, os controles de adição de recursos ficam desabilitados. Uma atividade que já tem horário de término não pode ser confirmada novamente.
- Se a permissão de notificação for negada ou o agendamento falhar, a construção continua; somente o aviso do sistema deixa de ser garantido.

## 5. Mecanismos de feedback

- Popups temporários, com cores distintas para sucesso e cancelamento/erro, informam operações como cadastro, cancelamento, confirmação e coleta.
- Avisos junto ao formulário indicam limites inválidos de minutos e segundos.
- Botões de salvar e adicionar ficam visualmente desabilitados enquanto faltarem dados obrigatórios ou houver valores inválidos.
- Os cartões indicam o estado da atividade; nos detalhes, cada recurso mostra a quantidade disponível em relação à necessária.
- Falta de estoque, permissão de notificação desativada e falha no agendamento são apresentados ao usuário. Falhas técnicas de notificação também são registradas no console.
- Os modais de cadastro podem ser cancelados pelo botão **Cancelar**, pelo botão Voltar do Android ou tocando fora deles.
- Todo componente com interatividade à clique tem feedback visual presente, tendo aumento de contraste enquanto pressionado.

## 6. Principais decisões técnicas

- Categorias, recursos e atividades são mantidos em um contexto compartilhado e persistidos juntos em uma única chave do AsyncStorage, evitando divergência entre as telas.
- A atividade guarda duração em segundos e o instante absoluto de término. O contador é derivado de `terminaConstrucaoEm - Date.now()`, em vez de depender de um timer que precisaria permanecer ativo em segundo plano.
- O estoque é associado pelo par categoria + nome do recurso para não confundir recursos homônimos de categorias diferentes.
- A confirmação atualiza atividade e estoque imediatamente. A solicitação de permissão e o agendamento da notificação são complementares e não bloqueiam o início da construção.
- Notificações usam `expo-notifications` e gatilho local de intervalo. O módulo do canal Android não é chamado explicitamente: o sistema pode usar o canal fallback da biblioteca.
- A permissão é solicitada no início de uma construção com duração. Sem ela, a contagem e a coleta continuam disponíveis, mas o usuário não recebe a notificação.
- A resposta à notificação carrega o identificador da atividade; a navegação o usa para abrir a tela de detalhes.
- O dropdown de recursos tem altura máxima e rolagem própria para que listas maiores não cubram os demais controles do formulário.

## 7. Execução e teste

### Preparar e iniciar

Pré-requisitos: Node.js e npm instalados. Na raiz do repositório:

```bash
npm install
npx expo start --tunnel ngrok
```

Leia o QR code com o Expo Go compatível com o SDK do projeto. Se o Metro estiver servindo um bundle antigo, pare o processo e reinicie com:

```bash
npx expo start --clear
```

Para validar os tipos TypeScript:

```bash
npm exec tsc -- --noEmit
```

Para gerar bundles de verificação para Android e iOS:

```bash
npx expo export --platform android --platform ios
```

### Cenários de teste manual

1. **Cadastro:** criar uma categoria, cadastrar recursos e criar uma atividade com mais de três recursos possíveis no seletor; confirmar que a lista do seletor rola sem cobrir os controles do formulário.
2. **Validação:** tentar salvar sem nome, categoria ou recurso; verificar que o botão permanece desabilitado. Informar minutos ou segundos iguais a `60` e verificar o aviso e o bloqueio do salvamento.
3. **Estoque insuficiente:** criar uma atividade que exija mais unidades do que existem; abrir seus detalhes e verificar que **Confirmar** não fica disponível.
4. **Adicionar estoque:** registrar uma quantidade positiva usando `+`; verificar que o total aumenta e o progresso é atualizado. Tentar enviar quantidade vazia ou zero e verificar que não é aceita.
5. **Construção com duração:** criar uma atividade com tempo curto, completar os requisitos e confirmar. Verificar o desconto exato no estoque, o estado **CONSTRUINDO**, o contador regressivo e o popup de confirmação.
6. **Conclusão e coleta:** aguardar o término; verificar o estado **PRONTA** e a disponibilidade de **Coletar**. Se permitido pelo dispositivo, confirmar também o recebimento da notificação e a abertura dos detalhes ao tocá-la.
7. **Permissão negada:** negar notificações e confirmar uma atividade com duração; verificar que a construção inicia mesmo assim, com feedback de que a notificação não está disponível.
8. **Construção instantânea:** deixar a duração vazia, confirmar com estoque suficiente e verificar que a atividade fica imediatamente pronta para coletar, sem solicitação de notificação.
9. **Persistência:** iniciar uma construção com duração, fechar e reabrir o app; verificar que a atividade permanece e que o tempo restante é calculado a partir do horário final salvo.

As notificações devem ser testadas em um dispositivo ou runtime que ofereça suporte ao módulo nativo de notificações. A exibição em segundo plano pode depender das permissões e configurações de economia de bateria do sistema operacional.
