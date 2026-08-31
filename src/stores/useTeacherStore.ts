import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { TeacherApplication } from '@/types';

interface TeacherStore {
  applications: TeacherApplication[];

  addApplication: (
    application: TeacherApplication
  ) => void;

  approveApplication: (
    id: string
  ) => void;

  rejectApplication: (
    id: string,
    reason?: string
  ) => void;
}

export const useTeacherStore =
  create<TeacherStore>()(
    persist(
      (set) => ({
        applications: [],

        /*
         * Adiciona uma nova solicitação
         * de professor.
         */
        addApplication: (
          application
        ) =>
          set((state) => ({
            applications: [
              ...state.applications,
              application,
            ],
          })),

        /*
         * Aprova o professor.
         */
        approveApplication: (
          id
        ) =>
          set((state) => ({
            applications:
              state.applications.map(
                (application) =>
                  application.id === id
                    ? {
                        ...application,
                        status:
                          'approved',
                        reviewedAt:
                          new Date().toISOString(),
                        reviewedBy:
                          'admin',
                      }
                    : application
              ),
          })),

        /*
         * Rejeita o professor.
         */
        rejectApplication: (
          id,
          reason
        ) =>
          set((state) => ({
            applications:
              state.applications.map(
                (application) =>
                  application.id === id
                    ? {
                        ...application,
                        status:
                          'rejected',
                        rejectionReason:
                          reason ||
                          'Cadastro não aprovado.',
                        reviewedAt:
                          new Date().toISOString(),
                        reviewedBy:
                          'admin',
                      }
                    : application
              ),
          })),
      }),

      {
        name: 'codequest-teacher-applications',
      }
    )
  );