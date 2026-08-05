import { Exercise, ProgramDetails, UserSettings } from '../types';

export const EXERCISE_IMAGE_BASE_URL = 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/';

export const DEFAULT_PROGRAM_A: ProgramDetails = {
  key: 'A',
  badge: 'PUSH',
  title: 'Séance A — PUSH',
  label: 'Pectoraux · Épaules · Triceps',
  description: 'Développement de la force et du volume sur tous les mouvements de poussée.',
  exercises: [
    {
      id: 'bench',
      name: 'Développé couché barre',
      category: 'push',
      muscles: 'Pectoraux · Épaules · Triceps',
      sets: 4,
      reps: '6–8',
      rest: 120,
      equipment: 'Barre & Banc',
      tip: 'Omoplates serrées et rétractées, pieds ancrés au sol. Descends la barre en contrôle jusqu\'à effleurer les pecs, puis pousse en gardant les coudes à 45°.',
      imgs: ['Barbell_Bench_Press', '0.jpg', '1.jpg']
    },
    {
      id: 'incline_db',
      name: 'Développé incliné haltères',
      category: 'push',
      muscles: 'Pectoraux haut · Deltoïdes',
      sets: 4,
      reps: '10',
      rest: 90,
      equipment: 'Haltères & Banc incliné',
      tip: 'Inclinaison du banc à 30–45°. Maintiens une légère rotation externe des épaules en bas. Contraction maximale des pectoraux en haut sans choquer les haltères.',
      imgs: ['Incline_Dumbbell_Press', '0.jpg', '1.jpg']
    },
    {
      id: 'cable_fly',
      name: 'Écarté poulie basse',
      category: 'push',
      muscles: 'Pectoraux · Sternal',
      sets: 3,
      reps: '12–15',
      rest: 75,
      equipment: 'Poulie vis-à-vis',
      tip: 'Imagine que tu enlaçes un grand arbre. Garde une légère flexion fixe aux coudes tout au long du trajet. Marque 1 seconde de pause en contraction max.',
      imgs: ['Cable_Fly', '0.jpg', '1.jpg']
    },
    {
      id: 'ohp',
      name: 'Développé épaules haltères',
      category: 'shoulders',
      muscles: 'Deltoïdes · Triceps',
      sets: 3,
      reps: '10–12',
      rest: 90,
      equipment: 'Haltères',
      tip: 'Assis buste bien droit ou debout. Ne verrouille pas brutalement les coudes en haut. Contrôle la descente jusqu\'au niveau des oreilles.',
      imgs: ['Dumbbell_Shoulder_Press', '0.jpg', '1.jpg']
    },
    {
      id: 'lat_raise',
      name: 'Élévations latérales',
      category: 'shoulders',
      muscles: 'Deltoïdes latéraux',
      sets: 3,
      reps: '15',
      rest: 60,
      equipment: 'Haltères',
      tip: 'Pouces légèrement inclinés vers le bas comme pour verser une bouteille d\'eau. Monte jusqu\'à l\'horizontale sans donner d\'élan avec le buste.',
      imgs: ['Side_Lateral_Raise', '0.jpg', '1.jpg']
    },
    {
      id: 'dips',
      name: 'Dips au poids de corps',
      category: 'push',
      muscles: 'Pectoraux bas · Triceps',
      sets: 3,
      reps: '8–10',
      rest: 90,
      equipment: 'Barres parallèles',
      tip: 'Penche légèrement le buste en avant pour cibler davantage les pecs. Descends jusqu\'à former un angle de 90° aux coudes avant de repousser.',
      imgs: ['Dips_-_Chest_Version', '0.jpg', '1.jpg']
    }
  ]
};

export const DEFAULT_PROGRAM_B: ProgramDetails = {
  key: 'B',
  badge: 'PULL',
  title: 'Séance B — PULL',
  label: 'Dos · Biceps · Arrière d\'épaules',
  description: 'Renforcement complet du tirage pour la largeur, la densité du dos et les biceps.',
  exercises: [
    {
      id: 'lat_pull',
      name: 'Tirage poulie haute large',
      category: 'pull',
      muscles: 'Dorsaux · Biceps · Rhomboïdes',
      sets: 4,
      reps: '8–10',
      rest: 90,
      equipment: 'Poulie haute',
      tip: 'Tire la barre vers le haut de la poitrine en orientant les coudes vers le bas et l\'arrière. Resserre fortement les omoplates en fin de mouvement.',
      imgs: ['Wide-Grip_Lat_Pulldown', '0.jpg', '1.jpg']
    },
    {
      id: 'bb_row',
      name: 'Rowing barre',
      category: 'pull',
      muscles: 'Dorsaux · Trapèzes · Biceps',
      sets: 4,
      reps: '8',
      rest: 90,
      equipment: 'Barre olympique',
      tip: 'Buste penché à environ 45°, dos parfaitement plat. Tire la barre vers le nombril en gardant les coudes le long du corps.',
      imgs: ['Bent_Over_Barbell_Row', '0.jpg', '1.jpg']
    },
    {
      id: 'db_row',
      name: 'Rowing haltère unilatéral',
      category: 'pull',
      muscles: 'Dorsaux · Biceps',
      sets: 3,
      reps: '10/côté',
      rest: 75,
      equipment: 'Haltère & Banc',
      tip: 'Genou et main posés sur le banc. Tire le coude vers le haut et l\'arrière sans tourner les hanches. Amplitude complète.',
      imgs: ['One-Arm_Dumbbell_Row', '0.jpg', '1.jpg']
    },
    {
      id: 'facepull',
      name: 'Face pull poulie',
      category: 'shoulders',
      muscles: 'Deltoïdes postérieurs · Rotateurs',
      sets: 3,
      reps: '15–20',
      rest: 60,
      equipment: 'Poulie & Corde',
      tip: 'Poulie fixée à hauteur des yeux. Tire la corde vers le visage en écartant les mains et en maintenant les coudes hauts. Excellent pour la santé des épaules.',
      imgs: ['Face_Pull', '0.jpg', '1.jpg']
    },
    {
      id: 'ez_curl',
      name: 'Curl biceps barre EZ',
      category: 'arms',
      muscles: 'Biceps · Brachial',
      sets: 3,
      reps: '12',
      rest: 60,
      equipment: 'Barre EZ',
      tip: 'Coudes collés au corps et fixes. Évite tout balancement du dos. Contrôle la phase négative sur 2 à 3 secondes.',
      imgs: ['Barbell_Curl', '0.jpg', '1.jpg']
    },
    {
      id: 'hammer',
      name: 'Curl marteau haltères',
      category: 'arms',
      muscles: 'Brachial · Brachio-radial',
      sets: 3,
      reps: '12',
      rest: 60,
      equipment: 'Haltères',
      tip: 'Prise neutre (pouces vers le haut). Coudes verrouillés le long des flancs. Isole parfaitement le long supinateur et le bras.',
      imgs: ['Hammer_Curls', '0.jpg', '1.jpg']
    }
  ]
};

export const DEFAULT_PROGRAM_C: ProgramDetails = {
  key: 'C',
  badge: 'LEGS + ABS',
  title: 'Séance C — LEGS',
  label: 'Jambes · Mollets · Sangle abdominale',
  description: 'Travail lourd et complet des quadriceps, ischio-jambiers, fessiers et du sangle abdominale.',
  exercises: [
    {
      id: 'squat',
      name: 'Squat barre',
      category: 'legs',
      muscles: 'Quadriceps · Fessiers · Ischios',
      sets: 4,
      reps: '8',
      rest: 120,
      equipment: 'Barre & Rack',
      tip: 'Pieds écartés largeur des épaules. Inspirer, gainer le tronc, puis descendre en poussant les hanches vers l\'arrière jusqu\'au parallèle. Talon bien ancrés.',
      imgs: ['Barbell_Full_Squat', '0.jpg', '1.jpg']
    },
    {
      id: 'rdl',
      name: 'Soulevé de terre roumain',
      category: 'legs',
      muscles: 'Ischio-jambiers · Fessiers · Lombaires',
      sets: 3,
      reps: '10',
      rest: 90,
      equipment: 'Barre',
      tip: 'Garde la barre collée aux jambes et le dos parfaitement plat. Pousse les fesses le plus loin possible vers l\'arrière jusqu\'à ressentir un bon étirement des ischios.',
      imgs: ['Romanian_Deadlift', '0.jpg', '1.jpg']
    },
    {
      id: 'legpress',
      name: 'Presse à cuisses',
      category: 'legs',
      muscles: 'Quadriceps · Fessiers',
      sets: 3,
      reps: '12–15',
      rest: 90,
      equipment: 'Presse à cuisses',
      tip: 'Ne verrouille jamais complètement les genoux en haut de mouvement. Descente contrôlée sans décoller le bas du dos du siège.',
      imgs: ['Leg_Press', '0.jpg', '1.jpg']
    },
    {
      id: 'lunges',
      name: 'Fentes marchées haltères',
      category: 'legs',
      muscles: 'Quadriceps · Fessiers · Ischios',
      sets: 3,
      reps: '10/jambe',
      rest: 75,
      equipment: 'Haltères',
      tip: 'Fais un grand pas vers l\'avant. Le genou arrière descend frôler le sol sans toucher. Pousse fort sur le talon avant pour revenir.',
      imgs: ['Dumbbell_Lunges', '0.jpg', '1.jpg']
    },
    {
      id: 'plank',
      name: 'Gainage planche',
      category: 'core',
      muscles: 'Transverse · Obliques · Lombaires',
      sets: 3,
      reps: '45–60s',
      rest: 45,
      equipment: 'Poids du corps',
      tip: 'Corps parfaitement aligné des talons à la tête. Contracte activement les fessiers et les abdominaux. Respire de façon fluide.',
      imgs: ['Plank', '0.jpg', '1.jpg']
    },
    {
      id: 'leg_raise',
      name: 'Relevés de jambes suspendu',
      category: 'core',
      muscles: 'Abdominaux bas · Flexeurs de hanche',
      sets: 3,
      reps: '12–15',
      rest: 60,
      equipment: 'Barre de traction',
      tip: 'Enroule le bassin vers le haut sans vous balancer. Contrôle fortement la descente pour maintenir une tension continue.',
      imgs: ['Hanging_Leg_Raise', '0.jpg', '1.jpg']
    },
    {
      id: 'cable_crunch',
      name: 'Crunch poulie haute',
      category: 'core',
      muscles: 'Grand droit des abdominaux',
      sets: 3,
      reps: '15',
      rest: 60,
      equipment: 'Poulie & Corde',
      tip: 'À genoux, corde derrière la nuque. Enroule la colonne vertébrale vers l\'arrière des genoux. Ne tire pas avec les bras.',
      imgs: ['Cable_Crunch', '0.jpg', '1.jpg']
    }
  ]
};

export const ALL_PROGRAMS: Record<string, ProgramDetails> = {
  A: DEFAULT_PROGRAM_A,
  B: DEFAULT_PROGRAM_B,
  C: DEFAULT_PROGRAM_C,
};

export const DEFAULT_SCHEDULE = ['A', 'B', 'C', 'rest', 'A', 'B', 'rest'];

export const DEFAULT_SETTINGS: UserSettings = {
  weightUnit: 'kg',
  timerSound: true,
  timerVibration: true,
  defaultRestTime: 90,
  autoOverloadStep: 2.5,
  barbellWeight: 20,
  autoShiftSchedule: true,
  animatedGifs: true,
  exerciseMediaBaseUrl: EXERCISE_IMAGE_BASE_URL,
};

export const EXTRA_LIBRARY_EXERCISES: Exercise[] = [
  {
    id: 'chest_press_machine',
    name: 'Développé machine guidée',
    category: 'push',
    muscles: 'Pectoraux · Triceps',
    sets: 3,
    reps: '10–12',
    rest: 75,
    equipment: 'Machine guidée',
    tip: 'Règle le siège pour avoir les poignées au niveau du milieu de poitrine. Pousse en gardant la poitrine sortie.',
    imgs: ['Lever_Chest_Press', '0.jpg', '1.jpg']
  },
  {
    id: 'tricep_pushdown',
    name: 'Extension triceps poulie corde',
    category: 'push',
    muscles: 'Triceps',
    sets: 3,
    reps: '12–15',
    rest: 60,
    equipment: 'Poulie haute & Corde',
    tip: 'Coudes collés aux côtes. Écarte la corde en bas de mouvement pour contracter fort le triceps.',
    imgs: ['Triceps_Pushdown', '0.jpg', '1.jpg']
  },
  {
    id: 'skullcrusher',
    name: 'Barre au front (Skullcrusher)',
    category: 'push',
    muscles: 'Triceps (chef long)',
    sets: 3,
    reps: '10–12',
    rest: 75,
    equipment: 'Barre EZ & Banc',
    tip: 'Amène la barre vers le haut du front ou légèrement derrière la tête. Coudes serrés et orientés vers le plafond.',
    imgs: ['Lying_Triceps_Extension', '0.jpg', '1.jpg']
  },
  {
    id: 'pulldown_close',
    name: 'Tirage poitrine prise serrée',
    category: 'pull',
    muscles: 'Dorsaux · Biceps',
    sets: 3,
    reps: '10',
    rest: 75,
    equipment: 'Poulie haute & Poignée V',
    tip: 'Tire la poignée vers le bas du sternum en étirant bien le grand dorsal en haut.',
    imgs: ['Close-Grip_Front_Lat_Pulldown', '0.jpg', '1.jpg']
  },
  {
    id: 'leg_extension',
    name: 'Leg extension',
    category: 'legs',
    muscles: 'Quadriceps',
    sets: 3,
    reps: '15',
    rest: 60,
    equipment: 'Machine leg extension',
    tip: 'Verrouille ton bassin contre le siège. Étends complètement les jambes et marque 1s en haut.',
    imgs: ['Leg_Extensions', '0.jpg', '1.jpg']
  },
  {
    id: 'leg_curl',
    name: 'Leg curl allongé',
    category: 'legs',
    muscles: 'Ischio-jambiers',
    sets: 3,
    reps: '12–15',
    rest: 60,
    equipment: 'Machine leg curl',
    tip: 'Garde les hanches bien plaquées sur le banc pendant toute l\'exécution.',
    imgs: ['Lying_Leg_Curls', '0.jpg', '1.jpg']
  },
  {
    id: 'calf_raise',
    name: 'Extensions mollets debout',
    category: 'legs',
    muscles: 'Mollets (Gastrocnémiens)',
    sets: 4,
    reps: '15–20',
    rest: 60,
    equipment: 'Machine ou Haltères',
    tip: 'Descente lente avec étirement profond en bas, puis montée explosive sur les pointes de pieds.',
    imgs: ['Standing_Calf_Raises', '0.jpg', '1.jpg']
  }
];
