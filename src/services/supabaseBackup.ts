import 'react-native-url-polyfill/auto';
import {createClient} from '@supabase/supabase-js';
import type {SupabaseClient} from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import {Platform} from 'react-native';

// Formato comum usado para salvar e restaurar os dados locais do aplicativo.
export type SupabaseBackupPayload = {
  categoryPages: string[][];
  resources: Array<{
    id: string;
    icon: string;
    name: string;
    quantity: string;
    category: string;
  }>;
  activities: Array<{
    id: string;
    name: string;
    category: string;
    resources: Array<{name: string; required: number}>;
    tempoConstrucaoSegundos: number;
    terminaConstrucaoEm?: number;
    idNotificacao?: string;
  }>;
};

// O SDK usa este adaptador para persistir a sessão e o refresh token no cofre nativo.
const secureSessionStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

// Mantém uma única instância do cliente durante a execução do aplicativo.
let supabaseClient: SupabaseClient | null = null;

// Cria o cliente somente quando a URL e a chave pública estão configuradas.
export function getSupabaseClient(): SupabaseClient | null {
  const projectUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/\/+$/, '');
  const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!projectUrl || !publishableKey) {
    return null;
  }

  if (supabaseClient === null) {
    supabaseClient = createClient(projectUrl, publishableKey, {
      auth: {
        storage: secureSessionStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }

  return supabaseClient;
}

// Garante uma sessão e grava um único backup por usuário autenticado.
export async function backupAppDataToSupabase(data: SupabaseBackupPayload): Promise<void> {
  if (Platform.OS === 'web') {
    throw new Error('O backup seguro está disponível no app Android ou iOS.');
  }

  const client = getSupabaseClient();
  if (client === null) {
    throw new Error('Configure EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY no arquivo .env.');
  }

  const userId = await getAuthenticatedUserId(client);

  const {error} = await client.from('app_backups').upsert({
    user_id: userId,
    data,
    updated_at: new Date().toISOString(),
  }, {onConflict: 'user_id'});

  if (error) {
    throw error;
  }
}

// Busca o backup da sessão atual; null representa ausência de registro remoto.
export async function restoreAppDataFromSupabase(): Promise<SupabaseBackupPayload | null> {
  if (Platform.OS === 'web') {
    throw new Error('A restauração segura está disponível no app Android ou iOS.');
  }

  const client = getSupabaseClient();
  if (client === null) {
    throw new Error('Configure EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY no arquivo .env.');
  }

  const userId = await getAuthenticatedUserId(client);
  const {data: row, error} = await client
    .from('app_backups')
    .select('data')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (row === null) {
    return null;
  }
  if (!isSupabaseBackupPayload(row.data)) {
    throw new Error('O backup encontrado tem um formato inválido.');
  }

  return row.data;
}

// Reaproveita a sessão persistida ou cria uma sessão anônima na primeira operação.
async function getAuthenticatedUserId(client: SupabaseClient): Promise<string> {
  const {data: sessionData, error: sessionError} = await client.auth.getSession();
  if (sessionError) {
    throw sessionError;
  }

  const currentUserId = sessionData.session?.user.id;
  if (currentUserId) {
    return currentUserId;
  }

  const {data: anonymousData, error: anonymousError} = await client.auth.signInAnonymously();
  if (anonymousError) {
    throw new Error(`Não foi possível iniciar a sessão anônima: ${anonymousError.message}`);
  }
  if (anonymousData.user === null) {
    throw new Error('A autenticação anônima não retornou um usuário.');
  }

  return anonymousData.user.id;
}

// Valida o JSON remoto antes de permitir que ele substitua o estado local.
function isSupabaseBackupPayload(value: unknown): value is SupabaseBackupPayload {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const payload = value as Record<string, unknown>;
  return Array.isArray(payload.categoryPages)
    && payload.categoryPages.every((page) => Array.isArray(page) && page.every((category) => typeof category === 'string'))
    && Array.isArray(payload.resources)
    && payload.resources.every((resource) => {
      if (typeof resource !== 'object' || resource === null) {
        return false;
      }
      const item = resource as Record<string, unknown>;
      return typeof item.id === 'string'
        && typeof item.icon === 'string'
        && typeof item.name === 'string'
        && typeof item.quantity === 'string'
        && typeof item.category === 'string';
    })
    && Array.isArray(payload.activities)
    && payload.activities.every((activity) => {
      if (typeof activity !== 'object' || activity === null) {
        return false;
      }
      const item = activity as Record<string, unknown>;
      return typeof item.id === 'string'
        && typeof item.name === 'string'
        && typeof item.category === 'string'
        && typeof item.tempoConstrucaoSegundos === 'number'
        && Array.isArray(item.resources)
        && item.resources.every((resource) => {
          if (typeof resource !== 'object' || resource === null) {
            return false;
          }
          const requirement = resource as Record<string, unknown>;
          return typeof requirement.name === 'string' && typeof requirement.required === 'number';
        })
        && (item.terminaConstrucaoEm === undefined || typeof item.terminaConstrucaoEm === 'number')
        && (item.idNotificacao === undefined || typeof item.idNotificacao === 'string');
    });
}