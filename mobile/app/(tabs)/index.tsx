import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, RefreshControl, TouchableOpacity,
  Animated, Dimensions, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ShoppingCart, CheckCircle, AlertCircle, Target,
  Coffee, DollarSign, ChevronRight, TrendingUp,
  Zap, Heart
} from 'lucide-react-native';
import { itensService, Item } from '../../src/services/itensService';
import { categoriasService, Categoria } from '../../src/services/categoriasService';
import { useAuth } from '../../src/context/AuthContext';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Skeleton, SkeletonCard } from '../../src/components/ui/SkeletonLoader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

// ─── Animated Stat Card ───────────────────────────────────────
function DashCard({
  iconBg, icon, label, value, subValue, delay = 0, accent,
}: {
  iconBg: string; icon: React.ReactNode; label: string; value: string;
  subValue?: string; delay?: number; accent?: string;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(18)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(anim, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: anim, transform: [{ translateY: slide }], flex: 1 }}>
      <View style={{
        backgroundColor: '#27272A', borderRadius: 24, padding: 16,
        borderWidth: 1, borderColor: '#3F3F46',
        ...(accent ? { borderLeftWidth: 3, borderLeftColor: accent } : {}),
      }}>
        <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: iconBg, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
          {icon}
        </View>
        <Text style={{ color: '#A1A1AA', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 3 }}>
          {label}
        </Text>
        <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '900', letterSpacing: -0.3 }}>
          {value}
        </Text>
        {subValue ? (
          <Text style={{ color: '#71717A', fontSize: 10, fontWeight: '600', marginTop: 2 }}>{subValue}</Text>
        ) : null}
      </View>
    </Animated.View>
  );
}

// ─── Section Title ────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '800', marginBottom: 12, letterSpacing: -0.2 }}>
      {children}
    </Text>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#18181B' }} edges={['top']}>
      <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}>
        <Skeleton width={140} height={12} borderRadius={6} style={{ marginBottom: 8 }} />
        <Skeleton width={200} height={28} borderRadius={8} style={{ marginBottom: 28 }} />
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
        <Skeleton width={160} height={16} borderRadius={8} style={{ marginBottom: 12 }} />
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Main Screen ──────────────────────────────────────────────
export default function InicioScreen() {
  const { usuario } = useAuth();
  const [itens, setItens] = useState<Item[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregarDados = async () => {
    try {
      const [its, cats] = await Promise.all([
        itensService.getAll(),
        categoriasService.listarDoUsuario(),
      ]);
      setItens(its || []);
      setCategorias((cats || []).sort((a: Categoria, b: Categoria) => (a.ordem || 0) - (b.ordem || 0)));
    } catch (e) {
      console.error('Erro dashboard:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  if (loading && !refreshing) return <LoadingSkeleton />;

  // ─── Calculations ────────────────────────────────────────────
  const calcTotal = (arr: Item[]) =>
    arr.reduce((a, i) => a + (Number(i.preco) || 0) * (Number(i.quantidade) || 0), 0);

  const totalGeral = calcTotal(itens);
  const totalPago = calcTotal(itens.filter(i => i.comprado));
  const totalFalta = totalGeral - totalPago;
  const totalVR = calcTotal(itens.filter(i => i.pagamento === 'vr'));
  const totalNormal = calcTotal(itens.filter(i => i.pagamento === 'normal'));
  const vrPago = calcTotal(itens.filter(i => i.pagamento === 'vr' && i.comprado));
  const normalPago = calcTotal(itens.filter(i => i.pagamento === 'normal' && i.comprado));
  const totalItens = itens.length;
  const totalComprados = itens.filter(i => i.comprado).length;
  const pctComprados = totalItens > 0 ? Math.round((totalComprados / totalItens) * 100) : 0;
  const pctPago = totalGeral > 0 ? (totalPago / totalGeral) * 100 : 0;
  const urgenciaFalta = calcTotal(itens.filter(i => i.prioridade === 'urgente' && !i.comprado));

  // Priority groups
  const prioridades = {
    urgente: { total: 0, pago: 0, falta: 0 },
    normal: { total: 0, pago: 0, falta: 0 },
    pode_esperar: { total: 0, pago: 0, falta: 0 },
  };
  itens.forEach(item => {
    const valor = (Number(item.preco) || 0) * (Number(item.quantidade) || 0);
    const p = item.prioridade;
    const key = p === 'urgente' ? 'urgente' : p === 'pode_esperar' ? 'pode_esperar' : 'normal';
    prioridades[key].total += valor;
    if (item.comprado) prioridades[key].pago += valor;
    else prioridades[key].falta += valor;
  });

  // Category stats
  const porCategoria = (categorias
    .map(cat => {
      const catItens = itens.filter(i => i.categoriaId === cat.id);
      const total = calcTotal(catItens);
      const pago = calcTotal(catItens.filter(i => i.comprado));
      return { ...cat, total, pago, qtd: catItens.length, comprados: catItens.filter(i => i.comprado).length };
    })
    .filter(c => c.qtd > 0)
    .sort((a, b) => b.total - a.total)) as (Categoria & { total: number; pago: number; qtd: number; comprados: number })[];

  const firstName = usuario?.nomeCompleto?.split(' ')[0] || 'Você';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#18181B' }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); carregarDados(); }}
            tintColor="#A78BFA"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ─────────────────────────────────── */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: '#A1A1AA', fontSize: 14, fontWeight: '500', marginBottom: 4 }}>
            Olá, {firstName}! 👋
          </Text>
          <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: '900', letterSpacing: -0.8 }}>
            Resumo do mês
          </Text>
        </View>

        {/* ── 4 Stat Cards (2x2) ─────────────────────── */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
          <DashCard
            iconBg="#A78BFA20" icon={<ShoppingCart size={16} color="#A78BFA" />}
            label="Total Planejado" value={fmt(totalGeral)} subValue={`${totalItens} itens`}
            delay={0}
          />
          <DashCard
            iconBg="#22C55E20" icon={<CheckCircle size={16} color="#22C55E" />}
            label="Já Pago" value={fmt(totalPago)} subValue={`${pctPago.toFixed(0)}% do total`}
            delay={80}
          />
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
          <DashCard
            iconBg="#EAB30820" icon={<AlertCircle size={16} color="#EAB308" />}
            label="Falta Pagar" value={fmt(totalFalta)} subValue={`${(100 - pctPago).toFixed(0)}% restante`}
            delay={160}
          />
          <DashCard
            iconBg="#3B82F620" icon={<Target size={16} color="#3B82F6" />}
            label="Progresso" value={`${pctComprados}%`} subValue={`${totalComprados}/${totalItens} itens`}
            delay={240}
          />
        </View>

        {/* ── Overall Progress Bar ────────────────────── */}
        {totalItens > 0 && (
          <View style={{ backgroundColor: '#27272A', borderRadius: 24, padding: 18, borderWidth: 1, borderColor: '#3F3F46', marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>Progresso de compras</Text>
              <Text style={{ color: '#A78BFA', fontSize: 14, fontWeight: '900' }}>{pctComprados}%</Text>
            </View>
            <ProgressBar progress={pctPago} color="#A78BFA" height={8} style={{ marginBottom: 8 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#71717A', fontSize: 11, fontWeight: '600' }}>{pctPago.toFixed(0)}% pago</Text>
              <Text style={{ color: '#71717A', fontSize: 11, fontWeight: '600' }}>{pctComprados}% itens comprados</Text>
            </View>
          </View>
        )}

        {/* ── Por tipo de pagamento ───────────────────── */}
        {totalGeral > 0 && (
          <>
            <SectionTitle>💳 Por tipo de pagamento</SectionTitle>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
              {/* VR/VA Card */}
              <View style={{ flex: 1, backgroundColor: '#27272A', borderRadius: 24, padding: 18, borderWidth: 1, borderColor: '#3F3F46', borderLeftWidth: 3, borderLeftColor: '#FBBF24' }}>
                <Coffee size={20} color="#FBBF24" style={{ marginBottom: 10 }} />
                <Text style={{ color: '#FBBF24', fontSize: 16, fontWeight: '900', marginBottom: 4 }}>{fmt(totalVR)}</Text>
                <Text style={{ color: '#A1A1AA', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>VR / VA</Text>
                <Text style={{ color: '#71717A', fontSize: 10, marginBottom: 2 }}>✅ Pago: {fmt(vrPago)}</Text>
                <Text style={{ color: '#EAB308', fontSize: 10, marginBottom: 8 }}>⚠️ Falta: {fmt(totalVR - vrPago)}</Text>
                <ProgressBar progress={totalVR > 0 ? (vrPago / totalVR) * 100 : 0} color="#FBBF24" height={4} />
              </View>
              {/* Normal Card */}
              <View style={{ flex: 1, backgroundColor: '#27272A', borderRadius: 24, padding: 18, borderWidth: 1, borderColor: '#3F3F46', borderLeftWidth: 3, borderLeftColor: '#A78BFA' }}>
                <DollarSign size={20} color="#A78BFA" style={{ marginBottom: 10 }} />
                <Text style={{ color: '#A78BFA', fontSize: 16, fontWeight: '900', marginBottom: 4 }}>{fmt(totalNormal)}</Text>
                <Text style={{ color: '#A1A1AA', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Normal</Text>
                <Text style={{ color: '#71717A', fontSize: 10, marginBottom: 2 }}>✅ Pago: {fmt(normalPago)}</Text>
                <Text style={{ color: '#EAB308', fontSize: 10, marginBottom: 8 }}>⚠️ Falta: {fmt(totalNormal - normalPago)}</Text>
                <ProgressBar progress={totalNormal > 0 ? (normalPago / totalNormal) * 100 : 0} color="#A78BFA" height={4} />
              </View>
            </View>
          </>
        )}

        {/* ── Resumo por prioridade ───────────────────── */}
        {(prioridades.urgente.total > 0 || prioridades.normal.total > 0 || prioridades.pode_esperar.total > 0) && (
          <>
            <SectionTitle>🎯 Resumo por prioridade</SectionTitle>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
              {prioridades.urgente.total > 0 && (
                <View style={{ width: (SCREEN_WIDTH - 50) / 2, backgroundColor: '#27272A', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#3F3F46' }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13, marginBottom: 4 }}>🔴 Urgente</Text>
                  <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 15, marginBottom: 4 }}>{fmt(prioridades.urgente.total)}</Text>
                  <Text style={{ color: '#71717A', fontSize: 10 }}>✅ {fmt(prioridades.urgente.pago)}</Text>
                  <Text style={{ color: '#EAB308', fontSize: 10, marginBottom: 8 }}>⚠️ {fmt(prioridades.urgente.falta)}</Text>
                  <ProgressBar progress={prioridades.urgente.total > 0 ? (prioridades.urgente.pago / prioridades.urgente.total) * 100 : 0} color="#EF4444" height={3} />
                </View>
              )}
              {prioridades.normal.total > 0 && (
                <View style={{ width: (SCREEN_WIDTH - 50) / 2, backgroundColor: '#27272A', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#3F3F46' }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13, marginBottom: 4 }}>🟡 Normal</Text>
                  <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 15, marginBottom: 4 }}>{fmt(prioridades.normal.total)}</Text>
                  <Text style={{ color: '#71717A', fontSize: 10 }}>✅ {fmt(prioridades.normal.pago)}</Text>
                  <Text style={{ color: '#EAB308', fontSize: 10, marginBottom: 8 }}>⚠️ {fmt(prioridades.normal.falta)}</Text>
                  <ProgressBar progress={prioridades.normal.total > 0 ? (prioridades.normal.pago / prioridades.normal.total) * 100 : 0} color="#A78BFA" height={3} />
                </View>
              )}
              {prioridades.pode_esperar.total > 0 && (
                <View style={{ width: (SCREEN_WIDTH - 50) / 2, backgroundColor: '#27272A', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#3F3F46' }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13, marginBottom: 4 }}>🟢 Pode esperar</Text>
                  <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 15, marginBottom: 4 }}>{fmt(prioridades.pode_esperar.total)}</Text>
                  <Text style={{ color: '#71717A', fontSize: 10 }}>✅ {fmt(prioridades.pode_esperar.pago)}</Text>
                  <Text style={{ color: '#EAB308', fontSize: 10, marginBottom: 8 }}>⚠️ {fmt(prioridades.pode_esperar.falta)}</Text>
                  <ProgressBar progress={prioridades.pode_esperar.total > 0 ? (prioridades.pode_esperar.pago / prioridades.pode_esperar.total) * 100 : 0} color="#22C55E" height={3} />
                </View>
              )}
            </View>
          </>
        )}

        {/* ── Tip Card ───────────────────────────────── */}
        {totalItens > 0 && (
          <View style={{ backgroundColor: '#A78BFA15', padding: 18, borderRadius: 24, borderWidth: 1, borderColor: '#A78BFA30', flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ fontSize: 22, marginRight: 14 }}>💡</Text>
            <Text style={{ color: '#E4E4E7', fontSize: 13, fontWeight: '500', lineHeight: 20, flex: 1 }}>
              {urgenciaFalta > 0
                ? `🎯 Foco total! Você ainda precisa de ${fmt(urgenciaFalta)} em itens URGENTES. Priorize essas compras!`
                : prioridades.normal.falta > 0
                  ? `📋 Continue organizando! Faltam ${fmt(prioridades.normal.falta)} em itens de prioridade normal.`
                  : totalFalta > 0
                    ? `👍 Bom progresso! Apenas ${fmt(totalFalta)} restante para completar tudo.`
                    : '🏆 Parabéns! Você já pagou TUDO que planejou! 🎉'}
            </Text>
          </View>
        )}

        {/* ── Por categoria ──────────────────────────── */}
        {porCategoria.length > 0 && (
          <>
            <SectionTitle>📊 Total por categoria</SectionTitle>
            <View style={{ gap: 10, marginBottom: 10 }}>
              {porCategoria.map(cat => {
                const pctCat = cat.total > 0 ? (cat.pago / cat.total) * 100 : 0;
                const pctOrc = totalGeral > 0 ? (cat.total / totalGeral) * 100 : 0;
                return (
                  <View key={cat.id} style={{
                    backgroundColor: '#27272A', borderRadius: 20, padding: 14,
                    borderWidth: 1, borderColor: '#3F3F46', flexDirection: 'row', alignItems: 'center',
                  }}>
                    <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: (cat.cor || '#A78BFA') + '25', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                      <Text style={{ fontSize: 20 }}>{cat.icone || '📦'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>{cat.nome}</Text>
                        <Text style={{ color: '#A78BFA', fontWeight: '900', fontSize: 14 }}>{fmt(cat.total)}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                        <Text style={{ color: '#71717A', fontSize: 10, fontWeight: '600' }}>{cat.qtd} itens</Text>
                        <Text style={{ color: '#71717A', fontSize: 10 }}>•</Text>
                        <Text style={{ color: '#71717A', fontSize: 10, fontWeight: '600' }}>✓ {cat.comprados} comprados</Text>
                        <Text style={{ color: '#71717A', fontSize: 10 }}>•</Text>
                        <Text style={{ color: '#71717A', fontSize: 10, fontWeight: '600' }}>{pctOrc.toFixed(0)}% do total</Text>
                      </View>
                      <ProgressBar progress={pctCat} color={cat.cor || '#A78BFA'} height={4} />
                      <Text style={{ color: '#52525B', fontSize: 9, marginTop: 4 }}>
                        Pago: {fmt(cat.pago)} de {fmt(cat.total)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Empty state */}
        {itens.length === 0 && !loading && (
          <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🛒</Text>
            <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '900', textAlign: 'center', marginBottom: 8 }}>
              Nenhum item ainda
            </Text>
            <Text style={{ color: '#71717A', fontSize: 14, textAlign: 'center', lineHeight: 22 }}>
              Adicione itens no Planejamento para ver seu resumo aqui.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
