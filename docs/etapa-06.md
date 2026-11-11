# Etapa 06 - Backup remoto com Supabase

## Objetivo

O app pode enviar e restaurar um backup dos dados locais para o Supabase a partir do final das telas **Categorias e recursos** ou **Atividades**. Os botões de backup e restauração ficam lado a lado e são iguais nas duas telas.

O armazenamento local com AsyncStorage continua sendo a fonte usada pelo app. O backup remoto é complementar e não substitui nem sincroniza automaticamente os dados locais.

## Serviço e comunicação

- Serviço externo: Supabase Database REST API.
- Protocolo: HTTPS.
- Operações: `UPSERT` e `SELECT` na tabela `app_backups` pelo Supabase JavaScript SDK; cada usuário mantém um registro de backup atualizado.
- Formato: JSON.
- O cliente oficial `@supabase/supabase-js` envia as requisições e anexa o JWT da sessão.

O corpo enviado tem a forma abaixo. Os arrays contêm os dados atuais do app:

```json
{
  "data": {
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
    "activities": []
  }
}
```

O backup cria ou atualiza o registro do usuário autenticado. A restauração consulta o mesmo registro e substitui os dados locais somente após a confirmação do usuário. Se não existir registro para a sessão atual, o app informa que não há backup.

## Configuração do projeto

Ative o provedor de login anônimo em **Authentication > Sign In / Providers > Anonymous**. Crie a tabela e a política pelo SQL Editor do Supabase:

```sql
create table if not exists public.app_backups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  updated_at timestamptz not null default now(),
  data jsonb not null
);

alter table public.app_backups
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.app_backups
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists app_backups_user_id_key
  on public.app_backups (user_id);

alter table public.app_backups enable row level security;

grant select, insert, update on public.app_backups to authenticated;

create policy "Users manage their own backup"
on public.app_backups
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
```

Configure as variáveis de ambiente copiando `.env.example` para `.env` e preenchendo a URL do projeto e a chave **Publishable** em **Project Settings > API Keys**. A URL e a chave pública já estão configuradas no `.env` local do ambiente de desenvolvimento. Reinicie o Expo após alterar variáveis.

## Segurança

- A chave Publishable fica no cliente e identifica o projeto; ela não concede acesso por si só.
- O app cria uma sessão anônima no primeiro backup. O Supabase fornece um JWT e o SDK o envia como `Bearer` nas requisições autenticadas.
- O JWT da sessão é persistido pelo `expo-secure-store`, usando o Keychain do iOS ou o armazenamento seguro do Android. A sessão é renovada quando o app está ativo.
- A política RLS compara `auth.uid()` com `user_id`; cada sessão só pode ler ou alterar seu próprio backup.
- A chave `service_role` nunca deve ser usada no app. O backup seguro não está habilitado para web nesta implementação.

Uma sessão anônima fica vinculada à instalação do app. Se o app for removido ou os dados locais forem apagados, a sessão pode ser perdida; recuperação entre dispositivos exigiria uma forma de login vinculada.

## Estados da interface

- **Carregamento:** os dois botões ficam desativados e a mensagem informa se o backup está sendo enviado ou buscado.
- **Sucesso:** informa se o backup foi salvo ou restaurado.
- **Confirmação:** antes de restaurar, um diálogo avisa que os dados locais serão substituídos e permite cancelar.
- **Erro:** mostra a falha de rede, autenticação ou resposta do Supabase; o usuário pode tentar novamente.
- **Ausência de dados:** o backup informa quando não há dados locais; a restauração informa quando não há backup para a sessão anônima atual.