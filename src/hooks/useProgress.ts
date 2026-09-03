import { useState, useEffect } from 'react';
import {
  doc,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';
import { useAuthStore } from '@/stores/useAuthStore';
import { db } from '@/lib/firebase';

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

const getStoredProgress = (): ProgressData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      const parsed = JSON.parse(stored);

      return {
        completedLessons: parsed.completedLessons || [],
        xp: parsed.xp || 0,
        downloadedLessons: parsed.downloadedLessons || [],
        lastUpdated:
          parsed.lastUpdated || new Date().toISOString(),
      };
    }
  } catch (err) {
    console.error('❌ Erro ao carregar progresso local:', err);
  }

  return DEFAULT;
};

export function useProgress() {
  const user = useAuthStore((s) => s.user);

  const [progress, setProgress] = useState<ProgressData>(
    getStoredProgress
  );

  // Recarrega o progresso quando o usuário muda
  useEffect(() => {
    setProgress(getStoredProgress());
  }, [user?.id]);

  // Conecta ao Firestore
  useEffect(() => {
    if (!user || !db) {
      return;
    }

    console.log('☁️ Conectando ao Firestore...');

    const progressRef = doc(
      db,
      'users',
      user.id,
      'progress',
      'main'
    );

    const unsubscribe = onSnapshot(
      progressRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();

          const normalizedData: ProgressData = {
            completedLessons:
              Array.isArray(data.completedLessons)
                ? data.completedLessons
                : [],

            xp:
              typeof data.xp === 'number'
                ? data.xp
                : 0,

            downloadedLessons:
              Array.isArray(data.downloadedLessons)
                ? data.downloadedLessons
                : [],

            lastUpdated:
              typeof data.lastUpdated === 'string'
                ? data.lastUpdated
                : new Date().toISOString(),
          };

          console.log(
            '☁️ Dados recebidos do Firestore:',
            normalizedData
          );

          setProgress(normalizedData);

          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(normalizedData)
          );
        } else {
          console.log(
            '☁️ Nenhum progresso encontrado. Usando progresso inicial.'
          );
        }
      },
      (error) => {
        console.error(
          '❌ Erro ao ler Firestore:',
          error.message
        );
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user?.id]);

  // Salva progresso
  const save = async (newData: ProgressData) => {
    console.log('💾 save() chamado com:', newData);

    // Estado local
    setProgress(newData);

    // localStorage
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(newData)
      );

      console.log('✅ Salvo no localStorage');
    } catch (err) {
      console.error(
        '❌ Erro ao salvar no localStorage:',
        err
      );
    }

    // Firebase
    if (!user) {
      console.log(
        '⚠️ Usuário não autenticado. Não será salvo na nuvem.'
      );
      return;
    }

    if (!db) {
      console.log(
        '⚠️ Firestore não está disponível.'
      );
      return;
    }

    try {
      console.log(
        '☁️ Salvando no Firestore...'
      );

      const progressRef = doc(
        db,
        'users',
        user.id,
        'progress',
        'main'
      );

      await setDoc(
        progressRef,
        newData
      );

      console.log(
        '☁️✅ Progresso salvo no Firestore!'
      );
    } catch (err: any) {
      console.error(
        '❌ Erro ao salvar no Firestore:',
        err?.message || err
      );
    }
  };

  const completeLesson = async (
    lessonId: string,
    xpReward: number
  ) => {
    if (progress.completedLessons.includes(lessonId)) {
      return;
    }

    await save({
      ...progress,

      completedLessons: [
        ...progress.completedLessons,
        lessonId,
      ],

      xp: progress.xp + xpReward,

      lastUpdated: new Date().toISOString(),
    });
  };

  const uncompleteLesson = async (
    lessonId: string,
    xpReward: number
  ) => {
    if (!progress.completedLessons.includes(lessonId)) {
      return;
    }

    await save({
      ...progress,

      completedLessons:
        progress.completedLessons.filter(
          (id) => id !== lessonId
        ),

      xp: Math.max(
        0,
        progress.xp - xpReward
      ),

      lastUpdated: new Date().toISOString(),
    });
  };

  const markAsDownloaded = async (
    lessonId: string
  ) => {
    if (
      progress.downloadedLessons.includes(lessonId)
    ) {
      return;
    }

    await save({
      ...progress,

      downloadedLessons: [
        ...progress.downloadedLessons,
        lessonId,
      ],

      lastUpdated: new Date().toISOString(),
    });
  };

  const removeDownload = async (
    lessonId: string
  ) => {
    await save({
      ...progress,

      downloadedLessons:
        progress.downloadedLessons.filter(
          (id) => id !== lessonId
        ),

      lastUpdated: new Date().toISOString(),
    });
  };

  const isLessonCompleted = (id: string) =>
    progress.completedLessons.includes(id);

  const isLessonDownloaded = (id: string) =>
    progress.downloadedLessons.includes(id);

  const getCourseProgress = (
    courseId: string,
    totalLessons: number
  ): number => {
    const completed =
      progress.completedLessons.filter((id) =>
        id.startsWith(`${courseId}-`)
      ).length;

    return totalLessons > 0
      ? Math.round(
          (completed / totalLessons) * 100
        )
      : 0;
  };

  const resetProgress = async () => {
    await save({
      ...DEFAULT,
      lastUpdated: new Date().toISOString(),
    });
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