import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';

type TeacherStatus = 'pending' | 'approved' | 'rejected';

interface Teacher {
  id: string;
  userId: string;
  email: string;
  name: string;
  phone: string;
  birthDate: string;
  knowledgeArea: string;
  documentName: string;
  status: TeacherStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
  reviewedAt?: unknown;
  reviewedBy?: string;
  rejectionReason?: string;
}

interface UserRecord {
  id: string;
  email?: string;
  username?: string;
  role?: string;
}

interface CourseRecord {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  views?: number;
  visits?: number;
  averageRating?: number;
  rating?: number;
  ratingsCount?: number;
  topic?: string;
  topics?: string[];
  tags?: string[];
  published?: boolean;
}

interface SearchRecord {
  term?: string;
  query?: string;
  count?: number;
}

type Tab =
  | 'overview'
  | 'teachers'
  | 'courses'
  | 'topics'
  | 'theme';

export function AdminDashboard() {
  const [activeTab, setActiveTab] =
    useState<Tab>('overview');

  const [background, setBackground] =
    useState('#050816');

  const [primaryColor, setPrimaryColor] =
    useState('#00D4FF');

  const [teachers, setTeachers] =
    useState<Teacher[]>([]);

  const [users, setUsers] =
    useState<UserRecord[]>([]);

  const [courses, setCourses] =
    useState<CourseRecord[]>([]);

  const [searches, setSearches] =
    useState<SearchRecord[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [savingTeacher, setSavingTeacher] =
    useState<string | null>(null);

  const [selectedTeacher, setSelectedTeacher] =
    useState<Teacher | null>(null);

  const [error, setError] =
    useState('');

  async function loadAdminData() {
    setLoading(true);
    setError('');

    try {
      if (!db) {
        throw new Error(
          'Firebase/Firestore não está configurado.'
        );
      }

      const [
        teachersSnapshot,
        usersSnapshot,
        coursesSnapshot,
        searchesSnapshot,
      ] = await Promise.all([
        getDocs(
          query(
            collection(db, 'teachers'),
            orderBy('createdAt', 'desc')
          )
        ),
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'courses')),
        getDocs(collection(db, 'searches')),
      ]);

      const loadedTeachers: Teacher[] =
        teachersSnapshot.docs.map((item) => {
          const data =
            item.data() as Partial<Teacher>;

          return {
            id: item.id,
            userId: data.userId || item.id,
            email: data.email || '',
            name: data.name || '',
            phone: data.phone || '',
            birthDate: data.birthDate || '',
            knowledgeArea:
              data.knowledgeArea || '',
            documentName:
              data.documentName || '',
            status:
              normalizeTeacherStatus(data.status),
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            reviewedAt: data.reviewedAt,
            reviewedBy: data.reviewedBy,
            rejectionReason:
              data.rejectionReason,
          };
        });

      const loadedUsers: UserRecord[] =
        usersSnapshot.docs.map((item) => {
          const data = item.data();

          return {
            id: item.id,
            email: data.email,
            username: data.username,
            role: data.role,
          };
        });

      const loadedCourses: CourseRecord[] =
        coursesSnapshot.docs.map((item) => {
          const data = item.data();

          return {
            id: item.id,
            name: data.name,
            title: data.title,
            description: data.description,
            views: Number(
              data.views ?? data.visits ?? 0
            ),
            visits: Number(data.visits ?? 0),
            averageRating: Number(
              data.averageRating ??
                data.rating ??
                0
            ),
            rating: Number(data.rating ?? 0),
            ratingsCount: Number(
              data.ratingsCount ?? 0
            ),
            topic: data.topic,
            topics: Array.isArray(data.topics)
              ? data.topics
              : undefined,
            tags: Array.isArray(data.tags)
              ? data.tags
              : undefined,
            published:
              data.published !== false,
          };
        });

      const loadedSearches: SearchRecord[] =
        searchesSnapshot.docs.map((item) => {
          const data = item.data();

          return {
            term: data.term,
            query: data.query,
            count: Number(data.count ?? 1),
          };
        });

      setTeachers(loadedTeachers);
      setUsers(loadedUsers);
      setCourses(loadedCourses);
      setSearches(loadedSearches);
    } catch (err) {
      console.error(
        'Erro ao carregar painel administrativo:',
        err
      );

      setError(
        'Não foi possível carregar os dados do Firebase. Verifique as regras do Firestore.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAdminData();
  }, []);

  async function approveTeacher(
    teacher: Teacher
  ) {
    if (!db) return;

    setSavingTeacher(teacher.id);

    try {
      await updateDoc(
        doc(db, 'teachers', teacher.id),
        {
          status: 'approved',
          reviewedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      );

      await updateDoc(
        doc(db, 'users', teacher.userId),
        {
          teacherStatus: 'approved',
          updatedAt: serverTimestamp(),
        }
      );

      setTeachers((current) =>
        current.map((item) =>
          item.id === teacher.id
            ? {
                ...item,
                status: 'approved',
              }
            : item
        )
      );

      setSelectedTeacher(null);
    } catch (err) {
      console.error(
        'Erro ao aprovar professor:',
        err
      );

      alert(
        'Não foi possível aprovar o professor.'
      );
    } finally {
      setSavingTeacher(null);
    }
  }

  async function rejectTeacher(
    teacher: Teacher
  ) {
    if (!db) return;

    const reason = window.prompt(
      'Informe o motivo da recusa:',
      ''
    );

    if (reason === null) {
      return;
    }

    setSavingTeacher(teacher.id);

    try {
      await updateDoc(
        doc(db, 'teachers', teacher.id),
        {
          status: 'rejected',
          rejectionReason: reason,
          reviewedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      );

      await updateDoc(
        doc(db, 'users', teacher.userId),
        {
          teacherStatus: 'rejected',
          rejectionReason: reason,
          updatedAt: serverTimestamp(),
        }
      );

      setTeachers((current) =>
        current.map((item) =>
          item.id === teacher.id
            ? {
                ...item,
                status: 'rejected',
                rejectionReason: reason,
              }
            : item
        )
      );

      setSelectedTeacher(null);
    } catch (err) {
      console.error(
        'Erro ao recusar professor:',
        err
      );

      alert(
        'Não foi possível recusar o professor.'
      );
    } finally {
      setSavingTeacher(null);
    }
  }

  const pendingTeachers = useMemo(
    () =>
      teachers.filter(
        (teacher) =>
          teacher.status === 'pending'
      ),
    [teachers]
  );

  const approvedTeachers = useMemo(
    () =>
      teachers.filter(
        (teacher) =>
          teacher.status === 'approved'
      ),
    [teachers]
  );

  const topCourses = useMemo(
    () =>
      [...courses]
        .sort(
          (a, b) =>
            getCourseViews(b) -
            getCourseViews(a)
        )
        .slice(0, 5),
    [courses]
  );

  const bestRatedCourses = useMemo(
    () =>
      [...courses]
        .filter(
          (course) =>
            getCourseRating(course) > 0
        )
        .sort(
          (a, b) =>
            getCourseRating(b) -
            getCourseRating(a)
        )
        .slice(0, 5),
    [courses]
  );

  const popularTopics = useMemo(
    () =>
      getPopularTopics(
        searches,
        courses
      ).slice(0, 10),
    [searches, courses]
  );

  const totalUsers = users.length;

  const publishedCourses =
    courses.filter(
      (course) =>
        course.published !== false
    ).length;

  return (
    <div
      style={{
        minHeight: '100vh',
        background,
        color: 'white',
        padding: '30px',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        <header
          style={{
            marginBottom: '30px',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '6px 12px',
              borderRadius: '20px',
              background: `${primaryColor}22`,
              border: `1px solid ${primaryColor}`,
              color: primaryColor,
              fontSize: '12px',
              marginBottom: '10px',
            }}
          >
            ÁREA ADMINISTRATIVA
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent:
                'space-between',
              alignItems: 'flex-start',
              gap: '20px',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: '36px',
                  margin: '0 0 8px',
                }}
              >
                Painel do Administrador
              </h1>

              <p
                style={{
                  color: '#9CA3AF',
                  margin: 0,
                }}
              >
                Controle de usuários,
                professores, cursos e
                estatísticas do CodeQuest.
              </p>
            </div>

            <button
              onClick={() => void loadAdminData()}
              style={{
                ...buttonStyle(
                  false,
                  primaryColor
                ),
                padding: '12px 18px',
              }}
            >
              🔄 Atualizar dados
            </button>
          </div>
        </header>

        {error && (
          <div
            style={{
              background:
                'rgba(239,68,68,0.12)',
              border:
                '1px solid #EF4444',
              borderRadius: '12px',
              padding: '15px',
              marginBottom: '20px',
              color: '#FCA5A5',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <nav
          style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '30px',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() =>
              setActiveTab('overview')
            }
            style={buttonStyle(
              activeTab === 'overview',
              primaryColor
            )}
          >
            📊 Visão geral
          </button>

          <button
            onClick={() =>
              setActiveTab('teachers')
            }
            style={buttonStyle(
              activeTab === 'teachers',
              primaryColor
            )}
          >
            👨‍🏫 Professores
            {pendingTeachers.length > 0 && (
              <span
                style={{
                  marginLeft: '8px',
                  background: '#F59E0B',
                  color: '#111827',
                  borderRadius: '999px',
                  padding: '2px 7px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                }}
              >
                {pendingTeachers.length}
              </span>
            )}
          </button>

          <button
            onClick={() =>
              setActiveTab('courses')
            }
            style={buttonStyle(
              activeTab === 'courses',
              primaryColor
            )}
          >
            📚 Cursos
          </button>

          <button
            onClick={() =>
              setActiveTab('topics')
            }
            style={buttonStyle(
              activeTab === 'topics',
              primaryColor
            )}
          >
            🔎 Temas
          </button>

          <button
            onClick={() =>
              setActiveTab('theme')
            }
            style={buttonStyle(
              activeTab === 'theme',
              primaryColor
            )}
          >
            🎨 Tema
          </button>
        </nav>

        {loading ? (
          <Loading />
        ) : (
          <>
            {activeTab === 'overview' && (
              <Overview
                totalUsers={totalUsers}
                approvedTeachers={
                  approvedTeachers.length
                }
                pendingTeachers={
                  pendingTeachers.length
                }
                publishedCourses={
                  publishedCourses
                }
                topCourses={topCourses}
                bestRatedCourses={
                  bestRatedCourses
                }
                popularTopics={
                  popularTopics
                }
                primaryColor={
                  primaryColor
                }
              />
            )}

            {activeTab === 'teachers' && (
              <TeachersTab
                teachers={teachers}
                savingTeacher={savingTeacher}
                onSelectTeacher={
                  setSelectedTeacher
                }
                onApprove={approveTeacher}
                onReject={rejectTeacher}
              />
            )}

            {activeTab === 'courses' && (
              <CoursesTab
                courses={courses}
              />
            )}

            {activeTab === 'topics' && (
              <TopicsTab
                topics={popularTopics}
              />
            )}

            {activeTab === 'theme' && (
              <ThemeTab
                background={background}
                primaryColor={primaryColor}
                setBackground={setBackground}
                setPrimaryColor={
                  setPrimaryColor
                }
              />
            )}
          </>
        )}
      </div>

      {selectedTeacher && (
        <TeacherDetailsModal
          teacher={selectedTeacher}
          saving={
            savingTeacher ===
            selectedTeacher.id
          }
          onClose={() =>
            setSelectedTeacher(null)
          }
          onApprove={() =>
            void approveTeacher(
              selectedTeacher
            )
          }
          onReject={() =>
            void rejectTeacher(
              selectedTeacher
            )
          }
        />
      )}
    </div>
  );
}

function Overview({
  totalUsers,
  approvedTeachers,
  pendingTeachers,
  publishedCourses,
  topCourses,
  bestRatedCourses,
  popularTopics,
  primaryColor,
}: {
  totalUsers: number;
  approvedTeachers: number;
  pendingTeachers: number;
  publishedCourses: number;
  topCourses: CourseRecord[];
  bestRatedCourses: CourseRecord[];
  popularTopics: {
    name: string;
    count: number;
  }[];
  primaryColor: string;
}) {
  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '15px',
          marginBottom: '25px',
        }}
      >
        <StatCard
          title="Usuários"
          value={totalUsers}
          description="Usuários cadastrados"
          color={primaryColor}
          icon="👥"
        />

        <StatCard
          title="Professores"
          value={approvedTeachers}
          description="Professores aprovados"
          color="#8B5CF6"
          icon="👨‍🏫"
        />

        <StatCard
          title="Pendentes"
          value={pendingTeachers}
          description="Aguardando aprovação"
          color="#F59E0B"
          icon="⏳"
        />

        <StatCard
          title="Cursos"
          value={publishedCourses}
          description="Cursos publicados"
          color="#00FF88"
          icon="📚"
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
        }}
      >
        <RankingCard
          title="🔥 Cursos mais acessados"
          items={topCourses.map(
            (course) => ({
              name:
                course.name ||
                course.title ||
                'Curso sem nome',
              value: `${getCourseViews(
                course
              ).toLocaleString(
                'pt-BR'
              )} acessos`,
            })
          )}
        />

        <RankingCard
          title="⭐ Cursos melhor avaliados"
          items={bestRatedCourses.map(
            (course) => ({
              name:
                course.name ||
                course.title ||
                'Curso sem nome',
              value: `${getCourseRating(
                course
              ).toFixed(1)} / 5`,
            })
          )}
        />

        <RankingCard
          title="🔎 Temas mais procurados"
          items={popularTopics.map(
            (topic) => ({
              name: topic.name,
              value: `${topic.count} buscas`,
            })
          )}
        />
      </div>
    </div>
  );
}

function TeachersTab({
  teachers,
  savingTeacher,
  onSelectTeacher,
  onApprove,
  onReject,
}: {
  teachers: Teacher[];
  savingTeacher: string | null;
  onSelectTeacher: (
    teacher: Teacher
  ) => void;
  onApprove: (
    teacher: Teacher
  ) => Promise<void>;
  onReject: (
    teacher: Teacher
  ) => Promise<void>;
}) {
  return (
    <section>
      <Panel>
        <h2 style={{ marginTop: 0 }}>
          👨‍🏫 Validação de professores
        </h2>

        <p
          style={{
            color: '#9CA3AF',
            lineHeight: 1.6,
          }}
        >
          Analise os dados enviados no
          cadastro e libere somente os
          professores aprovados.
        </p>

        {teachers.length === 0 ? (
          <Empty
            text="Nenhuma solicitação de professor encontrada."
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gap: '15px',
              marginTop: '20px',
            }}
          >
            {teachers.map((teacher) => (
              <div
                key={teacher.id}
                style={{
                  background: '#0A1020',
                  border:
                    '1px solid #26344D',
                  borderRadius: '12px',
                  padding: '20px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    gap: '15px',
                    alignItems:
                      'flex-start',
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <h3
                      style={{
                        margin:
                          '0 0 8px',
                      }}
                    >
                      {teacher.name ||
                        'Sem nome'}
                    </h3>

                    <div
                      style={{
                        color:
                          '#9CA3AF',
                        fontSize:
                          '13px',
                        lineHeight:
                          1.8,
                      }}
                    >
                      <div>
                        📧{' '}
                        {teacher.email ||
                          'Não informado'}
                      </div>

                      <div>
                        💻 Área:{' '}
                        {teacher.knowledgeArea ||
                          'Não informada'}
                      </div>

                      <div>
                        📄 Documento:{' '}
                        {teacher.documentName ||
                          'Não enviado'}
                      </div>
                    </div>
                  </div>

                  <StatusBadge
                    status={teacher.status}
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    flexWrap: 'wrap',
                    marginTop: '18px',
                  }}
                >
                  <button
                    onClick={() =>
                      onSelectTeacher(
                        teacher
                      )
                    }
                    style={smallButton}
                  >
                    👁️ Ver cadastro completo
                  </button>

                  {teacher.status ===
                    'pending' && (
                    <>
                      <button
                        disabled={
                          savingTeacher ===
                          teacher.id
                        }
                        onClick={() =>
                          void onApprove(
                            teacher
                          )
                        }
                        style={{
                          ...smallButton,
                          background:
                            '#00FF88',
                          color:
                            '#00150A',
                          border:
                            'none',
                        }}
                      >
                        {savingTeacher ===
                        teacher.id
                          ? 'Salvando...'
                          : '✅ Aprovar'}
                      </button>

                      <button
                        disabled={
                          savingTeacher ===
                          teacher.id
                        }
                        onClick={() =>
                          void onReject(
                            teacher
                          )
                        }
                        style={{
                          ...smallButton,
                          background:
                            'transparent',
                          color:
                            '#FF5555',
                          border:
                            '1px solid #FF5555',
                        }}
                      >
                        ❌ Recusar
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </section>
  );
}

function CoursesTab({
  courses,
}: {
  courses: CourseRecord[];
}) {
  const sorted = [
    ...courses,
  ].sort(
    (a, b) =>
      getCourseViews(b) -
      getCourseViews(a)
  );

  return (
    <Panel>
      <h2 style={{ marginTop: 0 }}>
        📚 Desempenho dos cursos
      </h2>

      {sorted.length === 0 ? (
        <Empty text="Ainda não existem cursos no Firestore." />
      ) : (
        <div
          style={{
            overflowX: 'auto',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse:
                'collapse',
              minWidth: '700px',
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>
                  Curso
                </th>
                <th style={thStyle}>
                  Acessos
                </th>
                <th style={thStyle}>
                  Avaliação
                </th>
                <th style={thStyle}>
                  Avaliações
                </th>
                <th style={thStyle}>
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {sorted.map((course) => (
                <tr key={course.id}>
                  <td style={tdStyle}>
                    {course.name ||
                      course.title ||
                      'Sem nome'}
                  </td>

                  <td style={tdStyle}>
                    {getCourseViews(
                      course
                    ).toLocaleString(
                      'pt-BR'
                    )}
                  </td>

                  <td style={tdStyle}>
                    ⭐{' '}
                    {getCourseRating(
                      course
                    ).toFixed(1)}
                  </td>

                  <td style={tdStyle}>
                    {course.ratingsCount ??
                      0}
                  </td>

                  <td style={tdStyle}>
                    {course.published ===
                    false
                      ? '🔒 Não publicado'
                      : '🟢 Publicado'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

function TopicsTab({
  topics,
}: {
  topics: {
    name: string;
    count: number;
  }[];
}) {
  return (
    <Panel>
      <h2 style={{ marginTop: 0 }}>
        🔎 Temas mais procurados
      </h2>

      <p
        style={{
          color: '#9CA3AF',
        }}
      >
        Ranking baseado nos registros da
        coleção <strong>searches</strong>.
      </p>

      {topics.length === 0 ? (
        <Empty
          text="Ainda não existem buscas registradas."
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gap: '10px',
            marginTop: '20px',
          }}
        >
          {topics.map(
            (topic, index) => (
              <div
                key={topic.name}
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center',
                  background:
                    '#0A1020',
                  border:
                    '1px solid #26344D',
                  borderRadius: '10px',
                  padding: '15px',
                }}
              >
                <div>
                  <strong>
                    #{index + 1}{' '}
                    {topic.name}
                  </strong>
                </div>

                <span
                  style={{
                    color: '#00D4FF',
                  }}
                >
                  {topic.count} buscas
                </span>
              </div>
            )
          )}
        </div>
      )}
    </Panel>
  );
}

function ThemeTab({
  background,
  primaryColor,
  setBackground,
  setPrimaryColor,
}: {
  background: string;
  primaryColor: string;
  setBackground: (
    value: string
  ) => void;
  setPrimaryColor: (
    value: string
  ) => void;
}) {
  return (
    <Panel>
      <h2 style={{ marginTop: 0 }}>
        🎨 Personalização
      </h2>

      <p
        style={{
          color: '#9CA3AF',
          marginBottom: '30px',
        }}
      >
        Pré-visualização das cores do
        painel administrativo.
      </p>

      <div
        style={{
          display: 'grid',
          gap: '20px',
          maxWidth: '500px',
        }}
      >
        <label>
          <span
            style={{
              display: 'block',
              marginBottom: '8px',
            }}
          >
            Cor principal
          </span>

          <input
            type="color"
            value={primaryColor}
            onChange={(event) =>
              setPrimaryColor(
                event.target.value
              )
            }
            style={{
              width: '100%',
              height: '50px',
              cursor: 'pointer',
            }}
          />
        </label>

        <label>
          <span
            style={{
              display: 'block',
              marginBottom: '8px',
            }}
          >
            Cor do fundo
          </span>

          <input
            type="color"
            value={background}
            onChange={(event) =>
              setBackground(
                event.target.value
              )
            }
            style={{
              width: '100%',
              height: '50px',
              cursor: 'pointer',
            }}
          />
        </label>

        <div
          style={{
            padding: '25px',
            borderRadius: '12px',
            border: `1px solid ${primaryColor}`,
            background,
          }}
        >
          <strong
            style={{
              color: primaryColor,
            }}
          >
            Pré-visualização
          </strong>

          <p
            style={{
              color: '#D1D5DB',
            }}
          >
            Assim ficará o painel.
          </p>
        </div>
      </div>
    </Panel>
  );
}

function TeacherDetailsModal({
  teacher,
  saving,
  onClose,
  onApprove,
  onReject,
}: {
  teacher: Teacher;
  saving: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background:
          'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 1000,
      }}
    >
      <div
        onClick={(event) =>
          event.stopPropagation()
        }
        style={{
          width: '100%',
          maxWidth: '650px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#111827',
          border:
            '1px solid #26344D',
          borderRadius: '16px',
          padding: '25px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            gap: '15px',
          }}
        >
          <div>
            <h2
              style={{
                margin:
                  '0 0 5px',
              }}
            >
              Cadastro do professor
            </h2>

            <p
              style={{
                color: '#9CA3AF',
                marginTop: 0,
              }}
            >
              Confira todos os dados
              enviados.
            </p>
          </div>

          <StatusBadge
            status={teacher.status}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gap: '12px',
            marginTop: '20px',
          }}
        >
          <Detail
            label="Nome completo"
            value={teacher.name}
          />

          <Detail
            label="E-mail"
            value={teacher.email}
          />

          <Detail
            label="Telefone"
            value={teacher.phone}
          />

          <Detail
            label="Data de nascimento"
            value={teacher.birthDate}
          />

          <Detail
            label="Área de conhecimento"
            value={
              teacher.knowledgeArea
            }
          />

          <Detail
            label="Documento"
            value={
              teacher.documentName ||
              'Não informado'
            }
          />

          <Detail
            label="UID"
            value={teacher.userId}
          />

          {teacher.rejectionReason && (
            <Detail
              label="Motivo da recusa"
              value={
                teacher.rejectionReason
              }
            />
          )}
        </div>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            marginTop: '25px',
          }}
        >
          {teacher.status ===
            'pending' && (
            <>
              <button
                disabled={saving}
                onClick={onApprove}
                style={{
                  ...smallButton,
                  background:
                    '#00FF88',
                  color:
                    '#00150A',
                  border: 'none',
                }}
              >
                {saving
                  ? 'Salvando...'
                  : '✅ Aprovar professor'}
              </button>

              <button
                disabled={saving}
                onClick={onReject}
                style={{
                  ...smallButton,
                  color:
                    '#FF5555',
                  border:
                    '1px solid #FF5555',
                }}
              >
                ❌ Recusar
              </button>
            </>
          )}

          <button
            onClick={onClose}
            style={smallButton}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        background: '#0A1020',
        border:
          '1px solid #26344D',
        borderRadius: '10px',
        padding: '13px',
      }}
    >
      <div
        style={{
          color: '#6B7280',
          fontSize: '11px',
          textTransform:
            'uppercase',
          marginBottom: '5px',
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: '#E5E7EB',
          wordBreak:
            'break-word',
        }}
      >
        {value || 'Não informado'}
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: TeacherStatus;
}) {
  const config = {
    pending: {
      text: 'Pendente',
      color: '#F59E0B',
    },
    approved: {
      text: 'Aprovado',
      color: '#00FF88',
    },
    rejected: {
      text: 'Recusado',
      color: '#FF5555',
    },
  };

  const current =
    config[status];

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '6px 10px',
        borderRadius: '999px',
        background: `${current.color}22`,
        color: current.color,
        fontSize: '12px',
        fontWeight: 'bold',
      }}
    >
      {current.text}
    </span>
  );
}

function StatCard({
  title,
  value,
  description,
  color,
  icon,
}: {
  title: string;
  value: number;
  description: string;
  color: string;
  icon: string;
}) {
  return (
    <div
      style={{
        background: '#111827',
        border:
          '1px solid #1F2937',
        borderRadius: '14px',
        padding: '20px',
      }}
    >
      <div
        style={{
          fontSize: '24px',
          marginBottom: '10px',
        }}
      >
        {icon}
      </div>

      <div
        style={{
          color,
          fontSize: '12px',
          fontWeight: 'bold',
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: '32px',
          fontWeight: 'bold',
          marginTop: '5px',
        }}
      >
        {value.toLocaleString(
          'pt-BR'
        )}
      </div>

      <div
        style={{
          color: '#9CA3AF',
          fontSize: '12px',
          marginTop: '5px',
        }}
      >
        {description}
      </div>
    </div>
  );
}

function RankingCard({
  title,
  items,
}: {
  title: string;
  items: {
    name: string;
    value: string;
  }[];
}) {
  return (
    <div
      style={{
        background: '#111827',
        border:
          '1px solid #1F2937',
        borderRadius: '14px',
        padding: '20px',
      }}
    >
      <h3
        style={{
          marginTop: 0,
        }}
      >
        {title}
      </h3>

      {items.length === 0 ? (
        <p
          style={{
            color: '#6B7280',
          }}
        >
          Ainda não existem dados
          suficientes.
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gap: '10px',
          }}
        >
          {items.map(
            (item, index) => (
              <div
                key={`${item.name}-${index}`}
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  gap: '15px',
                  padding:
                    '12px 0',
                  borderBottom:
                    '1px solid #1F2937',
                }}
              >
                <span>
                  <strong>
                    {index + 1}.
                  </strong>{' '}
                  {item.name}
                </span>

                <span
                  style={{
                    color: '#00D4FF',
                    whiteSpace:
                      'nowrap',
                  }}
                >
                  {item.value}
                </span>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

function Panel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: '#111827',
        border:
          '1px solid #1F2937',
        borderRadius: '14px',
        padding: '24px',
      }}
    >
      {children}
    </section>
  );
}

function Loading() {
  return (
    <Panel>
      <div
        style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#9CA3AF',
        }}
      >
        🔄 Carregando dados do
        Firebase...
      </div>
    </Panel>
  );
}

function Empty({
  text,
}: {
  text: string;
}) {
  return (
    <div
      style={{
        padding: '50px 20px',
        textAlign: 'center',
        color: '#6B7280',
      }}
    >
      {text}
    </div>
  );
}

const smallButton = {
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #374151',
  background: '#172033',
  color: '#E5E7EB',
  fontWeight: 'bold',
  cursor: 'pointer',
};

function buttonStyle(
  active: boolean,
  color: string
): React.CSSProperties {
  return {
    padding: '10px 16px',
    borderRadius: '8px',
    border: active
      ? `1px solid ${color}`
      : '1px solid #374151',
    background: active
      ? `${color}22`
      : '#111827',
    color: active
      ? color
      : '#D1D5DB',
    cursor: 'pointer',
    fontWeight: active
      ? 'bold'
      : 'normal',
  };
}

const thStyle: React.CSSProperties =
  {
    textAlign: 'left',
    padding: '12px',
    borderBottom:
      '1px solid #374151',
    color: '#9CA3AF',
    fontSize: '12px',
  };

const tdStyle: React.CSSProperties =
  {
    padding: '14px 12px',
    borderBottom:
      '1px solid #1F2937',
    fontSize: '13px',
  };

function getCourseViews(
  course: CourseRecord
) {
  return Number(
    course.views ??
      course.visits ??
      0
  );
}

function getCourseRating(
  course: CourseRecord
) {
  return Number(
    course.averageRating ??
      course.rating ??
      0
  );
}

function normalizeTeacherStatus(
  value: unknown
): TeacherStatus {
  const status = String(
    value ?? 'pending'
  )
    .trim()
    .toLowerCase();

  if (status === 'approved') {
    return 'approved';
  }

  if (status === 'rejected') {
    return 'rejected';
  }

  return 'pending';
}

function getPopularTopics(
  searches: SearchRecord[],
  courses: CourseRecord[]
) {
  const map = new Map<
    string,
    number
  >();

  for (const search of searches) {
    const term = String(
      search.term ??
        search.query ??
        ''
    ).trim();

    if (!term) continue;

    map.set(
      term,
      (map.get(term) || 0) +
        Number(search.count ?? 1)
    );
  }

  if (map.size === 0) {
    for (const course of courses) {
      const topics = [
        ...(course.topics || []),
        ...(course.tags || []),
        ...(course.topic
          ? [course.topic]
          : []),
      ];

      for (const topic of topics) {
        const normalized =
          String(topic).trim();

        if (!normalized) continue;

        map.set(
          normalized,
          (map.get(normalized) || 0) +
            1
        );
      }
    }
  }

  return [...map.entries()]
    .map(
      ([name, count]) => ({
        name,
        count,
      })
    )
    .sort(
      (a, b) => b.count - a.count
    );
}