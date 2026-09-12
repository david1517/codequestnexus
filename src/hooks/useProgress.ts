import { useEffect, useState } from 'react';
import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';

import { useAuthStore } from '@/stores/useAuthStore';
import { db } from '@/lib/firebase';

export interface ProgressData {
  completedLessons: string[];
  xp: number;
  downloadedLessons: string[];
  lastUpdated: string;
}

/**
 * Cria um progresso NOVO.
 *
 * IMPORTANTE:
 * Isso nunca representa outro usuário.
 * É usado somente quando o UID atual ainda não possui
 * um documento de progresso.
 */
const createDefaultProgress = (): ProgressData => ({
  completedLessons: [],
  xp: 0,
  downloadedLessons: [],
  lastUpdated: new Date().toISOString(),
});

/**
 * Cada usuário possui uma chave LOCAL diferente.
 *
 * Exemplo:
 * codequest-progress-direct-abc123
 * codequest-progress-direct-xyz789
 *
 * Nunca existe uma chave global compartilhada.
 */
const getStorageKey = (userId: string) =>
  `codequest-progress-direct-${userId}`;

/**
 * Garante que os dados vindos do Firestore tenham
 * exatamente o formato esperado pelo aplicativo.
 */
const normalizeProgress = (value: unknown): ProgressData => {
  if (!value || typeof value !== 'object') {
    return createDefaultProgress();
  }

  const parsed = value as Record<string, unknown>;

  return {
    completedLessons: Array.isArray(parsed.completedLessons)
      ? parsed.completedLessons.filter(
          (item): item is string => typeof item === 'string'
        )
      : [],

    xp:
      typeof parsed.xp === 'number' &&
      Number.isFinite(parsed.xp)
        ? parsed.xp
        : 0,

    downloadedLessons: Array.isArray(parsed.downloadedLessons)
      ? parsed.downloadedLessons.filter(
          (item): item is string => typeof item === 'string'
        )
      : [],

    lastUpdated:
      typeof parsed.lastUpdated === 'string'
        ? parsed.lastUpdated
        : new Date().toISOString(),
  };
};

/**
 * Lê somente o progresso LOCAL do UID atual.
 *
 * Nunca existe fallback para:
 * - outro usuário
 * - guest
 * - chave global
 * - progresso compartilhado
 */
const getStoredProgress = (
  userId: string
): ProgressData | null => {
  try {
    const stored = localStorage.getItem(
      getStorageKey(userId)
    );

    if (!stored) {
      return null;
    }

    return normalizeProgress(JSON.parse(stored));
  } catch (error) {
    console.error(
      '❌ Erro ao carregar progresso local do usuário:',
      error
    );

    return null;
  }
};

/**
 * Salva uma cópia local vinculada exclusivamente ao UID.
 */
const saveLocalProgress = (
  userId: string,
  progress: ProgressData
) => {
  try {
    localStorage.setItem(
      getStorageKey(userId),
      JSON.stringify(progress)
    );
  } catch (error) {
    console.error(
      '❌ Erro ao salvar progresso local:',
      error
    );
  }
};

export function useProgress() {
  /**
   * ESTE é o identificador que separa completamente
   * o progresso de cada usuário.
   */
  const userId = useAuthStore(
    (state) => state.user?.id
  );

  const [progress, setProgress] =
    useState<ProgressData>(() =>
      userId
        ? getStoredProgress(userId) ??
          createDefaultProgress()
        : createDefaultProgress()
    );

  const [loading, setLoading] = useState(true);

  /**
   * Quando o usuário muda:
   *
   * usuário A -> usuário B
   *
   * carregamos somente B.
   *
   * Nunca mantemos o progresso de A.
   */
  useEffect(() => {
    let cancelled = false;

    const loadUserProgress = async () => {
      /**
       * Nenhum usuário logado.
       *
       * Não buscamos progresso de ninguém.
       */
      if (!userId) {
        setProgress(createDefaultProgress());
        setLoading(false);
        return;
      }

      setLoading(true);

      /**
       * Primeiro usamos a cópia LOCAL do MESMO UID
       * apenas para evitar a tela aparecendo vazia
       * enquanto o Firestore responde.
       */
      const localProgress =
        getStoredProgress(userId);

      if (!cancelled && localProgress) {
        setProgress(localProgress);
      } else if (!cancelled) {
        setProgress(createDefaultProgress());
      }

      /**
       * Sem Firebase/Firestore:
       * o usuário continua usando apenas os dados
       * locais pertencentes ao próprio UID.
       */
      if (!db) {
        if (!cancelled) {
          setLoading(false);
        }

        return;
      }

      /**
       * CAMINHO EXCLUSIVO DO USUÁRIO.
       *
       * users/{userId}/progress/main
       */
      const progressRef = doc(
        db,
        'users',
        userId,
        'progress',
        'main'
      );

      try {
        /**
         * Primeiro verificamos se o documento existe.
         *
         * Isso evita o problema anterior:
         *
         * onSnapshot -> documento inexistente
         * -> createDefaultProgress()
         * -> usuário aparece com 0
         */
        const snapshot = await getDoc(progressRef);

        if (cancelled) {
          return;
        }

        if (snapshot.exists()) {
          /**
           * O Firestore é a fonte oficial.
           *
           * Pegamos SOMENTE o documento deste UID.
           */
          const firestoreProgress =
            normalizeProgress(
              snapshot.data()
            );

          setProgress(firestoreProgress);

          saveLocalProgress(
            userId,
            firestoreProgress
          );
        } else {
          /**
           * O usuário ainda não possui progresso
           * salvo no Firestore.
           *
           * Se ele já tinha progresso LOCAL do
           * MESMO UID, preservamos.
           *
           * Se não tinha, começa do zero.
           */
          const initialProgress =
            localProgress ??
            createDefaultProgress();

          setProgress(initialProgress);

          /**
           * Criamos o documento SOMENTE dentro
           * do UID atual.
           */
          await setDoc(
            progressRef,
            initialProgress
          );

          saveLocalProgress(
            userId,
            initialProgress
          );
        }
      } catch (error) {
        console.error(
          '❌ Erro ao carregar progresso do usuário:',
          error
        );

        /**
         * Se o Firestore falhar, não pegamos
         * progresso de ninguém.
         *
         * Usamos somente a cópia local do próprio UID.
         */
        if (!cancelled) {
          setProgress(
            localProgress ??
              createDefaultProgress()
          );
        }
      }

      if (!cancelled) {
        setLoading(false);
      }
    };

    loadUserProgress();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  /**
   * Listener em tempo real.
   *
   * Depois que o documento do usuário existe,
   * qualquer alteração feita por este usuário
   * em outro lugar será refletida aqui.
   */
  useEffect(() => {
    if (!userId || !db) {
      return;
    }

    const progressRef = doc(
      db,
      'users',
      userId,
      'progress',
      'main'
    );

    const unsubscribe = onSnapshot(
      progressRef,
      (snapshot) => {
        /**
         * Segurança extra:
         * se o documento sumir, não buscamos
         * progresso de outro lugar.
         */
        if (!snapshot.exists()) {
          return;
        }

        const firestoreProgress =
          normalizeProgress(
            snapshot.data()
          );

        setProgress(firestoreProgress);

        saveLocalProgress(
          userId,
          firestoreProgress
        );
      },
      (error) => {
        console.error(
          '❌ Erro ao acompanhar progresso no Firestore:',
          error
        );
      }
    );

    return () => {
      unsubscribe();
    };
  }, [userId]);

  /**
   * Salva o progresso do usuário atual.
   *
   * IMPORTANTE:
   * nunca salva em documento global.
   *
   * Sempre:
   * users/{userId}/progress/main
   */
  const save = async (
    newData: ProgressData
  ) => {
    if (!userId) {
      console.warn(
        '⚠️ Tentativa de salvar progresso sem usuário logado.'
      );

      return;
    }

    const normalized =
      normalizeProgress(newData);

    /**
     * Atualização imediata da interface.
     */
    setProgress(normalized);

    /**
     * Cópia local EXCLUSIVA deste usuário.
     */
    saveLocalProgress(
      userId,
      normalized
    );

    /**
     * Sem Firestore, a cópia local do UID
     * continua funcionando.
     */
    if (!db) {
      return;
    }

    try {
      const progressRef = doc(
        db,
        'users',
        userId,
        'progress',
        'main'
      );

      await setDoc(
        progressRef,
        normalized
      );
    } catch (error: unknown) {
      console.error(
        '❌ Erro ao salvar progresso no Firestore:',
        error instanceof Error
          ? error.message
          : error
      );
    }
  };

  /**
   * Marca uma aula como concluída.
   */
  const completeLesson = async (
    lessonId: string,
    xpReward: number
  ) => {
    if (!userId) {
      return;
    }

    if (
      progress.completedLessons.includes(
        lessonId
      )
    ) {
      return;
    }

    await save({
      ...progress,

      completedLessons: [
        ...progress.completedLessons,
        lessonId,
      ],

      xp:
        progress.xp +
        Math.max(0, xpReward),

      lastUpdated:
        new Date().toISOString(),
    });
  };

  /**
   * Desmarca uma aula.
   */
  const uncompleteLesson = async (
    lessonId: string,
    xpReward: number
  ) => {
    if (!userId) {
      return;
    }

    if (
      !progress.completedLessons.includes(
        lessonId
      )
    ) {
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
        progress.xp -
          Math.max(0, xpReward)
      ),

      lastUpdated:
        new Date().toISOString(),
    });
  };

  /**
   * Marca PDF/material como baixado.
   *
   * O ID é salvo somente no progresso
   * do usuário atual.
   */
  const markAsDownloaded = async (
    lessonId: string
  ) => {
    if (!userId) {
      return;
    }

    if (
      progress.downloadedLessons.includes(
        lessonId
      )
    ) {
      return;
    }

    await save({
      ...progress,

      downloadedLessons: [
        ...progress.downloadedLessons,
        lessonId,
      ],

      lastUpdated:
        new Date().toISOString(),
    });
  };

  /**
   * Remove uma aula da lista de downloads
   * deste usuário.
   */
  const removeDownload = async (
    lessonId: string
  ) => {
    if (!userId) {
      return;
    }

    await save({
      ...progress,

      downloadedLessons:
        progress.downloadedLessons.filter(
          (id) => id !== lessonId
        ),

      lastUpdated:
        new Date().toISOString(),
    });
  };

  /**
   * Verifica se uma aula foi concluída
   * pelo usuário atual.
   */
  const isLessonCompleted = (
    lessonId: string
  ) => {
    return progress.completedLessons.includes(
      lessonId
    );
  };

  /**
   * Verifica se uma aula foi baixada
   * pelo usuário atual.
   */
  const isLessonDownloaded = (
    lessonId: string
  ) => {
    return progress.downloadedLessons.includes(
      lessonId
    );
  };

  /**
   * Calcula o progresso de um curso
   * usando somente as aulas concluídas
   * pelo usuário atual.
   */
  const getCourseProgress = (
    courseId: string,
    totalLessons: number
  ): number => {
    const completed =
      progress.completedLessons.filter(
        (id) =>
          id.startsWith(
            `${courseId}-`
          )
      ).length;

    return totalLessons > 0
      ? Math.round(
          (completed /
            totalLessons) *
            100
        )
      : 0;
  };

  /**
   * Reseta SOMENTE o progresso
   * do usuário atualmente logado.
   *
   * Não afeta nenhum outro usuário.
   */
  const resetProgress = async () => {
    if (!userId) {
      return;
    }

    await save(
      createDefaultProgress()
    );
  };

  return {
    progress,
    loading,

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