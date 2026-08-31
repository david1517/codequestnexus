import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';

interface ProgressData {
  completedLessons: string[];
  xp: number;
  downloadedLessons: string[];
  lastUpdated: string;
}

const DEFAULT: ProgressData = {
  completedLessons: [],
  xp: 0,
  downloadedLessons: [],
  lastUpdated: new Date().toISOString(),
};

const STORAGE_KEY = 'codequest-progress-direct';
const HAS_FIREBASE = !!import.meta.env.VITE_FIREBASE_API_KEY;

export function useProgress() {
  const user = useAuthStore((s) => s.user);
  const [progress, setProgress] = useState<ProgressData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          completedLessons: parsed.completedLessons || [],
          xp: parsed.xp || 0,
          downloadedLessons: parsed.downloadedLessons || [],
          lastUpdated: parsed.lastUpdated || new Date().toISOString(),
        };
      }
    } catch (err) {
      console.error('Erro ao carregar:', err);
    }
    return DEFAULT;
  });

  // Recarrega quando o usuário muda
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProgress({
          completedLessons: parsed.completedLessons || [],
          xp: parsed.xp || 0,
          downloadedLessons: parsed.downloadedLessons || [],
          lastUpdated: parsed.lastUpdated || new Date().toISOString(),
        });
      } else {
        setProgress(DEFAULT);
      }
    } catch (err) {
      console.error('Erro ao carregar:', err);
    }
  }, [user?.id]);

  // Listener do Firestore (se tiver Firebase)
  useEffect(() => {
    if (!user || !HAS_FIREBASE) return;

    let unsubscribe: any;
    (async () => {
      try {
        const { doc, onSnapshot } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const docRef = doc(db, 'users', user.id, 'progress', 'data');

        console.log('☁️ Conectando ao Firestore...');

        unsubscribe = onSnapshot(
          docRef,
          (snap) => {
            if (snap.exists()) {
              const data = snap.data() as ProgressData;
              console.log('☁️ Dados do Firestore:', data);
              setProgress(data);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            }
          },
          (err) => {
            console.warn('⚠️ Erro no Firestore:', err.message);
          }
        );
      } catch (err) {
        console.warn('⚠️ Firebase não disponível:', err);
      }
    })();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  // FUNÇÃO SAVE COM LOGS DETALHADOS
  const save = async (newData: ProgressData) => {
    console.log('💾 save() chamado com:', newData);

    // 1. Salva no estado local
    setProgress(newData);

    // 2. Salva no localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      console.log('✅ Salvo no localStorage');
    } catch (err) {
      console.error('❌ Erro ao salvar local:', err);
    }

    // 3. Salva no Firebase (se configurado e tiver user)
    if (user && HAS_FIREBASE) {
      console.log('☁️ Tentando salvar no Firebase...');
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        console.log('☁️ db conectado:', !!db);
        console.log('☁️ user.id:', user.id);
        await setDoc(doc(db, 'users', user.id, 'progress', 'data'), newData);
        console.log('☁️✅ Salvo no Firebase com sucesso!');
      } catch (err: any) {
        console.error('❌ Erro Firebase:', err.message);
        console.error('❌ Código:', err.code);
      }
    } else {
      console.log('⚠️ Não vai salvar no Firebase porque:');
      console.log('   user existe:', !!user);
      console.log('   HAS_FIREBASE:', HAS_FIREBASE);
    }
  };

  const completeLesson = async (lessonId: string, xpReward: number) => {
    if (progress.completedLessons.includes(lessonId)) return;
    await save({
      ...progress,
      completedLessons: [...progress.completedLessons, lessonId],
      xp: progress.xp + xpReward,
      lastUpdated: new Date().toISOString(),
    });
  };

  const uncompleteLesson = async (lessonId: string, xpReward: number) => {
    if (!progress.completedLessons.includes(lessonId)) return;
    await save({
      ...progress,
      completedLessons: progress.completedLessons.filter((id) => id !== lessonId),
      xp: Math.max(0, progress.xp - xpReward),
      lastUpdated: new Date().toISOString(),
    });
  };

  const markAsDownloaded = async (lessonId: string) => {
    if (progress.downloadedLessons.includes(lessonId)) return;
    await save({
      ...progress,
      downloadedLessons: [...progress.downloadedLessons, lessonId],
      lastUpdated: new Date().toISOString(),
    });
  };

  const removeDownload = async (lessonId: string) => {
    await save({
      ...progress,
      downloadedLessons: progress.downloadedLessons.filter((id) => id !== lessonId),
      lastUpdated: new Date().toISOString(),
    });
  };

  const isLessonCompleted = (id: string) => progress.completedLessons.includes(id);
  const isLessonDownloaded = (id: string) => progress.downloadedLessons.includes(id);

  const getCourseProgress = (courseId: string, totalLessons: number): number => {
    const completed = progress.completedLessons.filter((id) =>
      id.startsWith(`${courseId}-`)
    ).length;
    return totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;
  };

  const resetProgress = async () => {
    await save({ ...DEFAULT, lastUpdated: new Date().toISOString() });
  };

  return {
    progress,
    loading: false,
    completeLesson,
    uncompleteLesson,
    markAsDownloaded,
    removeDownload,
    isLessonCompleted,
    isLessonDownloaded,
    getCourseProgress,
    resetProgress,
  };
}
