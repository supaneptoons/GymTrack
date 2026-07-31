import React, { useState } from 'react';
import { Exercise } from '../types';
import { EXERCISE_IMAGE_BASE_URL } from '../data/defaultProgram';
import { Search, Plus, Library, Dumbbell, X, Sparkles } from 'lucide-react';

interface ExerciseLibraryViewProps {
  allExercises: Exercise[];
  onAddCustomExercise: (newEx: Exercise) => void;
}

export const ExerciseLibraryView: React.FC<ExerciseLibraryViewProps> = ({
  allExercises,
  onAddCustomExercise,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Exercise Form State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<Exercise['category']>('push');
  const [newMuscles, setNewMuscles] = useState('');
  const [newEquipment, setNewEquipment] = useState('Haltères');
  const [newSets, setNewSets] = useState(3);
  const [newReps, setNewReps] = useState('10–12');
  const [newRest, setNewRest] = useState(60);
  const [newTip, setNewTip] = useState('');

  const filteredExercises = allExercises.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.muscles.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || ex.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleCreateExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const created: Exercise = {
      id: `custom_${Date.now()}`,
      name: newName,
      category: newCategory,
      muscles: newMuscles || 'Muscles ciblés',
      sets: newSets,
      reps: newReps,
      rest: newRest,
      equipment: newEquipment,
      tip: newTip || 'Gardez une forme stricte et contrôlez le mouvement.',
      imgs: ['Barbell_Bench_Press', '0.jpg', '1.jpg'], // fallback
      custom: true,
    };

    onAddCustomExercise(created);
    setShowAddModal(false);

    // Reset Form
    setNewName('');
    setNewTip('');
    setNewMuscles('');
  };

  return (
    <div className="p-4 max-w-4xl mx-auto pb-24 text-zinc-100 animate-in fade-in duration-200">
      {/* Title & Add Button */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-[#0a0a0a] font-heading flex items-center gap-2">
            <Library className="w-6 h-6 text-[#0a0a0a]" />
            <span>Bibliothèque</span>
          </h2>
          <p className="text-xs text-zinc-600 font-semibold mt-0.5">
            Explorer les mouvements et créer vos exercices personnalisés.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-[#bbff00] hover:bg-[#a6e600] text-[#0a0a0a] font-black text-xs px-3.5 py-2 rounded-xl shadow-md active:scale-95 transition-all font-heading"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Créer</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher un exercice, muscle..."
          className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#bbff00]"
        />
      </div>

      {/* Category Chips */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-3 mb-4">
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
                ? 'bg-[#bbff00] text-[#0a0a0a] shadow-md shadow-[#bbff00]/20'
                : 'bg-[#0a0a0a] border border-zinc-800 text-zinc-300 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Exercise List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredExercises.map((ex) => (
          <div
            key={ex.id}
            className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between hover:border-zinc-700 transition-all shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-extrabold text-sm text-white font-heading">{ex.name}</h3>
                {ex.custom && (
                  <span className="text-[9px] font-bold bg-[#bbff00]/15 text-[#bbff00] border border-[#bbff00]/30 px-2 py-0.5 rounded">
                    Perso
                  </span>
                )}
              </div>

              <p className="text-xs text-zinc-400 mb-2">{ex.muscles}</p>

              <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono mb-3">
                <span className="bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                  {ex.sets} séries × {ex.reps}
                </span>
                <span className="bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                  ⏱ {ex.rest}s repos
                </span>
                {ex.equipment && (
                  <span className="bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                    {ex.equipment}
                  </span>
                )}
              </div>

              <p className="text-xs text-zinc-300 line-clamp-2 italic bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800/60">
                "{ex.tip}"
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Create Custom Exercise Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl w-full max-w-md p-5 text-zinc-100 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#bbff00]" />
              <h3 className="font-black text-lg uppercase tracking-wide text-white font-heading">
                Ajouter un Exercice
              </h3>
            </div>

            <form onSubmit={handleCreateExercise} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">
                  Nom de l'exercice
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Hip Thrust barre"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#bbff00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Catégorie</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as Exercise['category'])}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#bbff00]"
                  >
                    <option value="push">Push (Pecs/Triceps)</option>
                    <option value="pull">Pull (Dos/Biceps)</option>
                    <option value="legs">Legs (Jambes)</option>
                    <option value="shoulders">Épaules</option>
                    <option value="arms">Bras</option>
                    <option value="core">Abdominaux</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Équipement</label>
                  <input
                    type="text"
                    placeholder="Barre / Haltères / Poulie..."
                    value={newEquipment}
                    onChange={(e) => setNewEquipment(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#bbff00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Muscles Ciblés</label>
                <input
                  type="text"
                  placeholder="ex: Fessiers · Ischio-jambiers"
                  value={newMuscles}
                  onChange={(e) => setNewMuscles(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#bbff00]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Séries</label>
                  <input
                    type="number"
                    value={newSets}
                    onChange={(e) => setNewSets(parseInt(e.target.value) || 3)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2 py-2 text-xs text-center text-white focus:outline-none focus:border-[#bbff00] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Répétitions</label>
                  <input
                    type="text"
                    value={newReps}
                    onChange={(e) => setNewReps(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2 py-2 text-xs text-center text-white focus:outline-none focus:border-[#bbff00] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Repos (s)</label>
                  <input
                    type="number"
                    value={newRest}
                    onChange={(e) => setNewRest(parseInt(e.target.value) || 60)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2 py-2 text-xs text-center text-white focus:outline-none focus:border-[#bbff00] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">
                  Conseil d'exécution / Forme
                </label>
                <textarea
                  rows={2}
                  placeholder="Détails techniques, posture, respiration..."
                  value={newTip}
                  onChange={(e) => setNewTip(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#bbff00]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#bbff00] hover:bg-[#a6e600] text-[#0a0a0a] font-black text-xs uppercase tracking-wider rounded-xl shadow-lg mt-2 font-heading"
              >
                Créer l'exercice
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
