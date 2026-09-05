import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/useAuthStore';

type LessonType =
  | 'pdf'
  | 'video'
  | 'quiz';

interface Lesson {
  id: string;
  title: string;
  description: string;
  type: LessonType;
  content: string;
  duration: number;
  xpReward: number;
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

export function TeacherDashboard() {
  const user = useAuthStore(
    (state) => state.user
  );

  const [teacherStatus, setTeacherStatus] =
    useState<TeacherStatus>('pending');

  const [courses, setCourses] =
    useState<Course[]>([]);

  const [selectedCourseId, setSelectedCourseId] =
    useState<string | null>(null);

  const [activeTab, setActiveTab] =
    useState<ActiveTab>('courses');

  const [newCourseTitle, setNewCourseTitle] =
    useState('');

  const [
    newCourseDescription,
    setNewCourseDescription,
  ] = useState('');

  const [loadingApproval, setLoadingApproval] =
    useState(true);

  const [loadingCourses, setLoadingCourses] =
    useState(false);

  const [creating, setCreating] =
    useState(false);

  const selectedCourse = useMemo(
    () =>
      courses.find(
        (course) =>
          course.id === selectedCourseId
      ) || null,
    [courses, selectedCourseId]
  );

  const approved =
    teacherStatus === 'approved';

  // =========================================================
  // ACOMPANHA A APROVAÇÃO EM TEMPO REAL
  // =========================================================
  //
  // O administrador pode ter salvo:
  //
  // teachers/{UID}.status = "approved"
  //
  // ou:
  //
  // users/{UID}.teacherStatus = "approved"
  //
  // Aceitamos os dois para evitar que o professor
  // fique preso em "Aguardando aprovação".
  //
  useEffect(() => {
    if (!user || !db) {
      setTeacherStatus('pending');
      setLoadingApproval(false);
      return;
    }

    setLoadingApproval(true);

    let teacherStatus: TeacherStatus = 'pending';
    let userTeacherStatus: TeacherStatus = 'pending';

    let teacherDocumentExists = false;
    let userDocumentExists = false;

    function applyApprovalStatus() {
      /*
       * Se qualquer uma das duas fontes estiver aprovada,
       * consideramos o professor aprovado.
       *
       * Isso também resolve o caso em que o Admin alterou
       * somente users.teacherStatus.
       */
      if (
        teacherStatus === 'approved' ||
        userTeacherStatus === 'approved'
      ) {
        setTeacherStatus('approved');
        return;
      }

      /*
       * Se nenhuma estiver aprovada, mas uma estiver recusada,
       * mostramos recusado.
       */
      if (
        teacherStatus === 'rejected' ||
        userTeacherStatus === 'rejected'
      ) {
        setTeacherStatus('rejected');
        return;
      }

      setTeacherStatus('pending');
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

    const unsubscribeTeacher = onSnapshot(
      teacherRef,
      (snapshot) => {
        teacherDocumentExists =
          snapshot.exists();

        if (snapshot.exists()) {
          const data =
            snapshot.data();

          teacherStatus =
            normalizeStatus(
              data.status ??
                data.teacherStatus ??
                'pending'
            );
        } else {
          teacherStatus = 'pending';
        }

        applyApprovalStatus();

        if (
          teacherDocumentExists ||
          userDocumentExists
        ) {
          setLoadingApproval(false);
        }
      },
      (error) => {
        console.error(
          'Erro ao acompanhar cadastro do professor:',
          error
        );

        teacherStatus = 'pending';

        applyApprovalStatus();

        if (userDocumentExists) {
          setLoadingApproval(false);
        }
      }
    );

    const unsubscribeUser = onSnapshot(
      userRef,
      (snapshot) => {
        userDocumentExists =
          snapshot.exists();

        if (snapshot.exists()) {
          const data =
            snapshot.data();

          userTeacherStatus =
            normalizeStatus(
              data.teacherStatus ??
                'pending'
            );
        } else {
          userTeacherStatus = 'pending';
        }

        applyApprovalStatus();

        if (
          teacherDocumentExists ||
          userDocumentExists
        ) {
          setLoadingApproval(false);
        }
      },
      (error) => {
        console.error(
          'Erro ao acompanhar status do usuário:',
          error
        );

        userTeacherStatus = 'pending';

        applyApprovalStatus();

        if (teacherDocumentExists) {
          setLoadingApproval(false);
        }
      }
    );

    return () => {
      unsubscribeTeacher();
      unsubscribeUser();
    };
  }, [user?.id]);

  // =========================================================
  // CARREGA OS CURSOS DO PROFESSOR EM TEMPO REAL
  // =========================================================

  useEffect(() => {
    if (
      !user ||
      !db ||
      teacherStatus !== 'approved'
    ) {
      setCourses([]);
      setLoadingCourses(false);
      return;
    }

    setLoadingCourses(true);

    const coursesQuery = query(
      collection(
        db,
        'courses'
      ),
      where(
        'teacherId',
        '==',
        user.id
      )
    );

    const unsubscribe = onSnapshot(
      coursesQuery,
      (snapshot) => {
        const loadedCourses: Course[] =
          snapshot.docs.map(
            (item) => {
              const data =
                item.data();

              return {
                id: item.id,

                slug:
                  String(
                    data.slug ??
                      item.id
                  ),

                name:
                  String(
                    data.name ??
                      data.title ??
                      'Curso sem nome'
                  ),

                description:
                  String(
                    data.description ??
                      ''
                  ),

                icon:
                  String(
                    data.icon ??
                      '📚'
                  ),

                color:
                  String(
                    data.color ??
                      '#00D4FF'
                  ),

                views:
                  Number(
                    data.views ??
                      0
                  ),

                lessons:
                  Array.isArray(
                    data.lessons
                  )
                    ? data.lessons as Lesson[]
                    : [],

                teacherId:
                  String(
                    data.teacherId ??
                      ''
                  ),

                published:
                  data.published ===
                  true,

                averageRating:
                  Number(
                    data.averageRating ??
                      data.rating ??
                      0
                  ),

                ratingsCount:
                  Number(
                    data.ratingsCount ??
                      data.ratingCount ??
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

        setSelectedCourseId(
          (currentSelectedId) => {
            if (
              loadedCourses.length ===
              0
            ) {
              return null;
            }

            if (
              currentSelectedId &&
              loadedCourses.some(
                (course) =>
                  course.id ===
                  currentSelectedId
              )
            ) {
              return currentSelectedId;
            }

            return loadedCourses[0].id;
          }
        );

        setLoadingCourses(false);
      },
      (error) => {
        console.error(
          'Erro ao carregar cursos do professor:',
          error
        );

        setCourses([]);
        setLoadingCourses(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [
    user?.id,
    teacherStatus,
  ]);

  // =========================================================
  // CRIAR CURSO
  // =========================================================

  async function createCourse() {
    if (!approved) {
      alert(
        'Seu cadastro ainda não foi aprovado pelo administrador.'
      );
      return;
    }

    if (
      !newCourseTitle.trim()
    ) {
      alert(
        'Digite o nome do curso.'
      );
      return;
    }

    if (!user || !db) {
      return;
    }

    setCreating(true);

    try {
      const courseId =
        `${user.id}-${Date.now()}`;

      const slug =
        createSlug(
          newCourseTitle
        );

      const course = {
        slug,

        name:
          newCourseTitle.trim(),

        description:
          newCourseDescription.trim() ||
          'Novo curso criado pelo professor.',

        icon:
          '📚',

        color:
          '#00D4FF',

        views:
          0,

        lessons: [
          {
            id: '1',
            title: 'Página 1',
            description: '',
            type: 'pdf' as LessonType,
            content: '',
            duration: 0,
            xpReward: 10,
          },
        ],

        teacherId:
          user.id,

        published:
          false,

        averageRating:
          0,

        ratingsCount:
          0,

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
        course
      );

      setSelectedCourseId(
        courseId
      );

      setNewCourseTitle('');
      setNewCourseDescription('');
      setActiveTab('courses');
    } catch (error) {
      console.error(
        'Erro ao criar curso:',
        error
      );

      alert(
        'Não foi possível criar o curso. Verifique se o administrador aprovou seu cadastro.'
      );
    } finally {
      setCreating(false);
    }
  }

  // =========================================================
  // SALVAR CURSO
  // =========================================================

  async function saveCourse(
    course: Course
  ) {
    if (!approved) {
      alert(
        'Você precisa ser aprovado pelo administrador para publicar conteúdo.'
      );
      return;
    }

    if (!db || !user) {
      return;
    }

    if (
      course.teacherId !==
      user.id
    ) {
      alert(
        'Você não pode alterar este curso.'
      );
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
          slug:
            course.slug,

          name:
            course.name,

          description:
            course.description,

          icon:
            course.icon,

          color:
            course.color,

          views:
            course.views,

          lessons:
            course.lessons,

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

      alert(
        'Curso salvo com sucesso!'
      );
    } catch (error) {
      console.error(
        'Erro ao salvar curso:',
        error
      );

      alert(
        'Não foi possível salvar o curso.'
      );
    }
  }

  // =========================================================
  // ATUALIZA CURSO LOCALMENTE
  // =========================================================

  function updateCourse(
    courseId: string,
    changes: Partial<Course>
  ) {
    if (!approved) {
      alert(
        'A publicação está bloqueada até a aprovação do administrador.'
      );
      return;
    }

    setCourses(
      (current) =>
        current.map(
          (course) =>
            course.id ===
            courseId
              ? {
                  ...course,
                  ...changes,
                }
              : course
        )
    );
  }

  // =========================================================
  // ATUALIZA AULA
  // =========================================================

  function updateLesson(
    lessonId: string,
    changes: Partial<Lesson>
  ) {
    if (!selectedCourse) {
      return;
    }

    if (!approved) {
      alert(
        'A edição está bloqueada até a aprovação do administrador.'
      );
      return;
    }

    const lessons =
      selectedCourse.lessons.map(
        (lesson) =>
          lesson.id ===
          lessonId
            ? {
                ...lesson,
                ...changes,
              }
            : lesson
      );

    const updatedCourse = {
      ...selectedCourse,
      lessons,
    };

    setCourses(
      (current) =>
        current.map(
          (course) =>
            course.id ===
            selectedCourse.id
              ? updatedCourse
              : course
        )
    );
  }

  // =========================================================
  // ADICIONAR AULA
  // =========================================================

  function addLesson() {
    if (!selectedCourse) {
      return;
    }

    if (!approved) {
      alert(
        'A edição está bloqueada até a aprovação do administrador.'
      );
      return;
    }

    const nextId =
      String(
        selectedCourse.lessons.length +
          1
      );

    const newLesson: Lesson = {
      id:
        nextId,

      title:
        `Página ${nextId}`,

      description:
        '',

      type:
        'pdf',

      content:
        '',

      duration:
        0,

      xpReward:
        10,
    };

    updateCourse(
      selectedCourse.id,
      {
        lessons: [
          ...selectedCourse.lessons,
          newLesson,
        ],
      }
    );
  }

  // =========================================================
  // CARREGAMENTO
  // =========================================================

  if (loadingApproval) {
    return (
      <Page>
        <div
          style={{
            textAlign:
              'center',
            padding:
              '100px 20px',
            color:
              '#9CA3AF',
          }}
        >
          🔄 Verificando aprovação...
        </div>
      </Page>
    );
  }

  // =========================================================
  // PROFESSOR AINDA NÃO APROVADO
  // =========================================================

  if (!approved) {
    return (
      <Page>
        <div
          style={{
            maxWidth:
              '700px',
            margin:
              '80px auto',
            background:
              '#0D1424',
            border:
              '1px solid #26344D',
            borderRadius:
              '18px',
            padding:
              '40px',
            textAlign:
              'center',
          }}
        >
          <div
            style={{
              fontSize:
                '60px',
              marginBottom:
                '15px',
            }}
          >
            {teacherStatus ===
            'rejected'
              ? '❌'
              : '⏳'}
          </div>

          <h1>
            {teacherStatus ===
            'rejected'
              ? 'Cadastro recusado'
              : 'Aguardando aprovação'}
          </h1>

          <p
            style={{
              color:
                '#9CA3AF',
              lineHeight:
                1.7,
            }}
          >
            {teacherStatus ===
            'rejected'
              ? 'O administrador recusou seu cadastro de professor. Entre em contato com a administração para saber o motivo.'
              : 'Seu cadastro de professor foi recebido. O administrador precisa analisar seus dados antes de liberar a criação e publicação de cursos.'}
          </p>

          <div
            style={{
              display:
                'inline-block',
              marginTop:
                '15px',
              padding:
                '8px 14px',
              borderRadius:
                '999px',
              background:
                teacherStatus ===
                'rejected'
                  ? '#FF555522'
                  : '#F59E0B22',
              color:
                teacherStatus ===
                'rejected'
                  ? '#FF5555'
                  : '#F59E0B',
              fontWeight:
                'bold',
              fontSize:
                '13px',
            }}
          >
            Status:{' '}
            {teacherStatus ===
            'rejected'
              ? 'Recusado'
              : 'Pendente'}
          </div>

          <p
            style={{
              color:
                '#6B7280',
              fontSize:
                '12px',
              marginTop:
                '20px',
            }}
          >
            Esta página verifica
            automaticamente quando o
            administrador alterar seu status.
          </p>
        </div>
      </Page>
    );
  }

  // =========================================================
  // ÁREA LIBERADA
  // =========================================================

  return (
    <Page>
      <header
        style={{
          display:
            'flex',
          justifyContent:
            'space-between',
          alignItems:
            'center',
          gap:
            '20px',
          marginBottom:
            '30px',
          flexWrap:
            'wrap',
        }}
      >
        <div>
          <div
            style={{
              color:
                '#00D4FF',
              fontSize:
                '12px',
              fontWeight:
                'bold',
              letterSpacing:
                '3px',
            }}
          >
            CODEQUEST NEXUS
          </div>

          <h1
            style={{
              fontSize:
                '34px',
              margin:
                '8px 0',
            }}
          >
            👨‍🏫 Central do Professor
          </h1>

          <p
            style={{
              color:
                '#9CA3AF',
              margin:
                0,
            }}
          >
            Seu cadastro foi aprovado.
            Agora você pode criar e
            editar seus cursos.
          </p>
        </div>

        <div
          style={{
            background:
              '#071F17',
            border:
              '1px solid #00FF88',
            padding:
              '12px 16px',
            borderRadius:
              '12px',
            color:
              '#00FF88',
            fontWeight:
              'bold',
          }}
        >
          ✅ PROFESSOR APROVADO
        </div>
      </header>

      <div
        style={{
          display:
            'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(180px, 1fr))',
          gap:
            '15px',
          marginBottom:
            '30px',
        }}
      >
        <Stat
          icon="📚"
          title="Cursos"
          value={
            courses.length
          }
        />

        <Stat
          icon="👁️"
          title="Visitas"
          value={
            courses.reduce(
              (
                total,
                course
              ) =>
                total +
                course.views,
              0
            )
          }
        />

        <Stat
          icon="⭐"
          title="Avaliação média"
          value={
            Number(
              getAverageRating(
                courses
              ).toFixed(1)
            )
          }
        />

        <Stat
          icon="📄"
          title="Aulas"
          value={
            courses.reduce(
              (
                total,
                course
              ) =>
                total +
                course.lessons
                  .length,
              0
            )
          }
        />
      </div>

      {loadingCourses && (
        <div
          style={{
            marginBottom:
              '20px',
            color:
              '#9CA3AF',
            fontSize:
              '13px',
          }}
        >
          🔄 Carregando seus cursos...
        </div>
      )}

      <div
        style={{
          display:
            'grid',
          gridTemplateColumns:
            '230px minmax(0, 1fr)',
          gap:
            '20px',
        }}
      >
        <aside
          style={{
            background:
              '#0D1424',
            border:
              '1px solid #1F2937',
            borderRadius:
              '16px',
            padding:
              '15px',
            height:
              'fit-content',
          }}
        >
          <button
            onClick={() =>
              setActiveTab(
                'courses'
              )
            }
            style={menuStyle(
              activeTab ===
                'courses'
            )}
          >
            📚 Meus cursos
          </button>

          <button
            onClick={() =>
              setActiveTab(
                'create'
              )
            }
            style={menuStyle(
              activeTab ===
                'create'
            )}
          >
            ➕ Criar curso
          </button>

          <button
            onClick={() =>
              setActiveTab(
                'score'
              )
            }
            style={menuStyle(
              activeTab ===
                'score'
            )}
          >
            ⭐ Pontuação
          </button>

          <div
            style={{
              borderTop:
                '1px solid #1F2937',
              margin:
                '15px 0',
            }}
          />

          {courses.length ===
          0 ? (
            <div
              style={{
                color:
                  '#6B7280',
                fontSize:
                  '12px',
                padding:
                  '8px',
              }}
            >
              Nenhum curso criado.
            </div>
          ) : (
            courses.map(
              (course) => (
                <button
                  key={
                    course.id
                  }
                  onClick={() => {
                    setSelectedCourseId(
                      course.id
                    );
                    setActiveTab(
                      'courses'
                    );
                  }}
                  style={{
                    width:
                      '100%',
                    textAlign:
                      'left',
                    border:
                      'none',
                    borderRadius:
                      '8px',
                    padding:
                      '10px',
                    marginBottom:
                      '5px',
                    cursor:
                      'pointer',
                    background:
                      selectedCourseId ===
                      course.id
                        ? '#17233A'
                        : 'transparent',
                    color:
                      selectedCourseId ===
                      course.id
                        ? '#00D4FF'
                        : '#9CA3AF',
                  }}
                >
                  📘{' '}
                  {
                    course.name
                  }
                </button>
              )
            )
          )}
        </aside>

        <main
          style={{
            background:
              '#0D1424',
            border:
              '1px solid #1F2937',
            borderRadius:
              '16px',
            padding:
              '25px',
            minWidth:
              0,
          }}
        >
          {activeTab ===
            'create' && (
            <CreateCourse
              title={
                newCourseTitle
              }
              description={
                newCourseDescription
              }
              setTitle={
                setNewCourseTitle
              }
              setDescription={
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
            'score' && (
            <ScoreEditor
              course={
                selectedCourse
              }
              onUpdate={
                updateCourse
              }
              onSave={
                saveCourse
              }
            />
          )}

          {activeTab ===
            'courses' &&
            selectedCourse && (
              <CourseEditor
                course={
                  selectedCourse
                }
                onUpdate={
                  updateCourse
                }
                onUpdateLesson={
                  updateLesson
                }
                onAddLesson={
                  addLesson
                }
                onSave={
                  saveCourse
                }
              />
            )}

          {activeTab ===
            'courses' &&
            !selectedCourse && (
            <div
              style={{
                textAlign:
                  'center',
                padding:
                  '80px 20px',
                color:
                  '#9CA3AF',
              }}
            >
              <div
                style={{
                  fontSize:
                    '50px',
                }}
              >
                📚
              </div>

              <h2>
                Crie seu primeiro
                curso
              </h2>

              <button
                onClick={() =>
                  setActiveTab(
                    'create'
                  )
                }
                style={
                  primaryButton
                }
              >
                Criar curso
              </button>
            </div>
          )}
        </main>
      </div>
    </Page>
  );
}

function Page({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight:
          '100vh',
        background:
          'radial-gradient(circle at top right, #182447 0%, #080D19 45%, #050811 100%)',
        color:
          'white',
        padding:
          '30px',
        fontFamily:
          'sans-serif',
      }}
    >
      <div
        style={{
          maxWidth:
            '1400px',
          margin:
            '0 auto',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Stat({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: number;
}) {
  return (
    <div
      style={{
        background:
          '#0D1424',
        border:
          '1px solid #1F2937',
        borderRadius:
          '14px',
        padding:
          '20px',
      }}
    >
      <div
        style={{
          fontSize:
            '25px',
        }}
      >
        {icon}
      </div>

      <div
        style={{
          color:
            '#9CA3AF',
          fontSize:
            '12px',
          marginTop:
            '10px',
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize:
            '25px',
          fontWeight:
            'bold',
          marginTop:
            '4px',
        }}
      >
        {value.toLocaleString(
          'pt-BR'
        )}
      </div>
    </div>
  );
}

function CreateCourse({
  title,
  description,
  setTitle,
  setDescription,
  onCreate,
  creating,
}: {
  title: string;
  description: string;
  setTitle: (
    value: string
  ) => void;
  setDescription: (
    value: string
  ) => void;
  onCreate: () => Promise<void>;
  creating: boolean;
}) {
  return (
    <section>
      <h2>
        ➕ Criar novo curso
      </h2>

      <p
        style={{
          color:
            '#9CA3AF',
        }}
      >
        O curso será criado como
        não publicado até que esteja
        pronto.
      </p>

      <div
        style={{
          display:
            'grid',
          gap:
            '20px',
          maxWidth:
            '700px',
          marginTop:
            '25px',
        }}
      >
        <label
          style={
            labelStyle
          }
        >
          Nome do curso

          <input
            value={
              title
            }
            onChange={(
              event
            ) =>
              setTitle(
                event.target.value
              )
            }
            placeholder="Ex.: Python do Zero"
            style={
              inputStyle
            }
          />
        </label>

        <label
          style={
            labelStyle
          }
        >
          Descrição

          <textarea
            value={
              description
            }
            onChange={(
              event
            ) =>
              setDescription(
                event.target.value
              )
            }
            placeholder="Explique o que o aluno aprenderá..."
            style={{
              ...inputStyle,
              minHeight:
                '120px',
              resize:
                'vertical',
            }}
          />
        </label>
      </div>

      <button
        onClick={() =>
          void onCreate()
        }
        disabled={
          creating
        }
        style={
          primaryButton
        }
      >
        {creating
          ? 'Criando...'
          : '🚀 Criar curso'}
      </button>
    </section>
  );
}

function ScoreEditor({
  course,
  onUpdate,
  onSave,
}: {
  course: Course | null;
  onUpdate: (
    id: string,
    changes: Partial<Course>
  ) => void;
  onSave: (
    course: Course
  ) => Promise<void>;
}) {
  if (!course) {
    return (
      <div>
        <h2>
          ⭐ Pontuação
        </h2>

        <p
          style={{
            color:
              '#9CA3AF',
          }}
        >
          Selecione um curso
          primeiro.
        </p>
      </div>
    );
  }

  return (
    <section>
      <h2>
        ⭐ Configuração do curso
      </h2>

      <div
        style={{
          background:
            '#111827',
          borderRadius:
            '12px',
          padding:
            '20px',
          marginTop:
            '20px',
        }}
      >
        <strong>
          {course.name}
        </strong>

        <p
          style={{
            color:
              '#9CA3AF',
          }}
        >
          Avaliação atual:{' '}
          {course.averageRating.toFixed(
            1
          )}{' '}
          / 5
        </p>

        <label
          style={
            labelStyle
          }
        >
          Publicação

          <select
            value={
              course.published
                ? 'published'
                : 'draft'
            }
            onChange={(
              event
            ) =>
              onUpdate(
                course.id,
                {
                  published:
                    event.target.value ===
                    'published',
                }
              )
            }
            style={{
              ...inputStyle,
              marginTop:
                '8px',
            }}
          >
            <option value="draft">
              Rascunho
            </option>

            <option value="published">
              Publicado
            </option>
          </select>
        </label>

        <button
          onClick={() =>
            void onSave(
              course
            )
          }
          style={
            primaryButton
          }
        >
          💾 Salvar curso
        </button>
      </div>
    </section>
  );
}

function CourseEditor({
  course,
  onUpdate,
  onUpdateLesson,
  onAddLesson,
  onSave,
}: {
  course: Course;
  onUpdate: (
    id: string,
    changes: Partial<Course>
  ) => void;
  onUpdateLesson: (
    id: string,
    changes: Partial<Lesson>
  ) => void;
  onAddLesson: () => void;
  onSave: (
    course: Course
  ) => Promise<void>;
}) {
  return (
    <section>
      <div
        style={{
          display:
            'flex',
          justifyContent:
            'space-between',
          alignItems:
            'flex-start',
          gap:
            '20px',
          flexWrap:
            'wrap',
        }}
      >
        <div
          style={{
            flex:
              1,
          }}
        >
          <input
            value={
              course.name
            }
            onChange={(
              event
            ) =>
              onUpdate(
                course.id,
                {
                  name:
                    event.target.value,
                }
              )
            }
            style={{
              ...inputStyle,
              fontSize:
                '25px',
              fontWeight:
                'bold',
            }}
          />

          <textarea
            value={
              course.description
            }
            onChange={(
              event
            ) =>
              onUpdate(
                course.id,
                {
                  description:
                    event.target.value,
                }
              )
            }
            style={{
              ...inputStyle,
              marginTop:
                '10px',
              minHeight:
                '80px',
            }}
          />
        </div>

        <button
          onClick={
            onAddLesson
          }
          style={
            primaryButton
          }
        >
          ➕ Nova página
        </button>
      </div>

      <div
        style={{
          display:
            'grid',
          gridTemplateColumns:
            '220px minmax(0, 1fr)',
          gap:
            '20px',
          marginTop:
            '30px',
        }}
      >
        <div
          style={{
            background:
              '#080D19',
            borderRadius:
              '12px',
            padding:
              '12px',
          }}
        >
          <strong
            style={{
              fontSize:
                '13px',
            }}
          >
            NAVEGAÇÃO
          </strong>

          {course.lessons.map(
            (
              lesson,
              index
            ) => (
              <div
                key={
                  lesson.id
                }
                style={{
                  padding:
                    '12px 8px',
                  borderBottom:
                    '1px solid #1F2937',
                  fontSize:
                    '13px',
                }}
              >
                {index +
                  1}
                .{' '}
                {lessonIcon(
                  lesson.type
                )}{' '}
                {
                  lesson.title
                }
              </div>
            )
          )}
        </div>

        <div>
          {course.lessons.map(
            (
              lesson
            ) => (
              <LessonEditor
                key={
                  lesson.id
                }
                lesson={
                  lesson
                }
                onUpdate={
                  onUpdateLesson
                }
              />
            )
          )}
        </div>
      </div>

      <div
        style={{
          display:
            'flex',
          gap:
            '15px',
          marginTop:
            '25px',
          flexWrap:
            'wrap',
        }}
      >
        <InfoBox
          title="👁️ Visitas"
          value={
            course.views
          }
        />

        <InfoBox
          title="⭐ Avaliação"
          value={
            Number(
              course.averageRating.toFixed(
                1
              )
            )
          }
        />

        <InfoBox
          title="📝 Avaliações"
          value={
            course.ratingsCount
          }
        />
      </div>

      <button
        onClick={() =>
          void onSave(
            course
          )
        }
        style={{
          ...primaryButton,
          marginTop:
            '25px',
        }}
      >
        💾 Salvar alterações
      </button>
    </section>
  );
}

function LessonEditor({
  lesson,
  onUpdate,
}: {
  lesson: Lesson;
  onUpdate: (
    id: string,
    changes: Partial<Lesson>
  ) => void;
}) {
  return (
    <div
      style={{
        background:
          '#111827',
        border:
          '1px solid #1F2937',
        borderRadius:
          '12px',
        padding:
          '18px',
        marginBottom:
          '15px',
      }}
    >
      <div
        style={{
          display:
            'flex',
          gap:
            '10px',
          alignItems:
            'center',
          marginBottom:
            '12px',
          flexWrap:
            'wrap',
        }}
      >
        <span
          style={{
            fontSize:
              '22px',
          }}
        >
          {lessonIcon(
            lesson.type
          )}
        </span>

        <input
          value={
            lesson.title
          }
          onChange={(
            event
          ) =>
            onUpdate(
              lesson.id,
              {
                title:
                  event.target.value,
              }
            )
          }
          style={{
            ...inputStyle,
            flex:
              1,
            minWidth:
              '200px',
          }}
        />

        <select
          value={
            lesson.type
          }
          onChange={(
            event
          ) =>
            onUpdate(
              lesson.id,
              {
                type:
                  event.target.value as LessonType,
              }
            )
          }
          style={
            inputStyle
          }
        >
          <option value="pdf">
            PDF
          </option>

          <option value="video">
            Vídeo
          </option>

          <option value="quiz">
            Questionário
          </option>
        </select>
      </div>

      <textarea
        value={
          lesson.content
        }
        onChange={(
          event
        ) =>
          onUpdate(
            lesson.id,
            {
              content:
                event.target.value,
            }
          )
        }
        placeholder="Conteúdo da aula..."
        style={{
          ...inputStyle,
          minHeight:
            '150px',
          resize:
            'vertical',
        }}
      />
    </div>
  );
}

function InfoBox({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div
      style={{
        flex:
          1,
        minWidth:
          '140px',
        background:
          '#111827',
        borderRadius:
          '10px',
        padding:
          '15px',
      }}
    >
      <div
        style={{
          color:
            '#9CA3AF',
          fontSize:
            '12px',
        }}
      >
        {title}
      </div>

      <strong
        style={{
          display:
            'block',
          marginTop:
            '5px',
          fontSize:
            '20px',
        }}
      >
        {value.toLocaleString(
          'pt-BR'
        )}
      </strong>
    </div>
  );
}

function lessonIcon(
  type: LessonType
) {
  if (
    type ===
    'pdf'
  ) {
    return '📄';
  }

  if (
    type ===
    'video'
  ) {
    return '🎥';
  }

  return '📝';
}

function normalizeStatus(
  value: unknown
): TeacherStatus {
  const status =
    String(
      value ??
        'pending'
    )
      .trim()
      .toLowerCase();

  if (
    status ===
    'approved'
  ) {
    return 'approved';
  }

  if (
    status ===
    'rejected'
  ) {
    return 'rejected';
  }

  return 'pending';
}

function createSlug(
  value: string
) {
  return value
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      ''
    )
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      '-'
    )
    .replace(
      /^-+|-+$/g,
      '');
}

function getAverageRating(
  courses: Course[]
) {
  if (
    courses.length ===
    0
  ) {
    return 0;
  }

  const ratedCourses =
    courses.filter(
      (course) =>
        course.averageRating >
        0
    );

  if (
    ratedCourses.length ===
    0
  ) {
    return 0;
  }

  return (
    ratedCourses.reduce(
      (
        total,
        course
      ) =>
        total +
        course.averageRating,
      0
    ) /
    ratedCourses.length
  );
}

const primaryButton = {
  border:
    'none',
  borderRadius:
    '9px',
  padding:
    '12px 18px',
  background:
    'linear-gradient(135deg, #00D4FF, #8B5CF6)',
  color:
    'white',
  fontWeight:
    'bold',
  cursor:
    'pointer',
  marginTop:
    '15px',
};

const inputStyle = {
  width:
    '100%',
  boxSizing:
    'border-box' as const,
  background:
    '#080D19',
  border:
    '1px solid #29364D',
  borderRadius:
    '8px',
  padding:
    '12px',
  color:
    'white',
  outline:
    'none',
};

const labelStyle = {
  display:
    'block',
  color:
    '#D1D5DB',
  fontSize:
    '13px',
};

function menuStyle(
  active: boolean
) {
  return {
    width:
      '100%',
    border:
      'none',
    borderRadius:
      '8px',
    padding:
      '12px',
    marginBottom:
      '5px',
    textAlign:
      'left' as const,
    cursor:
      'pointer',
    background:
      active
        ? '#17233A'
        : 'transparent',
    color:
      active
        ? '#00D4FF'
        : '#9CA3AF',
    fontWeight:
      active
        ? 'bold'
        : 'normal',
  };
}