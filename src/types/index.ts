export type Rarity =
  | 'common'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic';

export type Difficulty =
  | 'easy'
  | 'medium'
  | 'hard'
  | 'epic';

export type ClassName =
  | 'Initiate'
  | 'Script Apprentice'
  | 'Code Warrior'
  | 'Algorithm Master'
  | 'Full Stack Legend'
  | 'Cyber Architect';

export type UserRole =
  | 'student'
  | 'teacher'
  | 'admin';

export type TeacherStatus =
  | 'pending'
  | 'approved'
  | 'rejected';

export type LessonType =
  | 'pdf'
  | 'video'
  | 'quiz';

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;

  role: UserRole;

  teacherStatus?: TeacherStatus;

  rejectionReason?: string;

  level: number;
  xp: number;
  currentStreak: number;
  longestStreak: number;

  className: ClassName;
  title: string;

  joinedAt: string;
}

export interface Planet {
  id: string;
  slug: string;
  name: string;
  planetName: string;
  description: string;
  language: string;
  icon: string;
  color: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  requiredLevel: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;

  type:
    | 'daily'
    | 'weekly'
    | 'story';

  xpReward: number;
  progress: number;
  target: number;

  expiresAt?: string;

  completed: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;

  rarity: Rarity;

  xpReward: number;
  unlocked: boolean;

  unlockedAt?: string;
}

export interface LeaderboardEntry {
  rank: number;

  user: {
    id: string;
    username: string;
    avatarUrl: string;
    level: number;
  };

  xp: number;
  streak: number;
}

export interface TeacherApplication {
  id: string;
  userId: string;

  name: string;
  email: string;
  phone: string;
  birthDate: string;
  knowledgeArea: string;

  documentUrl: string;
  documentName?: string;

  status: TeacherStatus;

  submittedAt: string;

  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface Lesson {
  id: string;

  title: string;
  description: string;

  type: LessonType;

  content: string;

  pdfUrl?: string;
  videoUrl?: string;

  codeExample?: string;

  language?: string;

  duration: number;

  xpReward: number;
}

export interface Course {
  id: string;

  slug: string;

  name: string;

  description: string;

  icon: string;

  color: string;

  views: number;

  lessons: Lesson[];

  teacherId?: string;

  published?: boolean;

  averageRating?: number;

  ratingsCount?: number;

  createdAt?: string;

  updatedAt?: string;
}