import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/useAuthStore';

type LessonType = 'pdf' | 'word' | 'video' | 'quiz';

interface Lesson {
  id: string;
  title: string;
  description: string;
  type: LessonType;
  content: string;
  duration: number;
  xpReward: number;

  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  fileType?: string;
  uploadedAt?: string;
}

interface Course {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  views: number;
  lessons: Lesson[];
  teacherId: string;
  published: boolean;
  averageRating: number;
  ratingsCount: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

type TeacherStatus =
  | 'pending'
  | 'approved'
  | 'rejected';

type ActiveTab =
  | 'courses'
  | 'create'
  | 'score';

/*
 * O Firestore possui limite de aproximadamente 1 MiB por documento.
 *
 * PDFs e arquivos Word pequenos serão armazenados como Data URL dentro do próprio
 * documento do curso, usando limites conservadores para evitar
 * estourar o tamanho do documento.
 */
const MAX_FILE_SIZE = 350 * 1024;
const MAX_TOTAL_EMBEDDED_SIZE = 700 * 1024;

function normalizeStatus(
  value: unknown
): TeacherStatus {
  const status = String(value ?? '')
    .trim()
    .toLowerCase();

  if (
    status === 'approved' ||
    status === 'aprovado'
  ) {
    return 'approved';
  }

  if (
    status === 'rejected' ||
    status === 'rejeitado'
  ) {
    return 'rejected';
  }

  return 'pending';
}

function createSlug(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatFileSize(
  bytes?: number
) {
  if (!bytes) {
    return '';
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

function getAverageRating(
  course: Course
) {
  if (
    !course.ratingsCount ||
    course.ratingsCount <= 0
  ) {
    return '0.0';
  }

  return course.averageRating.toFixed(1);
}

function isDataUrl(
  value?: string
) {
  return Boolean(
    value &&
      value.startsWith('data:')
  );
}

function serializeLesson(
  lesson: Lesson
) {
  const result: Record<
    string,
    unknown
  > = {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    type: lesson.type,
    content: lesson.content,
    duration: lesson.duration,
    xpReward: lesson.xpReward,
  };

  if (lesson.fileName) {
    result.fileName = lesson.fileName;
  }

  if (lesson.fileUrl) {
    result.fileUrl = lesson.fileUrl;
  }

  if (
    typeof lesson.fileSize ===
    'number'
  ) {
    result.fileSize =
      lesson.fileSize;
  }

  if (lesson.fileType) {
    result.fileType =
      lesson.fileType;
  }

  if (lesson.uploadedAt) {
    result.uploadedAt =
      lesson.uploadedAt;
  }

  return result;
}

function getEmbeddedSize(
  lessons: Lesson[]
) {
  return lessons.reduce(
    (total, lesson) => {
      if (
        isDataUrl(lesson.fileUrl)
      ) {
        return (
          total +
          lesson.fileUrl!.length
        );
      }

      return total;
    },
    0
  );
}

function readFileAsDataUrl(
  file: File
): Promise<string> {
  return new Promise(
    (resolve, reject) => {
      const reader =
        new FileReader();

      reader.onload = () => {
        if (
          typeof reader.result ===
          'string'
        ) {
          resolve(
            reader.result
          );
        } else {
          reject(
            new Error(
              'Não foi possível ler o arquivo.'
            )
          );
        }
      };

      reader.onerror = () => {
        reject(
          new Error(
            'Erro ao ler o arquivo.'
          )
        );
      };

      reader.readAsDataURL(file);
    }
  );
}

export function TeacherDashboard() {
  const { user } =
    useAuthStore();

  const [teacherStatus, setTeacherStatus] =
    useState<TeacherStatus>(
      'pending'
    );

  const [courses, setCourses] =
    useState<Course[]>([]);

  const [
    selectedCourseId,
    setSelectedCourseId,
  ] = useState<string | null>(
    null
  );

  const [activeTab, setActiveTab] =
    useState<ActiveTab>('courses');

  const [newCourseTitle, setNewCourseTitle] =
    useState('');

  const [
    newCourseDescription,
    setNewCourseDescription,
  ] = useState('');

  const [
    loadingApproval,
    setLoadingApproval,
  ] = useState(true);

  const [
    loadingCourses,
    setLoadingCourses,
  ] = useState(true);

  const [creating, setCreating] =
    useState(false);

  const [
    deletingCourse,
    setDeletingCourse,
  ] = useState(false);

  const selectedCourse =
    useMemo(() => {
      return (
        courses.find(
          (course) =>
            course.id ===
            selectedCourseId
        ) ?? null
      );
    }, [
      courses,
      selectedCourseId,
    ]);

  /*
   * Verifica aprovação do professor.
   */
  useEffect(() => {
    if (!user?.id || !db) {
      setTeacherStatus(
        'pending'
      );
      setLoadingApproval(false);
      return;
    }

    const teacherRef = doc(
      db,
      'teachers',
      user.id
    );

    const userRef = doc(
      db,
      'users',
      user.id
    );

    let teacherStatusValue:
      | TeacherStatus
      | null = null;

    let userStatusValue:
      | TeacherStatus
      | null = null;

    const updateStatus = () => {
      if (
        teacherStatusValue ===
          'approved' ||
        userStatusValue ===
          'approved'
      ) {
        setTeacherStatus(
          'approved'
        );
        setLoadingApproval(false);
        return;
      }

      if (
        teacherStatusValue ===
          'rejected' ||
        userStatusValue ===
          'rejected'
      ) {
        setTeacherStatus(
          'rejected'
        );
        setLoadingApproval(false);
        return;
      }

      setTeacherStatus(
        'pending'
      );
      setLoadingApproval(false);
    };

    const unsubscribeTeacher =
      onSnapshot(
        teacherRef,
        (snapshot) => {
          if (
            snapshot.exists()
          ) {
            const data =
              snapshot.data();

            teacherStatusValue =
              normalizeStatus(
                data.status
              );
          }

          updateStatus();
        },
        () => {
          teacherStatusValue =
            null;
          updateStatus();
        }
      );

    const unsubscribeUser =
      onSnapshot(
        userRef,
        (snapshot) => {
          if (
            snapshot.exists()
          ) {
            const data =
              snapshot.data();

            userStatusValue =
              normalizeStatus(
                data.teacherStatus ??
                  data.status
              );
          }

          updateStatus();
        },
        () => {
          userStatusValue =
            null;
          updateStatus();
        }
      );

    return () => {
      unsubscribeTeacher();
      unsubscribeUser();
    };
  }, [user?.id]);

  /*
   * Carrega cursos do professor.
   */
  useEffect(() => {
    if (
      !user?.id ||
      !db ||
      teacherStatus !==
        'approved'
    ) {
      setCourses([]);
      setLoadingCourses(false);
      return;
    }

    setLoadingCourses(true);

    const coursesRef =
      collection(
        db,
        'courses'
      );

    const coursesQuery =
      query(
        coursesRef,
        where(
          'teacherId',
          '==',
          user.id
        )
      );

    const unsubscribe =
      onSnapshot(
        coursesQuery,
        (snapshot) => {
          const loadedCourses =
            snapshot.docs.map(
              (item) => {
                const data =
                  item.data();

                const lessons =
                  Array.isArray(
                    data.lessons
                  )
                    ? data.lessons.map(
                        (
                          lesson: any
                        ) => ({
                          id: String(
                            lesson.id ??
                              Date.now()
                          ),
                          title:
                            String(
                              lesson.title ??
                                ''
                            ),
                          description:
                            String(
                              lesson.description ??
                                ''
                            ),
                          type:
                            lesson.type ===
                              'word' ||
                            lesson.type ===
                              'video' ||
                            lesson.type ===
                              'quiz'
                              ? lesson.type
                              : 'pdf',
                          content:
                            String(
                              lesson.content ??
                                ''
                            ),
                          duration:
                            Number(
                              lesson.duration ??
                                0
                            ),
                          xpReward:
                            Number(
                              lesson.xpReward ??
                                10
                            ),
                          fileName:
                            lesson.fileName,
                          fileUrl:
                            lesson.fileUrl,
                          fileSize:
                            typeof lesson.fileSize ===
                            'number'
                              ? lesson.fileSize
                              : undefined,
                          fileType:
                            lesson.fileType,
                          uploadedAt:
                            lesson.uploadedAt,
                        })
                      )
                    : [];

                return {
                  id: item.id,
                  slug: String(
                    data.slug ??
                      createSlug(
                        data.name ??
                          'curso'
                      )
                  ),
                  name: String(
                    data.name ??
                      ''
                  ),
                  description:
                    String(
                      data.description ??
                        ''
                    ),
                  icon: String(
                    data.icon ??
                      '📚'
                  ),
                  color: String(
                    data.color ??
                      '#00D4FF'
                  ),
                  views: Number(
                    data.views ?? 0
                  ),
                  lessons,
                  teacherId:
                    String(
                      data.teacherId ??
                        ''
                    ),
                  published:
                    Boolean(
                      data.published
                    ),
                  averageRating:
                    Number(
                      data.averageRating ??
                        0
                    ),
                  ratingsCount:
                    Number(
                      data.ratingsCount ??
                        0
                    ),
                  createdAt:
                    data.createdAt,
                  updatedAt:
                    data.updatedAt,
                };
              }
            );

          setCourses(
            loadedCourses
          );
          setLoadingCourses(false);

          if (
            selectedCourseId &&
            !loadedCourses.some(
              (course) =>
                course.id ===
                selectedCourseId
            )
          ) {
            setSelectedCourseId(
              null
            );
          }
        },
        () => {
          setLoadingCourses(false);
        }
      );

    return unsubscribe;
  }, [
    user?.id,
    teacherStatus,
    selectedCourseId,
  ]);

  async function createCourse() {
    if (
      !user?.id ||
      !db ||
      !newCourseTitle.trim()
    ) {
      return;
    }

    setCreating(true);

    try {
      const courseId =
        `${user.id}-${Date.now()}`;

      const course: Course = {
        id: courseId,
        slug: createSlug(
          newCourseTitle
        ),
        name:
          newCourseTitle.trim(),
        description:
          newCourseDescription.trim(),
        icon: '📚',
        color: '#00D4FF',
        views: 0,
        lessons: [
          {
            id: '1',
            title: 'Página 1',
            description: '',
            type: 'pdf',
            content: '',
            duration: 0,
            xpReward: 10,
          },
        ],
        teacherId: user.id,
        published: false,
        averageRating: 0,
        ratingsCount: 0,
        createdAt:
          serverTimestamp(),
        updatedAt:
          serverTimestamp(),
      };

      await setDoc(
        doc(
          db,
          'courses',
          courseId
        ),
        {
          ...course,
          lessons:
            course.lessons.map(
              serializeLesson
            ),
          createdAt:
            serverTimestamp(),
          updatedAt:
            serverTimestamp(),
        }
      );

      setNewCourseTitle('');
      setNewCourseDescription('');

      setSelectedCourseId(
        courseId
      );

      setActiveTab(
        'courses'
      );
    } catch (error) {
      console.error(
        'Erro ao criar curso:',
        error
      );

      alert(
        'Não foi possível criar o curso.'
      );
    } finally {
      setCreating(false);
    }
  }

  async function saveCourse(
    course: Course
  ) {
    if (!db || !user?.id) {
      return;
    }

    try {
      await setDoc(
        doc(
          db,
          'courses',
          course.id
        ),
        {
          name: course.name,
          slug: course.slug,
          description:
            course.description,
          icon: course.icon,
          color: course.color,
          views: course.views,
          lessons:
            course.lessons.map(
              serializeLesson
            ),
          teacherId:
            course.teacherId,
          published:
            course.published,
          averageRating:
            course.averageRating,
          ratingsCount:
            course.ratingsCount,
          updatedAt:
            serverTimestamp(),
        },
        {
          merge: true,
        }
      );
    } catch (error) {
      console.error(
        'Erro ao salvar curso:',
        error
      );

      throw error;
    }
  }

  function updateCourse(
    courseId: string,
    changes: Partial<Course>
  ) {
    setCourses((current) =>
      current.map((course) =>
        course.id === courseId
          ? {
              ...course,
              ...changes,
            }
          : course
      )
    );
  }

  function updateLesson(
    courseId: string,
    lessonId: string,
    changes: Partial<Lesson>
  ) {
    setCourses((current) =>
      current.map((course) => {
        if (
          course.id !==
          courseId
        ) {
          return course;
        }

        return {
          ...course,
          lessons:
            course.lessons.map(
              (lesson) =>
                lesson.id ===
                lessonId
                  ? {
                      ...lesson,
                      ...changes,
                    }
                  : lesson
            ),
        };
      })
    );
  }

  async function saveLessonChanges(
    courseId: string,
    lesson: Lesson
  ) {
    if (!db) {
      return;
    }

    const course =
      courses.find(
        (item) =>
          item.id === courseId
      );

    if (!course) {
      return;
    }

    const updatedLessons =
      course.lessons.map(
        (item) =>
          item.id === lesson.id
            ? lesson
            : item
      );

    try {
      await setDoc(
        doc(
          db,
          'courses',
          courseId
        ),
        {
          lessons:
            updatedLessons.map(
              serializeLesson
            ),
          updatedAt:
            serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      setCourses((current) =>
        current.map(
          (item) =>
            item.id === courseId
              ? {
                  ...item,
                  lessons:
                    updatedLessons,
                }
              : item
        )
      );

      alert(
        'Aula salva com sucesso!'
      );
    } catch (error) {
      console.error(
        'Erro ao salvar aula:',
        error
      );

      alert(
        'Não foi possível salvar a aula.'
      );
    }
  }

  async function addLesson(
    courseId: string
  ) {
    const course =
      courses.find(
        (item) =>
          item.id === courseId
      );

    if (!course) {
      return;
    }

    const newLesson: Lesson = {
      id: String(
        Date.now()
      ),
      title: `Aula ${
        course.lessons.length + 1
      }`,
      description: '',
      type: 'pdf',
      content: '',
      duration: 0,
      xpReward: 10,
    };

    const updatedLessons = [
      ...course.lessons,
      newLesson,
    ];

    setCourses((current) =>
      current.map((item) =>
        item.id === courseId
          ? {
              ...item,
              lessons:
                updatedLessons,
            }
          : item
      )
    );

    if (!db) {
      return;
    }

    try {
      await setDoc(
        doc(
          db,
          'courses',
          courseId
        ),
        {
          lessons:
            updatedLessons.map(
              serializeLesson
            ),
          updatedAt:
            serverTimestamp(),
        },
        {
          merge: true,
        }
      );
    } catch (error) {
      console.error(
        'Erro ao adicionar aula:',
        error
      );
    }
  }

  async function uploadLessonFile(
    courseId: string,
    lesson: Lesson,
    file: File
  ) {
    if (!db) {
      alert(
        'Firebase não está conectado.'
      );
      return;
    }

    if (
      lesson.type !== 'pdf' &&
      lesson.type !== 'word'
    ) {
      alert(
        'Para vídeos, use um link externo do YouTube, Vimeo ou outra plataforma.'
      );
      return;
    }

    const lowerFileName = file.name.toLowerCase();
    const isPdf =
      file.type === 'application/pdf' ||
      lowerFileName.endsWith('.pdf');
    const isWord =
      file.type === 'application/msword' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      lowerFileName.endsWith('.doc') ||
      lowerFileName.endsWith('.docx');

    if (lesson.type === 'pdf' && !isPdf) {
      alert('Envie somente arquivos PDF.');
      return;
    }

    if (lesson.type === 'word' && !isWord) {
      alert('Envie somente arquivos Word (.doc ou .docx).');
      return;
    }

    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      alert(
        `Esse PDF é muito grande. O limite é ${formatFileSize(
          MAX_FILE_SIZE
        )} para este modo gratuito.`
      );
      return;
    }

    const course =
      courses.find(
        (item) =>
          item.id === courseId
      );

    if (!course) {
      return;
    }

    try {
      const dataUrl =
        await readFileAsDataUrl(
          file
        );

      const lessonsWithoutCurrent =
        course.lessons.map(
          (item) => {
            if (
              item.id !==
              lesson.id
            ) {
              return item;
            }

            const {
              fileName,
              fileUrl,
              fileSize,
              fileType,
              uploadedAt,
              ...rest
            } = item;

            return rest;
          }
        );

      const currentEmbeddedSize =
        getEmbeddedSize(
          lessonsWithoutCurrent
        );

      if (
        currentEmbeddedSize +
          dataUrl.length >
        MAX_TOTAL_EMBEDDED_SIZE
      ) {
        alert(
          'O curso já possui muitos arquivos armazenados. Remova algum PDF antigo antes de adicionar outro.'
        );
        return;
      }

      const updatedLesson: Lesson =
        {
          ...lesson,
          fileName:
            file.name,
          fileUrl:
            dataUrl,
          fileSize:
            file.size,
          fileType:
            isPdf
              ? 'application/pdf'
              : file.type ||
                'application/msword',
          uploadedAt:
            new Date().toISOString(),
        };

      const updatedLessons =
        course.lessons.map(
          (item) =>
            item.id ===
            lesson.id
              ? updatedLesson
              : item
        );

      setCourses((current) =>
        current.map((item) =>
          item.id === courseId
            ? {
                ...item,
                lessons:
                  updatedLessons,
              }
            : item
        )
      );

      await setDoc(
        doc(
          db,
          'courses',
          courseId
        ),
        {
          lessons:
            updatedLessons.map(
              serializeLesson
            ),
          updatedAt:
            serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      alert(
        lesson.type === 'word'
          ? 'Arquivo Word anexado com sucesso!'
          : 'PDF anexado com sucesso!'
      );
    } catch (error) {
      console.error(
        'Erro ao anexar PDF:',
        error
      );

      alert(
        'Não foi possível anexar o PDF.'
      );
    }
  }

  async function removeLessonFile(
    courseId: string,
    lessonId: string
  ) {
    const course =
      courses.find(
        (item) =>
          item.id === courseId
      );

    if (!course) {
      return;
    }

    const updatedLessons =
      course.lessons.map(
        (lesson) => {
          if (
            lesson.id !==
            lessonId
          ) {
            return lesson;
          }

          const {
            fileName,
            fileUrl,
            fileSize,
            fileType,
            uploadedAt,
            ...rest
          } = lesson;

          return rest;
        }
      );

    setCourses((current) =>
      current.map((item) =>
        item.id === courseId
          ? {
              ...item,
              lessons:
                updatedLessons,
            }
          : item
      )
    );

    if (!db) {
      return;
    }

    try {
      await setDoc(
        doc(
          db,
          'courses',
          courseId
        ),
        {
          lessons:
            updatedLessons.map(
              serializeLesson
            ),
          updatedAt:
            serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      alert(
        'Arquivo removido.'
      );
    } catch (error) {
      console.error(
        'Erro ao remover arquivo:',
        error
      );

      alert(
        'Não foi possível remover o arquivo.'
      );
    }
  }

  async function deleteLesson(
    courseId: string,
    lessonId: string
  ) {
    const course =
      courses.find(
        (item) =>
          item.id === courseId
      );

    if (!course) {
      return;
    }

    const confirmed =
      window.confirm(
        'Tem certeza que deseja excluir esta aula?'
      );

    if (!confirmed) {
      return;
    }

    const updatedLessons =
      course.lessons.filter(
        (lesson) =>
          lesson.id !==
          lessonId
      );

    setCourses((current) =>
      current.map((item) =>
        item.id === courseId
          ? {
              ...item,
              lessons:
                updatedLessons,
            }
          : item
      )
    );

    if (!db) {
      return;
    }

    try {
      await setDoc(
        doc(
          db,
          'courses',
          courseId
        ),
        {
          lessons:
            updatedLessons.map(
              serializeLesson
            ),
          updatedAt:
            serverTimestamp(),
        },
        {
          merge: true,
        }
      );
    } catch (error) {
      console.error(
        'Erro ao excluir aula:',
        error
      );

      alert(
        'Não foi possível excluir a aula.'
      );
    }
  }

  async function deleteCourse(
    courseId: string
  ) {
    if (!db) {
      return;
    }

    const confirmed =
      window.confirm(
        'Tem certeza que deseja excluir este curso? Essa ação não pode ser desfeita.'
      );

    if (!confirmed) {
      return;
    }

    setDeletingCourse(true);

    try {
      await deleteDoc(
        doc(
          db,
          'courses',
          courseId
        )
      );

      setCourses((current) =>
        current.filter(
          (course) =>
            course.id !==
            courseId
        )
      );

      setSelectedCourseId(
        null
      );

      setActiveTab(
        'courses'
      );
    } catch (error) {
      console.error(
        'Erro ao excluir curso:',
        error
      );

      alert(
        'Não foi possível excluir o curso. Verifique as regras do Firestore.'
      );
    } finally {
      setDeletingCourse(false);
    }
  }

  if (loadingApproval) {
    return (
      <div style={styles.centerScreen}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingIcon}>
            ⏳
          </div>

          <h2 style={styles.loadingTitle}>
            Verificando aprovação
          </h2>

          <p style={styles.mutedText}>
            Aguarde enquanto verificamos
            seu acesso de professor.
          </p>
        </div>
      </div>
    );
  }

  if (
    teacherStatus ===
    'pending'
  ) {
    return (
      <div style={styles.centerScreen}>
        <div style={styles.statusCard}>
          <div style={styles.statusIcon}>
            🕐
          </div>

          <h1 style={styles.statusTitle}>
            Cadastro em análise
          </h1>

          <p style={styles.statusText}>
            Seu cadastro de professor
            ainda está aguardando
            aprovação do administrador.
          </p>

          <button
            style={styles.secondaryButton}
            onClick={() =>
              window.location.reload()
            }
          >
            Atualizar status
          </button>
        </div>
      </div>
    );
  }

  if (
    teacherStatus ===
    'rejected'
  ) {
    return (
      <div style={styles.centerScreen}>
        <div style={styles.statusCard}>
          <div style={styles.statusIcon}>
            ❌
          </div>

          <h1 style={styles.statusTitle}>
            Cadastro não aprovado
          </h1>

          <p style={styles.statusText}>
            Seu cadastro de professor
            foi recusado.
          </p>

          <button
            style={styles.secondaryButton}
            onClick={() =>
              window.location.reload()
            }
          >
            Verificar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.brand}>
            CODEQUEST NEXUS
          </div>

          <h1 style={styles.pageTitle}>
            Painel do Professor
          </h1>

          <p style={styles.pageSubtitle}>
            Crie cursos, aulas e materiais
            para seus alunos.
          </p>
        </div>

        <div style={styles.headerActions}>
          <button
            style={
              activeTab ===
              'courses'
                ? styles.activeTabButton
                : styles.tabButton
            }
            onClick={() => {
              setActiveTab(
                'courses'
              );
              setSelectedCourseId(
                null
              );
            }}
          >
            📚 Meus cursos
          </button>

          <button
            style={
              activeTab ===
              'create'
                ? styles.activeTabButton
                : styles.tabButton
            }
            onClick={() => {
              setActiveTab(
                'create'
              );
              setSelectedCourseId(
                null
              );
            }}
          >
            ➕ Criar curso
          </button>
        </div>
      </header>

      <main style={styles.main}>
        {activeTab ===
          'create' && (
          <CreateCourse
            title={
              newCourseTitle
            }
            description={
              newCourseDescription
            }
            onTitleChange={
              setNewCourseTitle
            }
            onDescriptionChange={
              setNewCourseDescription
            }
            onCreate={
              createCourse
            }
            creating={
              creating
            }
          />
        )}

        {activeTab ===
          'courses' &&
          !selectedCourse && (
            <CourseList
              courses={courses}
              loading={
                loadingCourses
              }
              onSelect={(courseId) => {
                setSelectedCourseId(
                  courseId
                );
                setActiveTab(
                  'courses'
                );
              }}
              onCreate={() => {
                setActiveTab(
                  'create'
                );
              }}
            />
          )}

        {activeTab ===
          'courses' &&
          selectedCourse && (
            <CourseEditor
              course={
                selectedCourse
              }
              deletingCourse={
                deletingCourse
              }
              onBack={() => {
                setSelectedCourseId(
                  null
                );
              }}
              onUpdateCourse={
                updateCourse
              }
              onUpdateLesson={
                updateLesson
              }
              onAddLesson={
                addLesson
              }
              onSaveLesson={
                saveLessonChanges
              }
              onUploadFile={
                uploadLessonFile
              }
              onRemoveFile={
                removeLessonFile
              }
              onDeleteLesson={
                deleteLesson
              }
              onSaveCourse={
                saveCourse
              }
              onDeleteCourse={
                deleteCourse
              }
            />
          )}
      </main>
    </div>
  );
}

interface CreateCourseProps {
  title: string;
  description: string;
  onTitleChange: (
    value: string
  ) => void;
  onDescriptionChange: (
    value: string
  ) => void;
  onCreate: () => void;
  creating: boolean;
}

function CreateCourse({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onCreate,
  creating,
}: CreateCourseProps) {
  return (
    <section style={styles.panel}>
      <div style={styles.panelHeader}>
        <div>
          <span style={styles.eyebrow}>
            NOVO CURSO
          </span>

          <h2 style={styles.sectionTitle}>
            Criar um novo curso
          </h2>

          <p style={styles.mutedText}>
            Monte uma nova experiência
            de aprendizagem.
          </p>
        </div>
      </div>

      <div style={styles.form}>
        <label style={styles.label}>
          Nome do curso
        </label>

        <input
          style={styles.input}
          value={title}
          onChange={(event) =>
            onTitleChange(
              event.target.value
            )
          }
          placeholder="Ex.: JavaScript do zero"
        />

        <label style={styles.label}>
          Descrição
        </label>

        <textarea
          style={styles.textarea}
          value={description}
          onChange={(event) =>
            onDescriptionChange(
              event.target.value
            )
          }
          placeholder="Explique o que os alunos irão aprender..."
          rows={6}
        />

        <button
          style={styles.primaryButton}
          onClick={onCreate}
          disabled={
            creating ||
            !title.trim()
          }
        >
          {creating
            ? 'Criando...'
            : '🚀 Criar curso'}
        </button>
      </div>
    </section>
  );
}

interface CourseListProps {
  courses: Course[];
  loading: boolean;
  onSelect: (
    courseId: string
  ) => void;
  onCreate: () => void;
}

function CourseList({
  courses,
  loading,
  onSelect,
  onCreate,
}: CourseListProps) {
  if (loading) {
    return (
      <section style={styles.panel}>
        <p style={styles.mutedText}>
          Carregando cursos...
        </p>
      </section>
    );
  }

  return (
    <section>
      <div style={styles.listHeader}>
        <div>
          <span style={styles.eyebrow}>
            PROFESSOR
          </span>

          <h2 style={styles.sectionTitle}>
            Meus cursos
          </h2>

          <p style={styles.mutedText}>
            {courses.length}{' '}
            {courses.length ===
            1
              ? 'curso criado'
              : 'cursos criados'}
          </p>
        </div>

        <button
          style={styles.primaryButton}
          onClick={onCreate}
        >
          ➕ Novo curso
        </button>
      </div>

      {courses.length ===
        0 && (
        <div
          style={
            styles.emptyState
          }
        >
          <div
            style={
              styles.emptyIcon
            }
          >
            📚
          </div>

          <h3
            style={
              styles.emptyTitle
            }
          >
            Você ainda não criou
            nenhum curso
          </h3>

          <p
            style={
              styles.mutedText
            }
          >
            Crie seu primeiro curso
            para começar.
          </p>

          <button
            style={
              styles.primaryButton
            }
            onClick={onCreate}
          >
            Criar primeiro curso
          </button>
        </div>
      )}

      <div style={styles.courseGrid}>
        {courses.map(
          (course) => (
            <button
              key={course.id}
              style={
                styles.courseCard
              }
              onClick={() =>
                onSelect(
                  course.id
                )
              }
            >
              <div
                style={{
                  ...styles.courseIcon,
                  background:
                    course.color,
                }}
              >
                {course.icon}
              </div>

              <div
                style={
                  styles.courseCardContent
                }
              >
                <div
                  style={
                    styles.courseStatus
                  }
                >
                  {course.published
                    ? '🟢 Publicado'
                    : '🟡 Rascunho'}
                </div>

                <h3
                  style={
                    styles.courseTitle
                  }
                >
                  {course.name}
                </h3>

                <p
                  style={
                    styles.courseDescription
                  }
                >
                  {course.description ||
                    'Sem descrição.'}
                </p>

                <div
                  style={
                    styles.courseMeta
                  }
                >
                  <span>
                    📖{' '}
                    {
                      course
                        .lessons
                        .length
                    }{' '}
                    aulas
                  </span>

                  <span>
                    ⭐{' '}
                    {getAverageRating(
                      course
                    )}
                  </span>

                  <span>
                    👁️{' '}
                    {course.views}
                  </span>
                </div>
              </div>
            </button>
          )
        )}
      </div>
    </section>
  );
}

interface CourseEditorProps {
  course: Course;
  deletingCourse: boolean;
  onBack: () => void;
  onUpdateCourse: (
    courseId: string,
    changes: Partial<Course>
  ) => void;
  onUpdateLesson: (
    courseId: string,
    lessonId: string,
    changes: Partial<Lesson>
  ) => void;
  onAddLesson: (
    courseId: string
  ) => void;
  onSaveLesson: (
    courseId: string,
    lesson: Lesson
  ) => Promise<void>;
  onUploadFile: (
    courseId: string,
    lesson: Lesson,
    file: File
  ) => Promise<void>;
  onRemoveFile: (
    courseId: string,
    lessonId: string
  ) => Promise<void>;
  onDeleteLesson: (
    courseId: string,
    lessonId: string
  ) => Promise<void>;
  onSaveCourse: (
    course: Course
  ) => Promise<void>;
  onDeleteCourse: (
    courseId: string
  ) => Promise<void>;
}

function CourseEditor({
  course,
  deletingCourse,
  onBack,
  onUpdateCourse,
  onUpdateLesson,
  onAddLesson,
  onSaveLesson,
  onUploadFile,
  onRemoveFile,
  onDeleteLesson,
  onSaveCourse,
  onDeleteCourse,
}: CourseEditorProps) {
  const [
    savingCourse,
    setSavingCourse,
  ] = useState(false);

  async function handleSave() {
    setSavingCourse(true);

    try {
      await onSaveCourse(
        course
      );

      alert(
        'Curso salvo com sucesso!'
      );
    } catch (error) {
      console.error(error);

      alert(
        'Não foi possível salvar o curso.'
      );
    } finally {
      setSavingCourse(false);
    }
  }

  return (
    <section>
      <div style={styles.editorTop}>
        <button
          style={styles.backButton}
          onClick={onBack}
        >
          ← Voltar
        </button>

        <div>
          <span style={styles.eyebrow}>
            EDITANDO CURSO
          </span>

          <h2 style={styles.sectionTitle}>
            {course.name}
          </h2>
        </div>
      </div>

      <div style={styles.panel}>
        <div
          style={
            styles.panelHeader
          }
        >
          <div>
            <h3
              style={
                styles.subsectionTitle
              }
            >
              Informações do curso
            </h3>

            <p
              style={
                styles.mutedText
              }
            >
              Edite o título e a
              descrição.
            </p>
          </div>
        </div>

        <div style={styles.form}>
          <label
            style={styles.label}
          >
            Nome
          </label>

          <input
            style={styles.input}
            value={course.name}
            onChange={(event) =>
              onUpdateCourse(
                course.id,
                {
                  name:
                    event.target
                      .value,
                  slug: createSlug(
                    event.target
                      .value
                  ),
                }
              )
            }
          />

          <label
            style={styles.label}
          >
            Descrição
          </label>

          <textarea
            style={styles.textarea}
            value={
              course.description
            }
            onChange={(event) =>
              onUpdateCourse(
                course.id,
                {
                  description:
                    event.target
                      .value,
                }
              )
            }
            rows={5}
          />

          <div
            style={
              styles.statsGrid
            }
          >
            <div
              style={
                styles.statCard
              }
            >
              <strong
                style={
                  styles.statNumber
                }
              >
                {
                  course.lessons
                    .length
                }
              </strong>

              <span
                style={
                  styles.statLabel
                }
              >
                Aulas
              </span>
            </div>

            <div
              style={
                styles.statCard
              }
            >
              <strong
                style={
                  styles.statNumber
                }
              >
                {
                  course.views
                }
              </strong>

              <span
                style={
                  styles.statLabel
                }
              >
                Visualizações
              </span>
            </div>

            <div
              style={
                styles.statCard
              }
            >
              <strong
                style={
                  styles.statNumber
                }
              >
                ⭐{' '}
                {getAverageRating(
                  course
                )}
              </strong>

              <span
                style={
                  styles.statLabel
                }
              >
                Avaliação
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          ...styles.panel,
          marginTop: 20,
        }}
      >
        <div
          style={
            styles.panelHeader
          }
        >
          <div>
            <h3
              style={
                styles.subsectionTitle
              }
            >
              Aulas
            </h3>

            <p
              style={
                styles.mutedText
              }
            >
              Adicione conteúdo,
              PDFs, Word e links de vídeos.
            </p>
          </div>

          <button
            style={
              styles.primaryButton
            }
            onClick={() =>
              onAddLesson(
                course.id
              )
            }
          >
            ➕ Nova aula
          </button>
        </div>

        <div>
          {course.lessons.map(
            (
              lesson,
              index
            ) => (
              <LessonEditor
                key={
                  lesson.id
                }
                lesson={
                  lesson
                }
                index={
                  index
                }
                courseId={
                  course.id
                }
                onUpdate={
                  (
                    changes
                  ) =>
                    onUpdateLesson(
                      course.id,
                      lesson.id,
                      changes
                    )
                }
                onSave={() =>
                  onSaveLesson(
                    course.id,
                    lesson
                  )
                }
                onUploadFile={(
                  file
                ) =>
                  onUploadFile(
                    course.id,
                    lesson,
                    file
                  )
                }
                onRemoveFile={() =>
                  onRemoveFile(
                    course.id,
                    lesson.id
                  )
                }
                onDelete={() =>
                  onDeleteLesson(
                    course.id,
                    lesson.id
                  )
                }
              />
            )
          )}
        </div>
      </div>

      <div
        style={{
          ...styles.panel,
          marginTop: 20,
        }}
      >
        <div
          style={
            styles.panelHeader
          }
        >
          <div>
            <h3
              style={
                styles.subsectionTitle
              }
            >
              Publicação
            </h3>

            <p
              style={
                styles.mutedText
              }
            >
              Controle se os alunos
              conseguem acessar este
              curso.
            </p>
          </div>

          <label
            style={
              styles.switchLabel
            }
          >
            <input
              type="checkbox"
              checked={
                course.published
              }
              onChange={(event) =>
                onUpdateCourse(
                  course.id,
                  {
                    published:
                      event.target
                        .checked,
                  }
                )
              }
            />

            <span>
              {course.published
                ? 'Publicado'
                : 'Rascunho'}
            </span>
          </label>
        </div>

        <div
          style={
            styles.actionRow
          }
        >
          <button
            style={
              styles.primaryButton
            }
            onClick={
              handleSave
            }
            disabled={
              savingCourse
            }
          >
            {savingCourse
              ? 'Salvando...'
              : '💾 Salvar curso'}
          </button>

          <button
            style={
              styles.dangerButton
            }
            onClick={() =>
              onDeleteCourse(
                course.id
              )
            }
            disabled={
              deletingCourse
            }
          >
            {deletingCourse
              ? 'Excluindo...'
              : '🗑️ Excluir curso'}
          </button>
        </div>
      </div>
    </section>
  );
}

interface LessonEditorProps {
  lesson: Lesson;
  index: number;
  courseId: string;
  onUpdate: (
    changes: Partial<Lesson>
  ) => void;
  onSave: () => Promise<void>;
  onUploadFile: (
    file: File
  ) => Promise<void>;
  onRemoveFile: () => Promise<void>;
  onDelete: () => Promise<void>;
}

function LessonEditor({
  lesson,
  index,
  onUpdate,
  onSave,
  onUploadFile,
  onRemoveFile,
  onDelete,
}: LessonEditorProps) {
  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    uploading,
    setUploading,
  ] = useState(false);

  const [
    removing,
    setRemoving,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  async function handleSave() {
    setSaving(true);

    try {
      await onSave();
    } finally {
      setSaving(false);
    }
  }

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    event.target.value = '';

    if (!file) {
      return;
    }

    setUploading(true);

    try {
      await onUploadFile(
        file
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleRemoveFile() {
    const confirmed =
      window.confirm(
        'Remover o material desta aula?'
      );

    if (!confirmed) {
      return;
    }

    setRemoving(true);

    try {
      await onRemoveFile();
    } finally {
      setRemoving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);

    try {
      await onDelete();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      style={
        styles.lessonCard
      }
    >
      <div
        style={
          styles.lessonHeader
        }
      >
        <div
          style={
            styles.lessonNumber
          }
        >
          {index + 1}
        </div>

        <div
          style={
            styles.lessonHeaderInfo
          }
        >
          <span
            style={
              styles.lessonBadge
            }
          >
            {lesson.type ===
            'pdf'
              ? '📄 PDF'
              : lesson.type ===
                'word'
              ? '📝 WORD'
              : lesson.type ===
                'video'
              ? '🎥 VÍDEO'
              : '🧠 QUIZ'}
          </span>

          <h4
            style={
              styles.lessonTitle
            }
          >
            {lesson.title ||
              `Aula ${
                index + 1
              }`}
          </h4>
        </div>
      </div>

      <div
        style={
          styles.lessonForm
        }
      >
        <label
          style={styles.label}
        >
          Título da aula
        </label>

        <input
          style={styles.input}
          value={
            lesson.title
          }
          onChange={(event) =>
            onUpdate({
              title:
                event.target
                  .value,
            })
          }
          placeholder="Ex.: Introdução ao JavaScript"
        />

        <label
          style={styles.label}
        >
          Descrição
        </label>

        <textarea
          style={styles.textarea}
          value={
            lesson.description
          }
          onChange={(event) =>
            onUpdate({
              description:
                event.target
                  .value,
            })
          }
          rows={3}
          placeholder="Descrição curta da aula..."
        />

        <div
          style={
            styles.twoColumns
          }
        >
          <div>
            <label
              style={
                styles.label
              }
            >
              Tipo
            </label>

            <select
              style={
                styles.input
              }
              value={
                lesson.type
              }
              onChange={(
                event
              ) =>
                onUpdate({
                  type:
                    event.target
                      .value as LessonType,
                })
              }
            >
              <option value="pdf">
                PDF / Material
              </option>

              <option value="word">
                Word (.doc / .docx)
              </option>

              <option value="video">
                Vídeo
              </option>

              <option value="quiz">
                Quiz
              </option>
            </select>
          </div>

          <div>
            <label
              style={
                styles.label
              }
            >
              Duração (minutos)
            </label>

            <input
              style={
                styles.input
              }
              type="number"
              min="0"
              value={
                lesson.duration
              }
              onChange={(event) =>
                onUpdate({
                  duration:
                    Number(
                      event.target
                        .value
                    ) || 0,
                })
              }
            />
          </div>
        </div>

        <div
          style={
            styles.twoColumns
          }
        >
          <div>
            <label
              style={
                styles.label
              }
            >
              Recompensa XP
            </label>

            <input
              style={
                styles.input
              }
              type="number"
              min="0"
              value={
                lesson.xpReward
              }
              onChange={(event) =>
                onUpdate({
                  xpReward:
                    Number(
                      event.target
                        .value
                    ) || 0,
                })
              }
            />
          </div>

          <div />
        </div>

        <label
          style={styles.label}
        >
          Conteúdo da aula
        </label>

        <textarea
          style={{
            ...styles.textarea,
            minHeight: 180,
          }}
          value={
            lesson.content
          }
          onChange={(event) =>
            onUpdate({
              content:
                event.target
                  .value,
            })
          }
          placeholder={
            lesson.type ===
            'video'
              ? 'Cole aqui informações ou instruções sobre o vídeo...'
              : 'Digite o conteúdo da aula...'
          }
        />

        {(lesson.type === 'pdf' || lesson.type === 'word') && (
          <div
            style={
              styles.materialBox
            }
          >
            <div>
              <strong
                style={
                  styles.materialTitle
                }
              >
                {lesson.type === 'word' ? '📝 Material Word' : '📄 Material PDF'}
              </strong>

              <p
                style={
                  styles.mutedText
                }
              >
                Neste modo sem
                Firebase Storage,
                PDFs pequenos ficam
                armazenados
                diretamente no
                Firestore.
              </p>

              <p
                style={
                  styles.warningText
                }
              >
                Limite por arquivo:{' '}
                {formatFileSize(
                  MAX_FILE_SIZE
                )}
                .
              </p>
            </div>

            {lesson.fileUrl ? (
              <div
                style={
                  styles.fileInfo
                }
              >
                <div>
                  <strong>
                    📎{' '}
                    {lesson.fileName ||
                      'PDF anexado'}
                  </strong>

                  {lesson.fileSize && (
                    <span
                      style={
                        styles.fileSize
                      }
                    >
                      {' '}
                      (
                      {formatFileSize(
                        lesson.fileSize
                      )}
                      )
                    </span>
                  )}
                </div>

                <div
                  style={
                    styles.actionRow
                  }
                >
                  <a
                    href={
                      lesson.fileUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                    style={
                      styles.linkButton
                    }
                  >
                    👁️ Abrir arquivo
                  </a>

                  <button
                    style={
                      styles.dangerOutlineButton
                    }
                    onClick={
                      handleRemoveFile
                    }
                    disabled={
                      removing
                    }
                  >
                    {removing
                      ? 'Removendo...'
                      : 'Remover'}
                  </button>
                </div>
              </div>
            ) : (
              <label
                style={
                  styles.uploadButton
                }
              >
                {uploading
                  ? '⏳ Enviando...'
                  : '📎 Anexar PDF/Word'}

                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={
                    handleFileChange
                  }
                  disabled={
                    uploading
                  }
                  style={
                    styles.hiddenInput
                  }
                />
              </label>
            )}

            {lesson.fileUrl &&
              !isDataUrl(
                lesson.fileUrl
              ) && (
                <p
                  style={
                    styles.warningText
                  }
                >
                  Este material
                  parece ser um link
                  externo.
                </p>
              )}
          </div>
        )}

        {lesson.type ===
          'video' && (
          <div
            style={
              styles.materialBox
            }
          >
            <strong
              style={
                styles.materialTitle
              }
            >
              🎥 Link do vídeo
            </strong>

            <p
              style={
                styles.mutedText
              }
            >
              Para não usar
              armazenamento pago,
              coloque o vídeo no
              YouTube, Vimeo ou
              outra plataforma e
              cole o link abaixo.
            </p>

            <input
              style={styles.input}
              type="url"
              value={
                lesson.fileUrl ??
                ''
              }
              onChange={(event) =>
                onUpdate({
                  fileUrl:
                    event.target
                      .value,
                  fileName:
                    event.target
                      .value
                      ? 'Vídeo externo'
                      : undefined,
                  fileType:
                    event.target
                      .value
                      ? 'text/url'
                      : undefined,
                  fileSize:
                    undefined,
                  uploadedAt:
                    event.target
                      .value
                      ? new Date().toISOString()
                      : undefined,
                })
              }
              placeholder="https://www.youtube.com/watch?v=..."
            />

            {lesson.fileUrl && (
              <div
                style={
                  styles.actionRow
                }
              >
                <a
                  href={
                    lesson.fileUrl
                  }
                  target="_blank"
                  rel="noreferrer"
                  style={
                    styles.linkButton
                  }
                >
                  ▶️ Abrir vídeo
                </a>

                <button
                  style={
                    styles.dangerOutlineButton
                  }
                  onClick={
                    handleRemoveFile
                  }
                  disabled={
                    removing
                  }
                >
                  {removing
                    ? 'Removendo...'
                    : 'Remover link'}
                </button>
              </div>
            )}
          </div>
        )}

        {lesson.type ===
          'quiz' && (
          <div
            style={
              styles.infoBox
            }
          >
            🧠 Para quizzes, coloque
            as instruções e o
            conteúdo no campo acima.
          </div>
        )}

        <div
          style={
            styles.actionRow
          }
        >
          <button
            style={
              styles.primaryButton
            }
            onClick={
              handleSave
            }
            disabled={
              saving
            }
          >
            {saving
              ? 'Salvando...'
              : '💾 Salvar aula'}
          </button>

          <button
            style={
              styles.dangerButton
            }
            onClick={
              handleDelete
            }
            disabled={
              deleting
            }
          >
            {deleting
              ? 'Excluindo...'
              : '🗑️ Excluir aula'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<
  string,
  React.CSSProperties
> = {
  page: {
    minHeight: '100vh',
    background:
      '#070B14',
    color: '#FFFFFF',
    paddingBottom: 60,
  },

  header: {
    display: 'flex',
    justifyContent:
      'space-between',
    alignItems: 'center',
    gap: 24,
    padding:
      '32px 5%',
    borderBottom:
      '1px solid rgba(255,255,255,0.08)',
    background:
      'rgba(7,11,20,0.96)',
  },

  brand: {
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 3,
    color: '#00D4FF',
    marginBottom: 8,
  },

  pageTitle: {
    margin: 0,
    fontSize: 32,
    fontWeight: 800,
  },

  pageSubtitle: {
    margin:
      '8px 0 0',
    color:
      'rgba(255,255,255,0.58)',
  },

  headerActions: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
  },

  main: {
    width: '90%',
    maxWidth: 1200,
    margin:
      '0 auto',
    paddingTop: 32,
  },

  tabButton: {
    border:
      '1px solid rgba(255,255,255,0.12)',
    background:
      'rgba(255,255,255,0.04)',
    color: '#FFFFFF',
    padding:
      '11px 16px',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 700,
  },

  activeTabButton: {
    border:
      '1px solid #00D4FF',
    background:
      'rgba(0,212,255,0.12)',
    color: '#00D4FF',
    padding:
      '11px 16px',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 700,
  },

  centerScreen: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent:
      'center',
    alignItems: 'center',
    background:
      '#070B14',
    color: '#FFFFFF',
    padding: 24,
  },

  loadingCard: {
    width: '100%',
    maxWidth: 460,
    textAlign: 'center',
    padding: 40,
    border:
      '1px solid rgba(255,255,255,0.1)',
    borderRadius: 20,
    background:
      '#0D1422',
  },

  statusCard: {
    width: '100%',
    maxWidth: 500,
    textAlign: 'center',
    padding: 48,
    border:
      '1px solid rgba(255,255,255,0.1)',
    borderRadius: 20,
    background:
      '#0D1422',
  },

  loadingIcon: {
    fontSize: 48,
    marginBottom: 20,
  },

  statusIcon: {
    fontSize: 56,
    marginBottom: 20,
  },

  loadingTitle: {
    margin:
      '0 0 10px',
    fontSize: 24,
  },

  statusTitle: {
    margin:
      '0 0 12px',
    fontSize: 26,
  },

  statusText: {
    color:
      'rgba(255,255,255,0.65)',
    lineHeight: 1.6,
    marginBottom: 24,
  },

  panel: {
    background:
      '#0D1422',
    border:
      '1px solid rgba(255,255,255,0.09)',
    borderRadius: 18,
    padding: 24,
  },

  panelHeader: {
    display: 'flex',
    justifyContent:
      'space-between',
    alignItems: 'center',
    gap: 20,
    marginBottom: 24,
  },

  listHeader: {
    display: 'flex',
    justifyContent:
      'space-between',
    alignItems: 'center',
    gap: 20,
    marginBottom: 24,
  },

  eyebrow: {
    display: 'block',
    color: '#00D4FF',
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 2,
    marginBottom: 8,
  },

  sectionTitle: {
    margin: 0,
    fontSize: 28,
    fontWeight: 800,
  },

  subsectionTitle: {
    margin: 0,
    fontSize: 21,
    fontWeight: 800,
  },

  mutedText: {
    color:
      'rgba(255,255,255,0.58)',
    lineHeight: 1.55,
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },

  label: {
    fontSize: 13,
    fontWeight: 700,
    color:
      'rgba(255,255,255,0.78)',
    marginTop: 4,
  },

  input: {
    width: '100%',
    boxSizing:
      'border-box',
    border:
      '1px solid rgba(255,255,255,0.12)',
    background:
      '#080E19',
    color: '#FFFFFF',
    borderRadius: 10,
    padding:
      '13px 14px',
    outline: 'none',
    fontSize: 14,
  },

  textarea: {
    width: '100%',
    boxSizing:
      'border-box',
    border:
      '1px solid rgba(255,255,255,0.12)',
    background:
      '#080E19',
    color: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    outline: 'none',
    resize: 'vertical',
    fontSize: 14,
    lineHeight: 1.55,
  },

  primaryButton: {
    border: 'none',
    background:
      '#00D4FF',
    color: '#041018',
    padding:
      '12px 18px',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 800,
    whiteSpace:
      'nowrap',
  },

  secondaryButton: {
    border:
      '1px solid rgba(255,255,255,0.16)',
    background:
      'rgba(255,255,255,0.05)',
    color: '#FFFFFF',
    padding:
      '12px 18px',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 700,
  },

  dangerButton: {
    border:
      '1px solid rgba(255,70,90,0.4)',
    background:
      'rgba(255,70,90,0.1)',
    color: '#FF7180',
    padding:
      '12px 18px',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 800,
    whiteSpace:
      'nowrap',
  },

  dangerOutlineButton: {
    border:
      '1px solid rgba(255,70,90,0.35)',
    background:
      'transparent',
    color: '#FF7180',
    padding:
      '9px 13px',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 700,
  },

  linkButton: {
    display:
      'inline-flex',
    alignItems:
      'center',
    textDecoration:
      'none',
    border:
      '1px solid rgba(0,212,255,0.35)',
    background:
      'rgba(0,212,255,0.08)',
    color: '#00D4FF',
    padding:
      '9px 13px',
    borderRadius: 8,
    fontWeight: 700,
  },

  backButton: {
    border:
      '1px solid rgba(255,255,255,0.12)',
    background:
      'rgba(255,255,255,0.04)',
    color: '#FFFFFF',
    padding:
      '10px 14px',
    borderRadius: 9,
    cursor: 'pointer',
    fontWeight: 700,
  },

  editorTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 18,
    marginBottom: 24,
  },

  courseGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 18,
  },

  courseCard: {
    display: 'flex',
    alignItems:
      'flex-start',
    gap: 16,
    textAlign: 'left',
    width: '100%',
    border:
      '1px solid rgba(255,255,255,0.09)',
    background:
      '#0D1422',
    color: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    cursor: 'pointer',
  },

  courseIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    display: 'flex',
    alignItems:
      'center',
    justifyContent:
      'center',
    fontSize: 26,
    flexShrink: 0,
  },

  courseCardContent: {
    minWidth: 0,
    flex: 1,
  },

  courseStatus: {
    fontSize: 11,
    color:
      'rgba(255,255,255,0.55)',
    marginBottom: 6,
  },

  courseTitle: {
    margin:
      '0 0 7px',
    fontSize: 18,
    fontWeight: 800,
  },

  courseDescription: {
    margin:
      '0 0 14px',
    color:
      'rgba(255,255,255,0.58)',
    fontSize: 13,
    lineHeight: 1.45,
  },

  courseMeta: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    color:
      'rgba(255,255,255,0.65)',
    fontSize: 12,
  },

  emptyState: {
    textAlign: 'center',
    padding: 60,
    border:
      '1px dashed rgba(255,255,255,0.14)',
    borderRadius: 18,
    marginBottom: 20,
  },

  emptyIcon: {
    fontSize: 52,
    marginBottom: 12,
  },

  emptyTitle: {
    margin:
      '0 0 8px',
    fontSize: 20,
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(3, 1fr)',
    gap: 12,
    marginTop: 14,
  },

  statCard: {
    padding: 16,
    border:
      '1px solid rgba(255,255,255,0.08)',
    background:
      '#080E19',
    borderRadius: 12,
  },

  statNumber: {
    display: 'block',
    fontSize: 21,
    marginBottom: 4,
  },

  statLabel: {
    color:
      'rgba(255,255,255,0.5)',
    fontSize: 12,
  },

  switchLabel: {
    display: 'flex',
    alignItems:
      'center',
    gap: 9,
    fontWeight: 700,
    cursor: 'pointer',
  },

  actionRow: {
    display: 'flex',
    gap: 10,
    alignItems:
      'center',
    flexWrap: 'wrap',
    marginTop: 18,
  },

  lessonCard: {
    border:
      '1px solid rgba(255,255,255,0.09)',
    borderRadius: 15,
    background:
      '#080E19',
    marginBottom: 16,
    overflow: 'hidden',
  },

  lessonHeader: {
    display: 'flex',
    alignItems:
      'center',
    gap: 14,
    padding: 18,
    borderBottom:
      '1px solid rgba(255,255,255,0.07)',
  },

  lessonNumber: {
    width: 38,
    height: 38,
    borderRadius: 10,
    display: 'flex',
    alignItems:
      'center',
    justifyContent:
      'center',
    background:
      'rgba(0,212,255,0.1)',
    color: '#00D4FF',
    fontWeight: 900,
  },

  lessonHeaderInfo: {
    minWidth: 0,
  },

  lessonBadge: {
    fontSize: 10,
    fontWeight: 800,
    color:
      'rgba(255,255,255,0.5)',
    letterSpacing: 1,
  },

  lessonTitle: {
    margin:
      '4px 0 0',
    fontSize: 17,
    fontWeight: 800,
  },

  lessonForm: {
    padding: 18,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },

  twoColumns: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(2, minmax(0, 1fr))',
    gap: 14,
  },

  materialBox: {
    border:
      '1px solid rgba(0,212,255,0.18)',
    background:
      'rgba(0,212,255,0.04)',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },

  materialTitle: {
    display: 'block',
    marginBottom: 6,
  },

  warningText: {
    color:
      'rgba(255,193,7,0.9)',
    fontSize: 12,
    lineHeight: 1.5,
  },

  fileInfo: {
    display: 'flex',
    alignItems:
      'center',
    justifyContent:
      'space-between',
    gap: 15,
    flexWrap: 'wrap',
    padding: 12,
    border:
      '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    background:
      'rgba(0,0,0,0.15)',
  },

  fileSize: {
    color:
      'rgba(255,255,255,0.5)',
    fontSize: 12,
  },

  uploadButton: {
    display:
      'inline-flex',
    alignItems:
      'center',
    justifyContent:
      'center',
    border:
      '1px dashed rgba(0,212,255,0.45)',
    background:
      'rgba(0,212,255,0.07)',
    color: '#00D4FF',
    padding:
      '14px 18px',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 800,
    width: 'fit-content',
  },

  hiddenInput: {
    display: 'none',
  },

  infoBox: {
    padding: 14,
    borderRadius: 10,
    background:
      'rgba(255,255,255,0.04)',
    border:
      '1px solid rgba(255,255,255,0.08)',
    color:
      'rgba(255,255,255,0.65)',
    fontSize: 13,
    lineHeight: 1.5,
  },
};