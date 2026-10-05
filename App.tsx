import {StatusBar} from 'expo-status-bar';
import {useEffect, useRef, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {Animated,FlatList,KeyboardAvoidingView,Modal,  Platform,Pressable,PanResponder,ScrollView,StyleSheet,Text,TextInput,View} from 'react-native';
import React from 'react';

// ==================== Navegação e tipos ====================
type Screen = 'home' | 'tutorials' | 'setup' | 'tracking';

// Tipagem das rotas: permite ao TypeScript validar nomes de telas e parâmetros de navegação.
type RootStackParamList = {
  home: undefined;
  tutorials: undefined;
  setup: undefined;
  tracking: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Cartões da tela inicial: altere título, descrição, etapa e símbolo aqui.
const actions: Array<{
  screen: Exclude<Screen, 'home'>;
  eyebrow: string;
  titulo: string;
  description: string;
  icon: string;
}> = [
  {
    screen: 'tutorials',
    eyebrow: 'PRIMEIROS PASSOS',
    titulo: 'Ver tutoriais',
    description: 'Aprenda a organizar seu jogo em poucos passos.',
    icon: '?',
  },
  {
    screen: 'setup',
    eyebrow: 'ORGANIZAR',
    titulo: 'Categorias e recursos',
    description: 'Crie um jogo, seus recursos e as atividades desejadas.',
    icon: '+',
  },
  {
    screen: 'tracking',
    eyebrow: 'ACOMPANHAR',
    titulo: 'Atividades',
    description: 'Veja o que falta e atualize seu estoque rapidamente.',
    icon: '>',
  },
];

// Tipos das entidades usadas nos formulários e listas.
type Resource = {
  id: string;
  icon: string;
  name: string;
  quantity: string;
  category: string;
};

type Activity = {
  name: string;
  category: string;
  resources: Array<{ name: string; required: number }>;
};

// ==================== Dados iniciais para testes ====================
// Categorias e estoques de exemplo; Madeira existe nas duas categorias para testar o vínculo correto.
const categoriasIniciais = [['Fazenda', 'Aventura']];
const recursosIniciais: Resource[] = [
  { id: 'teste-1', icon: '*', name: 'Madeira', quantity: 'x18', category: 'Fazenda' },
  { id: 'teste-2', icon: '#', name: 'Ferro', quantity: 'x5', category: 'Fazenda' },
  { id: 'teste-3', icon: '+', name: 'Pedra', quantity: 'x0', category: 'Fazenda' },
  { id: 'teste-4', icon: '*', name: 'Madeira', quantity: 'x3', category: 'Aventura' },
  { id: 'teste-5', icon: '%', name: 'Cristal', quantity: 'x7', category: 'Aventura' },
];

// ==================== Navegador principal ====================
export default function App() {
  return (
    // Fornece as métricas de área segura usadas por SafeAreaView em iOS e Android.
    <SafeAreaProvider>
      {/* NavigationContainer mantém o estado global da navegação. */}
      <NavigationContainer>
        {/* Native Stack troca telas com navegação nativa; headerShown=false oculta o cabeçalho padrão. */}
        <Stack.Navigator initialRouteName="home" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="home">
            {(props) => <AppContent screen="home" navigation={props.navigation} />}
          </Stack.Screen>
          <Stack.Screen name="tutorials">
            {(props) => <AppContent screen="tutorials" navigation={props.navigation} />}
          </Stack.Screen>
          <Stack.Screen name="setup">
            {(props) => <AppContent screen="setup" navigation={props.navigation} />}
          </Stack.Screen>
          <Stack.Screen name="tracking">
            {(props) => <AppContent screen="tracking" navigation={props.navigation} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

// ==================== Estado, regras e telas ====================
function AppContent({
  screen,
  navigation,
}: {
  screen: Screen;
  navigation: NativeStackNavigationProp<RootStackParamList>;
}) {
  // ===== Estado da tela Categorias e recursos =====
  // Seleção, paginação e valores do modal compartilhado por abas.
  // useState guarda o valor entre renderizações; chamar o setter atualiza a interface.
  const [categoryPage, setCategoryPage] = useState(0);
  const [categoryPages, setCategoryPages] = useState<string[][]>(categoriasIniciais);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [entryModalVisible, setEntryModalVisible] = useState(false);
  const [entryModalTab, setEntryModalTab] = useState<'category' | 'resource'>('category');
  const [categoryModalMode, setCategoryModalMode] = useState<'add' | 'edit'>('add');
  const [categoryName, setCategoryName] = useState('');
  const [resources, setResources] = useState<Resource[]>(recursosIniciais);
  const [resourceModalMode, setResourceModalMode] = useState<'add' | 'edit'>('add');
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [resourceName, setResourceName] = useState('');
  const [resourceQuantity, setResourceQuantity] = useState('');
  const [resourceCategory, setResourceCategory] = useState('');
  const [resourceDropdownOpen, setResourceDropdownOpen] = useState(false);

  // ===== Estado da tela Atividades =====
  // Lista, detalhe aberto, expansão do estoque e campos de criação/adição.
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityDetails, setActivityDetails] = useState<Activity | null>(null);
  const [expandedInventoryResourceId, setExpandedInventoryResourceId] = useState<string | null>(null);
  const [acquiredQuantity, setAcquiredQuantity] = useState('');
  const [activityModalVisible, setActivityModalVisible] = useState(false);
  const [activityName, setActivityName] = useState('');
  const [activityCategory, setActivityCategory] = useState('');
  const [activityCategoryDropdownOpen, setActivityCategoryDropdownOpen] = useState(false);
  const [activityResourceName, setActivityResourceName] = useState('');
  const [activityResourceQuantity, setActivityResourceQuantity] = useState('');
  const [activityResourceDropdownOpen, setActivityResourceDropdownOpen] = useState(false);
  const [selectedActivityResources, setSelectedActivityResources] = useState<Activity['resources']>([]);
  const [feedback, setFeedback] = useState<{ mensagem: string; tipo: 'sucesso' | 'cancelado' } | null>(null);
  const [categoryBoxWidth, setCategoryBoxWidth] = useState(0);
  // useRef preserva referências mutáveis sem provocar uma nova renderização.
  const categoryPageRef = useRef(categoryPage);
  const categoryPagesRef = useRef(categoryPages);
  const categoryBoxWidthRef = useRef(categoryBoxWidth);
  // Animated.Value mantém a posição do trilho animado entre atualizações da tela.
  const categoryTrackX = useRef(new Animated.Value(0)).current;
  categoryPageRef.current = categoryPage;
  categoryPagesRef.current = categoryPages;
  categoryBoxWidthRef.current = categoryBoxWidth;

  // ===== Aviso temporário e medidas da paginação =====
  useEffect(() => {
    if (feedback === null) {
      return undefined;
    }

    const timeout = setTimeout(() => setFeedback(null), 2600); // Numero 2600 é quanto ms fica visivel o aviso
    return () => clearTimeout(timeout); // Limpa o timer ao desmontar ou quando feedback muda.
  }, [feedback]);

  // ===== Modal de categoria: abrir, fechar, criar e renomear =====
  const openCategoryModal = (mode: 'add' | 'edit') => {
    setEntryModalTab('category');
    setCategoryModalMode(mode);
    setCategoryName(mode === 'edit' && selectedCategory !== null ? selectedCategory : '');
    setEntryModalVisible(true);
  };
  const closeCategoryModal = (mostrarFeedback = true) => {
    setEntryModalVisible(false);
    setCategoryName('');

    if (mostrarFeedback) {
      setFeedback({ mensagem: 'Operação cancelada', tipo: 'cancelado' });
    }
  };
  const saveCategory = () => {
    const trimmedName = categoryName.trim();

    if (trimmedName.length === 0) {
      return;
    }

    if (categoryModalMode === 'edit' && selectedCategory !== null) {
      // Renomear mantém recursos e atividades vinculados à categoria selecionada.
      setCategoryPages((currentPages) => currentPages.map((page) => page.map((category) => (
        category === selectedCategory ? trimmedName : category
      ))));
      setResources((currentResources) => currentResources.map((resource) => (
        resource.category === selectedCategory
          ? { ...resource, category: trimmedName }
          : resource
      )));
      setActivities((currentActivities) => currentActivities.map((activity) => (
        activity.category === selectedCategory
          ? { ...activity, category: trimmedName }
          : activity
      )));
      setSelectedCategory(trimmedName);
    } else {
      const lastPageIndex = categoryPages.length - 1;
      const nextPage = lastPageIndex < 0
        ? 0
        : categoryPages[lastPageIndex].length >= 6
          ? categoryPages.length
          : lastPageIndex;

      setCategoryPages((currentPages) => {
        const updatedPages = currentPages.map((page) => [...page]);

        if (updatedPages.length === 0) {
          return [[trimmedName]];
        }

        const currentLastPageIndex = updatedPages.length - 1;

        if (updatedPages[currentLastPageIndex].length >= 6) {
          updatedPages.push([trimmedName]);
        } else {
          updatedPages[currentLastPageIndex].push(trimmedName);
        }

        return updatedPages;
      });
      animateToCategoryPage(nextPage);
    }

    closeCategoryModal(false);
    setFeedback({
      mensagem: categoryModalMode === 'edit'
        ? 'Categoria alterada com sucesso'
        : 'Categoria adicionada com sucesso',
      tipo: 'sucesso',
    });
  };
  // ===== Exclusão em cascata de categoria e dados dependentes =====
  const deleteCategory = () => {
    if (selectedCategory === null) {
      return;
    }

    const categoryToDelete = selectedCategory;
    // Remove páginas que ficaram vazias e mantém o índice dentro do novo intervalo.
    const updatedPages = categoryPages
      .map((page) => page.filter((category) => category !== categoryToDelete))
      .filter((page) => page.length > 0);
    const nextPage = Math.min(categoryPage, Math.max(updatedPages.length - 1, 0));

    setCategoryPages(updatedPages);
    setCategoryPage(nextPage);
    categoryPagesRef.current = updatedPages;
    categoryPageRef.current = nextPage;
    categoryTrackX.setValue(-nextPage * categoryBoxWidthRef.current);
    setSelectedCategory(null);
    // Recursos e atividades não podem ficar referenciando a categoria removida.
    setResources((currentResources) => currentResources.filter((resource) => resource.category !== categoryToDelete));
    setActivities((currentActivities) => currentActivities.filter((activity) => activity.category !== categoryToDelete));
    setFeedback({ mensagem: 'Categoria e conteúdos associados excluídos', tipo: 'sucesso' });
  };
  // ===== Exclusão de recursos e atividades que dependem deles =====
  const deleteResources = (resourcesToDelete: Resource[]) => {
    if (resourcesToDelete.length === 0) {
      return;
    }

    // IDs removem os registros exatos; categoria + nome preserva recursos homônimos de outros jogos.
    const resourceIdsToDelete = new Set(resourcesToDelete.map((resource) => resource.id));
    const resourceKeysToDelete = new Set(resourcesToDelete.map((resource) => `${resource.category}\u0000${resource.name}`));

    setResources((currentResources) => currentResources.filter((resource) => !resourceIdsToDelete.has(resource.id)));
    setActivities((currentActivities) => currentActivities.filter((activity) => (
      !activity.resources.some((resource) => resourceKeysToDelete.has(`${activity.category}\u0000${resource.name}`))
    )));
  };
  const deleteResource = (resource: Resource) => {
    deleteResources([resource]);
    setFeedback({ mensagem: 'Recurso e atividades associadas excluídos', tipo: 'sucesso' });
  };
  // Limpar respeita o filtro atual: remove a categoria selecionada ou o estoque inteiro.
  const clearResourceList = () => {
    if (visibleResources.length === 0) {
      return;
    }

    deleteResources(visibleResources);
    setFeedback({ mensagem: 'Recursos visíveis e atividades associadas excluídos', tipo: 'sucesso' });
  };
  // ===== Modal de recurso: preencher campos para criar ou editar =====
  const openResourceModal = (mode: 'add' | 'edit', resource?: Resource) => {
    setEntryModalTab('resource');
    setResourceModalMode(mode);
    setEditingResourceId(resource?.id ?? null);
    setResourceName(resource?.name ?? '');
    setResourceQuantity(resource?.quantity.replace(/^x/, '') ?? '');
    setResourceCategory(resource?.category ?? selectedCategory ?? categoryPages[0]?.[0] ?? '');
    setResourceDropdownOpen(false);
    setEntryModalVisible(true);
  };
  // Fechar também limpa valores antigos para a próxima abertura do formulário.
  const closeResourceModal = (mostrarFeedback = true) => {
    setEntryModalVisible(false);
    setEditingResourceId(null);
    setResourceName('');
    setResourceQuantity('');
    setResourceCategory('');
    setResourceDropdownOpen(false);

    if (mostrarFeedback) {
      setFeedback({ mensagem: 'Operação cancelada', tipo: 'cancelado' });
    }
  };
  // Valida os campos e atualiza o recurso existente ou adiciona um novo.
  const saveResource = () => {
    const trimmedName = resourceName.trim();
    const trimmedQuantity = resourceQuantity.trim();

    if (trimmedName.length === 0 || trimmedQuantity.length === 0 || resourceCategory.length === 0) {
      return;
    }

    if (resourceModalMode === 'edit' && editingResourceId !== null) {
      setResources((currentResources) => currentResources.map((resource) => (
        resource.id === editingResourceId
          ? { ...resource, name: trimmedName, quantity: `x${trimmedQuantity}`, category: resourceCategory }
          : resource
      )));
    } else {
      setResources((currentResources) => [
        ...currentResources,
        {
          id: `resource-${Date.now()}`,
          icon: '*',
          name: trimmedName,
          quantity: `x${trimmedQuantity}`,
          category: resourceCategory,
        },
      ]);
    }

    closeResourceModal(false);
    setFeedback({
      mensagem: resourceModalMode === 'edit'
        ? 'Recurso alterado com sucesso'
        : 'Recurso adicionado com sucesso',
      tipo: 'sucesso',
    });
  };
  // Trocar de aba inicia um formulário novo, sem reaproveitar dados de edição.
  const switchEntryModalTab = (tab: 'category' | 'resource') => {
    if (tab === entryModalTab) {
      return;
    }

    setEntryModalTab(tab);
    setCategoryModalMode('add');
    setCategoryName('');
    setResourceModalMode('add');
    setEditingResourceId(null);
    setResourceName('');
    setResourceQuantity('');
    setResourceCategory(selectedCategory ?? categoryPages[0]?.[0] ?? '');
    setResourceDropdownOpen(false);
  };
  // O botão flutuante abre o formulário compartilhado começando pela aba Categoria.
  const openEntryModal = () => {
    setEntryModalTab('category');
    setCategoryModalMode('add');
    setCategoryName('');
    setEntryModalVisible(true);
  };

  // ===== Modal de atividade: abrir, limpar, selecionar e salvar =====
  const openActivityModal = () => {
    setActivityName('');
    setActivityCategory(selectedCategory ?? categoryPages[0]?.[0] ?? '');
    setActivityCategoryDropdownOpen(false);
    setActivityResourceName('');
    setActivityResourceQuantity('');
    setActivityResourceDropdownOpen(false);
    setSelectedActivityResources([]);
    setActivityModalVisible(true);
  };
  const closeActivityModal = (mostrarFeedback = true) => {
    setActivityModalVisible(false);
    setActivityName('');
    setActivityCategory('');
    setActivityCategoryDropdownOpen(false);
    setActivityResourceName('');
    setActivityResourceQuantity('');
    setActivityResourceDropdownOpen(false);
    setSelectedActivityResources([]);

    if (mostrarFeedback) {
      setFeedback({ mensagem: 'Operação cancelada', tipo: 'cancelado' });
    }
  };
  const changeActivityCategory = (category: string) => {
    // Trocar categoria limpa seleções anteriores, pois os recursos são específicos do jogo.
    setActivityCategory(category);
    setSelectedActivityResources([]);
    setActivityResourceName('');
    setActivityResourceQuantity('');
    setActivityCategoryDropdownOpen(false);
    setActivityResourceDropdownOpen(false);
  };
  const addActivityResource = () => {
    const trimmedName = activityResourceName.trim();
    const quantity = Number(activityResourceQuantity);
    const alreadyAdded = selectedActivityResources.some((resource) => resource.name === trimmedName);

    if (trimmedName.length === 0 || !Number.isFinite(quantity) || quantity <= 0 || alreadyAdded) {
      return;
    }

    setSelectedActivityResources((currentResources) => [
      ...currentResources,
      { name: trimmedName, required: quantity },
    ]);
    setActivityResourceName('');
    setActivityResourceQuantity('');
    setActivityResourceDropdownOpen(false);
  };
  const saveActivity = () => {
    const trimmedName = activityName.trim();

    if (trimmedName.length === 0 || activityCategory.length === 0 || selectedActivityResources.length === 0) {
      return;
    }

    setActivities((currentActivities) => [
      ...currentActivities,
      {
        name: trimmedName,
        category: activityCategory,
        resources: selectedActivityResources,
      },
    ]);
    closeActivityModal(false);
    setFeedback({ mensagem: 'Atividade adicionada com sucesso', tipo: 'sucesso' });
  };
  // ===== Detalhe da atividade e estoque atual =====
  // A busca usa categoria + nome para não misturar recursos homônimos.
  const getAvailableResourceQuantity = (category: string, name: string) => {
    const resource = resources.find((item) => item.category === category && item.name === name);
    return Number(resource?.quantity.replace(/^x/, '') ?? 0);
  };
  const closeActivityDetails = () => {
    setActivityDetails(null);
    setExpandedInventoryResourceId(null);
    setAcquiredQuantity('');
  };
  // Soma unidades adquiridas ao recurso do inventário ligado à atividade atual.
  const addAcquiredQuantity = (name: string) => {
    if (activityDetails === null) {
      return;
    }

    const quantityToAdd = Number(acquiredQuantity);
    const matchingResource = resources.find((resource) => (
      resource.category === activityDetails.category
      && resource.name === name
    ));

    if (matchingResource === undefined || !Number.isSafeInteger(quantityToAdd) || quantityToAdd <= 0) {
      return;
    }

    // Atualização funcional usa o estado mais recente, evitando capturar um valor antigo do closure.
    setResources((currentResources) => currentResources.map((resource) => (
      resource.id === matchingResource.id
        ? { ...resource, quantity: `x${Number(resource.quantity.replace(/^x/, '')) + quantityToAdd}` }
        : resource
    )));
    setExpandedInventoryResourceId(null);
    setAcquiredQuantity('');
  };

  // ===== Animação, gesto e troca de página das categorias =====
  const animateToCategoryPage = (nextPage: number) => {
    const width = categoryBoxWidthRef.current;

    if (width === 0) {
      setCategoryPage(nextPage);
      setSelectedCategory(null);
      return;
    }

    // Animated.timing interpola o deslocamento; useNativeDriver move transform sem animar layout.
    Animated.timing(categoryTrackX, {
      duration: 220,
      toValue: -nextPage * width,
      useNativeDriver: true,
    }).start(() => {
      setCategoryPage(nextPage);
      setSelectedCategory(null);
    });
  };
  // PanResponder reconhece o arraste horizontal; refs fornecem valores atuais sem recriar o handler.
  const categorySwipeResponder = useRef(
    PanResponder.create({
      // Só captura o gesto quando o movimento horizontal supera o vertical e o limiar escolhido.
      onMoveShouldSetPanResponder: (_, gestureState) => (
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
        && Math.abs(gestureState.dx) > 12
      ),
      onPanResponderMove: (_, gestureState) => {
        const width = categoryBoxWidthRef.current;

        if (width > 0) {
          categoryTrackX.setValue(-categoryPageRef.current * width + gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const currentPage = categoryPageRef.current;
        const width = categoryBoxWidthRef.current;
        const pageDirection = gestureState.dx < 0 ? 1 : -1;
        const shouldChangePage = Math.abs(gestureState.dx) >= 40;
        const nextPage = shouldChangePage
          ? Math.min(Math.max(currentPage + pageDirection, 0), categoryPagesRef.current.length - 1)
          : currentPage;

        if (width === 0 || categoryPagesRef.current.length === 0) {
          return;
        }

        Animated.timing(categoryTrackX, {
          duration: 220,
          toValue: -nextPage * width,
          useNativeDriver: true,
        }).start(() => {
          if (nextPage !== currentPage) {
            setCategoryPage(nextPage);
            setSelectedCategory(null);
          }
        });
      },
    }),
  ).current;
  // ===== Dados derivados para listas e seletores =====
  const visibleResources = selectedCategory === null
    ? resources
    : resources.filter((resource) => resource.category === selectedCategory);
  const resourceCategoryOptions = Array.from(new Set(categoryPages.flat()));
  const activityResourceOptions = resources.filter((resource) => (
    resource.category === activityCategory
    && !selectedActivityResources.some((selectedResource) => selectedResource.name === resource.name)
  ));

  // ==================== Tela de tutoriais ====================
  if (screen !== 'home') {
    if (screen === 'tutorials') {
      return (
        <SafeAreaView style={styles.areaSegura}>
          <StatusBar style="light" />
          {/* ScrollView é indicado aqui porque o tutorial é curto e todo o conteúdo pode ser montado de uma vez. */}
          <ScrollView contentContainerStyle={[styles.containerTela, styles.containerTutorial]} showsVerticalScrollIndicator={false}>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [styles.botaoVoltar, pressed && styles.botaoPressionado]}
            >
              {/* ícone e texto do botão de voltar */}
              <Text style={styles.textoBotaoVoltar}>{'<'} Voltar</Text>
            </Pressable>

            <View style={styles.cabecalhoInterno}>
              {/* título e subtítulo da página de tutoriais */}
              <Text style={styles.sobretitulo}>COMO FUNCIONA</Text>
              <Text style={styles.tituloTutorial}>Do estoque ao fim</Text>
              <Text style={styles.introducaoTutorial}>
                Separe os recursos por jogo, defina metas e acompanhe o progresso conforme seu estoque aumenta.
              </Text>
            </View>

            <View style={styles.fluxoTutorial}>
              {/* primeira etapa: organização por categoria */}
              <View style={styles.linhaHorizontal}>
                <View style={styles.numeroEtapaTutorial}><Text style={styles.textoNumeroEtapaTutorial}>1</Text></View>
                <View style={styles.conteudoFlexivel}>
                  {/* título e explicação da etapa */}
                  <Text style={styles.tituloEtapaTutorial}>Organize por jogo</Text>
                  <Text style={styles.descricaoEtapaTutorial}>
                    Em Categorias e recursos, toque em ⊕ para abrir o modal. Use as abas na parte inferior para alternar entre Categoria e Recurso. Crie uma categoria para cada jogo.
                  </Text>
                  {/* exemplo visual das categorias */}
                  <View style={[styles.superficie, styles.exemploCategoriaTutorial]}>
                    <Text style={styles.rotuloExemploTutorial}>CATEGORIAS</Text>
                    <View style={styles.gradeCategoriaTutorial}>
                      {['catg1', 'catg2', 'catg3', 'catg4'].map((category) => (
                        <View key={category} style={styles.etiquetaCategoriaTutorial}>
                          <Text style={styles.textoEtiquetaCategoriaTutorial}>{category}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.conectorTutorial} />

              {/* segunda etapa: recursos separados por categoria */}
              <View style={styles.linhaHorizontal}>
                <View style={styles.numeroEtapaTutorial}><Text style={styles.textoNumeroEtapaTutorial}>2</Text></View>
                <View style={styles.conteudoFlexivel}>
                  {/* título e explicação da etapa */}
                  <Text style={styles.tituloEtapaTutorial}>Registre o estoque</Text>
                  <Text style={styles.descricaoEtapaTutorial}>
                    Na aba Recurso, informe nome, quantidade disponível e categoria. Estoques de recursos com o mesmo nome ficam separados quando pertencem a jogos diferentes.
                  </Text>
                  {/* dados de exemplo dos recursos e quantidades */}
                  <View style={[styles.superficie, styles.exemploRecursoTutorial]}>
                    {[
                      { icon: '*', name: 'Ferro / catg1', quantity: 'x99' },
                      { icon: '+', name: 'Ferro / catg2', quantity: 'x12' },
                    ].map((resource) => (
                      <View key={resource.name} style={styles.linhaRecursoTutorial}>
                        <View style={[styles.baseIconeRecurso, styles.iconeRecursoTutorial]}><Text style={styles.textoIconeRecursoTutorial}>{resource.icon}</Text></View>
                        <Text style={styles.nomeRecursoTutorial}>{resource.name}</Text>
                        <Text style={styles.quantidadeRecursoTutorial}>{resource.quantity}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.conectorTutorial} />

              {/* terceira etapa: metas e atualização do estoque */}
              <View style={styles.linhaHorizontal}>
                <View style={styles.numeroEtapaTutorial}><Text style={styles.textoNumeroEtapaTutorial}>3</Text></View>
                <View style={styles.conteudoFlexivel}>
                  {/* título e explicação da etapa */}
                  <Text style={styles.tituloEtapaTutorial}>Crie e acompanhe atividades</Text>
                  <Text style={styles.descricaoEtapaTutorial}>
                    Na página Atividades, toque em ⊕ para criar uma meta, escolher a categoria e definir quanto precisa de cada recurso. Toque na atividade para ver todos os itens; use + na linha de um recurso para informar as unidades recebidas. O estoque e o progresso são atualizados automaticamente.
                  </Text>
                  {/* exemplo de atividade, status e progresso dos recursos */}
                  <View style={[styles.superficie, styles.exemploAtividadeTutorial]}>
                    <View style={styles.cabecalhoAtividadeTutorial}>
                      <View>
                        <Text style={styles.nomeAtividadeTutorial}>Construir celeiro</Text>
                        <Text style={styles.categoriaAtividadeTutorial}>catg1</Text>
                      </View>
                      <Text style={styles.situacaoAtividadeTutorial}>PENDENTE</Text>
                    </View>
                    <View style={styles.linhaRecursoAtividadeTutorial}>
                      <Text style={styles.textoRecursoTutorial}>Ferro</Text>
                      <Text style={styles.quantidadeMetaTutorial}>4/12</Text>
                      <View style={styles.acaoAdicionarTutorial}>
                        <Text style={styles.textoAcaoAdicionarTutorial}>+</Text>
                      </View>
                    </View>
                    <View style={styles.linhaRecursoAtividadeTutorial}>
                      <Text style={[styles.textoRecursoTutorial, styles.textoConcluidoRiscado]}>Madeira</Text>
                      <Text style={[styles.quantidadeMetaTutorial, styles.textoQuantidadeConcluida]}>8/8</Text>
                      <View style={styles.acaoAdicionarTutorial}>
                        <Text style={styles.textoAcaoAdicionarTutorial}>+</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* dica resumida sobre categoria, estoque e atividades */}
            <View style={styles.dicaTutorial}>
              <Text style={styles.iconeDicaTutorial}>i</Text>
              <Text style={styles.textoDicaTutorial}>O estoque pertence à categoria. Ao registrar unidades em uma atividade, todas as metas ligadas ao mesmo recurso acompanham a mudança.</Text>
            </View>
            {/* Modal de demonstração desativado nesta tela; o cadastro real fica em Atividades. */}
            <Modal
              animationType="fade"
              transparent
              visible={false}
              onRequestClose={() => closeActivityModal()}
            >
              {/* evita que o teclado cubra os campos em dispositivos móveis */}
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.espacoFlexivel}>
                <View style={styles.fundoModal}>
                  <View style={styles.modalCadastro}>
                    {/* título do modal */}
                    <Text style={styles.tituloModalCadastro}>Nova atividade</Text>
                    <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} style={styles.conteudoComAlturaLimitada}>
                      {/* campo para digitar o nome da atividade */}
                      <TextInput
                        accessibilityLabel="Nome da atividade"
                        autoFocus
                        maxLength={32}
                        onChangeText={setActivityName}
                        placeholder="Nome da atividade"
                        placeholderTextColor="#B8B4C6"
                        style={styles.campoModalCadastro}
                        value={activityName}
                      />
                      {/* seletor da categoria da atividade */}
                      <Pressable
                        accessibilityRole="button"
                        accessibilityState={{ expanded: activityCategoryDropdownOpen }}
                        onPress={() => setActivityCategoryDropdownOpen((isOpen) => !isOpen)}
                        style={({ pressed }) => [styles.seletorRecursoModal, pressed && styles.botaoPressionado]}
                      >
                        <Text style={styles.textoSeletorRecursoModal}>{activityCategory || 'Escolha uma categoria'}</Text>
                        <Text style={styles.setaSeletorRecursoModal}>{activityCategoryDropdownOpen ? '^' : 'v'}</Text>
                      </Pressable>
                      {/* lista de categorias aberta pelo seletor acima */}
                      {activityCategoryDropdownOpen && (
                        <View style={styles.opcoesRecursoModal}>
                          {resourceCategoryOptions.map((category) => (
                            <Pressable
                              accessibilityRole="button"
                              key={category}
                              onPress={() => changeActivityCategory(category)}
                              style={({ pressed }) => [styles.opcaoRecursoModal, pressed && styles.botaoPressionado]}
                            >
                              <Text style={styles.textoOpcaoRecursoModal}>{category}</Text>
                            </Pressable>
                          ))}
                        </View>
                      )}
                      {/* seletor do recurso e quantidade necessária */}
                      <View style={styles.linhaEntradaModalAtividade}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityState={{ expanded: activityResourceDropdownOpen }}
                          onPress={() => setActivityResourceDropdownOpen((isOpen) => !isOpen)}
                          style={({ pressed }) => [styles.seletorRecursoModal, styles.seletorRecursoModalAtividade, pressed && styles.botaoPressionado]}
                        >
                          <Text style={styles.textoSeletorRecursoModal} numberOfLines={1}>{activityResourceName || 'Escolha o recurso'}</Text>
                          <Text style={styles.setaSeletorRecursoModal}>{activityResourceDropdownOpen ? '^' : 'v'}</Text>
                        </Pressable>
                        <TextInput
                          accessibilityLabel="Quantidade necessária"
                          keyboardType="numeric"
                          maxLength={9}
                          onChangeText={(value) => setActivityResourceQuantity(value.replace(/[^0-9]/g, ''))}
                          placeholder="Qtd."
                          placeholderTextColor="#B8B4C6"
                          style={styles.quantidadeModalAtividade}
                          value={activityResourceQuantity}
                        />
                      </View>
                      {/* recursos disponíveis dentro da categoria escolhida */}
                      {activityResourceDropdownOpen && (
                        <View style={styles.opcoesRecursoModal}>
                          {activityResourceOptions.map((resource) => (
                            <Pressable
                              accessibilityRole="button"
                              key={resource.id}
                              onPress={() => {
                                setActivityResourceName(resource.name);
                                setActivityResourceDropdownOpen(false);
                              }}
                              style={({ pressed }) => [styles.opcaoRecursoModal, pressed && styles.botaoPressionado]}
                            >
                              <Text style={styles.textoOpcaoRecursoModal}>{resource.name}</Text>
                            </Pressable>
                          ))}
                          {activityResourceOptions.length === 0 && <Text style={styles.mensagemVaziaModalAtividade}>Todos os recursos desta categoria já foram adicionados.</Text>}
                        </View>
                      )}
                      {/* comando para incluir o recurso escolhido na atividade */}
                      <Pressable
                        accessibilityRole="button"
                        disabled={activityResourceName.length === 0 || activityResourceQuantity.length === 0}
                        onPress={addActivityResource}
                        style={({ pressed }) => [
                          styles.toolbarBotao,
                          styles.botaoAdicionarRecursoModalAtividade,
                          (activityResourceName.length === 0 || activityResourceQuantity.length === 0) && styles.toolbarBotaoDesabilitado,
                          pressed && styles.botaoPressionado,
                        ]}
                      >
                        <Text style={styles.toolbarIcone}>+</Text>
                        <Text style={styles.toolbarRotulo}>Adicionar recurso</Text>
                      </Pressable>
                      {/* resumo dos recursos adicionados; o X remove um item */}
                      {selectedActivityResources.length > 0 && (
                        <View style={styles.listaSelecionadosModalAtividade}>
                          {selectedActivityResources.map((resource) => (
                            <View key={resource.name} style={styles.linhaRecurso}>
                              <Text style={styles.nomeRecurso}>{resource.name}</Text>
                              <Text style={styles.quantidadeRecurso}>x{resource.required}</Text>
                              {/* ação para retirar este recurso da atividade */}
                              <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={`Remover ${resource.name}`}
                                onPress={() => setSelectedActivityResources((currentResources) => currentResources.filter((item) => item.name !== resource.name))}
                                style={({ pressed }) => [styles.botaoIconeRecurso, pressed && styles.botaoPressionado]}
                              >
                                <Text style={styles.textoBotaoRecurso}>&#10005;</Text>
                              </Pressable>
                            </View>
                          ))}
                        </View>
                      )}
                    </ScrollView>
                    {/* ações de cancelar ou salvar o cadastro */}
                    <View style={styles.acoesModalCadastro}>
                      <Pressable accessibilityRole="button" onPress={() => closeActivityModal()} style={({ pressed }) => [styles.botaoModalCadastro, pressed && styles.botaoPressionado]}>
                        <Text style={styles.textoBotaoModal}>Cancelar</Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        disabled={activityName.trim().length === 0 || activityCategory.length === 0 || selectedActivityResources.length === 0}
                        onPress={saveActivity}
                        style={({ pressed }) => [
                          styles.botaoModalCadastro,
                          (activityName.trim().length === 0 || activityCategory.length === 0 || selectedActivityResources.length === 0) && styles.toolbarBotaoDesabilitado,
                          pressed && styles.botaoPressionado,
                        ]}
                      >
                        <Text style={styles.textoBotaoModal}>Salvar</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </Modal>
          </ScrollView>
          {/* botão flutuante para voltar à tela inicial */}
          <FloatingHomeButton navigation={navigation} />
        </SafeAreaView>
      );
    }

    // ==================== Tela de atividades ====================
    if (screen === 'tracking') {
      return (
        <SafeAreaView style={styles.areaSegura}>
          <StatusBar style="light" />
          <ScrollView contentContainerStyle={[styles.containerTela, styles.containerComRodape]} showsVerticalScrollIndicator={false}>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [styles.botaoVoltar, pressed && styles.botaoPressionado]}
            >
              {/* ícone e texto do botão de voltar */}
              <Text style={styles.textoBotaoVoltar}>{'<'} Voltar</Text>
            </Pressable>

            {/* título e contador da página de atividades */}
            <View style={styles.cabecalhoAtividades}>
              <View>
                <Text style={styles.sobretitulo}>ACOMPANHAR</Text>
                <Text style={styles.tituloAtividades}>Atividades</Text>
              </View>
              <Text style={styles.contadorAtividades}>{activities.length} atividades</Text>
            </View>

            <View style={styles.listaAtividades}>
              {/* texto exibido quando ainda não há atividades */}
              {activities.length === 0 && (
                <Text style={styles.atividadesVazio}>Nenhuma atividade cadastrada.</Text>
              )}
              {/* cartões com nome, categoria, status e progresso de cada atividade */}
              {activities.map((activity, activityIndex) => {
                const activityResources = activity.resources.map((activityResource) => {
                  return {
                    ...activityResource,
                    current: getAvailableResourceQuantity(activity.category, activityResource.name),
                  };
                });
                const completedCount = activityResources.filter((resource) => resource.current >= resource.required).length;
                const activityIsComplete = completedCount === activityResources.length;
                const hiddenResourceCount = Math.max(activityResources.length - 3, 0);

                return (
                  // Cartão: nome, categoria, status e quantidades são exibidos abaixo.
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Abrir atividade ${activity.name}`}
                    key={`${activity.name}-${activityIndex}`}
                    onPress={() => setActivityDetails(activity)}
                    style={({ pressed }) => [styles.superficie, styles.cartaoAtividade, pressed && styles.cartaoAtividadePressionado]}
                  >
                    <View style={styles.cabecalhoCartaoAtividade}>
                      <View>
                        {/* nome e categoria da atividade */}
                        <Text style={styles.nomeAtividade}>{activity.name}</Text>
                        <Text style={styles.categoriaAtividade}>{activity.category}</Text>
                      </View>
                      <View style={[styles.situacaoAtividade, activityIsComplete ? styles.situacaoAtividadeConcluida : styles.situacaoAtividadePendente]}>
                        {/* texto do status: PENDENTE ou CONCLUIDA */}
                        <Text style={[styles.textoSituacaoAtividade, activityIsComplete ? styles.textoSituacaoConcluida : styles.textoSituacaoPendente]}>
                          {activityIsComplete ? 'CONCLUIDA' : 'PENDENTE'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.listaRecursosAtividade}>
                      {/* até três recursos aparecem no cartão; os demais são resumidos abaixo */}
                      {activityResources.slice(0, 3).map((resource) => {
                        const isComplete = resource.current >= resource.required;

                        return (
                          <View
                            key={resource.name}
                            style={styles.linhaRecursoAtividade}
                          >
                            <View style={[styles.caixaRecursoAtividade, isComplete && styles.caixaRecursoAtividadeCompleta]}>
                              {isComplete && <Text style={styles.marcaRecursoAtividade}>✓</Text>}
                            </View>
                            <Text style={[styles.nomeRecursoAtividade, isComplete && styles.textoConcluidoRiscado]}>
                              {resource.name}
                            </Text>
                            {/* quantidade atual do estoque sobre a quantidade necessária */}
                            <Text style={[styles.quantidadeRecursoAtividade, isComplete && styles.textoQuantidadeConcluida]}>
                              {resource.current}/{resource.required}
                            </Text>
                          </View>
                        );
                      })}
                      {/* resumo dos recursos além dos três mostrados no cartão */}
                      {hiddenResourceCount > 0 && (
                        <Text style={styles.maisRecursosAtividade}>+ {hiddenResourceCount} recurso{hiddenResourceCount > 1 ? 's' : ''}</Text>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
            {/* ===== Modal de criação: título, placeholders e rótulos dos botões editáveis abaixo ===== */}
            {/* Modal renderiza acima da tela; onRequestClose recebe o botão Voltar do Android. */}
            <Modal
              animationType="fade"
              transparent
              visible={activityModalVisible}
              onRequestClose={() => closeActivityModal()}
            >
              {/* KeyboardAvoidingView ajusta o conteúdo quando o teclado virtual aparece. */}
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.espacoFlexivel}>
                <View style={styles.fundoModal}>
                  <View style={styles.modalCadastro}>
                    {/* título do modal de criação */}
                    <Text style={styles.tituloModalCadastro}>Nova atividade</Text>
                    <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} style={styles.conteudoComAlturaLimitada}>
                      {/* campo de nome: placeholder e limite de caracteres */}
                      <TextInput accessibilityLabel="Nome da atividade" autoFocus maxLength={32} onChangeText={setActivityName} placeholder="Nome da atividade" placeholderTextColor="#B8B4C6" style={styles.campoModalCadastro} value={activityName} />
                      {/* seletor de categoria e opções disponíveis */}
                      <Pressable accessibilityRole="button" accessibilityState={{ expanded: activityCategoryDropdownOpen }} onPress={() => setActivityCategoryDropdownOpen((isOpen) => !isOpen)} style={({ pressed }) => [styles.seletorRecursoModal, pressed && styles.botaoPressionado]}>
                        <Text style={styles.textoSeletorRecursoModal}>{activityCategory || 'Escolha uma categoria'}</Text>
                        <Text style={styles.setaSeletorRecursoModal}>{activityCategoryDropdownOpen ? '^' : 'v'}</Text>
                      </Pressable>
                      {activityCategoryDropdownOpen && (
                        <View style={styles.opcoesRecursoModal}>
                          {resourceCategoryOptions.map((category) => (
                            <Pressable accessibilityRole="button" key={category} onPress={() => changeActivityCategory(category)} style={({ pressed }) => [styles.opcaoRecursoModal, pressed && styles.botaoPressionado]}>
                              <Text style={styles.textoOpcaoRecursoModal}>{category}</Text>
                            </Pressable>
                          ))}
                        </View>
                      )}
                      {/* seletor de recurso e campo da quantidade necessária */}
                      <View style={styles.linhaEntradaModalAtividade}>
                        <Pressable accessibilityRole="button" accessibilityState={{ expanded: activityResourceDropdownOpen }} onPress={() => setActivityResourceDropdownOpen((isOpen) => !isOpen)} style={({ pressed }) => [styles.seletorRecursoModal, styles.seletorRecursoModalAtividade, pressed && styles.botaoPressionado]}>
                          <Text style={styles.textoSeletorRecursoModal} numberOfLines={1}>{activityResourceName || 'Escolha o recurso'}</Text>
                          <Text style={styles.setaSeletorRecursoModal}>{activityResourceDropdownOpen ? '^' : 'v'}</Text>
                        </Pressable>
                        {/* teclado, placeholder e limite da quantidade necessária */}
                        <TextInput accessibilityLabel="Quantidade necessária" keyboardType="numeric" maxLength={9} onChangeText={(value) => setActivityResourceQuantity(value.replace(/[^0-9]/g, ''))} placeholder="Qtd." placeholderTextColor="#B8B4C6" style={styles.quantidadeModalAtividade} value={activityResourceQuantity} />
                      </View>
                      {activityResourceDropdownOpen && (
                        <View style={styles.opcoesRecursoModal}>
                          {activityResourceOptions.map((resource) => (
                            <Pressable accessibilityRole="button" key={resource.id} onPress={() => { setActivityResourceName(resource.name); setActivityResourceDropdownOpen(false); }} style={({ pressed }) => [styles.opcaoRecursoModal, pressed && styles.botaoPressionado]}>
                              <Text style={styles.textoOpcaoRecursoModal}>{resource.name}</Text>
                            </Pressable>
                          ))}
                          {activityResourceOptions.length === 0 && <Text style={styles.mensagemVaziaModalAtividade}>Todos os recursos desta categoria já foram adicionados.</Text>}
                        </View>
                      )}
                      {/* símbolo e texto do botão que inclui o recurso selecionado */}
                      <Pressable accessibilityRole="button" disabled={activityResourceName.length === 0 || activityResourceQuantity.length === 0} onPress={addActivityResource} style={({ pressed }) => [styles.toolbarBotao, styles.botaoAdicionarRecursoModalAtividade, (activityResourceName.length === 0 || activityResourceQuantity.length === 0) && styles.toolbarBotaoDesabilitado, pressed && styles.botaoPressionado]}>
                        <Text style={styles.toolbarIcone}>+</Text>
                        <Text style={styles.toolbarRotulo}>Adicionar recurso</Text>
                      </Pressable>
                      {/* recursos já incluídos na atividade; o ícone remove o item */}
                      {selectedActivityResources.length > 0 && (
                        <View style={styles.listaSelecionadosModalAtividade}>
                          {selectedActivityResources.map((resource) => (
                            <View key={resource.name} style={styles.linhaRecurso}>
                              <Text style={styles.nomeRecurso}>{resource.name}</Text>
                              <Text style={styles.quantidadeRecurso}>x{resource.required}</Text>
                              <Pressable accessibilityRole="button" accessibilityLabel={`Remover ${resource.name}`} onPress={() => setSelectedActivityResources((currentResources) => currentResources.filter((item) => item.name !== resource.name))} style={({ pressed }) => [styles.botaoIconeRecurso, pressed && styles.botaoPressionado]}>
                                <Text style={styles.textoBotaoRecurso}>&#10005;</Text>
                              </Pressable>
                            </View>
                          ))}
                        </View>
                      )}
                    </ScrollView>
                    {/* ações para cancelar ou salvar a atividade */}
                    <View style={styles.acoesModalCadastro}>
                      <Pressable accessibilityRole="button" onPress={() => closeActivityModal()} style={({ pressed }) => [styles.botaoModalCadastro, pressed && styles.botaoPressionado]}>
                        <Text style={styles.textoBotaoModal}>Cancelar</Text>
                      </Pressable>
                      <Pressable accessibilityRole="button" disabled={activityName.trim().length === 0 || activityCategory.length === 0 || selectedActivityResources.length === 0} onPress={saveActivity} style={({ pressed }) => [styles.botaoModalCadastro, (activityName.trim().length === 0 || activityCategory.length === 0 || selectedActivityResources.length === 0) && styles.toolbarBotaoDesabilitado, pressed && styles.botaoPressionado]}>
                        <Text style={styles.textoBotaoModal}>Salvar</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </Modal>
            {/* ===== Modal de detalhe das atividades ===== */}
            {/* Modal de tela cheia; o fechamento também responde ao botão Voltar do Android. */}
            <Modal
              animationType="slide"
              visible={activityDetails !== null}
              onRequestClose={closeActivityDetails}
            >
              {/* Ajusta a área útil conforme o teclado e respeita diferenças de plataforma. */}
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.espacoFlexivel}
              >
                <SafeAreaView style={styles.modalDetalheAtividade}>
                  {activityDetails !== null && (
                    <>
                      {/* nome, categoria e botão de fechar o detalhe */}
                      <View style={styles.cabecalhoModalDetalheAtividade}>
                        <View style={styles.conteudoFlexivel}>
                          <Text style={styles.tituloDetalheAtividade}>{activityDetails.name}</Text>
                          <Text style={styles.categoriaDetalheAtividade}>{activityDetails.category}</Text>
                        </View>
                        <Pressable
                          accessibilityLabel="Fechar atividade"
                          accessibilityRole="button"
                          onPress={closeActivityDetails}
                          style={({ pressed }) => [styles.botaoFecharDetalheAtividade, pressed && styles.botaoPressionado]}
                        >
                          <Text style={styles.textoBotaoFecharDetalheAtividade}>&#10005;</Text>
                        </Pressable>
                      </View>
                      {/* lista virtualizada dos recursos; cada linha permite somar unidades ao estoque */}
                      <FlatList
                        data={activityDetails.resources}
                        extraData={{ resources, expandedInventoryResourceId, acquiredQuantity }}
                        initialNumToRender={10}
                        keyboardShouldPersistTaps="handled"
                        keyExtractor={(item) => item.name}
                        maxToRenderPerBatch={10}
                        showsVerticalScrollIndicator={false}
                        windowSize={7}
                        contentContainerStyle={styles.listaDetalheAtividade}
                        style={styles.espacoFlexivel}
                        renderItem={({ item }) => {
                          // Procura pelo nome e categoria para não misturar recursos homônimos de jogos diferentes.
                          const inventoryResource = resources.find((resource) => (
                            resource.category === activityDetails.category
                            && resource.name === item.name
                          ));
                          const availableQuantity = getAvailableResourceQuantity(activityDetails.category, item.name);
                          // O progresso compara o estoque atual com a meta salva na atividade.
                          const isComplete = availableQuantity >= item.required;
                          const isExpanded = inventoryResource !== undefined
                            && expandedInventoryResourceId === inventoryResource.id;

                          return (
                            <View style={styles.linhaDetalheAtividade}>
                              <View style={styles.cabecalhoLinhaDetalheAtividade}>
                                <View style={styles.informacoesRecursoDetalheAtividade}>
                                  <Text style={styles.nomeRecursoDetalheAtividade}>{item.name}</Text>
                                  {/* formato: quantidade disponível / quantidade necessária */}
                                  <Text style={[styles.quantidadeRecursoDetalheAtividade, isComplete && styles.textoQuantidadeConcluida]}>
                                    {availableQuantity}/{item.required}
                                  </Text>
                                </View>
                                {/* botão + abre o campo para informar unidades recém-adquiridas */}
                                <Pressable
                                  accessibilityLabel={`Adicionar unidades de ${item.name}`}
                                  accessibilityRole="button"
                                  disabled={inventoryResource === undefined}
                                  onPress={() => {
                                    if (inventoryResource === undefined) {
                                      return;
                                    }

                                    setExpandedInventoryResourceId((currentId) => (
                                      currentId === inventoryResource.id ? null : inventoryResource.id
                                    ));
                                    setAcquiredQuantity('');
                                  }}
                                  style={({ pressed }) => [
                                    styles.botaoAdicionarRecursoDetalhe,
                                    inventoryResource === undefined && styles.componenteDesabilitado,
                                    pressed && styles.botaoPressionado,
                                  ]}
                                >
                                  <Text style={styles.iconeAdicionarRecursoDetalhe}>+</Text>
                                </Pressable>
                              </View>
                              {isExpanded && (
                                <View style={styles.formularioAdicionarEstoque}>
                                  {/* campo numérico para a quantidade adquirida */}
                                  <TextInput
                                    accessibilityLabel={`Unidades adquiridas de ${item.name}`}
                                    keyboardType="numeric"
                                    maxLength={12}
                                    onChangeText={(value) => setAcquiredQuantity(value.replace(/[^0-9]/g, ''))}
                                    onSubmitEditing={() => addAcquiredQuantity(item.name)}
                                    placeholder="Unidades obtidas"
                                    placeholderTextColor="#B8B4C6"
                                    returnKeyType="done"
                                    style={styles.campoQuantidadeAdquirida}
                                    value={acquiredQuantity}
                                  />
                                  {/* soma a quantidade digitada ao estoque do recurso */}
                                  <Pressable
                                    accessibilityRole="button"
                                    disabled={acquiredQuantity.length === 0 || Number(acquiredQuantity) <= 0}
                                    onPress={() => addAcquiredQuantity(item.name)}
                                    style={({ pressed }) => [
                                      styles.botaoConfirmarAdicao,
                                      (acquiredQuantity.length === 0 || Number(acquiredQuantity) <= 0) && styles.componenteDesabilitado,
                                      pressed && styles.botaoPressionado,
                                    ]}
                                  >
                                    {/* Rótulo do botão que confirma a quantidade adquirida. */}
                                    <Text style={styles.textoConfirmarAdicao}>Adicionar</Text>
                                  </Pressable>
                                </View>
                              )}
                            </View>
                          );
                        }}
                      />
                    </>
                  )}
                </SafeAreaView>
              </KeyboardAvoidingView>
            </Modal>
          </ScrollView>
          <FloatingHomeButton navigation={navigation} />
          <FloatingAddButton onPress={openActivityModal} />
        </SafeAreaView>
      );
    }

    // ==================== Tela de categorias e recursos ====================
    if (screen === 'setup') {
      return (
        <SafeAreaView style={styles.areaSegura}>
          <StatusBar style="light" />
          <ScrollView contentContainerStyle={[styles.containerTela, styles.containerComRodape]} showsVerticalScrollIndicator={false}>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [styles.botaoVoltar, pressed && styles.botaoPressionado]}
            >
              {/* icone e texto do botão de voltar */}
              <Text style={styles.textoBotaoVoltar}>{'<'} Voltar</Text>
            </Pressable>

            <View style={styles.cabecalhoInterno}>
              {/* titulo e subtitulo da pagina de recursos/categorias */}
              <Text style={styles.sobretitulo}>ORGANIZAR JOGO</Text>
              <Text style={styles.tituloOrganizacao}>Categorias e recursos</Text>
            </View>

            {/* cabeçalho da seção Categorias */}
            <View style={styles.cabecalhoSecao}>
              <View>
                {/* titulo e dica da seção Categorias */}
                <Text style={styles.categoriaTitulo}>Categorias</Text>
                <Text style={styles.categoriaDica}>Selecione uma categoria para gerenciar</Text>
              </View>
              <Text style={styles.rotuloPagina}>
                {categoryPages.length === 0 ? '0 / 0' : `${categoryPage + 1} / ${categoryPages.length}`}
              </Text>
            </View>

            {/* Grade e paginação das categorias cadastradas. */}
            <View style={[styles.superficie, styles.conteudoRecortado]}>
              <View
                {...categorySwipeResponder.panHandlers}
                onLayout={(event) => {
                  const width = event.nativeEvent.layout.width;
                  setCategoryBoxWidth(width);
                  categoryTrackX.setValue(-categoryPageRef.current * width);
                }}
                style={styles.conteudoRecortado}
              >
                <Animated.View style={[styles.linhaHorizontal, { transform: [{ translateX: categoryTrackX }] }]}>
                  {categoryPages.length === 0 && (
                    <View style={[styles.paginaCategoria, { width: categoryBoxWidth || '100%' }]}>
                      {/* texto caso o box esteja vazio. */}
                      <Text style={styles.atividadesVazio}>Nenhuma categoria cadastrada.</Text>
                    </View>
                  )}
                  {categoryPages.map((categories, pageIndex) => (
                    <View key={`category-page-${pageIndex}`} style={[styles.paginaCategoria, { width: categoryBoxWidth || '100%' }]}>
                      <View style={styles.gradeCategoria}>
                        {categories.map((category) => {
                          const isSelected = selectedCategory === category;

                          return (
                            <Pressable
                              accessibilityRole="button"
                              accessibilityState={{ selected: isSelected }}
                              key={category}
                              onPress={() => setSelectedCategory(isSelected ? null : category)}
                              style={({ pressed }) => [
                                styles.itemCategoria,
                                isSelected && styles.componenteSelecionado,
                                pressed && styles.itemCategoriaPressionado,
                              ]}
                            >
                              <Text style={[styles.textoItemCategoria, isSelected && styles.textoItemCategoriaSelecionado]}>
                                {category}
                              </Text>
                              <View style={[styles.seletorCategoria, isSelected && styles.seletorCategoriaSelecionado]}>
                                {isSelected && <View style={styles.pontoSeletorCategoria} />}
                              </View>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  ))}
                </Animated.View>
              </View>

              <View style={styles.toolbarCategoria}>
                {/* Ícones e rótulos das ações da categoria podem ser trocados sem alterar seus onPress. */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: selectedCategory === null }}
                  disabled={selectedCategory === null}
                  onPress={() => openCategoryModal('edit')}
                  style={({ pressed }) => [
                    styles.toolbarBotao,
                    selectedCategory === null && styles.toolbarBotaoDesabilitado,
                    pressed && styles.botaoPressionado,
                  ]}
                >
                  {/* icone e texto do botão de editar das categorias */}
                  <Text style={styles.toolbarIcone}>&#x270E;</Text>
                  <Text style={styles.toolbarRotulo}>Editar</Text>
                </Pressable>
                {/* exclusão da categoria selecionada e dos dados associados */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Excluir categoria selecionada"
                  accessibilityState={{ disabled: selectedCategory === null }}
                  disabled={selectedCategory === null}
                  onPress={deleteCategory}
                  style={({ pressed }) => [
                    styles.toolbarBotao,
                    selectedCategory === null && styles.toolbarBotaoDesabilitado,
                    pressed && styles.botaoPressionado,
                  ]}
                >
                  {/* icone e texto do botão de excluir das categorias */}
                  <Text style={styles.toolbarIcone}>&#10005;</Text>
                  <Text style={styles.toolbarRotulo}>Excluir</Text>
                </Pressable>
                {/* divisor visual entre ações de categoria e paginação */}
                <View style={styles.toolbarDivisor} />
                {/* botão página anterior*/}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Pagina anterior"
                  accessibilityState={{ disabled: categoryPage === 0 }}
                  disabled={categoryPage === 0}
                  onPress={() => animateToCategoryPage(Math.max(categoryPage - 1, 0))}
                  style={({ pressed }) => [
                    styles.botaoPagina,
                    categoryPage === 0 && styles.toolbarBotaoDesabilitado,
                    pressed && styles.botaoPressionado,
                  ]}
                >
                    {/* texto da seta de paginação */}
                    <Text style={styles.setaPagina}>{'<<'}</Text>
                </Pressable>
                {/* botão próxima página */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Proxima pagina"
                  accessibilityState={{ disabled: categoryPages.length === 0 || categoryPage === categoryPages.length - 1 }}
                  disabled={categoryPages.length === 0 || categoryPage === categoryPages.length - 1}
                  onPress={() => animateToCategoryPage(Math.min(categoryPage + 1, categoryPages.length - 1))}
                  style={({ pressed }) => [
                    styles.botaoPagina,
                    (categoryPages.length === 0 || categoryPage === categoryPages.length - 1) && styles.toolbarBotaoDesabilitado,
                    pressed && styles.botaoPressionado,
                  ]}
                >
                  {/* texto da seta de paginação */}
                  <Text style={styles.setaPagina}>{'>>'}</Text>
                </Pressable>
              </View>
            </View>

            {/* Cabeçalho, dica e contador da seção Recursos. */}
            <View style={[styles.cabecalhoSecao, styles.cabecalhoSecaoEspacado]}>
              <View>
                <Text style={styles.categoriaTitulo}>Recursos</Text>
                <Text style={styles.categoriaDica}>
                  {selectedCategory === null ? 'Todos os recursos' : `Recursos de ${selectedCategory}`}
                </Text>
              </View>
              <Text style={styles.rotuloPagina}>{visibleResources.length} itens</Text>
            </View>

            {/* Lista de recursos: ícone, nome, quantidade e ações. */}
            <View style={[styles.superficie, styles.conteudoRecortado]}>
              <View style={styles.toolbarRecurso}>
                <View style={styles.acaoToolbarRecurso}>
                  {/* limpar remove os recursos visíveis e atividades que dependem deles */}
                  <Pressable
                    accessibilityRole="button"
                    onPress={clearResourceList}
                    style={({ pressed }) => [styles.botaoAcaoRecurso, pressed && styles.botaoPressionado]}
                  >
                    {/* texto e ícone do botão de limpar recursos*/}
                    <Text style={styles.toolbarIcone}>&#10005;</Text>
                    <Text style={styles.toolbarRotulo}>Limpar</Text>
                  </Pressable>
                </View>
              </View>

              {/* Conteúdo da lista de recursos. */}
              <ScrollView
                accessibilityLabel="Lista de recursos"
                nestedScrollEnabled
                showsVerticalScrollIndicator
                style={styles.conteudoComAlturaLimitada}
              >
                {visibleResources.length === 0 && (
                  <Text style={styles.atividadesVazio}>
                    {/* Texto exibido quando não há recursos visíveis. */}
                    {resources.length === 0 ? 'Nenhum recurso cadastrado.' : 'Nenhum recurso nesta categoria.'}
                  </Text>
                )}
                {visibleResources.map((resource) => (
                  <View key={resource.id} style={styles.linhaRecurso}>
                    <View style={styles.identidadeRecurso}>
                      <View style={[styles.baseIconeRecurso, styles.iconeRecurso]}>
                        <Text style={styles.textoIconeRecurso}>{resource.icon}</Text>
                      </View>
                      <Text style={styles.nomeRecurso}>{resource.name}</Text>
                    </View>
                    <Text style={styles.quantidadeRecurso}>{resource.quantity}</Text>
                    {/* Botões de editar. */}
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Editar ${resource.name}`}
                      onPress={() => openResourceModal('edit', resource)}
                      style={({ pressed }) => [styles.botaoIconeRecurso, pressed && styles.botaoPressionado]}
                    >
                      {/* Ícone de edição */}
                      <Text style={styles.textoBotaoRecurso}>&#x270E;</Text>
                    </Pressable>
                    {/* excluir o recurso também exclui atividades que o utilizam */}
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Excluir ${resource.name}`}
                      onPress={() => deleteResource(resource)}
                      style={({ pressed }) => [styles.botaoIconeRecurso, pressed && styles.botaoPressionado]}
                    >
                      {/* Ícone de exclusão */}
                      <Text style={styles.textoBotaoRecurso}>&#10005;</Text>
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* ===== Modal único: textos dos campos, título, abas e ações ===== */}
            <Modal
              animationType="fade"
              transparent
              visible={entryModalVisible}
              onRequestClose={() => (entryModalTab === 'category' ? closeCategoryModal() : closeResourceModal())}
            >
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.espacoFlexivel}
              >
                <View style={styles.fundoModal}>
                  <View style={styles.modalCadastro}>
                    {/* Título, textos dos campos e rótulos das abas. */}
                    <Text style={styles.tituloModalCadastro}>
                      {entryModalTab === 'category'
                        ? categoryModalMode === 'edit' ? 'Editar categoria' : 'Nova categoria'
                        : resourceModalMode === 'edit' ? 'Editar recurso' : 'Novo recurso'}
                    </Text>
                    {/* Placeholders, limites de texto e tipo de teclado dos campos. */}
                    <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} style={styles.conteudoComAlturaLimitada}>
                      {entryModalTab === 'category' ? (
                        <TextInput
                          accessibilityLabel="Nome da categoria"
                          autoFocus
                          maxLength={32}
                          onChangeText={setCategoryName}
                          onSubmitEditing={saveCategory}
                          placeholder="Nome da categoria"
                          placeholderTextColor="#B8B4C6"
                          returnKeyType="done"
                          style={styles.campoModalCadastro}
                          value={categoryName}
                        />
                      ) : (
                        <>
                          {/* Placeholder e limite do nome do recurso. */}
                          <TextInput
                            accessibilityLabel="Nome do recurso"
                            autoFocus
                            maxLength={32}
                            onChangeText={setResourceName}
                            placeholder="Nome do recurso"
                            placeholderTextColor="#B8B4C6"
                            style={styles.campoModalCadastro}
                            value={resourceName}
                          />
                          {/* Teclado e limite de quantidade do recurso. */}
                          <TextInput
                            accessibilityLabel="Quantidade do recurso"
                            keyboardType="numeric"
                            maxLength={9}
                            onChangeText={(value) => setResourceQuantity(value.replace(/[^0-9]/g, ''))}
                            placeholder="Quantidade"
                            placeholderTextColor="#B8B4C6"
                            style={[styles.campoModalCadastro, styles.campoQuantidadeRecursoModal]}
                            value={resourceQuantity}
                          />
                          {/* botão de seleção de categoria */}
                          <Pressable
                            accessibilityRole="button"
                            accessibilityState={{ expanded: resourceDropdownOpen }}
                            onPress={() => setResourceDropdownOpen((isOpen) => !isOpen)}
                            style={({ pressed }) => [styles.seletorRecursoModal, pressed && styles.botaoPressionado]}
                          >
                            <Text style={styles.textoSeletorRecursoModal}>
                              {resourceCategory || 'Escolha uma categoria'}
                            </Text>
                            <Text style={styles.setaSeletorRecursoModal}>{resourceDropdownOpen ? '^' : 'v'}</Text>
                          </Pressable>
                          {resourceDropdownOpen && (
                            <View style={styles.opcoesRecursoModal}>
                              {resourceCategoryOptions.map((category) => (
                                <Pressable
                                  accessibilityRole="button"
                                  key={category}
                                  onPress={() => {
                                    setResourceCategory(category);
                                    setResourceDropdownOpen(false);
                                  }}
                                  style={({ pressed }) => [styles.opcaoRecursoModal, pressed && styles.botaoPressionado]}
                                >
                                  <Text style={styles.textoOpcaoRecursoModal}>{category}</Text>
                                </Pressable>
                              ))}
                            </View>
                          )}
                        </>
                      )}
                    </ScrollView>
                    <View style={styles.acoesModalCadastro}>
                      {/* botão de cancelar a edição de recurso */}
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => (entryModalTab === 'category' ? closeCategoryModal() : closeResourceModal())}
                        style={({ pressed }) => [styles.botaoModalCadastro, pressed && styles.botaoPressionado]}
                      >
                        <Text style={styles.textoBotaoModal}>Cancelar</Text>
                      </Pressable>
                      {/* botão de salvar a edição de recurso */}
                      <Pressable
                        accessibilityRole="button"
                        disabled={entryModalTab === 'category'
                          ? categoryName.trim().length === 0
                          : resourceName.trim().length === 0 || resourceQuantity.trim().length === 0 || resourceCategory.length === 0}
                        onPress={entryModalTab === 'category' ? saveCategory : saveResource}
                        style={({ pressed }) => [
                          styles.botaoModalCadastro,
                          (entryModalTab === 'category'
                            ? categoryName.trim().length === 0
                            : resourceName.trim().length === 0 || resourceQuantity.trim().length === 0 || resourceCategory.length === 0) && styles.toolbarBotaoDesabilitado,
                          pressed && styles.botaoPressionado,
                        ]}
                      >
                        {/* texto do botão de salvar a edição de recurso */}
                        <Text style={styles.textoBotaoModal}>Salvar</Text>
                      </Pressable>
                    </View>
                    <View style={styles.abasModalCadastro}>
                      {/* Abas de categoria */}
                      <Pressable
                        accessibilityRole="tab"
                        accessibilityState={{ selected: entryModalTab === 'category' }}
                        onPress={() => switchEntryModalTab('category')}
                        style={({ pressed }) => [
                          styles.abaModalCadastro,
                          entryModalTab === 'category' && styles.componenteSelecionado,
                          pressed && styles.botaoPressionado,
                        ]}
                      >
                        <Text style={[styles.textoAbaModalCadastro, entryModalTab === 'category' && styles.textoAbaModalCadastroSelecionada]}>Categoria</Text>
                      </Pressable>
                      {/* Aba de recurso */}
                      <Pressable
                        accessibilityRole="tab"
                        accessibilityState={{ selected: entryModalTab === 'resource' }}
                        onPress={() => switchEntryModalTab('resource')}
                        style={({ pressed }) => [
                          styles.abaModalCadastro,
                          entryModalTab === 'resource' && styles.componenteSelecionado,
                          pressed && styles.botaoPressionado,
                        ]}
                      >
                        <Text style={[styles.textoAbaModalCadastro, entryModalTab === 'resource' && styles.textoAbaModalCadastroSelecionada]}>Recurso</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </Modal>

          </ScrollView>
          {/* Popup de feedback sobre a operação realizada */}
          {feedback !== null && (
            <View style={[styles.popupFeedback, feedback.tipo === 'sucesso' ? styles.popupFeedbackSucesso : styles.popupFeedbackCancelado]}>
              <Text style={styles.textoPopupFeedback}>{feedback.mensagem}</Text>
            </View>
          )}
          <FloatingHomeButton navigation={navigation} />
          <FloatingAddButton onPress={openEntryModal} />
        </SafeAreaView>
      );
    }

    return null;
  }

  // ==================== Tela inicial ====================
  return (
    <SafeAreaView style={styles.areaSegura}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.cabecalho}>
          <View style={styles.marcaLogo}>
            {/* texto do logo */}
            <Text style={styles.textoLogo}>FH</Text>
          </View>
          {/* Rótulo do produto na tela inicial. */}
          <Text style={styles.rotuloCabecalho}>FARM HELPER</Text>
        </View>

        <View style={styles.destaque}>
          {/* Texto principal da home: subtítulo e chamada. */}
          <Text style={styles.sobretitulo}>BEM-VINDO AO</Text>
          <Text style={styles.titulo}>Farm{ '\n' }Helper</Text>
          <Text style={styles.subtitulo}>
            Transforme recursos espalhados em um plano claro para suas proximas conquistas.
          </Text>
        </View>

        {/* Texto do título que antecede os cartões de navegação. */}
        <Text style={styles.tituloSecao}>O que voce quer fazer?</Text>
        <View style={styles.acoes}>
          {actions.map((action) => (
            // Pressable cria uma área tocável; pressed permite feedback visual durante o toque.
            <Pressable
              accessibilityRole="button"
              key={action.screen}
              onPress={() => navigation.navigate(action.screen)}
              style={({ pressed }) => [styles.cartaoAcao, pressed && styles.cartaoAcaoPressionado]}
            >
              <View style={styles.iconeAcao}>
                <Text style={styles.textoIconeAcao}>{action.icon}</Text>
              </View>
              <View style={styles.espacoFlexivel}>
                <Text style={styles.rotuloAcao}>{action.eyebrow}</Text>
                <Text style={styles.tituloAcao}>{action.titulo}</Text>
                <Text style={styles.descricaoAcao}>{action.description}</Text>
              </View>
              <Text style={styles.setaAcao}>{'->'}</Text>
            </Pressable>
          ))}
        </View>

          {/* Nota de rodapé com informações sobre os dados salvos. */}
        <Text style={styles.notaRodape}>Dados salvos local no dispositivo.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ======================== BOTAO FLUTUANTE DE VOLTAR PARA A TELA INICIAL ========================
function FloatingHomeButton({
  navigation,
}: {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}) {
  return (
    <Pressable
      accessibilityLabel="Voltar para a tela principal"
      accessibilityRole="button"
      onPress={() => navigation.reset({ index: 0, routes: [{ name: 'home' }] })} // Reseta a pilha de navegação para evitar voltar para telas anteriores.
      style={({ pressed }) => [styles.botaoFlutuanteCasa, pressed && styles.botaoFlutuanteCasaPressionado]}
    >
      {/* Símbolo do botão flutuante; troque apenas o caractere para mudar o ícone. */}
      <Text style={styles.iconeFlutuanteCasa}>⌂</Text>
    </Pressable>
  );
}

// ========================BOTAO FLUTUANTE DE ADICIONAR CATEGORIA OU RECURSO========================
function FloatingAddButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel="Adicionar categoria ou recurso"
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.botaoFlutuanteAdicionar, pressed && styles.botaoFlutuanteCasaPressionado]}
    >
      {/* Símbolo do botão flutuante; troque apenas o caractere para mudar o ícone. */}
      <Text style={styles.iconeFlutuanteAdicionar}>⊕</Text>
    </Pressable>
  );
}

// Bases tipográficas compartilhadas, NAO TOCAR
const tipografiaCompartilhada = {
  textoAcentuadoCompacto: {
    color: '#A78BFA',
    fontSize: 11,
    fontWeight: '800' as const,
  },
  nomeItem: {
    color: '#F5F3FF',
    fontSize: 13,
    fontWeight: '800' as const,
  },
  campoNumerico: {
    color: '#FFFFFF',
    fontSize: 15,
  },
};

// ==================== Estilos: compartilhados e por tela ====================
// Utilitários comuns ficam no início; os estilos específicos seguem agrupados por seção.
const styles = StyleSheet.create({
  // ===== Estilos compartilhados entre telas =====
  areaSegura: {
    flex: 1,
    backgroundColor: '#17171C',
  },
  containerTela: {
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  superficie: {
    backgroundColor: '#24242D',
    borderColor: '#393544',
    borderRadius: 16,
    borderWidth: 1,
  },
  espacoFlexivel: {
    flex: 1,
  },
  containerComRodape: {
    paddingBottom: 40,
  },
  conteudoComAlturaLimitada: {
    maxHeight: 360,
  },
  botaoVoltar: {
    alignSelf: 'flex-start', // opções: auto | flex-start | flex-end | center | stretch | baseline
    paddingVertical: 10,
  },
  textoBotaoVoltar: {
    color: '#A78BFA',
    fontSize: 15,
    fontWeight: '800',
  },
  botaoPressionado: {
    backgroundColor: '#302846',
    borderColor: '#A78BFA',
    transform: [{ scale: 0.96 }],
  },
  componenteSelecionado: {
    backgroundColor: '#3A2D5D',
    borderColor: '#A78BFA',
  },
  toolbarBotao: {
    alignItems: 'center', // opções: flex-start | flex-end | center | stretch | baseline
    borderColor: '#5B4A82',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexShrink: 1,
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  toolbarBotaoDesabilitado: {
    backgroundColor: '#592F36',
    borderColor: '#8A4A52',
  },
  toolbarIcone: {
    color: '#C4B5FD',
    fontSize: 21,
    fontWeight: '700',
    lineHeight: 21,
  },
  toolbarRotulo: {
    color: '#D2CCDF',
    fontSize: 11,
    fontWeight: '700',
  },
  baseIconeRecurso: {
    alignItems: 'center', // opções: flex-start | flex-end | center | stretch | baseline
    backgroundColor: '#3A2D5D',
    borderRadius: 8,
    justifyContent: 'center', // opções: flex-start | flex-end | center | space-between | space-around | space-evenly
  },
  textoConcluidoRiscado: {
    color: '#7FBAA6',
    textDecorationLine: 'line-through',
  },
  textoQuantidadeConcluida: {
    color: '#34D399',
  },
  // ===== Estilos da tela inicial =====
  container: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  cabecalho: {
    alignItems: 'center', // opções: flex-start | flex-end | center | stretch | baseline
    flexDirection: 'row',
    gap: 12,
  },
  marcaLogo: {
    alignItems: 'center', // opções: flex-start | flex-end | center | stretch | baseline
    backgroundColor: '#8B5CF6',
    borderRadius: 14,
    height: 48,
    justifyContent: 'center', // opções: flex-start | flex-end | center | space-between | space-around | space-evenly
    transform: [{ rotate: '-6deg' }],
    width: 48,
  },
  textoLogo: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  rotuloCabecalho: {
    color: '#A7A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  destaque: {
    paddingTop: 58,
    paddingBottom: 34,
  },
  sobretitulo: {
    color: '#A78BFA',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 10,
  },
  titulo: {
    color: '#F5F3FF',
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 52,
  },
  subtitulo: {
    color: '#B8B4C6',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 20,
    maxWidth: 330,
  },
  tituloSecao: {
    color: '#F5F3FF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
    marginTop: 36,
  },
  acoes: {
    gap: 12,
  },
  cartaoAcao: {
    alignItems: 'center', // opções: flex-start | flex-end | center | stretch | baseline
    backgroundColor: '#24242D',
    borderColor: '#393544',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 104,
    padding: 16,
  },
  cartaoAcaoPressionado: {
    backgroundColor: '#302846',
    transform: [{ scale: 0.985 }],
  },
  iconeAcao: {
    alignItems: 'center', // opções: flex-start | flex-end | center | stretch | baseline
    backgroundColor: '#3A2D5D',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center', // opções: flex-start | flex-end | center | space-between | space-around | space-evenly
    marginRight: 14,
    width: 48,
  },
  textoIconeAcao: {
    color: '#C4B5FD',
    fontSize: 24,
    fontWeight: '700',
  },
  rotuloAcao: {
    color: '#A78BFA',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  tituloAcao: {
    color: '#F5F3FF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  descricaoAcao: {
    color: '#AAA6BA',
    fontSize: 12,
    lineHeight: 17,
  },
  setaAcao: {
    color: '#A78BFA',
    fontSize: 17,
    fontWeight: '800',
    marginLeft: 8,
  },
  notaRodape: {
    color: '#777386',
    fontSize: 11,
    marginTop: 28,
    textAlign: 'center',
  },
  // ===== Estilos da tela de tutoriais =====
  containerTutorial: {
    paddingBottom: 42,
  },
  cabecalhoInterno: {
    paddingBottom: 30,
    paddingTop: 42,
  },
  tituloTutorial: {
    color: '#F5F3FF',
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 39,
  },
  introducaoTutorial: {
    color: '#B8B4C6',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 14,
  },
  fluxoTutorial: {
    paddingLeft: 2,
  },
  linhaHorizontal: {
    flexDirection: 'row',
  },
  numeroEtapaTutorial: {
    alignItems: 'center', // opções: flex-start | flex-end | center | stretch | baseline
    backgroundColor: '#8B5CF6',
    borderRadius: 15,
    height: 30,
    justifyContent: 'center', // opções: flex-start | flex-end | center | space-between | space-around | space-evenly
    marginRight: 12,
    width: 30,
  },
  textoNumeroEtapaTutorial: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  conteudoFlexivel: {
    flex: 1,
    minWidth: 0,
  },
  tituloEtapaTutorial: {
    color: '#F5F3FF',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 7,
  },
  descricaoEtapaTutorial: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 19,
  },
  conectorTutorial: {
    backgroundColor: '#4B4265',
    height: 28,
    marginLeft: 15,
    width: 1,
  },
  exemploCategoriaTutorial: {
    borderRadius: 12,
    marginTop: 14,
    padding: 12,
  },
  rotuloExemploTutorial: {
    color: '#A78BFA',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 9,
  },
  gradeCategoriaTutorial: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  etiquetaCategoriaTutorial: {
    backgroundColor: '#3A2D5D',
    borderColor: '#55427D',
    borderRadius: 7,
    borderWidth: 1,
    flexBasis: '46%',
    flexGrow: 1,
    paddingHorizontal: 9,
    paddingVertical: 8,
  },
  textoEtiquetaCategoriaTutorial: {
    color: '#DDD1FF',
    fontSize: 11,
    fontWeight: '800',
  },
  exemploRecursoTutorial: {
    borderRadius: 12,
    marginTop: 14,
    paddingHorizontal: 10,
  },
  linhaRecursoTutorial: {
    alignItems: 'center', // opções: flex-start | flex-end | center | stretch | baseline
    borderBottomColor: '#393544',
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 48,
  },
  iconeRecursoTutorial: {
    height: 26,
    marginRight: 9,
    width: 26,
  },
  textoIconeRecursoTutorial: {
    color: '#C4B5FD',
    fontSize: 13,
    fontWeight: '900',
  },
  nomeRecursoTutorial: {
    color: '#F5F3FF',
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
  },
  quantidadeRecursoTutorial: {
    color: '#A78BFA',
    fontSize: 12,
    fontWeight: '900',
  },
  exemploAtividadeTutorial: {
    borderRadius: 12,
    marginTop: 14,
    paddingHorizontal: 12,
  },
  cabecalhoAtividadeTutorial: {
    alignItems: 'center', // opções: flex-start | flex-end | center | stretch | baseline
    borderBottomColor: '#393544',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between', // opções: flex-start | flex-end | center | space-between | space-around | space-evenly
    minHeight: 43,
  },
  nomeAtividadeTutorial: {
    color: '#F5F3FF',
    fontSize: 12,
    fontWeight: '900',
  },
  categoriaAtividadeTutorial: {
    color: '#A78BFA',
    fontSize: 9,
    fontWeight: '800',
    marginTop: 3,
  },
  situacaoAtividadeTutorial: {
    backgroundColor: '#991B1B',
    borderRadius: 5,
    color: '#FEE2E2',
    fontSize: 8,
    fontWeight: '900',
    paddingHorizontal: 6,
    paddingVertical: 5,
  },
  linhaRecursoAtividadeTutorial: {
    alignItems: 'center', // opções: flex-start | flex-end | center | stretch | baseline
    borderBottomColor: '#393544',
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 37,
  },
  textoRecursoTutorial: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
  },
  quantidadeMetaTutorial: {
    color: '#F5F3FF',
    fontSize: 11,
    fontWeight: '900',
  },
  acaoAdicionarTutorial: {
    alignItems: 'center', // opções: flex-start | flex-end | center | stretch | baseline
    backgroundColor: '#3A2D5D',
    borderColor: '#8B5CF6',
    borderRadius: 8,
    borderWidth: 1,
    height: 30,
    justifyContent: 'center', // opções: flex-start | flex-end | center | space-between | space-around | space-evenly
    marginLeft: 8,
    width: 30,
  },
  textoAcaoAdicionarTutorial: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 22,
  },
  dicaTutorial: {
    alignItems: 'center', // opções: flex-start | flex-end | center | stretch | baseline
    backgroundColor: '#28233A',
    borderColor: '#493B6D',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 30,
    padding: 13,
  },
  iconeDicaTutorial: {
    alignItems: 'center', // opções: flex-start | flex-end | center | stretch | baseline
    backgroundColor: '#8B5CF6',
    borderRadius: 10,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    height: 20,
    lineHeight: 20,
    marginRight: 10,
    textAlign: 'center',
    width: 20,
  },
  textoDicaTutorial: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  // ===== Estilos da tela de atividades e detalhe =====
  cabecalhoAtividades: {
    alignItems: 'flex-end', // opções: flex-start | flex-end | center | stretch | baseline
    flexDirection: 'row',
    justifyContent: 'space-between', // opções: flex-start | flex-end | center | space-between | space-around | space-evenly
    paddingBottom: 24,
    paddingTop: 42,
  },
  tituloAtividades: {
    color: '#F5F3FF',
    fontSize: 36,
    fontWeight: '900',
    lineHeight: 40,
  },
  contadorAtividades: {
    color: '#A78BFA',
    flexShrink: 1,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
    marginLeft: 12,
  },
  atividadesVazio: {
    color: '#B8B4C6',
    fontSize: 14,
    paddingVertical: 24,
    textAlign: 'center',
  },
  modalDetalheAtividade: {
    backgroundColor: '#17171C',
    flex: 1,
  },
  cabecalhoModalDetalheAtividade: {
    alignItems: 'center', // opções: flex-start | flex-end | center | stretch | baseline
    borderBottomColor: '#393544',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between', // opções: flex-start | flex-end | center | space-between | space-around | space-evenly
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  tituloDetalheAtividade: {
    color: '#F5F3FF',
    fontSize: 25,
    fontWeight: '900',
  },
  categoriaDetalheAtividade: {
    color: '#A78BFA',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
  },
  botaoFecharDetalheAtividade: {
    alignItems: 'center', // opções: flex-start | flex-end | center | stretch | baseline
    backgroundColor: '#24242D',
    borderColor: '#5B4A82',
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center', // opções: flex-start | flex-end | center | space-between | space-around | space-evenly
    width: 44,
  },
  textoBotaoFecharDetalheAtividade: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  listaDetalheAtividade: {
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  linhaDetalheAtividade: {
    backgroundColor: '#24242D',
    borderColor: '#393544',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    padding: 12,
  },
  cabecalhoLinhaDetalheAtividade: {
    alignItems: 'center', // opções: flex-start | flex-end | center | stretch | baseline
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between', // opções: flex-start | flex-end | center | space-between | space-around | space-evenly
  },
  informacoesRecursoDetalheAtividade: {
    flex: 1,
    gap: 6,
    minWidth: 0,
  },
  nomeRecursoDetalheAtividade: {
    color: '#F5F3FF',
    fontSize: 15,
    fontWeight: '800',
  },
  quantidadeRecursoDetalheAtividade: {
    alignSelf: 'flex-start', // opções: auto | flex-start | flex-end | center | stretch | baseline
    backgroundColor: '#17171C',
    borderRadius: 6,
    color: '#D2CCDF',
    fontSize: 13,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  botaoAdicionarRecursoDetalhe: {
    alignItems: 'center', // opções: flex-start | flex-end | center | stretch | baseline
    backgroundColor: '#3A2D5D',
    borderColor: '#8B5CF6',
    borderRadius: 10,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center', // opções: flex-start | flex-end | center | space-between | space-around | space-evenly
    width: 44,
  },
  componenteDesabilitado: {
    opacity: 0.45,
  },
  iconeAdicionarRecursoDetalhe: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '500',
    lineHeight: 30,
  },
  formularioAdicionarEstoque: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  campoQuantidadeAdquirida: {
    backgroundColor: '#17171C',
    borderColor: '#817B91',
    borderRadius: 8,
    borderWidth: 1,
    color: '#FFFFFF',
    flex: 1,
    fontSize: 15,
    minHeight: 44,
    paddingHorizontal: 12,
  },
  botaoConfirmarAdicao: {
    alignItems: 'center', // opções: flex-start | flex-end | center | stretch | baseline
    backgroundColor: '#166534',
    borderColor: '#4ADE80',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center', // opções: flex-start | flex-end | center | space-between | space-around | space-evenly
    minWidth: 96,
    paddingHorizontal: 12,
  },
  textoConfirmarAdicao: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  listaAtividades: {
    gap: 18,
    marginTop: 24,
  },
  cartaoAtividade: {
    minHeight: 196,
    overflow: 'hidden',
    width: '100%',
  },
  cartaoAtividadePressionado: {
    backgroundColor: '#302846',
    borderColor: '#8B5CF6',
  },
  cabecalhoCartaoAtividade: {
    alignItems: 'center', // opções: flex-start | flex-end | center | stretch | baseline
    borderBottomColor: '#393544',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between', // opções: flex-start | flex-end | center | space-between | space-around | space-evenly
    minHeight: 64,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  nomeAtividade: {
    color: '#F5F3FF',
    fontSize: 17,
    fontWeight: '900',
  },
  categoriaAtividade: {
    color: '#A78BFA',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 3,
  },
  situacaoAtividade: {
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  situacaoAtividadePendente: {
    backgroundColor: '#991B1B',
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  situacaoAtividadeConcluida: {
    backgroundColor: '#166534',
    borderColor: '#4ADE80',
    borderWidth: 1,
  },
  textoSituacaoAtividade: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  textoSituacaoPendente: {
    color: '#FEE2E2',
  },
  textoSituacaoConcluida: {
    color: '#DCFCE7',
  },
  listaRecursosAtividade: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  linhaRecursoAtividade: {
    alignItems: 'center', // opções: flex-start | flex-end | center | stretch | baseline
    borderBottomColor: '#393544',
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 42,
    paddingHorizontal: 4,
  },
  caixaRecursoAtividade: {
    alignItems: 'center', // opções: flex-start | flex-end | center | stretch | baseline
    borderColor: '#817B91',
    borderRadius: 5,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center', // opções: flex-start | flex-end | center | space-between | space-around | space-evenly
    marginRight: 10,
    width: 20,
  },
  caixaRecursoAtividadeCompleta: {
    backgroundColor: '#34D399',
    borderColor: '#34D399',
  },
  marcaRecursoAtividade: {
    color: '#17231F',
    fontSize: 14,
    fontWeight: '900',
  },
  nomeRecursoAtividade: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  quantidadeRecursoAtividade: {
    color: '#F5F3FF',
    fontSize: 13,
    fontWeight: '900',
    minWidth: 44,
    textAlign: 'right',
  },
  maisRecursosAtividade: {
    color: '#A78BFA',
    fontSize: 11,
    fontWeight: '800',
    paddingTop: 8,
    textAlign: 'center',
  },
  // ===== Estilos da tela de categorias e recursos =====
  tituloOrganizacao: {
    color: '#F5F3FF',
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 37,
  },
  cabecalhoSecao: {
    alignItems: 'flex-end', // opções: flex-start | flex-end | center | stretch | baseline
    flexDirection: 'row',
    justifyContent: 'space-between', // opções: flex-start | flex-end | center | space-between | space-around | space-evenly
    marginBottom: 12,
  },
  cabecalhoSecaoEspacado: {
    marginTop: 32,
  },
  categoriaTitulo: {
    color: '#F5F3FF',
    fontSize: 19,
    fontWeight: '800',
  },
  categoriaDica: {
    color: '#FFFFFF',
    fontSize: 11,
    marginTop: 4,
  },
  rotuloPagina: {
    color: '#A78BFA',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  conteudoRecortado: {
    overflow: 'hidden',
  },
  paginaCategoria: {
    flexShrink: 0,
  },
  gradeCategoria: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    padding: 12,
  },
  itemCategoria: {
    alignItems: 'center', // opções: flex-start | flex-end | center | stretch | baseline
    backgroundColor: '#2E2D38',
    borderColor: '#454151',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    height: 52,
    justifyContent: 'space-between', // opções: flex-start | flex-end | center | space-between | space-around | space-evenly
    paddingHorizontal: 12,
    flexBasis: '45%',
    flexGrow: 1,
    flexShrink: 1,
  },
  itemCategoriaPressionado: {
    opacity: 0.78,
  },
  textoItemCategoria: {
    color: '#F5F3FF',
    fontSize: 13,
    fontWeight: '800',
  },
  textoItemCategoriaSelecionado: {
    color: '#DDD1FF',
  },
  seletorCategoria: {
    alignItems: 'center', // opções: flex-start | flex-end | center | stretch | baseline
    borderColor: '#817B91',
    borderRadius: 9,
    borderWidth: 2,
    height: 18,
    justifyContent: 'center', // opções: flex-start | flex-end | center | space-between | space-around | space-evenly
    width: 18,
  },
  seletorCategoriaSelecionado: {
    borderColor: '#C4B5FD',
  },
  pontoSeletorCategoria: {
    backgroundColor: '#C4B5FD',
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  toolbarCategoria: {
    alignItems: 'center', // opções: flex-start | flex-end | center | stretch | baseline
    borderColor: '#393544',
    borderTopWidth: 1,
    flexDirection: 'row',
    minHeight: 64,
    paddingHorizontal: 10,
  },
  toolbarDivisor: {
    backgroundColor: '#454151',
    height: 28,
    marginHorizontal: 8,
    width: 1,
  },
  botaoPagina: {
    alignItems: 'center', // opções: flex-start | flex-end | center | stretch | baseline
    borderColor: '#5B4A82',
    borderRadius: 8,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center', // opções: flex-start | flex-end | center | space-between | space-around | space-evenly
    width: 38,
  },
  setaPagina: {
    color: '#C4B5FD',
    fontSize: 25,
    fontWeight: '700',
  },
  toolbarRecurso: {
    alignItems: 'center', // opções: flex-start | flex-end | center | stretch | baseline
    borderBottomColor: '#393544',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end', // opções: flex-start | flex-end | center | space-between | space-around | space-evenly
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  acaoToolbarRecurso: {
    alignItems: 'center', // opções: flex-start | flex-end | center | stretch | baseline
    flexDirection: 'row',
    flexShrink: 1,
  },
  botaoAcaoRecurso: {
    alignItems: 'center', // opções: flex-start | flex-end | center | stretch | baseline
    borderColor: '#5B4A82',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  linhaRecurso: {
    alignItems: 'center', // opções: flex-start | flex-end | center | stretch | baseline
    borderBottomColor: '#393544',
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 58,
    paddingHorizontal: 12,
  },
  identidadeRecurso: {
    alignItems: 'center', // opções: flex-start | flex-end | center | stretch | baseline
    flex: 1,
    flexDirection: 'row',
    minWidth: 0,
  },
  iconeRecurso: {
    height: 32,
    marginRight: 10,
    width: 32,
  },
  textoIconeRecurso: {
    color: '#C4B5FD',
    fontSize: 16,
    fontWeight: '800',
  },
  nomeRecurso: {
    color: '#F5F3FF',
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '800',
  },
  quantidadeRecurso: {
    color: '#B8B4C6',
    fontSize: 13,
    fontWeight: '800',
    marginHorizontal: 8,
    minWidth: 34,
    textAlign: 'right',
  },
  botaoIconeRecurso: {
    alignItems: 'center', // opções: flex-start | flex-end | center | stretch | baseline
    borderColor: '#5B4A82',
    borderRadius: 8,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center', // opções: flex-start | flex-end | center | space-between | space-around | space-evenly
    width: 34,
  },
  textoBotaoRecurso: {
    color: '#C4B5FD',
    fontSize: 17,
    fontWeight: '700',
  },
  // ===== Estilos dos modais =====
  textoBotaoModal: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  fundoModal: {
    alignItems: 'center', // opções: flex-start | flex-end | center | stretch | baseline
    backgroundColor: 'rgba(0, 0, 0, 0.68)',
    flex: 1,
    justifyContent: 'center', // opções: flex-start | flex-end | center | space-between | space-around | space-evenly
    padding: 20,
  },
  modalCadastro: {
    backgroundColor: '#24242D',
    borderColor: '#5B4A82',
    borderRadius: 16,
    borderWidth: 1,
    maxWidth: 420,
    padding: 18,
    width: '100%',
  },
  tituloModalCadastro: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 14,
  },
  campoModalCadastro: {
    backgroundColor: '#17171C',
    borderColor: '#817B91',
    borderRadius: 10,
    borderWidth: 1,
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  abasModalCadastro: {
    borderTopColor: '#393544',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    paddingTop: 12,
  },
  abaModalCadastro: {
    alignItems: 'center', // opções: flex-start | flex-end | center | stretch | baseline
    backgroundColor: '#17171C',
    borderColor: '#454151',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center', // opções: flex-start | flex-end | center | space-between | space-around | space-evenly
    minHeight: 44,
  },
  textoAbaModalCadastro: {
    color: '#B8B4C6',
    fontSize: 13,
    fontWeight: '700',
  },
  textoAbaModalCadastroSelecionada: {
    color: '#FFFFFF',
  },
  campoQuantidadeRecursoModal: {
    marginTop: 10,
  },
  acoesModalCadastro: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  botaoModalCadastro: {
    alignItems: 'center', // opções: flex-start | flex-end | center | stretch | baseline
    backgroundColor: '#24242D',
    borderColor: '#5B4A82',
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center', // opções: flex-start | flex-end | center | space-between | space-around | space-evenly
    minHeight: 52,
    paddingHorizontal: 12,
  },
  linhaEntradaModalAtividade: {
    alignItems: 'center', // opções: flex-start | flex-end | center | stretch | baseline
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  seletorRecursoModalAtividade: {
    flex: 1,
    marginTop: 0,
  },
  quantidadeModalAtividade: {
    backgroundColor: '#17171C',
    borderColor: '#817B91',
    borderRadius: 10,
    borderWidth: 1,
    color: '#FFFFFF',
    fontSize: 15,
    minHeight: 52,
    paddingHorizontal: 12,
    textAlign: 'center',
    width: 72,
  },
  botaoAdicionarRecursoModalAtividade: {
    justifyContent: 'center', // opções: flex-start | flex-end | center | space-between | space-around | space-evenly
    marginTop: 10,
  },
  listaSelecionadosModalAtividade: {
    backgroundColor: '#17171C',
    borderColor: '#393544',
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 12,
    overflow: 'hidden',
  },
  mensagemVaziaModalAtividade: {
    color: '#FFFFFF',
    fontSize: 12,
    padding: 12,
  },
  seletorRecursoModal: {
    alignItems: 'center', // opções: flex-start | flex-end | center | stretch | baseline
    backgroundColor: '#24242D',
    borderColor: '#5B4A82',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between', // opções: flex-start | flex-end | center | space-between | space-around | space-evenly
    marginTop: 10,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  textoSeletorRecursoModal: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  setaSeletorRecursoModal: {
    color: '#C4B5FD',
    fontSize: 18,
    fontWeight: '900',
    marginLeft: 10,
  },
  opcoesRecursoModal: {
    backgroundColor: '#17171C',
    borderColor: '#5B4A82',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 6,
    maxHeight: 150,
  },
  opcaoRecursoModal: {
    borderBottomColor: '#393544',
    borderBottomWidth: 1,
    minHeight: 44,
    justifyContent: 'center', // opções: flex-start | flex-end | center | space-between | space-around | space-evenly
    paddingHorizontal: 12,
  },
  textoOpcaoRecursoModal: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  // ===== Estilos de popup e botões flutuantes =====
  popupFeedback: {
    alignSelf: 'center', // opções: auto | flex-start | flex-end | center | stretch | baseline
    borderRadius: 10,
    borderWidth: 1,
    left: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'absolute',
    right: 20,
    top: 14,
    zIndex: 2,
  },
  popupFeedbackSucesso: {
    backgroundColor: '#166534',
    borderColor: '#4ADE80',
  },
  popupFeedbackCancelado: {
    backgroundColor: '#991B1B',
    borderColor: '#EF4444',
  },
  textoPopupFeedback: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  botaoFlutuanteCasa: {
    alignItems: 'center', // opções: flex-start | flex-end | center | stretch | baseline
    backgroundColor: '#8B5CF6',
    borderColor: '#C4B5FD',
    borderRadius: 28,
    borderWidth: 1,
    bottom: 72,
    elevation: 8,
    height: 56,
    justifyContent: 'center', // opções: flex-start | flex-end | center | space-between | space-around | space-evenly
    left: 20,
    position: 'absolute',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    width: 56,
  },
  botaoFlutuanteCasaPressionado: {
    backgroundColor: '#7546DA',
    transform: [{ scale: 0.94 }],
  },
  iconeFlutuanteCasa: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 32,
  },
  botaoFlutuanteAdicionar: {
    alignItems: 'center', // opções: flex-start | flex-end | center | stretch | baseline
    backgroundColor: '#8B5CF6',
    borderColor: '#C4B5FD',
    borderRadius: 28,
    borderWidth: 1,
    bottom: 72,
    elevation: 8,
    height: 56,
    justifyContent: 'center', // opções: flex-start | flex-end | center | space-between | space-around | space-evenly
    position: 'absolute',
    right: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    width: 56,
  },
  iconeFlutuanteAdicionar: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '500',
    lineHeight: 36,
  },
});
