import React, { useState, useMemo } from 'react';
import { SessionState, Exercise } from '../types';
import { getExerciseHistory, calculate1RM } from '../utils/workoutUtils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import {
  LineChart as ChartIcon,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Dumbbell,
  Calendar,
  Layers,
  Zap,
  Award,
  CheckCircle2,
  Flame,
  ChevronDown,
  ChevronUp,
  Activity,
  BarChart2,
} from 'lucide-react';

interface StatsViewProps {
  sessions: Record<string, SessionState>;
  allExercises: Exercise[];
}

type TimeframeMode = 'daily' | 'weekly';
type GlobalMetric = 'volume' | 'sets' | 'maxKg';

export const StatsView: React.FC<StatsViewProps> = ({ sessions, allExercises }) => {
  const [timeframe, setTimeframe] = useState<TimeframeMode>('weekly');
  const [metric, setMetric] = useState<GlobalMetric>('maxKg');
  const [showExerciseDetails, setShowExerciseDetails] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // --- 1. Compute Global Daily Data ---
  const dailyGlobalData = useMemo(() => {
    const dates = Object.keys(sessions).sort();
    const result: Array<{
      dateStr: string;
      label: string;
      volumeKg: number;
      volumeTonnes: number;
      setsCount: number;
      maxKg: number;
      exercisesCount: number;
      exercisesList: string[];
    }> = [];

    dates.forEach((d) => {
      const s = sessions[d];
      let dayVol = 0;
      let daySets = 0;
      let dayMax = 0;
      const exNamesSet = new Set<string>();

      Object.entries(s.weights || {}).forEach(([exId, w]) => {
        const exObj = allExercises.find((e) => e.id === exId);
        let hasLogged = false;

        for (let i = 1; i <= 10; i++) {
          const kg = parseFloat(w[`s${i}_kg`]) || 0;
          const reps = parseInt(w[`s${i}_reps`]) || 10;
          if (kg > 0) {
            dayVol += kg * reps;
            daySets++;
            if (kg > dayMax) dayMax = kg;
            hasLogged = true;
          }
        }

        if (hasLogged && exObj) {
          exNamesSet.add(exObj.name);
        }
      });

      if (dayVol > 0 || daySets > 0) {
        const dateObj = new Date(`${d}T12:00:00`);
        const formatted = dateObj.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
        });

        result.push({
          dateStr: d,
          label: formatted,
          volumeKg: Math.round(dayVol),
          setsCount: daySets,
          maxKg: dayMax,
          exercisesCount: exNamesSet.size,
          exercisesList: Array.from(exNamesSet),
        });
      }
    });

    return result;
  }, [sessions, allExercises]);

  // --- 2. Compute Weekly Global Aggregated Data ---
  const weeklyGlobalData = useMemo(() => {
    const weekMap: Record<
      string,
      {
        weekStart: string;
        label: string;
        volumeKg: number;
        setsCount: number;
        maxKg: number;
        sessionsCount: number;
        exercisesList: Set<string>;
      }
    > = {};

    dailyGlobalData.forEach((day) => {
      const dateObj = new Date(`${day.dateStr}T12:00:00`);
      const dayOfWeek = (dateObj.getDay() + 6) % 7; // Monday = 0
      const monday = new Date(dateObj);
      monday.setDate(dateObj.getDate() - dayOfWeek);
      const weekKey = monday.toISOString().slice(0, 10);

      if (!weekMap[weekKey]) {
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        const startStr = monday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        const endStr = sunday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

        weekMap[weekKey] = {
          weekStart: weekKey,
          label: `${startStr} - ${endStr}`,
          volumeKg: 0,
          setsCount: 0,
          maxKg: 0,
          sessionsCount: 0,
          exercisesList: new Set(),
        };
      }

      weekMap[weekKey].volumeKg += day.volumeKg;
      weekMap[weekKey].setsCount += day.setsCount;
      weekMap[weekKey].sessionsCount += 1;
      if (day.maxKg > weekMap[weekKey].maxKg) {
        weekMap[weekKey].maxKg = day.maxKg;
      }
      day.exercisesList.forEach((e) => weekMap[weekKey].exercisesList.add(e));
    });

    return Object.keys(weekMap)
      .sort()
      .map((wKey) => {
        const item = weekMap[wKey];
        return {
          ...item,
          exercisesCount: item.exercisesList.size,
        };
      });
  }, [dailyGlobalData]);

  // Active chart data based on selected timeframe (daily vs weekly)
  const currentChartData = timeframe === 'weekly' ? weeklyGlobalData : dailyGlobalData;

  // --- 3. Key Overview Stats & Comparisons ---
  const globalSummary = useMemo(() => {
    const totalVolumeKg = dailyGlobalData.reduce((acc, d) => acc + d.volumeKg, 0);
    const totalSets = dailyGlobalData.reduce((acc, d) => acc + d.setsCount, 0);
    const totalSessions = dailyGlobalData.length;

    // Current week vs previous week
    const currentWeekData =
      weeklyGlobalData.length > 0 ? weeklyGlobalData[weeklyGlobalData.length - 1] : null;
    const prevWeekData =
      weeklyGlobalData.length > 1 ? weeklyGlobalData[weeklyGlobalData.length - 2] : null;

    let volumeGrowthPct = 0;
    if (currentWeekData && prevWeekData && prevWeekData.volumeKg > 0) {
      volumeGrowthPct = Math.round(
        ((currentWeekData.volumeKg - prevWeekData.volumeKg) / prevWeekData.volumeKg) * 100
      );
    }

    // Records PRs count
    const allPRs: Array<{ exerciseName: string; maxKg: number; date: string }> = [];
    allExercises.forEach((ex) => {
      const hist = getExerciseHistory(ex.id, sessions);
      if (hist.length > 0) {
        const best = hist.reduce((prev, curr) => (curr.maxKg > prev.maxKg ? curr : prev), hist[0]);
        allPRs.push({
          exerciseName: ex.name,
          maxKg: best.maxKg,
          date: best.date,
        });
      }
    });

    return {
      totalVolumeKg,
      totalSets,
      totalSessions,
      currentWeekVolumeKg: currentWeekData ? currentWeekData.volumeKg : 0,
      currentWeekSessions: currentWeekData ? currentWeekData.sessionsCount : 0,
      prevWeekVolumeKg: prevWeekData ? prevWeekData.volumeKg : 0,
      volumeGrowthPct,
      prsCount: allPRs.length,
      topPRs: allPRs.sort((a, b) => b.maxKg - a.maxKg).slice(0, 5),
    };
  }, [dailyGlobalData, weeklyGlobalData, allExercises, sessions]);

  // --- 4. Muscle Volume Breakdown ---
  const muscleDistribution = useMemo(() => {
    const volumes: Record<string, number> = {};
    let grandTotal = 0;

    Object.values(sessions).forEach((s: SessionState) => {
      Object.entries(s.weights || {}).forEach(([exId, w]) => {
        const ex = allExercises.find((e) => e.id === exId);
        if (!ex) return;

        let vol = 0;
        for (let i = 1; i <= 10; i++) {
          const kg = parseFloat(w[`s${i}_kg`]) || 0;
          const reps = parseInt(w[`s${i}_reps`]) || 10;
          if (kg > 0) vol += kg * reps;
        }

        const cat = ex.category || 'push';
        volumes[cat] = (volumes[cat] || 0) + vol;
        grandTotal += vol;
      });
    });

    return { volumes, grandTotal };
  }, [sessions, allExercises]);

  // Filter exercises for secondary detail list
  const filteredExercises = useMemo(() => {
    return allExercises.filter(
      (ex) => selectedCategory === 'all' || ex.category === selectedCategory
    );
  }, [allExercises, selectedCategory]);

  return (
    <div className="p-4 max-w-4xl mx-auto pb-28 text-slate-900 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-[#0a0a0a] font-heading flex items-center gap-2">
            <ChartIcon className="w-6 h-6 text-[#0a0a0a]" />
            <span>Tableau de Progression Globale</span>
          </h2>
          <p className="text-xs text-slate-600 font-bold mt-0.5">
            Vue d'ensemble de ton volume de travail, assiduité et surcharge progressive.
          </p>
        </div>

        {/* Global Timeframe Switcher: Par Semaine vs Par Jour */}
        <div className="inline-flex p-1 bg-slate-200/90 rounded-2xl border border-slate-300 self-start sm:self-auto shadow-inner">
          <button
            onClick={() => setTimeframe('weekly')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              timeframe === 'weekly'
                ? 'bg-[#0a0a0a] text-[#bbff00] shadow-md'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Par Semaine</span>
          </button>
          <button
            onClick={() => setTimeframe('daily')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              timeframe === 'daily'
                ? 'bg-[#0a0a0a] text-[#bbff00] shadow-md'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Par Jour</span>
          </button>
        </div>
      </div>

      {/* ⚡ Status Banner */}
      <div className="bg-[#0a0a0a] text-white p-4 rounded-2xl shadow-xl border border-slate-800 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#bbff00] text-[#0a0a0a] shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-[#bbff00] uppercase tracking-wider font-heading flex items-center gap-1.5">
              <span>Bilan Rapide de Progression</span>
              {globalSummary.volumeGrowthPct > 0 && (
                <span className="bg-[#bbff00]/20 text-[#bbff00] text-[10px] px-2 py-0.5 rounded-full font-mono">
                  +{globalSummary.volumeGrowthPct}% cette semaine
                </span>
              )}
            </div>
            <h3 className="text-base font-black tracking-tight text-white font-heading mt-0.5">
              {globalSummary.currentWeekSessions > 0
                ? `${globalSummary.currentWeekSessions} séance(s) effectuée(s) cette semaine (${globalSummary.currentWeekVolumeKg.toLocaleString('fr-FR')} kg)`
                : "Commencez votre première séance pour afficher votre niveau d'effort !"}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <span className="text-xs font-mono font-bold text-slate-400">Total cumulé:</span>
          <span className="bg-slate-800 text-[#bbff00] px-3 py-1.5 rounded-xl font-mono font-black text-sm border border-slate-700">
            {globalSummary.totalVolumeKg.toLocaleString('fr-FR')} kg
          </span>
        </div>
      </div>

      {/* 4 KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="liquid-glass p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block font-heading mb-1">
            Volume Cette Semaine
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono font-black text-2xl text-slate-900">
              {globalSummary.currentWeekVolumeKg.toLocaleString('fr-FR')}
            </span>
            <span className="text-xs font-bold text-slate-500">kg</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[10px] font-bold">
            {globalSummary.volumeGrowthPct >= 0 ? (
              <span className="text-emerald-600 flex items-center gap-0.5 font-mono font-black">
                <TrendingUp className="w-3 h-3" /> +{globalSummary.volumeGrowthPct}% vs sem.
                dernière
              </span>
            ) : (
              <span className="text-rose-600 flex items-center gap-0.5 font-mono font-black">
                <TrendingDown className="w-3 h-3" /> {globalSummary.volumeGrowthPct}% vs sem.
                dernière
              </span>
            )}
          </div>
        </div>

        <div className="liquid-glass p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block font-heading mb-1">
            Séances Réalisées
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono font-black text-2xl text-slate-900">
              {globalSummary.totalSessions}
            </span>
            <span className="text-xs font-bold text-slate-500">au total</span>
          </div>
          <p className="text-[10px] text-slate-500 font-bold mt-1">
            {globalSummary.currentWeekSessions} séance(s) cette semaine
          </p>
        </div>

        <div className="liquid-glass p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block font-heading mb-1">
            Séries Effectuées
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono font-black text-2xl text-sky-600">
              {globalSummary.totalSets}
            </span>
            <span className="text-xs font-bold text-slate-500">séries</span>
          </div>
          <p className="text-[10px] text-slate-500 font-bold mt-1">
            Moy. {globalSummary.totalSessions > 0 ? Math.round(globalSummary.totalSets / globalSummary.totalSessions) : 0} séries/séance
          </p>
        </div>

        <div className="liquid-glass p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block font-heading mb-1">
            Records d'Exercices (PRs)
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono font-black text-2xl text-amber-500">
              {globalSummary.prsCount}
            </span>
            <span className="text-xs font-bold text-slate-500">exercices</span>
          </div>
          <p className="text-[10px] text-amber-600 font-extrabold mt-1 flex items-center gap-1">
            <Trophy className="w-3 h-3" /> Records enregistrés
          </p>
        </div>
      </div>

      {/* 📊 MAIN GLOBAL PROGRESSION CHART */}
      <div className="liquid-glass rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-200/90 mb-6">
        {/* Chart Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 font-heading flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#0a0a0a]" />
              <span>
                {metric === 'maxKg'
                  ? 'Évolution de la Charge Maximale (Poids sur la barre)'
                  : metric === 'volume'
                  ? 'Évolution du Volume Total Cumulé (Poids × Répétitions)'
                  : 'Nombre de Séries Effectuées'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 font-bold">
              {metric === 'maxKg'
                ? 'Affiche le poids maximal que vous avez soulevé sur la barre (ex: 10 kg).'
                : metric === 'volume'
                ? 'Volume de travail total (ex: 10 kg × 10 rép × 4 séries = 400 kg déplacés au total).'
                : 'Total des séries complétées.'}
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 self-start sm:self-auto">
            <button
              onClick={() => setMetric('maxKg')}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                metric === 'maxKg'
                  ? 'bg-[#0a0a0a] text-[#bbff00] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Charge Max (kg)
            </button>
            <button
              onClick={() => setMetric('volume')}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                metric === 'volume'
                  ? 'bg-[#0a0a0a] text-[#bbff00] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Volume Cumulé (kg)
            </button>
            <button
              onClick={() => setMetric('sets')}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                metric === 'sets'
                  ? 'bg-[#0a0a0a] text-[#bbff00] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Séries (Nb)
            </button>
          </div>
        </div>

        {/* Recharts Area / Bar Display */}
        {currentChartData.length > 0 ? (
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {timeframe === 'weekly' ? (
                <BarChart
                  data={currentChartData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const dataItem = payload[0].payload;
                        return (
                          <div className="bg-[#0a0a0a] text-white p-3 rounded-xl border border-slate-800 shadow-xl font-mono text-xs space-y-1">
                            <p className="font-extrabold text-[#bbff00]">{label}</p>
                            <p className="text-slate-200">
                              Volume Total:{' '}
                              <span className="text-[#bbff00] font-black">
                                {dataItem.volumeKg.toLocaleString('fr-FR')} kg
                              </span>
                            </p>
                            <p className="text-slate-300">
                              Séances:{' '}
                              <span className="text-white font-bold">{dataItem.sessionsCount} séance(s)</span>
                            </p>
                            <p className="text-slate-300">
                              Séries Totales:{' '}
                              <span className="text-white font-bold">{dataItem.setsCount} séries</span>
                            </p>
                            <p className="text-slate-300">
                              Charge Max Levée:{' '}
                              <span className="text-white font-bold">{dataItem.maxKg} kg</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey={metric === 'volume' ? 'volumeKg' : metric === 'sets' ? 'setsCount' : 'maxKg'}
                    radius={[6, 6, 0, 0]}
                  >
                    {currentChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          index === currentChartData.length - 1
                            ? '#0a0a0a'
                            : '#334155'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <AreaChart
                  data={currentChartData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorGlobalMetric" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0a0a0a" stopOpacity={0.85} />
                      <stop offset="95%" stopColor="#0a0a0a" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const dataItem = payload[0].payload;
                        return (
                          <div className="bg-[#0a0a0a] text-white p-3 rounded-xl border border-slate-800 shadow-xl font-mono text-xs space-y-1">
                            <p className="font-extrabold text-[#bbff00]">
                              Séance du {label} ({dataItem.dateStr})
                            </p>
                            <p className="text-slate-200">
                              Volume Jour:{' '}
                              <span className="text-[#bbff00] font-black">
                                {dataItem.volumeKg.toLocaleString('fr-FR')} kg
                              </span>
                            </p>
                            <p className="text-slate-300">
                              Séries Jouées:{' '}
                              <span className="text-white font-bold">{dataItem.setsCount} séries</span>
                            </p>
                            <p className="text-slate-300">
                              Charge Max:{' '}
                              <span className="text-white font-bold">{dataItem.maxKg} kg</span>
                            </p>
                            {dataItem.exercisesList && dataItem.exercisesList.length > 0 && (
                              <p className="text-[10px] text-slate-400 font-sans pt-1 border-t border-slate-800">
                                Exercices: {dataItem.exercisesList.slice(0, 3).join(', ')}
                                {dataItem.exercisesList.length > 3 ? '...' : ''}
                              </p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={metric === 'volume' ? 'volumeKg' : metric === 'sets' ? 'setsCount' : 'maxKg'}
                    stroke="#0a0a0a"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorGlobalMetric)"
                    dot={{ r: 4, fill: '#bbff00', stroke: '#0a0a0a', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#bbff00', stroke: '#0a0a0a', strokeWidth: 2 }}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-4">
            <Trophy className="w-8 h-8 mb-2 text-slate-300" />
            <p className="font-semibold">Aucune séance enregistrée pour l'instant.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Saisissez vos répétitions et charges lors de vos séances pour visualiser votre graphique global !
            </p>
          </div>
        )}
      </div>

      {/* Muscle Volume Breakdown */}
      {muscleDistribution.grandTotal > 0 && (
        <div className="liquid-glass rounded-2xl p-4 mb-6 shadow-md border border-slate-200/90">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 font-heading">
              <Dumbbell className="w-4 h-4 text-[#0a0a0a]" />
              <span>Répartition du Volume par Groupe Musculaire</span>
            </h3>
            <span className="font-mono font-black text-xs text-[#0a0a0a] bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
              {Math.round(muscleDistribution.grandTotal).toLocaleString('fr-FR')} kg au total
            </span>
          </div>

          {/* Distribution Progress Bar */}
          <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex mb-3 border border-slate-200">
            {Object.entries(muscleDistribution.volumes).map(([cat, vol]) => {
              const pct = (vol / muscleDistribution.grandTotal) * 100;
              let bg = 'bg-[#0a0a0a]';
              if (cat === 'pull') bg = 'bg-sky-500';
              if (cat === 'legs') bg = 'bg-amber-500';
              if (cat === 'shoulders') bg = 'bg-purple-500';
              if (cat === 'arms') bg = 'bg-emerald-500';
              if (cat === 'core') bg = 'bg-rose-500';

              return (
                <div
                  key={cat}
                  style={{ width: `${pct}%` }}
                  className={`h-full ${bg} transition-all duration-500`}
                  title={`${cat}: ${Math.round(pct)}%`}
                />
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 text-[11px] font-bold text-slate-700">
            {Object.entries(muscleDistribution.volumes).map(([cat, vol]) => {
              const pct = Math.round((vol / muscleDistribution.grandTotal) * 100);
              return (
                <div key={cat} className="flex items-center gap-1.5 capitalize">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      cat === 'push'
                        ? 'bg-[#0a0a0a]'
                        : cat === 'pull'
                        ? 'bg-sky-500'
                        : cat === 'legs'
                        ? 'bg-amber-500'
                        : cat === 'shoulders'
                        ? 'bg-purple-500'
                        : cat === 'core'
                        ? 'bg-rose-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                  <span>
                    {cat} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Personal Records Hall of Fame */}
      {globalSummary.topPRs.length > 0 && (
        <div className="liquid-glass rounded-2xl p-4 mb-6 shadow-md border border-slate-200/90">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 font-heading">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Meilleurs Records d'Exercices (Top PRs)</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-bold font-mono">
              {globalSummary.topPRs.length} record(s) principaux
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {globalSummary.topPRs.map((pr, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-[#0a0a0a] text-[#bbff00] font-mono font-black text-xs flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 font-heading">
                      {pr.exerciseName}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-semibold">{pr.date}</p>
                  </div>
                </div>
                <div className="font-mono font-black text-sm text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                  {pr.maxKg} kg
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collapsible Section for Individual Exercise Breakdown */}
      <div className="mt-8 border-t border-slate-200 pt-5">
        <button
          onClick={() => setShowExerciseDetails(!showExerciseDetails)}
          className="w-full flex items-center justify-between bg-slate-100 hover:bg-slate-200/80 p-3.5 rounded-2xl text-slate-800 transition-all border border-slate-200 shadow-2xs"
        >
          <span className="text-xs font-black uppercase tracking-wider font-heading flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-700" />
            <span>Voir le détail par exercice individuel</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-bold font-mono">
              {showExerciseDetails ? 'Masquer' : 'Afficher'}
            </span>
            {showExerciseDetails ? (
              <ChevronUp className="w-4 h-4 text-slate-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-600" />
            )}
          </div>
        </button>

        {showExerciseDetails && (
          <div className="mt-4 space-y-4 animate-in fade-in duration-200">
            {/* Category Filter Chips */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: 'all', label: 'Tous' },
                { id: 'push', label: 'Push' },
                { id: 'pull', label: 'Pull' },
                { id: 'legs', label: 'Jambes' },
                { id: 'shoulders', label: 'Épaules' },
                { id: 'arms', label: 'Bras' },
                { id: 'core', label: 'Abdos' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap font-heading ${
                    selectedCategory === cat.id
                      ? 'bg-[#0a0a0a] text-[#bbff00] shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Exercises List Grid */}
            <div className="space-y-2.5">
              {filteredExercises.map((ex) => {
                const history = getExerciseHistory(ex.id, sessions);
                if (history.length === 0) return null;

                const maxRecord = Math.max(...history.map((h) => h.maxKg));
                const max1RM = Math.max(...history.map((h) => h.estimated1RM));
                const lastEntry = history[history.length - 1];

                return (
                  <div
                    key={ex.id}
                    className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-black text-xs text-slate-900 font-heading">
                          {ex.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-semibold capitalize">
                          {ex.muscles} • {history.length} séance(s)
                        </p>
                      </div>
                      <span className="font-mono font-black text-xs text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                        Best: {maxRecord} kg
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-mono font-bold">
                      <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                        <span className="text-[9px] text-slate-400 block font-sans uppercase">
                          1RM Max
                        </span>
                        <span className="text-amber-600">{max1RM} kg</span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                        <span className="text-[9px] text-slate-400 block font-sans uppercase">
                          Dernier
                        </span>
                        <span className="text-sky-600">{lastEntry.maxKg} kg</span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                        <span className="text-[9px] text-slate-400 block font-sans uppercase">
                          Cible
                        </span>
                        <span className="text-emerald-600">{lastEntry.maxKg + 2.5} kg</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

