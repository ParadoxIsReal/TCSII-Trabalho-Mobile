# Etapa 07 - Estado compartilhado e recurso nativo

## Objetivo

Esta etapa documenta o gerenciamento de dados compartilhados entre as telas e a integração com notificações locais para avisar quando uma construção termina. O fluxo atende ao acompanhamento de atividades: o usuário pode sair da tela, e o app mantém os dados da atividade e do estoque disponíveis ao voltar.

## Gerenciamento de estado

O app usa **React Context** (`AppDataContext` e `AppDataProvider`) com os hooks `useState` e `useContext` para compartilhar dados entre as telas. O provider envolve a navegação e disponibiliza os dados e suas funções de atualização por meio do hook `useAppData`.

Os seguintes estados são compartilhados globalmente:

- **Categorias** (`categoryPages`), que organizam os dados por jogo ou grupo.
- **Recursos e quantidades em estoque** (`resources`).
- **Atividades**, incluindo seus requisitos, duração, horário de término da construção e identificador da notificação, quando houver.

Esses dados são globais porque mais de uma tela precisa consultá-los ou atualizá-los. Por exemplo, uma alteração no estoque deve refletir no acompanhamento da atividade, e a construção iniciada nos detalhes deve continuar registrada ao navegar para outra tela. Mantê-los em um contexto comum evita cópias divergentes dos mesmos dados.

Categorias, recursos e atividades são persistidos juntos em uma chave do **AsyncStorage**. Na inicialização, o app carrega os dados salvos antes de montar a navegação; alterações são persistidas após a hidratação. Estado temporário de interface — como filtros, seleções e formulários — não faz parte desse estado compartilhado persistido.

## Recurso nativo: notificações locais

O recurso nativo utilizado é o sistema de **notificações locais**, integrado pelo pacote `expo-notifications`. Ele foi escolhido porque atividades podem ter construções com duração: uma notificação permite avisar o usuário quando o prazo termina, mesmo que ele esteja em outra tela ou tenha deixado o app em segundo plano. O aviso é agendado no dispositivo e não depende de um servidor para ser enviado.

### Permissões

É necessária a autorização do sistema operacional para exibir notificações:

- **Android:** permissão de notificações do sistema; em versões que a exigem, como Android 13 ou superior, o usuário precisa concedê-la durante a execução.
- **iOS:** autorização do usuário para exibir notificações, solicitada durante a execução.

O app consulta a autorização existente e, se necessário, solicita a permissão quando o usuário inicia uma construção com duração. A apresentação do aviso também pode depender das configurações de notificações e de economia de bateria do dispositivo.

### Fluxo de utilização

1. O usuário completa os requisitos da atividade e toca em **Confirmar**.
2. O app desconta os recursos do estoque e registra o horário absoluto em que a construção termina. Essa atualização não depende do resultado da solicitação de notificação.
3. Para construções com duração, o app verifica a permissão e solicita autorização se necessário. Se autorizada, agenda uma notificação local para o tempo restante, com o identificador da atividade nos dados do aviso.
4. Ao concluir, a notificação informa que a atividade está pronta para coleta. Com o app aberto, a configuração solicita que o sistema também a apresente como banner/lista.
5. Ao tocar no aviso, o app abre **Atividades** e os detalhes da atividade correspondente. O usuário ainda precisa tocar em **Coletar** para removê-la.
6. Uma construção instantânea (duração vazia ou `00:00:00`) fica pronta imediatamente e não solicita permissão nem agenda notificação.

## Falhas e indisponibilidade

- Se o usuário negar a permissão, a construção e o contador continuam; o app informa que as notificações estão desativadas.
- Se a consulta de permissão ou o agendamento falhar, a construção não é desfeita. O app apresenta feedback de que o aviso falhou e registra falhas técnicas no console.
- Sem notificação, o usuário ainda pode acompanhar a atividade pela lista. O término é calculado a partir do horário absoluto persistido, não da execução contínua de um temporizador em segundo plano.
- Um ambiente sem suporte ao módulo nativo de notificações não permite validar a entrega do aviso. A navegação e o acompanhamento pela interface continuam disponíveis.

## Execução e teste

Pré-requisitos: Node.js e npm. Na raiz do repositório, instale as dependências e inicie o Expo:

```bash
npm install
npx expo start --tunnel ngrok
```

Abra o projeto em um dispositivo ou runtime compatível com `expo-notifications` e conceda a permissão quando solicitada. Para validar os tipos TypeScript:

```bash
npm exec tsc -- --noEmit
```

### Cenários de teste manual

1. **Estado compartilhado:** crie ou altere uma categoria, um recurso e uma atividade; navegue entre **Categorias e recursos** e **Atividades** e confirme que os dados e o estoque permanecem consistentes.
2. **Persistência:** encerre e reabra o app; confirme que categorias, recursos e atividades continuam disponíveis.
3. **Notificação permitida:** crie uma atividade com duração curta, complete os requisitos e toque em **Confirmar**. Verifique o desconto do estoque, aguarde o término e confirme o aviso. Toque nele e confira se os detalhes da atividade abrem; toque em **Coletar** para removê-la.
4. **Permissão negada:** negue a autorização quando solicitada e inicie uma construção com duração. Confirme que a construção continua, que o app informa a indisponibilidade da notificação e que a atividade pode ser acompanhada e coletada pela tela.
5. **Construção instantânea:** confirme uma atividade com duração vazia ou `00:00:00`. Verifique que ela fica pronta imediatamente e que não há solicitação de permissão nem notificação agendada.
6. **Retomada após fechar o app:** inicie uma construção com duração, feche e reabra o app. Confirme que a atividade permanece e que o tempo restante corresponde ao horário de término salvo.

Teste a exibição e a abertura da notificação em um dispositivo ou runtime compatível; o comportamento em segundo plano pode variar conforme o sistema operacional e as configurações do dispositivo.
