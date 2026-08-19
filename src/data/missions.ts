export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'story';
  xpReward: number;
  progress: number;
  target: number;
  expiresAt?: string;
  completed: boolean;
}

export const MISSIONS: Mission[] = [
  {
    id: 'm1',
    title: 'Maratona Diaria',
    description: 'Complete 3 licoes hoje',
    type: 'daily',
    xpReward: 50,
    progress: 0,
    target: 3,
    completed: false,
  },
  {
    id: 'm2',
    title: 'Cacador de Bugs',
    description: 'Resolva 5 exercicios de codigo',
    type: 'daily',
    xpReward: 75,
    progress: 0,
    target: 5,
    completed: false,
  },
  {
    id: 'm3',
    title: 'Explorador Galactico',
    description: 'Visite 2 planetas diferentes',
    type: 'daily',
    xpReward: 40,
    progress: 0,
    target: 2,
    completed: false,
  },
  {
    id: 'm4',
    title: 'Mestre da Semana',
    description: 'Acumule 1000 XP esta semana',
    type: 'weekly',
    xpReward: 200,
    progress: 0,
    target: 1000,
    completed: false,
  },
  {
    id: 'm5',
    title: 'Colecionador de Conhecimento',
    description: 'Baixe 5 licoes para offline',
    type: 'weekly',
    xpReward: 150,
    progress: 0,
    target: 5,
    completed: false,
  },
  {
    id: 'm6',
    title: 'Primeira Jornada',
    description: 'Complete sua primeira licao',
    type: 'story',
    xpReward: 100,
    progress: 0,
    target: 1,
    completed: false,
  },
  {
    id: 'm7',
    title: 'Desbravador',
    description: 'Comece 3 cursos diferentes',
    type: 'story',
    xpReward: 150,
    progress: 0,
    target: 3,
    completed: false,
  },
];
