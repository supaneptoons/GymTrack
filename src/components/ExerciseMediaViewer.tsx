import React, { useState, useEffect, useMemo } from 'react';
import { Exercise } from '../types';
import { EXERCISE_IMAGE_BASE_URL } from '../data/defaultProgram';
import { Image as ImageIcon, Sparkles } from 'lucide-react';

interface ExerciseMediaViewerProps {
  exercise: Exercise;
  baseUrl?: string;
  defaultAnimated?: boolean;
}

export const ExerciseMediaViewer: React.FC<ExerciseMediaViewerProps> = ({
  exercise,
  baseUrl = EXERCISE_IMAGE_BASE_URL,
}) => {
  const [folder, f0, f1] = exercise.imgs || ['Barbell_Bench_Press', '0.jpg', '1.jpg'];
  const activeBaseUrl = baseUrl || EXERCISE_IMAGE_BASE_URL;
  const cleanBaseUrl = activeBaseUrl.endsWith('/') ? activeBaseUrl : `${activeBaseUrl}/`;

  // Candidate images for static 0.jpg and 1.jpg
  const img0Candidates = useMemo(() => [
    `${cleanBaseUrl}${folder}/${f0}`,
    `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${folder}/${f0}`,
    `https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/${folder}/${f0}`,
  ], [cleanBaseUrl, folder, f0]);

  const img1Candidates = useMemo(() => [
    `${cleanBaseUrl}${folder}/${f1}`,
    `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${folder}/${f1}`,
    `https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/${folder}/${f1}`,
  ], [cleanBaseUrl, folder, f1]);

  const [img0Index, setImg0Index] = useState(0);
  const [img1Index, setImg1Index] = useState(0);

  useEffect(() => {
    setImg0Index(0);
    setImg1Index(0);
  }, [exercise.id, baseUrl]);

  const currentImg0Url = img0Candidates[img0Index];
  const currentImg1Url = img1Candidates[img1Index];

  const handleImg0Error = () => {
    if (img0Index + 1 < img0Candidates.length) {
      setImg0Index((prev) => prev + 1);
    }
  };

  const handleImg1Error = () => {
    if (img1Index + 1 < img1Candidates.length) {
      setImg1Index((prev) => prev + 1);
    }
  };

  return (
    <div className="my-3 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-100/90 p-2 rounded-xl border border-slate-200/80 text-xs">
        <div className="flex items-center gap-1.5 font-extrabold text-[11px] text-slate-700 font-heading">
          <Sparkles className="w-3.5 h-3.5 text-[#0a0a0a]" />
          <span>Visuel Démonstration Mouvement</span>
        </div>

        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 font-mono">
          <ImageIcon className="w-3.5 h-3.5 text-slate-600" />
          <span>Positions Départ & Arrivée</span>
        </div>
      </div>

      {/* Static 2-photo side-by-side view */}
      <div className="grid grid-cols-2 gap-2">
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 group">
          <img
            key={currentImg0Url}
            src={currentImg0Url}
            alt="Départ"
            className="w-full h-full object-cover"
            onError={handleImg0Error}
            loading="lazy"
          />
          <span className="absolute bottom-1.5 left-1.5 bg-[#0a0a0a]/80 backdrop-blur-sm text-[9px] font-bold text-white px-2 py-0.5 rounded uppercase tracking-wider font-heading">
            Départ
          </span>
        </div>

        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 group">
          <img
            key={currentImg1Url}
            src={currentImg1Url}
            alt="Arrivée"
            className="w-full h-full object-cover"
            onError={handleImg1Error}
            loading="lazy"
          />
          <span className="absolute bottom-1.5 left-1.5 bg-[#0a0a0a]/80 backdrop-blur-sm text-[9px] font-bold text-white px-2 py-0.5 rounded uppercase tracking-wider font-heading">
            Arrivée
          </span>
        </div>
      </div>
    </div>
  );
};

