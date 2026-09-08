import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';

interface Lesson {
  id: string;
  title: string;
  description?: string;
  type: 'pdf' | 'video' | 'quiz';
  content?: string;
  duration?: number;
  xpReward?: number;
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  fileType?: string;
  uploadedAt?: unknown;
}

interface FirebaseCourse {
  id: string;
  slug?: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  views?: number;
  lessons?: Lesson[];
  teacherId?: string;
  published?: boolean;
  averageRating?: number;
  ratingsCount?: number;
}

interface CourseWithTeacher extends FirebaseCourse {
  teacherName: string;
}

function materialLabel(type: Lesson['type']) {
  if (type === 'pdf') return '📄 PDF';
  if (type === 'video') return '🎥 Vídeo';
  return '🧠 Quiz';
}

export function Galaxy() {
  const [courses, setCourses] = useState<CourseWithTeacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const coursesQuery = query(
      collection(db, 'courses'),
      where('published', '==', true)
    );

    const unsubscribe = onSnapshot(
      coursesQuery,
      async (snapshot) => {
        try {
          const loadedCourses =
            await Promise.all(
              snapshot.docs.map(
                async (courseDoc) => {
                  const data =
                    courseDoc.data() as Omit<
                      FirebaseCourse,
                      'id'
                    >;

                  let teacherName =
                    'Professor';

                  if (data.teacherId) {
                    try {
                      const teacherSnap =
                        await getDoc(
                          doc(
                            db!,
                            'teachers',
                            data.teacherId
                          )
                        );

                      if (
                        teacherSnap.exists()
                      ) {
                        const teacherData =
                          teacherSnap.data();

                        teacherName =
                          teacherData.name ||
                          teacherData.username ||
                          'Professor';
                      } else {
                        const userSnap =
                          await getDoc(
                            doc(
                              db!,
                              'users',
                              data.teacherId
                            )
                          );

                        if (
                          userSnap.exists()
                        ) {
                          const userData =
                            userSnap.data();

                          teacherName =
                            userData.username ||
                            userData.name ||
                            'Professor';
                        }
                      }
                    } catch (error) {
                      console.error(
                        'Erro ao buscar professor:',
                        error
                      );
                    }
                  }

                  return {
                    id: courseDoc.id,
                    ...data,
                    teacherName,
                    lessons:
                      Array.isArray(
                        data.lessons
                      )
                        ? data.lessons
                        : [],
                  };
                }
              )
            );

          setCourses(loadedCourses);
        } catch (error) {
          console.error(
            'Erro ao carregar cursos:',
            error
          );

          setCourses([]);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error(
          'Erro ao acompanhar cursos:',
          error
        );

        setCourses([]);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '18px',
        }}
      >
        Carregando cursos...
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '30px',
        color: 'white',
      }}
    >
      <div
        style={{
          marginBottom: '30px',
        }}
      >
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 'bold',
            margin: 0,
          }}
        >
          🌌 Galáxia
        </h1>

        <p
          style={{
            color: '#9CA3AF',
            marginTop: '8px',
          }}
        >
          Escolha um curso para começar sua
          jornada.
        </p>
      </div>

      {courses.length === 0 ? (
        <div
          style={{
            background: '#111827',
            border: '1px solid #374151',
            borderRadius: '16px',
            padding: '30px',
            textAlign: 'center',
            color: '#9CA3AF',
          }}
        >
          <div
            style={{
              fontSize: '40px',
              marginBottom: '12px',
            }}
          >
            🚀
          </div>

          <h2
            style={{
              color: 'white',
              marginBottom: '8px',
            }}
          >
            Nenhum curso publicado ainda
          </h2>

          <p>
            Quando um professor publicar um
            curso, ele aparecerá aqui.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
          }}
        >
          {courses.map((course) => {
            const lessons =
              course.lessons || [];

            const color =
              course.color || '#6366F1';

            const slug =
              course.slug || course.id;

            return (
              <div
                key={course.id}
                style={{
                  background: '#111827',
                  border: `1px solid ${color}`,
                  borderRadius: '16px',
                  padding: '24px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    fontSize: '42px',
                    marginBottom: '15px',
                  }}
                >
                  {course.icon || '🚀'}
                </div>

                <h2
                  style={{
                    margin: 0,
                    fontSize: '22px',
                  }}
                >
                  {course.name}
                </h2>

                <p
                  style={{
                    color: '#9CA3AF',
                    lineHeight: 1.5,
                  }}
                >
                  {course.description ||
                    'Curso disponível para você.'}
                </p>

                <div
                  style={{
                    marginTop: '15px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: '#1F2937',
                    color: '#D1D5DB',
                  }}
                >
                  👨‍🏫 Professor:{' '}
                  <strong
                    style={{
                      color: 'white',
                    }}
                  >
                    {course.teacherName}
                  </strong>
                </div>

                <div
                  style={{
                    marginTop: '15px',
                    color: '#D1D5DB',
                    fontSize: '14px',
                  }}
                >
                  📚 {lessons.length}{' '}
                  {lessons.length === 1
                    ? 'aula'
                    : 'aulas'}
                </div>

                {lessons.length > 0 && (
                  <div
                    style={{
                      marginTop: '18px',
                    }}
                  >
                    <h3
                      style={{
                        fontSize: '15px',
                        marginBottom: '10px',
                      }}
                    >
                      📦 Material disponível
                    </h3>

                    <div
                      style={{
                        display: 'flex',
                        flexDirection:
                          'column',
                        gap: '8px',
                      }}
                    >
                      {lessons
                        .slice(0, 5)
                        .map((lesson, index) => (
                          <div
                            key={
                              lesson.id ||
                              `${course.id}-${index}`
                            }
                            style={{
                              background:
                                '#1F2937',
                              borderRadius:
                                '8px',
                              padding:
                                '10px',
                            }}
                          >
                            <div
                              style={{
                                fontWeight:
                                  'bold',
                                fontSize:
                                  '14px',
                              }}
                            >
                              {index + 1}.{' '}
                              {lesson.title}
                            </div>

                            <div
                              style={{
                                marginTop:
                                  '4px',
                                color:
                                  '#9CA3AF',
                                fontSize:
                                  '12px',
                              }}
                            >
                              {materialLabel(
                                lesson.type
                              )}
                            </div>
                          </div>
                        ))}
                    </div>

                    {lessons.length > 5 && (
                      <div
                        style={{
                          marginTop: '8px',
                          color: '#9CA3AF',
                          fontSize: '12px',
                        }}
                      >
                        +{' '}
                        {lessons.length - 5}{' '}
                        materiais
                      </div>
                    )}
                  </div>
                )}

                <Link
                  to={`/lesson/${slug}/1`}
                  style={{
                    display: 'block',
                    marginTop: '20px',
                    padding: '12px',
                    borderRadius: '8px',
                    background: color,
                    color: '#000',
                    textDecoration: 'none',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  🚀 Entrar no curso
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}