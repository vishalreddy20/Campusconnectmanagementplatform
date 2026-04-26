import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TASKS, SUBMISSIONS } from '../data/mockData';

export type TaskType = 'Referral' | 'Social Post' | 'Event Attendance' | 'Content Creation' | 'Custom';
export type ProofType = 'Image' | 'URL' | 'Screenshot';
export type TaskStatus = 'Active' | 'Expired' | 'Draft';
export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  description: string;
  points: number;
  deadline: string;
  proofRequired: boolean;
  proofType?: ProofType;
  autoApprove: boolean;
  status: TaskStatus;
  createdAt: string;
  assignedTo: string;
}

export interface Submission {
  id: string;
  taskId: string;
  ambassadorId: string;
  status: SubmissionStatus;
  proof?: string;
  proofType?: ProofType;
  submittedAt: string;
  reviewedAt?: string;
  pointsAwarded?: number;
  rejectionReason?: string;
}

interface TaskState {
  tasks: Task[];
  submissions: Submission[];
  getTaskById: (id: string) => Task | undefined;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  submitTask: (submission: Omit<Submission, 'id' | 'submittedAt' | 'status'>) => void;
  approveSubmission: (submissionId: string, points: number) => void;
  rejectSubmission: (submissionId: string, reason: string) => void;
  getSubmissionsByAmbassador: (ambassadorId: string) => Submission[];
  getSubmissionsByTask: (taskId: string) => Submission[];
  getPendingSubmissions: () => Submission[];
  hasSubmittedTask: (ambassadorId: string, taskId: string) => boolean;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: TASKS,
      submissions: SUBMISSIONS,

      getTaskById: (id: string) => {
        return get().tasks.find((task) => task.id === id);
      },

      addTask: (task: Omit<Task, 'id'>) => {
        const newTask: Task = {
          ...task,
          id: `task_${Date.now()}`,
        };
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
      },

      updateTask: (id: string, data: Partial<Task>) => {
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...data } : task)),
        }));
      },

      deleteTask: (id: string) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, status: 'Draft' as const } : task
          ),
          submissions: state.submissions.map((sub) =>
            sub.taskId === id && sub.status === 'pending'
              ? {
                  ...sub,
                  status: 'rejected' as const,
                  rejectionReason: 'Task removed by organization',
                  reviewedAt: new Date().toISOString(),
                }
              : sub
          ),
        }));
      },

      submitTask: (submission: Omit<Submission, 'id' | 'submittedAt' | 'status'>) => {
        const task = get().getTaskById(submission.taskId);
        if (!task) return;

        const newSubmission: Submission = {
          ...submission,
          id: `sub_${Date.now()}`,
          submittedAt: new Date().toISOString(),
          status: task.autoApprove ? 'approved' : 'pending',
        };

        if (task.autoApprove) {
          newSubmission.pointsAwarded = task.points;
          newSubmission.reviewedAt = new Date().toISOString();
        }

        set((state) => ({
          submissions: [...state.submissions, newSubmission],
        }));
      },

      approveSubmission: (submissionId: string, points: number) => {
        set((state) => ({
          submissions: state.submissions.map((sub) =>
            sub.id === submissionId
              ? {
                  ...sub,
                  status: 'approved' as const,
                  pointsAwarded: points,
                  reviewedAt: new Date().toISOString(),
                }
              : sub
          ),
        }));
      },

      rejectSubmission: (submissionId: string, reason: string) => {
        set((state) => ({
          submissions: state.submissions.map((sub) =>
            sub.id === submissionId
              ? {
                  ...sub,
                  status: 'rejected' as const,
                  rejectionReason: reason,
                  reviewedAt: new Date().toISOString(),
                }
              : sub
          ),
        }));
      },

      getSubmissionsByAmbassador: (ambassadorId: string) => {
        return get().submissions.filter((sub) => sub.ambassadorId === ambassadorId);
      },

      getSubmissionsByTask: (taskId: string) => {
        return get().submissions.filter((sub) => sub.taskId === taskId);
      },

      getPendingSubmissions: () => {
        return get().submissions.filter((sub) => sub.status === 'pending');
      },

      hasSubmittedTask: (ambassadorId: string, taskId: string) => {
        return get().submissions.some(
          (sub) => sub.ambassadorId === ambassadorId && sub.taskId === taskId
        );
      },
    }),
    {
      name: 'task-storage',
    }
  )
);
