import { useMemo, useState } from 'react';

type LessonType = 'pdf' | 'video' | 'quiz';

interface Lesson {
  id: number;
  title: string;
  type: LessonType;
  content: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  students: number;
  visits: number;
  points: number;
  lessons: Lesson[];
}

const initialCourses: Course[] = [
  {
    id: 1,
    title: 'JavaScript do Zero',
    description:
      'Aprenda JavaScript começando pelos conceitos fundamentais.',
    students: 128,
    visits: 842,
    points: 500,
    lessons: [
      {
        id: 1,
        title: 'Introdução ao JavaScript',
        type: 'pdf',
        content:
          'PDF: Introdução ao JavaScript\n\nconst nome = "CodeQuest";\nconsole.log(nome);',
      },
      {
        id: 2,
        title: 'Variáveis e constantes',
        type: 'video',
        content: 'https://www.youtube.com/watch?v=example',
      },
      {
        id: 3,
        title: 'Funções',
        type: 'pdf',
        content:
          'PDF: Funções\n\nfunction somar(a, b) {\n  return a + b;\n}',
      },
      {
        id: 4,
        title: 'Praticando funções',
        type: 'video',
        content: 'https://www.youtube.com/watch?v=example2',
      },
      {
        id: 5,
        title: 'Questionário final',
        type: 'quiz',
        content: 'Perguntas sobre JavaScript básico.',
      },
    ],
  },
];

function lessonIcon(type: LessonType) {
  if (type === 'pdf') return '📄';
  if (type === 'video') return '🎥';
  return '📝';
}

function lessonName(type: LessonType) {
  if (type === 'pdf') return 'PDF';
  if (type === 'video') return 'Vídeo';
  return 'Questionário';
}

export function TeacherDashboard() {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [selectedCourseId, setSelectedCourseId] = useState(1);
  const [activeTab, setActiveTab] = useState<
    'courses' | 'create' | 'score'
  >('courses');

  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDescription, setNewCourseDescription] =
    useState('');

  const selectedCourse = useMemo(
    () =>
      courses.find(
        (course) => course.id === selectedCourseId
      ) || null,
    [courses, selectedCourseId]
  );

  function createCourse() {
    if (!newCourseTitle.trim()) {
      alert('Digite o nome do curso.');
      return;
    }

    const course: Course = {
      id: Date.now(),
      title: newCourseTitle,
      description:
        newCourseDescription ||
        'Novo curso criado pelo professor.',
      students: 0,
      visits: 0,
      points: 100,
      lessons: [
        {
          id: 1,
          title: 'Página 1',
          type: 'pdf',
          content:
            'Coloque aqui o conteúdo do primeiro PDF.',
        },
        {
          id: 2,
          title: 'Página 2',
          type: 'video',
          content:
            'Coloque aqui o link do vídeo.',
        },
        {
          id: 3,
          title: 'Página 3',
          type: 'pdf',
          content:
            'Coloque aqui o conteúdo do segundo PDF.',
        },
        {
          id: 4,
          title: 'Página 4',
          type: 'video',
          content:
            'Coloque aqui o segundo vídeo.',
        },
        {
          id: 5,
          title: 'Página 5',
          type: 'quiz',
          content:
            'Coloque aqui as perguntas do questionário.',
        },
      ],
    };

    setCourses((old) => [...old, course]);
    setSelectedCourseId(course.id);
    setNewCourseTitle('');
    setNewCourseDescription('');
    setActiveTab('courses');
  }

  function updateCourse(
    courseId: number,
    changes: Partial<Course>
  ) {
    setCourses((old) =>
      old.map((course) =>
        course.id === courseId
          ? { ...course, ...changes }
          : course
      )
    );
  }

  function updateLesson(
    lessonId: number,
    changes: Partial<Lesson>
  ) {
    if (!selectedCourse) return;

    const lessons = selectedCourse.lessons.map(
      (lesson) =>
        lesson.id === lessonId
          ? { ...lesson, ...changes }
          : lesson
    );

    updateCourse(selectedCourse.id, { lessons });
  }

  function addLesson() {
    if (!selectedCourse) return;

    const nextId =
      Math.max(
        0,
        ...selectedCourse.lessons.map(
          (lesson) => lesson.id
        )
      ) + 1;

    const newLesson: Lesson = {
      id: nextId,
      title: `Página ${nextId}`,
      type: 'pdf',
      content: '',
    };

    updateCourse(selectedCourse.id, {
      lessons: [...selectedCourse.lessons, newLesson],
    });
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top right, #182447 0%, #080D19 45%, #050811 100%)',
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
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '30px',
          }}
        >
          <div>
            <div
              style={{
                color: '#00D4FF',
                fontSize: '12px',
                fontWeight: 'bold',
                letterSpacing: '3px',
              }}
            >
              CODEQUEST NEXUS
            </div>

            <h1
              style={{
                fontSize: '34px',
                margin: '8px 0',
              }}
            >
              👨‍🏫 Central do Professor
            </h1>

            <p
              style={{
                color: '#9CA3AF',
                margin: 0,
              }}
            >
              Crie cursos, aulas e desafios para seus alunos.
            </p>
          </div>

          <div
            style={{
              background: '#111827',
              border: '1px solid #26344D',
              padding: '14px 18px',
              borderRadius: '12px',
            }}
          >
            <div
              style={{
                color: '#9CA3AF',
                fontSize: '12px',
              }}
            >
              PERFIL
            </div>

            <strong>👨‍🏫 Professor</strong>
          </div>
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '15px',
            marginBottom: '30px',
          }}
        >
          <Stat
            icon="📚"
            title="Cursos"
            value={courses.length}
          />

          <Stat
            icon="👥"
            title="Alunos"
            value={courses.reduce(
              (total, course) =>
                total + course.students,
              0
            )}
          />

          <Stat
            icon="👁️"
            title="Visitas"
            value={courses.reduce(
              (total, course) =>
                total + course.visits,
              0
            )}
          />

          <Stat
            icon="⭐"
            title="Pontuação"
            value={courses.reduce(
              (total, course) =>
                total + course.points,
              0
            )}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              '230px minmax(0, 1fr)',
            gap: '20px',
          }}
        >
          <aside
            style={{
              background: '#0D1424',
              border: '1px solid #1F2937',
              borderRadius: '16px',
              padding: '15px',
              height: 'fit-content',
            }}
          >
            <button
              onClick={() => setActiveTab('courses')}
              style={menuStyle(
                activeTab === 'courses'
              )}
            >
              📚 Meus cursos
            </button>

            <button
              onClick={() => setActiveTab('create')}
              style={menuStyle(
                activeTab === 'create'
              )}
            >
              ➕ Criar curso
            </button>

            <button
              onClick={() => setActiveTab('score')}
              style={menuStyle(
                activeTab === 'score'
              )}
            >
              ⭐ Pontuação
            </button>

            <div
              style={{
                borderTop: '1px solid #1F2937',
                margin: '15px 0',
              }}
            />

            <div
              style={{
                fontSize: '11px',
                color: '#6B7280',
                padding: '8px',
              }}
            >
              CURSOS
            </div>

            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => {
                  setSelectedCourseId(course.id);
                  setActiveTab('courses');
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px',
                  marginBottom: '5px',
                  cursor: 'pointer',
                  background:
                    selectedCourseId === course.id
                      ? '#17233A'
                      : 'transparent',
                  color:
                    selectedCourseId === course.id
                      ? '#00D4FF'
                      : '#9CA3AF',
                }}
              >
                📘 {course.title}
              </button>
            ))}
          </aside>

          <main
            style={{
              background: '#0D1424',
              border: '1px solid #1F2937',
              borderRadius: '16px',
              padding: '25px',
              minWidth: 0,
            }}
          >
            {activeTab === 'create' && (
              <CreateCourse
                title={newCourseTitle}
                description={newCourseDescription}
                setTitle={setNewCourseTitle}
                setDescription={
                  setNewCourseDescription
                }
                onCreate={createCourse}
              />
            )}

            {activeTab === 'score' && (
              <ScoreEditor
                course={selectedCourse}
                onUpdate={updateCourse}
              />
            )}

            {activeTab === 'courses' &&
              selectedCourse && (
                <CourseEditor
                  course={selectedCourse}
                  onUpdate={updateCourse}
                  onUpdateLesson={updateLesson}
                  onAddLesson={addLesson}
                />
              )}

            {activeTab === 'courses' &&
              !selectedCourse && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '80px 20px',
                    color: '#9CA3AF',
                  }}
                >
                  <div style={{ fontSize: '50px' }}>
                    📚
                  </div>
                  <h2>Crie seu primeiro curso</h2>
                  <button
                    onClick={() =>
                      setActiveTab('create')
                    }
                    style={primaryButton}
                  >
                    Criar curso
                  </button>
                </div>
              )}
          </main>
        </div>
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
        background: '#0D1424',
        border: '1px solid #1F2937',
        borderRadius: '14px',
        padding: '20px',
      }}
    >
      <div style={{ fontSize: '25px' }}>{icon}</div>

      <div
        style={{
          color: '#9CA3AF',
          fontSize: '12px',
          marginTop: '10px',
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: '25px',
          fontWeight: 'bold',
          marginTop: '4px',
        }}
      >
        {value.toLocaleString('pt-BR')}
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
}: {
  title: string;
  description: string;
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  onCreate: () => void;
}) {
  return (
    <section>
      <h2>➕ Criar novo curso</h2>

      <p style={{ color: '#9CA3AF' }}>
        Crie um curso e depois adicione as páginas.
      </p>

      <div style={formGrid}>
        <label style={labelStyle}>
          Nome do curso
          <input
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            placeholder="Ex.: Python do Zero"
            style={inputStyle}
          />
        </label>

        <label style={labelStyle}>
          Descrição
          <textarea
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="Explique o que o aluno aprenderá..."
            style={{
              ...inputStyle,
              minHeight: '120px',
              resize: 'vertical',
            }}
          />
        </label>
      </div>

      <button
        onClick={onCreate}
        style={primaryButton}
      >
        🚀 Criar curso
      </button>
    </section>
  );
}

function ScoreEditor({
  course,
  onUpdate,
}: {
  course: Course | null;
  onUpdate: (
    id: number,
    changes: Partial<Course>
  ) => void;
}) {
  const [points, setPoints] = useState(
    course?.points || 0
  );

  if (!course) {
    return (
      <div>
        <h2>⭐ Pontuação</h2>
        <p style={{ color: '#9CA3AF' }}>
          Selecione um curso primeiro.
        </p>
      </div>
    );
  }

  return (
    <section>
      <h2>⭐ Pontuação do curso</h2>

      <p style={{ color: '#9CA3AF' }}>
        Defina quantos pontos o aluno receberá.
      </p>

      <div
        style={{
          background: '#111827',
          borderRadius: '12px',
          padding: '20px',
          marginTop: '20px',
        }}
      >
        <strong>{course.title}</strong>

        <input
          type="number"
          min="0"
          value={points}
          onChange={(event) =>
            setPoints(
              Number(event.target.value)
            )
          }
          style={{
            ...inputStyle,
            marginTop: '15px',
          }}
        />

        <button
          onClick={() =>
            onUpdate(course.id, { points })
          }
          style={primaryButton}
        >
          💾 Salvar pontuação
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
}: {
  course: Course;
  onUpdate: (
    id: number,
    changes: Partial<Course>
  ) => void;
  onUpdateLesson: (
    id: number,
    changes: Partial<Lesson>
  ) => void;
  onAddLesson: () => void;
}) {
  return (
    <section>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '20px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1 }}>
          <input
            value={course.title}
            onChange={(event) =>
              onUpdate(course.id, {
                title: event.target.value,
              })
            }
            style={{
              ...inputStyle,
              fontSize: '25px',
              fontWeight: 'bold',
            }}
          />

          <textarea
            value={course.description}
            onChange={(event) =>
              onUpdate(course.id, {
                description: event.target.value,
              })
            }
            style={{
              ...inputStyle,
              marginTop: '10px',
              minHeight: '80px',
            }}
          />
        </div>

        <button
          onClick={onAddLesson}
          style={primaryButton}
        >
          ➕ Nova página
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            '220px minmax(0, 1fr)',
          gap: '20px',
          marginTop: '30px',
        }}
      >
        <div
          style={{
            background: '#080D19',
            borderRadius: '12px',
            padding: '12px',
          }}
        >
          <strong style={{ fontSize: '13px' }}>
            NAVEGAÇÃO DO CURSO
          </strong>

          {course.lessons.map((lesson, index) => (
            <div
              key={lesson.id}
              style={{
                padding: '12px 8px',
                borderBottom:
                  '1px solid #1F2937',
                fontSize: '13px',
              }}
            >
              {index + 1}. {lessonIcon(lesson.type)}{' '}
              {lesson.title}
            </div>
          ))}
        </div>

        <div>
          {course.lessons.map((lesson) => (
            <LessonEditor
              key={lesson.id}
              lesson={lesson}
              onUpdate={onUpdateLesson}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '15px',
          marginTop: '25px',
          flexWrap: 'wrap',
        }}
      >
        <InfoBox
          title="👥 Alunos"
          value={course.students}
        />

        <InfoBox
          title="👁️ Visitas"
          value={course.visits}
        />

        <InfoBox
          title="⭐ Pontos"
          value={course.points}
        />
      </div>
    </section>
  );
}

function LessonEditor({
  lesson,
  onUpdate,
}: {
  lesson: Lesson;
  onUpdate: (
    id: number,
    changes: Partial<Lesson>
  ) => void;
}) {
  return (
    <div
      style={{
        background: '#111827',
        border: '1px solid #1F2937',
        borderRadius: '12px',
        padding: '18px',
        marginBottom: '15px',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <span style={{ fontSize: '22px' }}>
          {lessonIcon(lesson.type)}
        </span>

        <input
          value={lesson.title}
          onChange={(event) =>
            onUpdate(lesson.id, {
              title: event.target.value,
            })
          }
          style={{
            ...inputStyle,
            flex: 1,
          }}
        />

        <select
          value={lesson.type}
          onChange={(event) =>
            onUpdate(lesson.id, {
              type: event.target.value as LessonType,
            })
          }
          style={inputStyle}
        >
          <option value="pdf">PDF</option>
          <option value="video">Vídeo</option>
          <option value="quiz">
            Questionário
          </option>
        </select>
      </div>

      <div
        style={{
          color: '#00D4FF',
          fontSize: '11px',
          marginBottom: '6px',
          fontWeight: 'bold',
        }}
      >
        {lessonName(lesson.type).toUpperCase()}
      </div>

      <textarea
        value={lesson.content}
        onChange={(event) =>
          onUpdate(lesson.id, {
            content: event.target.value,
          })
        }
        placeholder={
          lesson.type === 'pdf'
            ? 'Cole aqui o conteúdo do PDF...'
            : lesson.type === 'video'
              ? 'Cole aqui o link do vídeo...'
              : 'Escreva aqui as perguntas...'
        }
        style={{
          ...inputStyle,
          minHeight: '120px',
          resize: 'vertical',
        }}
      />

      {lesson.type === 'pdf' && (
        <div
          style={{
            marginTop: '10px',
            padding: '10px',
            background: '#071522',
            borderRadius: '8px',
            color: '#9CA3AF',
            fontSize: '12px',
          }}
        >
          💡 Se houver código nesta página, o
          sistema poderá transformar o código em
          um bloco copiável para o aluno.
        </div>
      )}
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
        flex: 1,
        minWidth: '140px',
        background: '#111827',
        borderRadius: '10px',
        padding: '15px',
      }}
    >
      <div
        style={{
          color: '#9CA3AF',
          fontSize: '12px',
        }}
      >
        {title}
      </div>

      <strong
        style={{
          display: 'block',
          marginTop: '5px',
          fontSize: '20px',
        }}
      >
        {value.toLocaleString('pt-BR')}
      </strong>
    </div>
  );
}

function menuStyle(active: boolean) {
  return {
    width: '100%',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '5px',
    textAlign: 'left' as const,
    cursor: 'pointer',
    background: active
      ? '#17233A'
      : 'transparent',
    color: active
      ? '#00D4FF'
      : '#9CA3AF',
    fontWeight: active
      ? 'bold'
      : 'normal',
  };
}

const primaryButton = {
  border: 'none',
  borderRadius: '9px',
  padding: '12px 18px',
  background:
    'linear-gradient(135deg, #00D4FF, #8B5CF6)',
  color: 'white',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginTop: '15px',
};

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box' as const,
  background: '#080D19',
  border: '1px solid #29364D',
  borderRadius: '8px',
  padding: '12px',
  color: 'white',
  outline: 'none',
};

const labelStyle = {
  display: 'block',
  color: '#D1D5DB',
  fontSize: '13px',
};

const formGrid = {
  display: 'grid',
  gap: '20px',
  maxWidth: '700px',
  marginTop: '25px',
};