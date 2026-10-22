# Etapa 04 - Persistência local de dados

## 1. Mecanismo de persistência utilizado

A aplicação utiliza `@react-native-async-storage/async-storage` para armazenar dados localmente no dispositivo. O AsyncStorage oferece armazenamento persistente de chave e valor e é adequado para o volume pequeno de dados do Farm Helper, sem exigir servidor, conta de usuário ou configuração de banco de dados.

Os dados são serializados como JSON e armazenados sob a chave `farm-helper-app-data`. A leitura e a gravação são assíncronas.

## 2. Justificativa da escolha

O AsyncStorage foi escolhido por ser uma solução simples, compatível com o Expo utilizado pelo projeto e suficiente para salvar as listas do aplicativo. Ele mantém os dados entre execuções sem introduzir infraestrutura remota ou a complexidade de um banco de dados relacional.

O armazenamento é local à instalação do aplicativo devido a natureza de uso pessoal do Farm Helper. Os dados não são sincronizados entre dispositivos e podem ser removidos se os dados do app forem apagados ou se o aplicativo for desinstalado.

## 3. Estrutura dos dados armazenados

Um único objeto contém as páginas de categorias, os recursos cadastrados e as atividades:

```json
{
  "categoryPages": [["Fazenda", "Aventura"]],
  "resources": [
    {
      "id": "resource-123",
      "icon": "*",
      "name": "Madeira",
      "quantity": "x18",
      "category": "Fazenda"
    }
  ],
  "activities": [
    {
      "name": "Construir celeiro",
      "category": "Fazenda",
      "resources": [
        { "name": "Madeira", "required": 12 }
      ]
    }
  ]
}
```

`categoryPages` é uma matriz de nomes de categorias, distribuídas em páginas. Cada recurso possui identificador, ícone, nome, quantidade e categoria. Cada atividade possui nome, categoria e uma lista de recursos com suas quantidades necessárias.

## 4. Operações de persistência implementadas

O `AppDataProvider`, posicionado acima da navegação, centraliza os dados compartilhados pelas telas:

- **Leitura:** ao iniciar, consulta a chave `farm-helper-app-data` e converte o JSON encontrado para o estado da aplicação.
- **Valores iniciais:** se ainda não houver dados salvos, são usados os dados de demonstração definidos no app. Se a leitura ou a conversão falhar, o erro é registrado no console e os valores iniciais permanecem disponíveis.
- **Gravação:** depois que a leitura inicial termina, alterações nas categorias, nos recursos ou nas atividades disparam a gravação do objeto completo com `AsyncStorage.setItem`.
- **Exclusões e edições:** são persistidas pelo mesmo mecanismo automático, pois atualizam as listas observadas pelo provider.

O app aguarda a leitura antes de montar a navegação. Isso impede que os valores iniciais sobrescrevam os dados existentes durante a inicialização. Campos de formulário, filtros, seleções e outros estados temporários da interface não são armazenados.

## 5. Telas que utilizam os dados persistidos

- **Categorias e recursos:** utiliza as páginas de categorias e a lista de recursos. Cadastro, edição, exclusão e atualização de quantidade são mantidos entre execuções.
- **Atividades:** utiliza a lista de atividades e consulta o estoque de recursos para apresentar o progresso. A atualização do estoque a partir dos detalhes de uma atividade também é persistida.

A tela inicial e a tela de tutoriais não exibem nem alteram essas listas; o conteúdo ilustrativo dos tutoriais é estático.

## 6. Execução e teste

Na raiz do projeto, instale as dependências e inicie o Expo:

```bash
npm install
npx expo start --tunnel
```

Abra o projeto no Expo Go usando o QR code. Para conferir o comportamento no dispositivo:

1. Na tela **Categorias e recursos**, crie uma categoria de teste e cadastre nela um recurso com uma quantidade fácil de reconhecer, por exemplo `x12`.
2. Na tela **Atividades**, crie uma atividade nessa categoria e associe o recurso com uma quantidade necessária.
3. Abra os detalhes da atividade e atualize o estoque pelo botão `+` do recurso; confirme o novo valor exibido.
4. Aguarde alguns instantes para a gravação assíncrona terminar. Encerre completamente o Expo Go pelo seletor de aplicativos recentes, sem desinstalar o app nem limpar seus dados.
5. Reabra o mesmo projeto pelo Expo Go, usando os projetos recentes ou lendo novamente o QR code enquanto o servidor Expo continua ativo.
6. Volte às telas **Categorias e recursos** e **Atividades**. Confirme que a categoria, o recurso com a quantidade atualizada e a atividade com seu progresso continuam presentes.

Para validar o funcionamento do projeto sem gerar arquivos:

```bash
npm exec tsc -- --noEmit
```
