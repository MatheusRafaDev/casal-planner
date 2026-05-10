import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, RefreshControl, Animated, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G } from 'react-native-svg';
import { itensService, Item } from '../../src/services/itensService';
import { categoriasService, Categoria } from '../../src/services/categoriasService';
import {
  BarChart3, TrendingUp, Sparkles, ShoppingCart,
  CheckCircle, Coffee, DollarSign,
} from 'lucide-react-native';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Skeleton, SkeletonCard } from '../../src/components/ui/SkeletonLoader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

// ─── Custom Donut Chart (sem react-native-svg-charts) ────────
interface DonutChartProps {
  percentage: number;   // 0-100
  radius?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  label?: string;
  sublabel?: string;
}

function DonutChart({
  percentage, radius = 90, strokeWidth = 18,
  color = '#A78BFA', bgColor = '#3F3F46',
  label, sublabel,
}: DonutChartProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const clamp = Math.min(Math.max(percentage, 0), 100);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: clamp,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [clamp]);

  const size = radius * 2 + strokeWidth;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  // React Native SVG doesn't support Animated.Value on strokeDashoffset directly,
  // so we render statically and rely on the initial animation being fast enough,
  // OR use an AnimatedCircle approach. For simplicity we use static + mount animation.
  const dashoffset = circumference - (circumference * clamp) / 100;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        {/* Background circle */}
        <Circle
          cx={cx} cy={cy} r={radius}
          stroke={bgColor} strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <Circle
          cx={cx} cy={cy} r={radius}
          stroke={color} strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
        />
      </Svg>
      {/* Center label */}
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        {sublabel && (
          <Text style={{ color: '#A1A1AA', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 2 }}>
            {sublabel}
          </Text>
        )}
        {label && (
          <Text style={{ color: '#FFFFFF', fontSize: 34, fontWeight: '900', letterSpacing: -1 }}>
            {label}
          </Text>
        )}
      </View>
    </View>
  );
}

// ─── Animated entrance card ───────────────────────────────────
function AnimatedCard({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: any }) {
  const anim = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(16)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(anim, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[{ opacity: anim, transform: [{ translateY: slide }] }, style]}>
      {children}
    </Animated.View>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#18181B' }} edges={['top']}>
      <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}>
        <Skeleton width={120} height={12} borderRadius={6} style={{ marginBottom: 8 }} />
        <Skeleton width={220} height={28} borderRadius={8} style={{ marginBottom: 28 }} />
        <Skeleton width="100%" height={280} borderRadius={32} style={{ marginBottom: 20 }} />
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
        <SkeletonCard />
        <SkeletonCard />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Main Screen ──────────────────────────────────────────────
export default function EstatisticasScreen() {
  const [itens, setItens] = useState<Item[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregarDados = async () => {
    try {
      const [its, cats] = await Promise.all([
        itensService.getAll().catch(() => [] as Item[]),
        categoriasService.listarDoUsuario().catch(() => [] as Categoria[]),
      ]);
      setItens(its || []);
      setCategorias(cats || []);
    } catch (e) {
      console.error('Erro estatisticas:', e);
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

  // Priority groups
  const prioridades: Record<string, { total: number; pago: number }> = {
    urgente: { total: 0, pago: 0 },
    normal: { total: 0, pago: 0 },
    pode_esperar: { total: 0, pago: 0 },
  };
  itens.forEach(item => {
    const valor = (Number(item.preco) || 0) * (Number(item.quantidade) || 0);
    const p = item.prioridade;
    const key = p === 'urgente' ? 'urgente' : p === 'pode_esperar' ? 'pode_esperar' : 'normal';
    prioridades[key].total += valor;
    if (item.comprado) prioridades[key].pago += valor;
  });

  // Category breakdown
  const catBreakdown = (categorias
    .map(cat => {
      const catItens = itens.filter(i => i.categoriaId === cat.id);
      const total = calcTotal(catItens);
      const pago = calcTotal(catItens.filter(i => i.comprado));
      return { ...cat, total, pago, qtd: catItens.length };
    })
    .filter(c => c.qtd > 0)
    .sort((a, b) => b.total - a.total)) as (Categoria & { total: number; pago: number; qtd: number })[];

  const insight =
    pctComprados >= 100 ? '🏆 Parabéns! Você já comprou tudo que planejou!' :
    pctComprados >= 70  ? '🌟 Excelente! Vocês estão com ótimo controle financeiro!' :
    pctComprados >= 50  ? '📈 Bom progresso! Mais da metade já foi comprada.' :
    pctComprados >= 25  ? '⚡ Continue assim! Ainda há bastante pela frente.' :
                          '🎯 Vamos lá! Ainda há muito a comprar.';

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
        {/* ── Header ──────────────────────────────── */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <TrendingUp size={14} color="#A78BFA" />
            <Text style={{ color: '#A1A1AA', fontSize: 13, fontWeight: '500', marginLeft: 6 }}>
              Insights Financeiros
            </Text>
          </View>
          <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: '900', letterSpacing: -0.8 }}>
            Análise de Gastos
          </Text>
        </View>

        {/* ── Donut Chart ─────────────────────────── */}
        <AnimatedCard delay={0}>
          <View style={{
            backgroundColor: '#27272A', borderRadius: 32, padding: 28, borderWidth: 1,
            borderColor: '#3F3F46', alignItems: 'center', marginBottom: 20,
          }}>
            <DonutChart
              percentage={pctPago}
              radius={90}
              strokeWidth={18}
              color="#A78BFA"
              bgColor="#3F3F46"
              label={`${pctComprados}%`}
              sublabel="PAGO"
            />

            {/* Legend */}
            <View style={{ flexDirection: 'row', gap: 24, marginTop: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: '#A78BFA' }} />
                <Text style={{ color: '#A1A1AA', fontSize: 12, fontWeight: '600' }}>
                  Pago: {fmt(totalPago)}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: '#3F3F46' }} />
                <Text style={{ color: '#A1A1AA', fontSize: 12, fontWeight: '600' }}>
                  Falta: {fmt(totalFalta)}
                </Text>
              </View>
            </View>
          </View>
        </AnimatedCard>

        {/* ── 2 Quick Stats ───────────────────────── */}
        <AnimatedCard delay={100}>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
            <View style={{ flex: 1, backgroundColor: '#27272A', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#3F3F46' }}>
              <ShoppingCart size={16} color="#A78BFA" style={{ marginBottom: 8 }} />
              <Text style={{ color: '#A1A1AA', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>Total</Text>
              <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 15, letterSpacing: -0.3 }}>{fmt(totalGeral)}</Text>
              <Text style={{ color: '#71717A', fontSize: 10, fontWeight: '600', marginTop: 2 }}>{totalItens} itens</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#27272A', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#3F3F46' }}>
              <CheckCircle size={16} color="#22C55E" style={{ marginBottom: 8 }} />
              <Text style={{ color: '#A1A1AA', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>Comprados</Text>
              <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 15, letterSpacing: -0.3 }}>{totalComprados}</Text>
              <Text style={{ color: '#71717A', fontSize: 10, fontWeight: '600', marginTop: 2 }}>de {totalItens} itens</Text>
            </View>
          </View>
        </AnimatedCard>

        {/* ── Progress Visual ──────────────────────── */}
        <AnimatedCard delay={150}>
          <View style={{ backgroundColor: '#27272A', borderRadius: 24, padding: 18, borderWidth: 1, borderColor: '#3F3F46', marginBottom: 20 }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 15, marginBottom: 16 }}>Progresso Geral</Text>
            <View style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ color: '#A1A1AA', fontSize: 12, fontWeight: '600' }}>Valor pago</Text>
                <Text style={{ color: '#A78BFA', fontWeight: '800', fontSize: 12 }}>{pctPago.toFixed(1)}%</Text>
              </View>
              <ProgressBar progress={pctPago} color="#A78BFA" height={8} />
            </View>
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ color: '#A1A1AA', fontSize: 12, fontWeight: '600' }}>Itens comprados</Text>
                <Text style={{ color: '#22C55E', fontWeight: '800', fontSize: 12 }}>{pctComprados}%</Text>
              </View>
              <ProgressBar progress={pctComprados} color="#22C55E" height={8} />
            </View>
          </View>
        </AnimatedCard>

        {/* ── Por tipo de pagamento ────────────────── */}
        <AnimatedCard delay={200}>
          <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '800', marginBottom: 12, letterSpacing: -0.2 }}>
            💳 Por tipo de pagamento
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
            <View style={{ flex: 1, backgroundColor: '#27272A', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#3F3F46', borderLeftWidth: 3, borderLeftColor: '#FBBF24' }}>
              <Coffee size={18} color="#FBBF24" style={{ marginBottom: 8 }} />
              <Text style={{ color: '#FBBF24', fontWeight: '900', fontSize: 16, marginBottom: 2 }}>{fmt(totalVR)}</Text>
              <Text style={{ color: '#A1A1AA', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>VR / VA</Text>
              <Text style={{ color: '#71717A', fontSize: 10, marginBottom: 2 }}>✅ {fmt(vrPago)}</Text>
              <Text style={{ color: '#EAB308', fontSize: 10, marginBottom: 8 }}>⚠️ {fmt(totalVR - vrPago)}</Text>
              <ProgressBar progress={totalVR > 0 ? (vrPago / totalVR) * 100 : 0} color="#FBBF24" height={4} />
            </View>
            <View style={{ flex: 1, backgroundColor: '#27272A', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#3F3F46', borderLeftWidth: 3, borderLeftColor: '#A78BFA' }}>
              <DollarSign size={18} color="#A78BFA" style={{ marginBottom: 8 }} />
              <Text style={{ color: '#A78BFA', fontWeight: '900', fontSize: 16, marginBottom: 2 }}>{fmt(totalNormal)}</Text>
              <Text style={{ color: '#A1A1AA', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Normal</Text>
              <Text style={{ color: '#71717A', fontSize: 10, marginBottom: 2 }}>✅ {fmt(normalPago)}</Text>
              <Text style={{ color: '#EAB308', fontSize: 10, marginBottom: 8 }}>⚠️ {fmt(totalNormal - normalPago)}</Text>
              <ProgressBar progress={totalNormal > 0 ? (normalPago / totalNormal) * 100 : 0} color="#A78BFA" height={4} />
            </View>
          </View>
        </AnimatedCard>

        {/* ── Por Prioridade ───────────────────────── */}
        {(prioridades.urgente.total > 0 || prioridades.normal.total > 0 || prioridades.pode_esperar.total > 0) && (
          <AnimatedCard delay={250}>
            <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '800', marginBottom: 12, letterSpacing: -0.2 }}>
              🎯 Por prioridade
            </Text>
            <View style={{ gap: 10, marginBottom: 20 }}>
              {([
                { key: 'urgente',      label: '🔴 Urgente',      color: '#EF4444' },
                { key: 'normal',       label: '🟡 Normal',       color: '#A78BFA' },
                { key: 'pode_esperar', label: '🟢 Pode esperar', color: '#22C55E' },
              ] as { key: keyof typeof prioridades; label: string; color: string }[])
                .filter(p => prioridades[p.key].total > 0)
                .map(p => {
                  const d = prioridades[p.key];
                  const pct = d.total > 0 ? (d.pago / d.total) * 100 : 0;
                  return (
                    <View key={p.key} style={{ backgroundColor: '#27272A', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#3F3F46' }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>{p.label}</Text>
                        <Text style={{ color: p.color, fontWeight: '800', fontSize: 12 }}>{pct.toFixed(0)}% pago</Text>
                      </View>
                      <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 18, marginBottom: 6, letterSpacing: -0.3 }}>
                        {fmt(d.total)}
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 16, marginBottom: 10 }}>
                        <Text style={{ color: '#71717A', fontSize: 11 }}>✅ {fmt(d.pago)}</Text>
                        <Text style={{ color: '#EAB308', fontSize: 11 }}>⚠️ {fmt(d.total - d.pago)}</Text>
                      </View>
                      <ProgressBar progress={pct} color={p.color} height={5} />
                    </View>
                  );
                })}
            </View>
          </AnimatedCard>
        )}

        {/* ── Por categoria ────────────────────────── */}
        {catBreakdown.length > 0 && (
          <AnimatedCard delay={300}>
            <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '800', marginBottom: 12, letterSpacing: -0.2 }}>
              📊 Por categoria
            </Text>
            <View style={{ gap: 10, marginBottom: 20 }}>
              {catBreakdown.map(cat => {
                const pct = cat.total > 0 ? (cat.pago / cat.total) * 100 : 0;
                const pctTotal = totalGeral > 0 ? (cat.total / totalGeral) * 100 : 0;
                return (
                  <View key={cat.id} style={{ backgroundColor: '#27272A', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#3F3F46' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                      <View style={{
                        width: 40, height: 40, borderRadius: 12,
                        backgroundColor: ((cat.cor as string) || '#A78BFA') + '25',
                        alignItems: 'center', justifyContent: 'center', marginRight: 12,
                      }}>
                        <Text style={{ fontSize: 18 }}>{(cat.icone as string) || '📦'}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>{cat.nome}</Text>
                          <Text style={{ color: '#A78BFA', fontWeight: '900', fontSize: 14 }}>{fmt(cat.total)}</Text>
                        </View>
                        <Text style={{ color: '#71717A', fontSize: 10, fontWeight: '600', marginTop: 2 }}>
                          {cat.qtd} itens • {pctTotal.toFixed(0)}% do orçamento • {pct.toFixed(0)}% pago
                        </Text>
                      </View>
                    </View>
                    <ProgressBar progress={pct} color={(cat.cor as string) || '#A78BFA'} height={5} />
                    <Text style={{ color: '#52525B', fontSize: 9, marginTop: 4 }}>
                      Pago: {fmt(cat.pago)} de {fmt(cat.total)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </AnimatedCard>
        )}

        {/* ── AI Insight ───────────────────────────── */}
        <AnimatedCard delay={350}>
          <View style={{ backgroundColor: '#A78BFA15', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#A78BFA30', flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={{ backgroundColor: '#A78BFA20', padding: 14, borderRadius: 18, marginRight: 14 }}>
              <Sparkles size={22} color="#A78BFA" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 15, marginBottom: 6 }}>Análise IA</Text>
              <Text style={{ color: '#A1A1AA', fontSize: 13, lineHeight: 20, fontWeight: '500' }}>
                {insight}
              </Text>
            </View>
          </View>
        </AnimatedCard>

        {/* ── Empty state ──────────────────────────── */}
        {itens.length === 0 && !loading && (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>📊</Text>
            <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '900', textAlign: 'center', marginBottom: 8 }}>
              Sem dados ainda
            </Text>
            <Text style={{ color: '#71717A', fontSize: 14, textAlign: 'center' }}>
              Adicione itens no Planejamento para ver suas estatísticas.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
