# Proposta de Projeto de Tecnologia de Construção de Software II
### Nome da aplicação
Farm Helper

### Problema a ser resolvido
Em vídeo games, particularmente de natureza RPG, gerenciamento de recursos e acompanhamento de tarefas/checklists não são frequentemente providenciados nativamente pelo jogo. Isso inclui coisas como diagramas a serem construídos, dependências e subdependências de materiais, recursos utilizados por múltiplas fontes, etc.

### Público Alvo:
uso pessoal e rápido para o criador do projeto, porém pode ser uma ferramenta de uso genérico para jogadores que priorizam uso individual.

### Objetivo Principal
providenciar uma interface que permita o usuário deixar sob a aplicação a responsabilidade de calcular e alertar sobre quaisquer metas/tarefas concluídas, como uma checklist ou lista de desejos e fazer o gerenciamento automático de dependências e recursos compartilhados.

### Descrição das funcionalidades
Criar listas de recursos desejados para uma devida “atividade”, e conforme adição dos recursos por parte do usuário, contabilizar tais recursos em quaisquer “atividades” que os utilizem, assim permitindo o usuário saber se uma atividade está completa com os recursos presentes, ou até saber se um devido recurso é suficiente para satisfazer todas as atividades pendentes que o utilizem.
Satisfazer essas utilidades em cascata, onde uma atividade é requisito de outra, corretamente alertando o usuário em que nível de hierarquia está faltando e se toda a pirâmide de conclusão está feita.
Permitir a separação clara dos recursos e atividades em diferentes categorias para satisfazer a múltiplos jogos simultâneos, sem que um afete o outro.

### Telas Previstas
Tela inicial, Telas de Tutoriais, Tela de criação de recursos/Atividades, Tela de criação de Categorias, Tela de acompanhamento, Tela de Configurações (tentativo).

### Fluxo Básico
O usuário vê os tutorias nas telas de tutorias, encaminha-se pra tela de criação de categorias para criar uma categoria do jogo desejado dele, então parte para a tela de criação de recursos, onde irá adicionar as informações de todos os recursos pertinentes e criar as atividades com todos os requisitos de recursos desejados. Após, a tela de acompanhamento irá listar de forma ergonômica todas as atividades pendentes, e permitir o usuário rapidamente “adicionar” recursos adquiridos ao armazenamento assim atualizando todas os requerimentos das atividades, deixando sempre a mostra o quanto falta e o que já foi atingido.

### Tecnologia envolvida para o desenvolvimento mobile
React Native.

### Backend
Não será utilizado backend na versão prevista do projeto, visto que a aplicação terá funcionamento local e não necessitará de comunicação com um servidor.

### APIs
Não haverá necessidade de comunicação com APIs externas. Todos os recursos, atividades, categorias e demais informações utilizadas pela aplicação serão inseridas e gerenciadas localmente pelo usuário.

### Forma prevista para armazenamento dos dados
Os dados serão armazenados localmente no dispositivo do usuário, utilizando uma solução de armazenamento persistente compatível com React Native.

### Repositório Git
https://github.com/ParadoxIsReal/TCSII-Trabalho-Mobile

### Estrutura Inicial de diretórios
```TCSII Mobile/
├── README.md
├── docs/
│   └── proposta.md
└── ...
```
