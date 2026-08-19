import { Link } from 'react-router-dom';
import { getAllCourses } from '@/data/courses';
import { useProgress } from '@/hooks/useProgress';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Globe, BookOpen, Clock, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { downloadLesson } from '@/utils/download';
import { useState } from 'react';

export function Courses() {
  const courses = getAllCourses();
  const { 
    getCourseProgress, 
    isLessonCompleted,
    markAsDownloaded 
  } = useProgress();
  const [filter, setFilter] = useState<'all' | 'Iniciante' | 'Intermediário' | 'Avançado'>('all');

  const filteredCourses = filter === 'all' 
    ? courses 
    : courses.filter(c => c.level === filter);

  // Baixar primeira lição de um curso como exemplo
  const handleDownloadFirst = (courseSlug: string) => {
    const course = courses.find(c => c.slug === courseSlug);
    if (!course || !course.lessons[0]) return;
    
    downloadLesson(course.lessons[0], course);
    markAsDownloaded(course.lessons[0].id);
    alert(`✅ "${course.lessons[0].title}" baixada!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-neon-blue" />
            <h1 className="font-display text-3xl font-black">Galáxia de Cursos</h1>
          </div>
          <p className="mt-1 text-sm text-gray-400">
            Escolha um planeta e comece sua jornada
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'Iniciante', 'Intermediário', 'Avançado'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 font-display text-xs font-bold uppercase tracking-wider transition-all ${
              filter === f
                ? 'bg-neon-blue text-black shadow-neon-blue'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {f === 'all' ? 'Todos' : f}
          </button>
        ))}
      </div>

      {/* Grid de Cursos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map(course => {
          const progressPercent = getCourseProgress(course.slug, course.totalLessons);
          const firstLessonId = course.lessons[0]?.id;
          const isFirstDone = firstLessonId ? isLessonCompleted(firstLessonId) : false;

          return (
            <Card 
              key={course.id} 
              className="group p-0 overflow-hidden"
              hoverable
            >
              {/* Cabeçalho colorido */}
              <div 
                className="relative h-32 overflow-hidden p-5"
                style={{ 
                  background: `linear-gradient(135deg, ${course.color}40, ${course.color}10)`,
                }}
              >
                <div className="absolute inset-0 bg-grid opacity-30" />
                <div className="relative flex items-start justify-between">
                  <div 
                    className="flex h-14 w-14 items-center justify-center rounded-xl text-3xl"
                    style={{ 
                      backgroundColor: `${course.color}30`,
                      boxShadow: `0 0 20px ${course.color}50`
                    }}
                  >
                    {course.icon}
                  </div>
                  <Badge 
                    rarity={course.level === 'Iniciante' ? 'common' : course.level === 'Intermediário' ? 'rare' : 'epic'}
                    size="sm"
                  >
                    {course.level}
                  </Badge>
                </div>
              </div>

              {/* Conteúdo */}
              <div className="p-5">
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="font-display text-lg font-black" style={{ color: course.color }}>
                    {course.name}
                  </h3>
                  {isFirstDone && (
                    <CheckCircle2 className="h-4 w-4 text-neon-green" />
                  )}
                </div>
                <p className="text-xs text-gray-500">{course.planetName}</p>
                <p className="mt-3 line-clamp-2 text-sm text-gray-300">
                  {course.description}
                </p>

                {/* Info */}
                <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    <span>{course.totalLessons} lições</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{course.lessons.reduce((acc, l) => acc + l.duration, 0)} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-neon-gold" />
                    <span>{course.totalXp} XP</span>
                  </div>
                </div>

                {/* Progresso */}
                {progressPercent > 0 && (
                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-gray-400">Progresso</span>
                      <span className="font-mono font-bold" style={{ color: course.color }}>
                        {progressPercent}%
                      </span>
                    </div>
                    <ProgressBar 
                      value={progressPercent} 
                      color="blue" 
                      size="sm"
                    />
                  </div>
                )}

                {/* Botões */}
                <div className="mt-4 flex gap-2">
                  <Link 
                    to={`/lesson/${course.slug}/${firstLessonId}`}
                    className="flex-1"
                  >
                    <Button 
                      fullWidth 
                      size="sm"
                      variant={progressPercent > 0 ? 'primary' : 'outline'}
                      rightIcon={<ArrowRight className="h-3 w-3" />}
                    >
                      {progressPercent > 0 ? 'Continuar' : 'Começar'}
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDownloadFirst(course.slug)}
                    title="Baixar 1ª lição para offline"
                  >
                    <BookOpen className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="rounded-lg border border-dashed border-white/10 bg-white/5 p-12 text-center">
          <Globe className="mx-auto mb-3 h-12 w-12 text-gray-500" />
          <p className="text-gray-400">Nenhum curso encontrado neste filtro.</p>
        </div>
      )}
    </div>
  );
}
