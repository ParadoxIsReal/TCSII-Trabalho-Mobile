import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import React from 'react';

type Screen = 'home' | 'tutorials' | 'setup' | 'tracking';

type RootStackParamList = {
  home: undefined;
  tutorials: undefined;
  setup: undefined;
  tracking: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

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

const previewCategoryPages = [
  ['catg1', 'catg2', 'catg3', 'catg4', 'catg5', 'catg6'],
  ['catg7', 'catg8', 'catg9', 'catg10', 'catg11', 'catg12'],
];

const previewResources = [
  { icon: '*', name: 'item1', quantity: 'x99', category: 'catg1' },
  { icon: '#', name: 'item2', quantity: 'x99', category: 'catg2' },
  { icon: '+', name: 'item3', quantity: 'x99', category: 'catg3' },
  { icon: '%', name: 'item4', quantity: 'x99', category: 'catg4' },
  { icon: '@', name: 'item5', quantity: 'x99', category: 'catg5' },
  { icon: '&', name: 'item6', quantity: 'x99', category: 'catg6' },
  { icon: '$', name: 'item7', quantity: 'x99', category: 'catg7' },
  { icon: '*', name: 'item8', quantity: 'x99', category: 'catg8' },
  { icon: '#', name: 'item9', quantity: 'x99', category: 'catg9' },
  { icon: '+', name: 'item10', quantity: 'x99', category: 'catg10' },
  { icon: '%', name: 'item11', quantity: 'x99', category: 'catg11' },
  { icon: '@', name: 'item12', quantity: 'x99', category: 'catg12' },
  { icon: '&', name: 'item13', quantity: 'x99', category: 'catg1' },
  { icon: '$', name: 'item14', quantity: 'x99', category: 'catg2' },
  { icon: '*', name: 'item15', quantity: 'x99', category: 'catg3' },
  { icon: '#', name: 'item16', quantity: 'x99', category: 'catg4' },
  { icon: '+', name: 'item17', quantity: 'x99', category: 'catg5' },
  { icon: '%', name: 'item18', quantity: 'x99', category: 'catg6' },
  { icon: '@', name: 'item19', quantity: 'x99', category: 'catg7' },
  { icon: '&', name: 'item20', quantity: 'x99', category: 'catg8' },
].map((resource, index) => ({
  ...resource,
  id: `resource-${index + 1}`,
}));

type Resource = typeof previewResources[number];

const previewActivities = [
  {
    name: 'nomeAtiv',
    category: 'catg1',
    resources: [
      { name: 'item1', current: 0, required: 20 },
      { name: 'item2', current: 0, required: 5 },
      { name: 'item3', current: 1, required: 1 },
      { name: 'item10', current: 0, required: 2 },
    ],
  },
  {
    name: 'nomeAtiv',
    category: 'catg4',
    resources: [
      { name: 'item4', current: 7, required: 7 },
      { name: 'item5', current: 5, required: 5 },
      { name: 'item6', current: 1, required: 1 },
    ],
  },
  {
    name: 'nomeAtiv',
    category: 'catg7',
    resources: [
      { name: 'item7', current: 3, required: 10 },
      { name: 'item8', current: 2, required: 4 },
      { name: 'item9', current: 0, required: 8 },
    ],
  },
];

type Activity = typeof previewActivities[number];

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
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

function AppContent({
  screen,
  navigation,
}: {
  screen: Screen;
  navigation: NativeStackNavigationProp<RootStackParamList>;
}) {
  const [categoryPage, setCategoryPage] = useState(0);
  const [categoryPages, setCategoryPages] = useState(previewCategoryPages);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState<'add' | 'edit'>('add');
  const [categoryName, setCategoryName] = useState('');
  const [resources, setResources] = useState(previewResources);
  const [resourceModalVisible, setResourceModalVisible] = useState(false);
  const [resourceModalMode, setResourceModalMode] = useState<'add' | 'edit'>('add');
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [resourceName, setResourceName] = useState('');
  const [resourceQuantity, setResourceQuantity] = useState('');
  const [resourceCategory, setResourceCategory] = useState('');
  const [resourceDropdownOpen, setResourceDropdownOpen] = useState(false);
  const [activities, setActivities] = useState(previewActivities);
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
  const categoryPageRef = useRef(categoryPage);
  const categoryPagesRef = useRef(categoryPages);
  const categoryBoxWidthRef = useRef(categoryBoxWidth);
  const categoryTrackX = useRef(new Animated.Value(0)).current;
  categoryPageRef.current = categoryPage;
  categoryPagesRef.current = categoryPages;
  categoryBoxWidthRef.current = categoryBoxWidth;
  useEffect(() => {
    if (feedback === null) {
      return undefined;
    }

    const timeout = setTimeout(() => setFeedback(null), 2600);
    return () => clearTimeout(timeout);
  }, [feedback]);
  const openCategoryModal = (mode: 'add' | 'edit') => {
    setCategoryModalMode(mode);
    setCategoryName(mode === 'edit' && selectedCategory !== null ? selectedCategory : '');
    setCategoryModalVisible(true);
  };
  const closeCategoryModal = (mostrarFeedback = true) => {
    setCategoryModalVisible(false);
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
      setCategoryPages((currentPages) => currentPages.map((page) => page.map((category) => (
        category === selectedCategory ? trimmedName : category
      ))));
      setSelectedCategory(trimmedName);
    } else {
      const lastPageIndex = categoryPages.length - 1;
      const nextPage = categoryPages[lastPageIndex].length >= 6
        ? categoryPages.length
        : lastPageIndex;

      setCategoryPages((currentPages) => {
        const updatedPages = currentPages.map((page) => [...page]);
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
  const openResourceModal = (mode: 'add' | 'edit', resource?: Resource) => {
    setResourceModalMode(mode);
    setEditingResourceId(resource?.id ?? null);
    setResourceName(resource?.name ?? '');
    setResourceQuantity(resource?.quantity.replace(/^x/, '') ?? '');
    setResourceCategory(resource?.category ?? selectedCategory ?? categoryPages[0][0]);
    setResourceDropdownOpen(false);
    setResourceModalVisible(true);
  };
  const closeResourceModal = (mostrarFeedback = true) => {
    setResourceModalVisible(false);
    setEditingResourceId(null);
    setResourceName('');
    setResourceQuantity('');
    setResourceCategory('');
    setResourceDropdownOpen(false);

    if (mostrarFeedback) {
      setFeedback({ mensagem: 'Operação cancelada', tipo: 'cancelado' });
    }
  };
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
  const openActivityModal = () => {
    setActivityName('');
    setActivityCategory(selectedCategory ?? categoryPages[0][0]);
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
      { name: trimmedName, current: 0, required: quantity },
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
  const animateToCategoryPage = (nextPage: number) => {
    const width = categoryBoxWidthRef.current;

    if (width === 0) {
      setCategoryPage(nextPage);
      setSelectedCategory(null);
      return;
    }

    Animated.timing(categoryTrackX, {
      duration: 220,
      toValue: -nextPage * width,
      useNativeDriver: true,
    }).start(() => {
      setCategoryPage(nextPage);
      setSelectedCategory(null);
    });
  };
  const categorySwipeResponder = useRef(
    PanResponder.create({
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

        if (width === 0) {
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
  const visibleResources = selectedCategory === null
    ? resources
    : resources.filter((resource) => resource.category === selectedCategory);
  const resourceCategoryOptions = Array.from(new Set(categoryPages.flat()));
  const activityResourceOptions = resources.filter((resource) => (
    resource.category === activityCategory
    && !selectedActivityResources.some((selectedResource) => selectedResource.name === resource.name)
  ));

  if (screen !== 'home') {
    if (screen === 'tutorials') {
      return (
        <SafeAreaView style={styles.safeArea}>
          <StatusBar style="light" />
          <ScrollView contentContainerStyle={[styles.screenContainer, styles.tutorialContainer]} showsVerticalScrollIndicator={false}>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [styles.backBotao, pressed && styles.botaoPressionado]}
            >
              <Text style={styles.backBotaoTexto}>{'<'} Voltar</Text>
            </Pressable>

            <View style={styles.tutorialHeader}>
              <Text style={styles.kicker}>COMO FUNCIONA</Text>
              <Text style={styles.tutorialTitulo}>Do preparo à conquista</Text>
              <Text style={styles.tutorialIntroducao}>
                Organize seus itens pelo jogo de origem, defina os recursos e transforme tudo em atividades para acompanhar.
              </Text>
            </View>

            <View style={styles.tutorialFluxo}>
              <View style={styles.tutorialEtapa}>
                <View style={styles.tutorialNumeroEtapa}><Text style={styles.tutorialNumeroEtapaTexto}>1</Text></View>
                <View style={styles.tutorialConteudoEtapa}>
                  <Text style={styles.tutorialTituloEtapa}>Crie categorias</Text>
                  <Text style={styles.tutorialDescricaoEtapa}>
                    Cada categoria representa um jogo de origem. Assim, recursos com o mesmo nome de jogos diferentes continuam separados.
                  </Text>
                  <View style={[styles.surface, styles.tutorialExemploCategoria]}>
                    <Text style={styles.tutorialRotuloExemplo}>CATEGORIAS</Text>
                    <View style={styles.tutorialGradeCategoria}>
                      {['catg1', 'catg2', 'catg3', 'catg4'].map((category) => (
                        <View key={category} style={styles.tutorialEtiquetaCategoria}>
                          <Text style={styles.tutorialTextoEtiquetaCategoria}>{category}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.tutorialConector} />

              <View style={styles.tutorialEtapa}>
                <View style={styles.tutorialNumeroEtapa}><Text style={styles.tutorialNumeroEtapaTexto}>2</Text></View>
                <View style={styles.tutorialConteudoEtapa}>
                  <Text style={styles.tutorialTituloEtapa}>Cadastre os recursos</Text>
                  <Text style={styles.tutorialDescricaoEtapa}>
                    Adicione os itens que voce possui ou precisa coletar. Cada recurso fica ligado ao jogo de origem e tem icone, nome e quantidade.
                  </Text>
                  <View style={[styles.surface, styles.tutorialExemploRecurso]}>
                    {[
                      { icon: '*', name: 'item1', quantity: 'x12' },
                      { icon: '+', name: 'item2', quantity: 'x08' },
                    ].map((resource) => (
                      <View key={resource.name} style={styles.tutorialLinhaRecurso}>
                        <View style={[styles.iconeRecursoBase, styles.tutorialIconeRecurso]}><Text style={styles.tutorialTextoIconeRecurso}>{resource.icon}</Text></View>
                        <Text style={styles.tutorialNomeRecurso}>{resource.name}</Text>
                        <Text style={styles.tutorialQuantidadeRecurso}>{resource.quantity}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.tutorialConector} />

              <View style={styles.tutorialEtapa}>
                <View style={styles.tutorialNumeroEtapa}><Text style={styles.tutorialNumeroEtapaTexto}>3</Text></View>
                <View style={styles.tutorialConteudoEtapa}>
                  <Text style={styles.tutorialTituloEtapa}>Monte atividades</Text>
                  <Text style={styles.tutorialDescricaoEtapa}>
                    Reuna os recursos necessários em uma checklist e acompanhe o progresso até concluir o objetivo.
                  </Text>
                  <View style={[styles.surface, styles.tutorialExemploAtividade]}>
                    <View style={styles.tutorialCabecalhoAtividade}>
                      <Text style={styles.tutorialNomeAtividade}>Construir celeiro</Text>
                      <Text style={styles.tutorialStatusAtividade}>PENDENTE</Text>
                    </View>
                    <View style={styles.tutorialLinhaChecklist}>
                      <View style={styles.tutorialCaixaChecklist} />
                      <Text style={styles.tutorialTextoChecklist}>Ferro</Text>
                      <Text style={styles.tutorialQuantidadeChecklist}>4/12</Text>
                    </View>
                    <View style={styles.tutorialLinhaChecklist}>
                      <View style={[styles.tutorialCaixaChecklist, styles.tutorialCaixaChecklistConcluida]}><Text style={styles.tutorialMarcaChecklist}>✓</Text></View>
                      <Text style={[styles.tutorialTextoChecklist, styles.tutorialTextoChecklistConcluido]}>Madeira</Text>
                      <Text style={[styles.tutorialQuantidadeChecklist, styles.tutorialQuantidadeChecklistConcluida]}>8/8</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.tutorialTip}>
              <Text style={styles.tutorialIconeDica}>i</Text>
              <Text style={styles.tutorialTextoDica}>O fluxo e continuo: categorias organizam, recursos abastecem e atividades mostram o que falta.</Text>
            </View>
            <Modal
              animationType="fade"
              transparent
              visible={false}
              onRequestClose={() => closeActivityModal()}
            >
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalTeclado}>
                <View style={styles.modalFundo}>
                  <View style={styles.modalCategoria}>
                    <Text style={styles.modalCategoriaTitulo}>Nova atividade</Text>
                    <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} style={styles.modalAtividadeConteudo}>
                      <TextInput
                        accessibilityLabel="Nome da atividade"
                        autoFocus
                        maxLength={32}
                        onChangeText={setActivityName}
                        placeholder="Nome da atividade"
                        placeholderTextColor="#B8B4C6"
                        style={styles.modalCategoriaCampo}
                        value={activityName}
                      />
                      <Pressable
                        accessibilityRole="button"
                        accessibilityState={{ expanded: activityCategoryDropdownOpen }}
                        onPress={() => setActivityCategoryDropdownOpen((isOpen) => !isOpen)}
                        style={({ pressed }) => [styles.modalRecursoSeletor, pressed && styles.botaoPressionado]}
                      >
                        <Text style={styles.modalRecursoSeletorTexto}>{activityCategory || 'Escolha uma categoria'}</Text>
                        <Text style={styles.modalRecursoSeletorSeta}>{activityCategoryDropdownOpen ? '^' : 'v'}</Text>
                      </Pressable>
                      {activityCategoryDropdownOpen && (
                        <View style={styles.modalRecursoOpcoes}>
                          {resourceCategoryOptions.map((category) => (
                            <Pressable
                              accessibilityRole="button"
                              key={category}
                              onPress={() => changeActivityCategory(category)}
                              style={({ pressed }) => [styles.modalRecursoOpcao, pressed && styles.botaoPressionado]}
                            >
                              <Text style={styles.modalRecursoOpcaoTexto}>{category}</Text>
                            </Pressable>
                          ))}
                        </View>
                      )}
                      <View style={styles.modalAtividadeLinhaEntrada}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityState={{ expanded: activityResourceDropdownOpen }}
                          onPress={() => setActivityResourceDropdownOpen((isOpen) => !isOpen)}
                          style={({ pressed }) => [styles.modalRecursoSeletor, styles.modalAtividadeSeletorRecurso, pressed && styles.botaoPressionado]}
                        >
                          <Text style={styles.modalRecursoSeletorTexto} numberOfLines={1}>{activityResourceName || 'Escolha o recurso'}</Text>
                          <Text style={styles.modalRecursoSeletorSeta}>{activityResourceDropdownOpen ? '^' : 'v'}</Text>
                        </Pressable>
                        <TextInput
                          accessibilityLabel="Quantidade necessária"
                          keyboardType="numeric"
                          maxLength={9}
                          onChangeText={(value) => setActivityResourceQuantity(value.replace(/[^0-9]/g, ''))}
                          placeholder="Qtd."
                          placeholderTextColor="#B8B4C6"
                          style={styles.modalAtividadeQuantidade}
                          value={activityResourceQuantity}
                        />
                      </View>
                      {activityResourceDropdownOpen && (
                        <View style={styles.modalRecursoOpcoes}>
                          {activityResourceOptions.map((resource) => (
                            <Pressable
                              accessibilityRole="button"
                              key={resource.id}
                              onPress={() => {
                                setActivityResourceName(resource.name);
                                setActivityResourceDropdownOpen(false);
                              }}
                              style={({ pressed }) => [styles.modalRecursoOpcao, pressed && styles.botaoPressionado]}
                            >
                              <Text style={styles.modalRecursoOpcaoTexto}>{resource.name}</Text>
                            </Pressable>
                          ))}
                          {activityResourceOptions.length === 0 && <Text style={styles.modalAtividadeVazio}>Todos os recursos desta categoria já foram adicionados.</Text>}
                        </View>
                      )}
                      <Pressable
                        accessibilityRole="button"
                        disabled={activityResourceName.length === 0 || activityResourceQuantity.length === 0}
                        onPress={addActivityResource}
                        style={({ pressed }) => [
                          styles.toolbarBotao,
                          styles.modalAtividadeAdicionar,
                          (activityResourceName.length === 0 || activityResourceQuantity.length === 0) && styles.toolbarBotaoDisable,
                          pressed && styles.botaoPressionado,
                        ]}
                      >
                        <Text style={styles.toolbarIcone}>+</Text>
                        <Text style={styles.toolbarRotulo}>Adicionar recurso</Text>
                      </Pressable>
                      {selectedActivityResources.length > 0 && (
                        <View style={styles.modalAtividadeSelecionados}>
                          {selectedActivityResources.map((resource) => (
                            <View key={resource.name} style={styles.recursoRow}>
                              <Text style={styles.recursoNome}>{resource.name}</Text>
                              <Text style={styles.recursoQuantidade}>x{resource.required}</Text>
                              <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={`Remover ${resource.name}`}
                                onPress={() => setSelectedActivityResources((currentResources) => currentResources.filter((item) => item.name !== resource.name))}
                                style={({ pressed }) => [styles.recursoBotaoIcone, pressed && styles.botaoPressionado]}
                              >
                                <Text style={styles.recursoTextoBotao}>&#10005;</Text>
                              </Pressable>
                            </View>
                          ))}
                        </View>
                      )}
                    </ScrollView>
                    <View style={styles.modalCategoriaAcoes}>
                      <Pressable accessibilityRole="button" onPress={() => closeActivityModal()} style={({ pressed }) => [styles.modalCategoriaBotao, pressed && styles.botaoPressionado]}>
                        <Text style={styles.novaAtividadeTexto}>Cancelar</Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        disabled={activityName.trim().length === 0 || activityCategory.length === 0 || selectedActivityResources.length === 0}
                        onPress={saveActivity}
                        style={({ pressed }) => [
                          styles.modalCategoriaBotao,
                          (activityName.trim().length === 0 || activityCategory.length === 0 || selectedActivityResources.length === 0) && styles.toolbarBotaoDisable,
                          pressed && styles.botaoPressionado,
                        ]}
                      >
                        <Text style={styles.novaAtividadeTexto}>Salvar</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </Modal>
          </ScrollView>
          <FloatingHomeButton navigation={navigation} />
        </SafeAreaView>
      );
    }

    if (screen === 'tracking') {
      return (
        <SafeAreaView style={styles.safeArea}>
          <StatusBar style="light" />
          <ScrollView contentContainerStyle={[styles.screenContainer, styles.containerAtividades]} showsVerticalScrollIndicator={false}>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [styles.backBotao, pressed && styles.botaoPressionado]}
            >
              <Text style={styles.backBotaoTexto}>{'<'} Voltar</Text>
            </Pressable>

            <View style={styles.cabecalhoAtividades}>
              <View>
                <Text style={styles.kicker}>ACOMPANHAR</Text>
                <Text style={styles.tituloAtividades}>Atividades</Text>
              </View>
              <Text style={styles.contadorAtividades}>{activities.length} atividades</Text>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={openActivityModal}
              style={({ pressed }) => [styles.novaAtividadeButton, pressed && styles.novaAtividadeButtonPressed]}
            >
              <Text style={styles.novaAtividadeIcone}>+</Text>
              <View>
                <Text style={styles.novaAtividadeLabel}>NOVA ATIVIDADE</Text>
                <Text style={styles.novaAtividadeTexto}>Criar uma checklist</Text>
              </View>
              <Text style={styles.novaAtividadeSeta}>{'>'}</Text>
            </Pressable>

            <View style={styles.listaAtividades}>
              {activities.map((activity, activityIndex) => {
                const completedCount = activity.resources.filter((resource) => resource.current >= resource.required).length;
                const activityIsComplete = completedCount === activity.resources.length;
                const hiddenResourceCount = Math.max(activity.resources.length - 3, 0);

                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Abrir atividade ${activity.name}`}
                    key={`${activity.name}-${activityIndex}`}
                    onPress={() => undefined}
                    style={({ pressed }) => [styles.surface, styles.cartaoAtividade, pressed && styles.cartaoAtividadePressionado]}
                  >
                    <View style={styles.cabecalhoCartaoAtividade}>
                      <View>
                        <Text style={styles.nomeAtividade}>{activity.name}</Text>
                        <Text style={styles.categoriaAtividade}>{activity.category}</Text>
                      </View>
                      <View style={[styles.statusAtividade, activityIsComplete ? styles.statusAtividadeCompleta : styles.statusAtividadePendente]}>
                        <Text style={[styles.textoStatusAtividade, activityIsComplete ? styles.textoStatusAtividadeCompleta : styles.textoStatusAtividadePendente]}>
                          {activityIsComplete ? 'CONCLUIDA' : 'PENDENTE'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.listaRecursosAtividade}>
                      {activity.resources.slice(0, 3).map((resource) => {
                        const isComplete = resource.current >= resource.required;

                        return (
                          <View
                            key={resource.name}
                            style={styles.linhaRecursoAtividade}
                          >
                            <View style={[styles.caixaRecursoAtividade, isComplete && styles.caixaRecursoAtividadeCompleta]}>
                              {isComplete && <Text style={styles.marcaRecursoAtividade}>✓</Text>}
                            </View>
                            <Text style={[styles.nomeRecursoAtividade, isComplete && styles.nomeRecursoAtividadeCompleto]}>
                              {resource.name}
                            </Text>
                            <Text style={[styles.quantidadeRecursoAtividade, isComplete && styles.quantidadeRecursoAtividadeCompleta]}>
                              {resource.current}/{resource.required}
                            </Text>
                          </View>
                        );
                      })}
                      {hiddenResourceCount > 0 && (
                        <Text style={styles.maisRecursosAtividade}>+ {hiddenResourceCount} recurso{hiddenResourceCount > 1 ? 's' : ''}</Text>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
            <Modal
              animationType="fade"
              transparent
              visible={activityModalVisible}
              onRequestClose={() => closeActivityModal()}
            >
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalTeclado}>
                <View style={styles.modalFundo}>
                  <View style={styles.modalCategoria}>
                    <Text style={styles.modalCategoriaTitulo}>Nova atividade</Text>
                    <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} style={styles.modalAtividadeConteudo}>
                      <TextInput accessibilityLabel="Nome da atividade" autoFocus maxLength={32} onChangeText={setActivityName} placeholder="Nome da atividade" placeholderTextColor="#B8B4C6" style={styles.modalCategoriaCampo} value={activityName} />
                      <Pressable accessibilityRole="button" accessibilityState={{ expanded: activityCategoryDropdownOpen }} onPress={() => setActivityCategoryDropdownOpen((isOpen) => !isOpen)} style={({ pressed }) => [styles.modalRecursoSeletor, pressed && styles.botaoPressionado]}>
                        <Text style={styles.modalRecursoSeletorTexto}>{activityCategory || 'Escolha uma categoria'}</Text>
                        <Text style={styles.modalRecursoSeletorSeta}>{activityCategoryDropdownOpen ? '^' : 'v'}</Text>
                      </Pressable>
                      {activityCategoryDropdownOpen && (
                        <View style={styles.modalRecursoOpcoes}>
                          {resourceCategoryOptions.map((category) => (
                            <Pressable accessibilityRole="button" key={category} onPress={() => changeActivityCategory(category)} style={({ pressed }) => [styles.modalRecursoOpcao, pressed && styles.botaoPressionado]}>
                              <Text style={styles.modalRecursoOpcaoTexto}>{category}</Text>
                            </Pressable>
                          ))}
                        </View>
                      )}
                      <View style={styles.modalAtividadeLinhaEntrada}>
                        <Pressable accessibilityRole="button" accessibilityState={{ expanded: activityResourceDropdownOpen }} onPress={() => setActivityResourceDropdownOpen((isOpen) => !isOpen)} style={({ pressed }) => [styles.modalRecursoSeletor, styles.modalAtividadeSeletorRecurso, pressed && styles.botaoPressionado]}>
                          <Text style={styles.modalRecursoSeletorTexto} numberOfLines={1}>{activityResourceName || 'Escolha o recurso'}</Text>
                          <Text style={styles.modalRecursoSeletorSeta}>{activityResourceDropdownOpen ? '^' : 'v'}</Text>
                        </Pressable>
                        <TextInput accessibilityLabel="Quantidade necessária" keyboardType="numeric" maxLength={9} onChangeText={(value) => setActivityResourceQuantity(value.replace(/[^0-9]/g, ''))} placeholder="Qtd." placeholderTextColor="#B8B4C6" style={styles.modalAtividadeQuantidade} value={activityResourceQuantity} />
                      </View>
                      {activityResourceDropdownOpen && (
                        <View style={styles.modalRecursoOpcoes}>
                          {activityResourceOptions.map((resource) => (
                            <Pressable accessibilityRole="button" key={resource.id} onPress={() => { setActivityResourceName(resource.name); setActivityResourceDropdownOpen(false); }} style={({ pressed }) => [styles.modalRecursoOpcao, pressed && styles.botaoPressionado]}>
                              <Text style={styles.modalRecursoOpcaoTexto}>{resource.name}</Text>
                            </Pressable>
                          ))}
                          {activityResourceOptions.length === 0 && <Text style={styles.modalAtividadeVazio}>Todos os recursos desta categoria já foram adicionados.</Text>}
                        </View>
                      )}
                      <Pressable accessibilityRole="button" disabled={activityResourceName.length === 0 || activityResourceQuantity.length === 0} onPress={addActivityResource} style={({ pressed }) => [styles.toolbarBotao, styles.modalAtividadeAdicionar, (activityResourceName.length === 0 || activityResourceQuantity.length === 0) && styles.toolbarBotaoDisable, pressed && styles.botaoPressionado]}>
                        <Text style={styles.toolbarIcone}>+</Text>
                        <Text style={styles.toolbarRotulo}>Adicionar recurso</Text>
                      </Pressable>
                      {selectedActivityResources.length > 0 && (
                        <View style={styles.modalAtividadeSelecionados}>
                          {selectedActivityResources.map((resource) => (
                            <View key={resource.name} style={styles.recursoRow}>
                              <Text style={styles.recursoNome}>{resource.name}</Text>
                              <Text style={styles.recursoQuantidade}>x{resource.required}</Text>
                              <Pressable accessibilityRole="button" accessibilityLabel={`Remover ${resource.name}`} onPress={() => setSelectedActivityResources((currentResources) => currentResources.filter((item) => item.name !== resource.name))} style={({ pressed }) => [styles.recursoBotaoIcone, pressed && styles.botaoPressionado]}>
                                <Text style={styles.recursoTextoBotao}>&#10005;</Text>
                              </Pressable>
                            </View>
                          ))}
                        </View>
                      )}
                    </ScrollView>
                    <View style={styles.modalCategoriaAcoes}>
                      <Pressable accessibilityRole="button" onPress={() => closeActivityModal()} style={({ pressed }) => [styles.modalCategoriaBotao, pressed && styles.botaoPressionado]}>
                        <Text style={styles.novaAtividadeTexto}>Cancelar</Text>
                      </Pressable>
                      <Pressable accessibilityRole="button" disabled={activityName.trim().length === 0 || activityCategory.length === 0 || selectedActivityResources.length === 0} onPress={saveActivity} style={({ pressed }) => [styles.modalCategoriaBotao, (activityName.trim().length === 0 || activityCategory.length === 0 || selectedActivityResources.length === 0) && styles.toolbarBotaoDisable, pressed && styles.botaoPressionado]}>
                        <Text style={styles.novaAtividadeTexto}>Salvar</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </Modal>
          </ScrollView>
          <FloatingHomeButton navigation={navigation} />
        </SafeAreaView>
      );
    }

    if (screen === 'setup') {
      return (
        <SafeAreaView style={styles.safeArea}>
          <StatusBar style="light" />
          <ScrollView contentContainerStyle={[styles.screenContainer, styles.setupContainer]} showsVerticalScrollIndicator={false}>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [styles.backBotao, pressed && styles.botaoPressionado]}
            >
              <Text style={styles.backBotaoTexto}>{'<'} Voltar</Text>
            </Pressable>

            <View style={styles.setupHeader}>
              <Text style={styles.kicker}>ORGANIZAR JOGO</Text>
              <Text style={styles.setupTitulo}>Categorias e recursos</Text>
            </View>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.categoriaTitulo}>Categorias</Text>
                <Text style={styles.categoriaDica}>Selecione uma categoria para gerenciar</Text>
              </View>
              <Text style={styles.pageLabel}>{categoryPage + 1} / {categoryPages.length}</Text>
            </View>

            <View style={[styles.surface, styles.categoriaBox]}>
              <View
                {...categorySwipeResponder.panHandlers}
                onLayout={(event) => {
                  const width = event.nativeEvent.layout.width;
                  setCategoryBoxWidth(width);
                  categoryTrackX.setValue(-categoryPageRef.current * width);
                }}
                style={styles.categoriaViewport}
              >
                <Animated.View style={[styles.categoriaTrack, { transform: [{ translateX: categoryTrackX }] }]}>
                  {categoryPages.map((categories, pageIndex) => (
                    <View key={`category-page-${pageIndex}`} style={[styles.categoriaPagina, { width: categoryBoxWidth || '100%' }]}>
                      <View style={styles.categoriaGrid}>
                        {categories.map((category) => {
                          const isSelected = selectedCategory === category;

                          return (
                            <Pressable
                              accessibilityRole="button"
                              accessibilityState={{ selected: isSelected }}
                              key={category}
                              onPress={() => setSelectedCategory(isSelected ? null : category)}
                              style={({ pressed }) => [
                                styles.categoriaItem,
                                isSelected && styles.categoriaItemSelected,
                                pressed && styles.categoriaItemPressed,
                              ]}
                            >
                              <Text style={[styles.categoriaItemTexto, isSelected && styles.categoriaItemTextoSelected]}>
                                {category}
                              </Text>
                              <View style={[styles.categoriaRadio, isSelected && styles.categoriaRadioSelected]}>
                                {isSelected && <View style={styles.categoriaRadioDot} />}
                              </View>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  ))}
                </Animated.View>
              </View>

              <View style={styles.categoriaToolbar}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => openCategoryModal('add')}
                  style={({ pressed }) => [styles.toolbarBotao, pressed && styles.botaoPressionado]}
                >
                  <Text style={styles.toolbarIcone}>+</Text>
                  <Text style={styles.toolbarRotulo}>Adicionar</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: selectedCategory === null }}
                  disabled={selectedCategory === null}
                  onPress={() => openCategoryModal('edit')}
                  style={({ pressed }) => [
                    styles.toolbarBotao,
                    selectedCategory === null && styles.toolbarBotaoDisable,
                    pressed && styles.botaoPressionado,
                  ]}
                >
                  <Text style={styles.toolbarIcone}>&#x270E;</Text>
                  <Text style={styles.toolbarRotulo}>Editar</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: selectedCategory === null }}
                  disabled={selectedCategory === null}
                  onPress={() => setSelectedCategory(null)}
                  style={({ pressed }) => [
                    styles.toolbarBotao,
                    selectedCategory === null && styles.toolbarBotaoDisable,
                    pressed && styles.botaoPressionado,
                  ]}
                >
                  <Text style={styles.toolbarIcone}>&#10005;</Text>
                  <Text style={styles.toolbarRotulo}>Excluir</Text>
                </Pressable>
                <View style={styles.toolbarDivider} />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Pagina anterior"
                  accessibilityState={{ disabled: categoryPage === 0 }}
                  disabled={categoryPage === 0}
                  onPress={() => animateToCategoryPage(Math.max(categoryPage - 1, 0))}
                  style={({ pressed }) => [
                    styles.pageBotao,
                    categoryPage === 0 && styles.toolbarBotaoDisable,
                    pressed && styles.botaoPressionado,
                  ]}
                >
                    <Text style={styles.pageSeta}>{'<<'}</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Proxima pagina"
                  accessibilityState={{ disabled: categoryPage === categoryPages.length - 1 }}
                  disabled={categoryPage === categoryPages.length - 1}
                  onPress={() => animateToCategoryPage(Math.min(categoryPage + 1, categoryPages.length - 1))}
                  style={({ pressed }) => [
                    styles.pageBotao,
                    categoryPage === categoryPages.length - 1 && styles.toolbarBotaoDisable,
                    pressed && styles.botaoPressionado,
                  ]}
                >
                  <Text style={styles.pageSeta}>{'>>'}</Text>
                </Pressable>
              </View>
            </View>

            <View style={[styles.sectionHeader, styles.sectionHeaderSpaced]}>
              <View>
                <Text style={styles.categoriaTitulo}>Recursos</Text>
                <Text style={styles.categoriaDica}>
                  {selectedCategory === null ? 'Todos os recursos' : `Recursos de ${selectedCategory}`}
                </Text>
              </View>
              <Text style={styles.pageLabel}>{visibleResources.length} itens</Text>
            </View>

            <View style={[styles.surface, styles.recursoBox]}>
              <View style={styles.recursoToolbar}>
                <View style={styles.recursoToolbarAcao}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => openResourceModal('add')}
                    style={({ pressed }) => [styles.recursoAcaoBotao, pressed && styles.botaoPressionado]}
                  >
                    <Text style={styles.toolbarIcone}>+</Text>
                    <Text style={styles.toolbarRotulo}>Adicionar</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => undefined}
                    style={({ pressed }) => [styles.recursoAcaoBotao, pressed && styles.botaoPressionado]}
                  >
                    <Text style={styles.toolbarIcone}>&#10005;</Text>
                    <Text style={styles.toolbarRotulo}>Limpar</Text>
                  </Pressable>
                </View>
              </View>

              <ScrollView
                accessibilityLabel="Lista de recursos"
                nestedScrollEnabled
                showsVerticalScrollIndicator
                style={styles.recursoLista}
              >
                {visibleResources.map((resource) => (
                  <View key={resource.id} style={styles.recursoRow}>
                    <View style={styles.recursoIdentidade}>
                      <View style={[styles.iconeRecursoBase, styles.recursoIcone]}>
                        <Text style={styles.recursoTextoIcone}>{resource.icon}</Text>
                      </View>
                      <Text style={styles.recursoNome}>{resource.name}</Text>
                    </View>
                    <Text style={styles.recursoQuantidade}>{resource.quantity}</Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Editar ${resource.name}`}
                      onPress={() => openResourceModal('edit', resource)}
                      style={({ pressed }) => [styles.recursoBotaoIcone, pressed && styles.botaoPressionado]}
                    >
                      <Text style={styles.recursoTextoBotao}>&#x270E;</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Excluir ${resource.name}`}
                      onPress={() => undefined}
                      style={({ pressed }) => [styles.recursoBotaoIcone, pressed && styles.botaoPressionado]}
                    >
                      <Text style={styles.recursoTextoBotao}>&#10005;</Text>
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            </View>

            <Modal
              animationType="fade"
              transparent
              visible={categoryModalVisible}
              onRequestClose={() => closeCategoryModal()}
            >
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalTeclado}
              >
                <View style={styles.modalFundo}>
                  <View style={styles.modalCategoria}>
                    <Text style={styles.modalCategoriaTitulo}>
                      {categoryModalMode === 'edit' ? 'Editar categoria' : 'Nova categoria'}
                    </Text>
                    <TextInput
                      accessibilityLabel="Nome da categoria"
                      autoFocus
                      maxLength={32}
                      onChangeText={setCategoryName}
                      onSubmitEditing={saveCategory}
                      placeholder="Nome da categoria"
                      placeholderTextColor="#B8B4C6"
                      returnKeyType="done"
                      style={styles.modalCategoriaCampo}
                      value={categoryName}
                    />
                    <View style={styles.modalCategoriaAcoes}>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => closeCategoryModal()}
                        style={({ pressed }) => [styles.modalCategoriaBotao, pressed && styles.botaoPressionado]}
                      >
                        <Text style={styles.novaAtividadeTexto}>Cancelar</Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        disabled={categoryName.trim().length === 0}
                        onPress={saveCategory}
                        style={({ pressed }) => [
                          styles.modalCategoriaBotao,
                          categoryName.trim().length === 0 && styles.toolbarBotaoDisable,
                          pressed && styles.botaoPressionado,
                        ]}
                      >
                        <Text style={styles.novaAtividadeTexto}>Salvar</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </Modal>

            <Modal
              animationType="fade"
              transparent
              visible={resourceModalVisible}
              onRequestClose={() => closeResourceModal()}
            >
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalTeclado}
              >
                <View style={styles.modalFundo}>
                  <View style={styles.modalCategoria}>
                    <Text style={styles.modalCategoriaTitulo}>
                      {resourceModalMode === 'edit' ? 'Editar recurso' : 'Novo recurso'}
                    </Text>
                    <TextInput
                      accessibilityLabel="Nome do recurso"
                      autoFocus
                      maxLength={32}
                      onChangeText={setResourceName}
                      placeholder="Nome do recurso"
                      placeholderTextColor="#B8B4C6"
                      style={styles.modalCategoriaCampo}
                      value={resourceName}
                    />
                    <TextInput
                      accessibilityLabel="Quantidade do recurso"
                      keyboardType="numeric"
                      maxLength={9}
                      onChangeText={(value) => setResourceQuantity(value.replace(/[^0-9]/g, ''))}
                      placeholder="Quantidade"
                      placeholderTextColor="#B8B4C6"
                      style={[styles.modalCategoriaCampo, styles.modalRecursoQuantidadeCampo]}
                      value={resourceQuantity}
                    />
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ expanded: resourceDropdownOpen }}
                      onPress={() => setResourceDropdownOpen((isOpen) => !isOpen)}
                      style={({ pressed }) => [styles.modalRecursoSeletor, pressed && styles.botaoPressionado]}
                    >
                      <Text style={styles.modalRecursoSeletorTexto}>
                        {resourceCategory || 'Escolha uma categoria'}
                      </Text>
                      <Text style={styles.modalRecursoSeletorSeta}>{resourceDropdownOpen ? '^' : 'v'}</Text>
                    </Pressable>
                    {resourceDropdownOpen && (
                      <ScrollView style={styles.modalRecursoOpcoes} nestedScrollEnabled>
                        {resourceCategoryOptions.map((category) => (
                          <Pressable
                            accessibilityRole="button"
                            key={category}
                            onPress={() => {
                              setResourceCategory(category);
                              setResourceDropdownOpen(false);
                            }}
                            style={({ pressed }) => [styles.modalRecursoOpcao, pressed && styles.botaoPressionado]}
                          >
                            <Text style={styles.modalRecursoOpcaoTexto}>{category}</Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    )}
                    <View style={styles.modalCategoriaAcoes}>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => closeResourceModal()}
                        style={({ pressed }) => [styles.modalCategoriaBotao, pressed && styles.botaoPressionado]}
                      >
                        <Text style={styles.novaAtividadeTexto}>Cancelar</Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        disabled={resourceName.trim().length === 0 || resourceQuantity.trim().length === 0 || resourceCategory.length === 0}
                        onPress={saveResource}
                        style={({ pressed }) => [
                          styles.modalCategoriaBotao,
                          (resourceName.trim().length === 0 || resourceQuantity.trim().length === 0 || resourceCategory.length === 0) && styles.toolbarBotaoDisable,
                          pressed && styles.botaoPressionado,
                        ]}
                      >
                        <Text style={styles.novaAtividadeTexto}>Salvar</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </Modal>

          </ScrollView>
          {feedback !== null && (
            <View style={[styles.feedbackPopup, feedback.tipo === 'sucesso' ? styles.feedbackPopupSucesso : styles.feedbackPopupCancelado]}>
              <Text style={styles.feedbackPopupTexto}>{feedback.mensagem}</Text>
            </View>
          )}
          <FloatingHomeButton navigation={navigation} />
        </SafeAreaView>
      );
    }

    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoMark}>
            <Text style={styles.logoText}>FH</Text>
          </View>
          <Text style={styles.headerLabel}>FARM HELPER</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.kicker}>BEM-VINDO AO</Text>
          <Text style={styles.titulo}>Farm{ '\n' }Helper</Text>
          <Text style={styles.subtitulo}>
            Transforme recursos espalhados em um plano claro para suas proximas conquistas.
          </Text>
        </View>

        <Text style={styles.sectionTitulo}>O que voce quer fazer?</Text>
        <View style={styles.actions}>
          {actions.map((action) => (
            <Pressable
              accessibilityRole="button"
              key={action.screen}
              onPress={() => navigation.navigate(action.screen)}
              style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
            >
              <View style={styles.actionIcone}>
                <Text style={styles.actionTextoIcone}>{action.icon}</Text>
              </View>
              <View style={styles.actionConteudo}>
                <Text style={styles.actionEyebrow}>{action.eyebrow}</Text>
                <Text style={styles.actionTitulo}>{action.titulo}</Text>
                <Text style={styles.actionDescricao}>{action.description}</Text>
              </View>
              <Text style={styles.actionSeta}>{'->'}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.footerNote}>Dados salvos local no dispositivo.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function FloatingHomeButton({
  navigation,
}: {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}) {
  return (
    <Pressable
      accessibilityLabel="Voltar para a tela principal"
      accessibilityRole="button"
      onPress={() => navigation.reset({ index: 0, routes: [{ name: 'home' }] })}
      style={({ pressed }) => [styles.floatingBotaoCasa, pressed && styles.floatingBotaoCasaPressed]}
    >
      <Text style={styles.floatingIconeCasa}>⌂</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#17171C',
  },
  screenContainer: {
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  surface: {
    backgroundColor: '#24242D',
    borderColor: '#393544',
    borderRadius: 16,
    borderWidth: 1,
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  logoMark: {
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    transform: [{ rotate: '-6deg' }],
    width: 48,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  headerLabel: {
    color: '#A7A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  hero: {
    paddingTop: 58,
    paddingBottom: 34,
  },
  kicker: {
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
  sectionTitulo: {
    color: '#F5F3FF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
    marginTop: 36,
  },
  actions: {
    gap: 12,
  },
  actionCard: {
    alignItems: 'center',
    backgroundColor: '#24242D',
    borderColor: '#393544',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 104,
    padding: 16,
  },
  actionCardPressed: {
    backgroundColor: '#302846',
    transform: [{ scale: 0.985 }],
  },
  actionIcone: {
    alignItems: 'center',
    backgroundColor: '#3A2D5D',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    marginRight: 14,
    width: 48,
  },
  actionTextoIcone: {
    color: '#C4B5FD',
    fontSize: 24,
    fontWeight: '700',
  },
  actionConteudo: {
    flex: 1,
  },
  actionEyebrow: {
    color: '#A78BFA',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  actionTitulo: {
    color: '#F5F3FF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  actionDescricao: {
    color: '#AAA6BA',
    fontSize: 12,
    lineHeight: 17,
  },
  actionSeta: {
    color: '#A78BFA',
    fontSize: 17,
    fontWeight: '800',
    marginLeft: 8,
  },
  footerNote: {
    color: '#777386',
    fontSize: 11,
    marginTop: 28,
    textAlign: 'center',
  },
  tutorialContainer: {
    paddingBottom: 42,
  },
  tutorialHeader: {
    paddingBottom: 30,
    paddingTop: 42,
  },
  tutorialTitulo: {
    color: '#F5F3FF',
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 39,
  },
  tutorialIntroducao: {
    color: '#B8B4C6',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 14,
  },
  tutorialFluxo: {
    paddingLeft: 2,
  },
  tutorialEtapa: {
    flexDirection: 'row',
  },
  tutorialNumeroEtapa: {
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 15,
    height: 30,
    justifyContent: 'center',
    marginRight: 12,
    width: 30,
  },
  tutorialNumeroEtapaTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  tutorialConteudoEtapa: {
    flex: 1,
    minWidth: 0,
  },
  tutorialTituloEtapa: {
    color: '#F5F3FF',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 7,
  },
  tutorialDescricaoEtapa: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 19,
  },
  tutorialConector: {
    backgroundColor: '#4B4265',
    height: 28,
    marginLeft: 15,
    width: 1,
  },
  tutorialExemploCategoria: {
    borderRadius: 12,
    marginTop: 14,
    padding: 12,
  },
  tutorialRotuloExemplo: {
    color: '#A78BFA',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 9,
  },
  tutorialGradeCategoria: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  tutorialEtiquetaCategoria: {
    backgroundColor: '#3A2D5D',
    borderColor: '#55427D',
    borderRadius: 7,
    borderWidth: 1,
    flexBasis: '46%',
    flexGrow: 1,
    paddingHorizontal: 9,
    paddingVertical: 8,
  },
  tutorialTextoEtiquetaCategoria: {
    color: '#DDD1FF',
    fontSize: 11,
    fontWeight: '800',
  },
  tutorialExemploRecurso: {
    borderRadius: 12,
    marginTop: 14,
    paddingHorizontal: 10,
  },
  tutorialLinhaRecurso: {
    alignItems: 'center',
    borderBottomColor: '#393544',
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 48,
  },
  iconeRecursoBase: {
    alignItems: 'center',
    backgroundColor: '#3A2D5D',
    borderRadius: 8,
    justifyContent: 'center',
  },
  tutorialIconeRecurso: {
    height: 26,
    marginRight: 9,
    width: 26,
  },
  tutorialTextoIconeRecurso: {
    color: '#C4B5FD',
    fontSize: 13,
    fontWeight: '900',
  },
  tutorialNomeRecurso: {
    color: '#F5F3FF',
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
  },
  tutorialQuantidadeRecurso: {
    color: '#A78BFA',
    fontSize: 12,
    fontWeight: '900',
  },
  tutorialExemploAtividade: {
    borderRadius: 12,
    marginTop: 14,
    paddingHorizontal: 12,
  },
  tutorialCabecalhoAtividade: {
    alignItems: 'center',
    borderBottomColor: '#393544',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 43,
  },
  tutorialNomeAtividade: {
    color: '#F5F3FF',
    fontSize: 12,
    fontWeight: '900',
  },
  tutorialStatusAtividade: {
    backgroundColor: '#991B1B',
    borderRadius: 5,
    color: '#FEE2E2',
    fontSize: 8,
    fontWeight: '900',
    paddingHorizontal: 6,
    paddingVertical: 5,
  },
  tutorialLinhaChecklist: {
    alignItems: 'center',
    borderBottomColor: '#393544',
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 37,
  },
  tutorialCaixaChecklist: {
    borderColor: '#817B91',
    borderRadius: 4,
    borderWidth: 2,
    height: 16,
    marginRight: 8,
    width: 16,
  },
  tutorialCaixaChecklistConcluida: {
    alignItems: 'center',
    backgroundColor: '#34D399',
    borderColor: '#34D399',
    justifyContent: 'center',
  },
  tutorialMarcaChecklist: {
    color: '#17231F',
    fontSize: 11,
    fontWeight: '900',
  },
  tutorialTextoChecklist: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
  },
  tutorialTextoChecklistConcluido: {
    color: '#7FBAA6',
    textDecorationLine: 'line-through',
  },
  tutorialQuantidadeChecklist: {
    color: '#F5F3FF',
    fontSize: 11,
    fontWeight: '900',
  },
  tutorialQuantidadeChecklistConcluida: {
    color: '#34D399',
  },
  tutorialTip: {
    alignItems: 'center',
    backgroundColor: '#28233A',
    borderColor: '#493B6D',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 30,
    padding: 13,
  },
  tutorialIconeDica: {
    alignItems: 'center',
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
  tutorialTextoDica: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  containerAtividades: {
    paddingBottom: 40,
  },
  cabecalhoAtividades: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  novaAtividadeButton: {
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 14,
    flexDirection: 'row',
    minHeight: 76,
    paddingHorizontal: 18,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 5,
  },
  novaAtividadeButtonPressed: {
    backgroundColor: '#7546DA',
    transform: [{ scale: 0.985 }],
  },
  novaAtividadeIcone: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '300',
    marginRight: 14,
  },
  novaAtividadeLabel: {
    color: '#EDE9FE',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 3,
  },
  novaAtividadeTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  novaAtividadeSeta: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginLeft: 'auto',
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
    alignItems: 'center',
    borderBottomColor: '#393544',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  statusAtividade: {
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  statusAtividadePendente: {
    backgroundColor: '#991B1B',
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  statusAtividadeCompleta: {
    backgroundColor: '#166534',
    borderColor: '#4ADE80',
    borderWidth: 1,
  },
  textoStatusAtividade: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  textoStatusAtividadePendente: {
    color: '#FEE2E2',
  },
  textoStatusAtividadeCompleta: {
    color: '#DCFCE7',
  },
  listaRecursosAtividade: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  linhaRecursoAtividade: {
    alignItems: 'center',
    borderBottomColor: '#393544',
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 42,
    paddingHorizontal: 4,
  },
  caixaRecursoAtividade: {
    alignItems: 'center',
    borderColor: '#817B91',
    borderRadius: 5,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
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
  nomeRecursoAtividadeCompleto: {
    color: '#7FBAA6',
    textDecorationLine: 'line-through',
  },
  quantidadeRecursoAtividade: {
    color: '#F5F3FF',
    fontSize: 13,
    fontWeight: '900',
    minWidth: 44,
    textAlign: 'right',
  },
  quantidadeRecursoAtividadeCompleta: {
    color: '#34D399',
  },
  maisRecursosAtividade: {
    color: '#A78BFA',
    fontSize: 11,
    fontWeight: '800',
    paddingTop: 8,
    textAlign: 'center',
  },
  setupContainer: {
    paddingBottom: 40,
  },
  setupHeader: {
    paddingBottom: 30,
    paddingTop: 42,
  },
  setupTitulo: {
    color: '#F5F3FF',
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 37,
  },
  sectionHeader: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionHeaderSpaced: {
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
  pageLabel: {
    color: '#A78BFA',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  categoriaBox: {
    overflow: 'hidden',
  },
  categoriaViewport: {
    overflow: 'hidden',
  },
  categoriaTrack: {
    flexDirection: 'row',
  },
  categoriaPagina: {
    flexShrink: 0,
  },
  categoriaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    padding: 12,
  },
  categoriaItem: {
    alignItems: 'center',
    backgroundColor: '#2E2D38',
    borderColor: '#454151',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    height: 52,
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    flexBasis: '45%',
    flexGrow: 1,
    flexShrink: 1,
  },
  categoriaItemSelected: {
    backgroundColor: '#3A2D5D',
    borderColor: '#A78BFA',
  },
  categoriaItemPressed: {
    opacity: 0.78,
  },
  categoriaItemTexto: {
    color: '#F5F3FF',
    fontSize: 13,
    fontWeight: '800',
  },
  categoriaItemTextoSelected: {
    color: '#DDD1FF',
  },
  categoriaRadio: {
    alignItems: 'center',
    borderColor: '#817B91',
    borderRadius: 9,
    borderWidth: 2,
    height: 18,
    justifyContent: 'center',
    width: 18,
  },
  categoriaRadioSelected: {
    borderColor: '#C4B5FD',
  },
  categoriaRadioDot: {
    backgroundColor: '#C4B5FD',
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  categoriaToolbar: {
    alignItems: 'center',
    borderColor: '#393544',
    borderTopWidth: 1,
    flexDirection: 'row',
    minHeight: 64,
    paddingHorizontal: 10,
  },
  toolbarBotao: {
    alignItems: 'center',
    borderColor: '#5B4A82',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexShrink: 1,
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  toolbarBotaoDisable: {
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
  toolbarDivider: {
    backgroundColor: '#454151',
    height: 28,
    marginHorizontal: 8,
    width: 1,
  },
  pageBotao: {
    alignItems: 'center',
    borderColor: '#5B4A82',
    borderRadius: 8,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 38,
  },
  pageSeta: {
    color: '#C4B5FD',
    fontSize: 25,
    fontWeight: '700',
  },
  recursoBox: {
    overflow: 'hidden',
  },
  recursoToolbar: {
    alignItems: 'center',
    borderBottomColor: '#393544',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  recursoToolbarAcao: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
  },
  recursoAcaoBotao: {
    alignItems: 'center',
    borderColor: '#5B4A82',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  recursoLista: {
    maxHeight: 360,
  },
  recursoRow: {
    alignItems: 'center',
    borderBottomColor: '#393544',
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 58,
    paddingHorizontal: 12,
  },
  recursoIdentidade: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    minWidth: 0,
  },
  recursoIcone: {
    height: 32,
    marginRight: 10,
    width: 32,
  },
  recursoTextoIcone: {
    color: '#C4B5FD',
    fontSize: 16,
    fontWeight: '800',
  },
  recursoNome: {
    color: '#F5F3FF',
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '800',
  },
  recursoQuantidade: {
    color: '#B8B4C6',
    fontSize: 13,
    fontWeight: '800',
    marginHorizontal: 8,
    minWidth: 34,
    textAlign: 'right',
  },
  recursoBotaoIcone: {
    alignItems: 'center',
    borderColor: '#5B4A82',
    borderRadius: 8,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 34,
  },
  recursoTextoBotao: {
    color: '#C4B5FD',
    fontSize: 17,
    fontWeight: '700',
  },
  backBotao: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
  },
  backBotaoTexto: {
    color: '#A78BFA',
    fontSize: 15,
    fontWeight: '800',
  },
  botaoPressionado: {
    backgroundColor: '#302846',
    borderColor: '#A78BFA',
    transform: [{ scale: 0.96 }],
  },
  modalTeclado: {
    flex: 1,
  },
  modalFundo: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.68)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalCategoria: {
    backgroundColor: '#24242D',
    borderColor: '#5B4A82',
    borderRadius: 16,
    borderWidth: 1,
    maxWidth: 420,
    padding: 18,
    width: '100%',
  },
  modalCategoriaTitulo: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 14,
  },
  modalCategoriaCampo: {
    backgroundColor: '#17171C',
    borderColor: '#817B91',
    borderRadius: 10,
    borderWidth: 1,
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  modalRecursoQuantidadeCampo: {
    marginTop: 10,
  },
  modalCategoriaAcoes: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modalCategoriaBotao: {
    alignItems: 'center',
    backgroundColor: '#24242D',
    borderColor: '#5B4A82',
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 12,
  },
  modalAtividadeConteudo: {
    maxHeight: 360,
  },
  modalAtividadeLinhaEntrada: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  modalAtividadeSeletorRecurso: {
    flex: 1,
    marginTop: 0,
  },
  modalAtividadeQuantidade: {
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
  modalAtividadeAdicionar: {
    justifyContent: 'center',
    marginTop: 10,
  },
  modalAtividadeSelecionados: {
    backgroundColor: '#17171C',
    borderColor: '#393544',
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 12,
    overflow: 'hidden',
  },
  modalAtividadeVazio: {
    color: '#FFFFFF',
    fontSize: 12,
    padding: 12,
  },
  modalRecursoSeletor: {
    alignItems: 'center',
    backgroundColor: '#24242D',
    borderColor: '#5B4A82',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  modalRecursoSeletorTexto: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  modalRecursoSeletorSeta: {
    color: '#C4B5FD',
    fontSize: 18,
    fontWeight: '900',
    marginLeft: 10,
  },
  modalRecursoOpcoes: {
    backgroundColor: '#17171C',
    borderColor: '#5B4A82',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 6,
    maxHeight: 150,
  },
  modalRecursoOpcao: {
    borderBottomColor: '#393544',
    borderBottomWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  modalRecursoOpcaoTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  feedbackPopup: {
    alignSelf: 'center',
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
  feedbackPopupSucesso: {
    backgroundColor: '#166534',
    borderColor: '#4ADE80',
  },
  feedbackPopupCancelado: {
    backgroundColor: '#991B1B',
    borderColor: '#EF4444',
  },
  feedbackPopupTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  floatingBotaoCasa: {
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    borderColor: '#C4B5FD',
    borderRadius: 28,
    borderWidth: 1,
    bottom: 72,
    elevation: 8,
    height: 56,
    justifyContent: 'center',
    left: 20,
    position: 'absolute',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    width: 56,
  },
  floatingBotaoCasaPressed: {
    backgroundColor: '#7546DA',
    transform: [{ scale: 0.94 }],
  },
  floatingIconeCasa: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 32,
  },
});
