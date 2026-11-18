// src/hooks/useTeacherQueries.ts
// React Query wrappers around teacherService. Pages import from here only.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { teacherService } from "@/services/teacherService";
import type {
  AddRemarkPayload,
  ApplyLeavePayload,
  Contact,
  CreateNoticePayload,
  PtmMeeting,
  SchedulePtmPayload,
  SendBroadcastPayload,
  TeacherProfile,
  TeacherProfileUpdate,
} from "@/types/school";

export const teacherKeys = {
  profile: ["teacher", "profile"] as const,
  classes: ["teacher", "classes"] as const,
  notices: ["teacher", "notices"] as const,
  myAttendance: ["teacher", "my-attendance"] as const,
  leaveBalances: ["teacher", "leave", "balances"] as const,
  leaveRequests: ["teacher", "leave", "requests"] as const,
  conversations: ["teacher", "conversations"] as const,
  messages: (id: string) => ["teacher", "messages", id] as const,
  contacts: ["teacher", "contacts"] as const,
  classOverview: ["teacher", "ct", "overview"] as const,
  classStudents: ["teacher", "ct", "students"] as const,
  progress: ["teacher", "ct", "progress"] as const,
  broadcasts: ["teacher", "ct", "broadcasts"] as const,
  ptms: ["teacher", "ct", "ptms"] as const,
};

/* ------------------------------ Profile ----------------------------- */

export const useTeacherProfile = () =>
  useQuery({ queryKey: teacherKeys.profile, queryFn: teacherService.getProfile });

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (u: TeacherProfileUpdate) => teacherService.updateProfile(u),
    onSuccess: (data) => qc.setQueryData(teacherKeys.profile, data),
  });
}

export function useUpdatePreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: TeacherProfile["preferences"]) => teacherService.updatePreferences(p),
    onSuccess: (data) => qc.setQueryData(teacherKeys.profile, data),
  });
}

export const useChangePassword = () =>
  useMutation({ mutationFn: teacherService.changePassword });

export const useMyClasses = () =>
  useQuery({ queryKey: teacherKeys.classes, queryFn: teacherService.getMyClasses });

/* ------------------------------ Notices ----------------------------- */

export const useNotices = () =>
  useQuery({ queryKey: teacherKeys.notices, queryFn: teacherService.getNotices });

export function useUnreadNoticeCount() {
  const { data } = useNotices();
  return data?.filter((n) => !n.isRead).length ?? 0;
}

function useNoticeMutation<T>(fn: (arg: T) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.notices }),
  });
}

export const useMarkNoticeRead = () => useNoticeMutation((id: string) => teacherService.markNoticeRead(id));
export const useMarkAllNoticesRead = () => useNoticeMutation(() => teacherService.markAllNoticesRead());
export const useCreateNotice = () => useNoticeMutation((p: CreateNoticePayload) => teacherService.createNotice(p));
export const useDeleteNotice = () => useNoticeMutation((id: string) => teacherService.deleteNotice(id));

/* --------------------------- My attendance -------------------------- */

export const useMyAttendance = () =>
  useQuery({ queryKey: teacherKeys.myAttendance, queryFn: teacherService.getMyAttendance });

export function useCheckInOut() {
  const qc = useQueryClient();
  const onSuccess = () => qc.invalidateQueries({ queryKey: teacherKeys.myAttendance });
  return {
    checkIn: useMutation({ mutationFn: teacherService.checkIn, onSuccess }),
    checkOut: useMutation({ mutationFn: teacherService.checkOut, onSuccess }),
  };
}

/* ------------------------------- Leave ------------------------------ */

export const useLeaveBalances = () =>
  useQuery({ queryKey: teacherKeys.leaveBalances, queryFn: teacherService.getLeaveBalances });

export const useLeaveRequests = () =>
  useQuery({ queryKey: teacherKeys.leaveRequests, queryFn: teacherService.getLeaveRequests });

function useLeaveMutation<T>(fn: (arg: T) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teacherKeys.leaveRequests });
      qc.invalidateQueries({ queryKey: teacherKeys.leaveBalances });
    },
  });
}

export const useApplyLeave = () => useLeaveMutation((p: ApplyLeavePayload) => teacherService.applyLeave(p));
export const useCancelLeave = () => useLeaveMutation((id: string) => teacherService.cancelLeave(id));

/* ------------------------------ Messages ---------------------------- */

export const useConversations = () =>
  useQuery({ queryKey: teacherKeys.conversations, queryFn: teacherService.getConversations });

export function useUnreadMessageCount() {
  const { data } = useConversations();
  return data?.reduce((sum, c) => sum + c.unreadCount, 0) ?? 0;
}

export function useMessages(conversationId: string | null) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: teacherKeys.messages(conversationId ?? "none"),
    enabled: !!conversationId,
    queryFn: async () => {
      const msgs = await teacherService.getMessages(conversationId!);
      // opening a thread marks it read → refresh unread badges
      qc.invalidateQueries({ queryKey: teacherKeys.conversations });
      return msgs;
    },
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, text }: { conversationId: string; text: string }) =>
      teacherService.sendMessage(conversationId, text),
    onSuccess: (msg) => {
      qc.invalidateQueries({ queryKey: teacherKeys.messages(msg.conversationId) });
      qc.invalidateQueries({ queryKey: teacherKeys.conversations });
    },
  });
}

export const useContacts = () =>
  useQuery({ queryKey: teacherKeys.contacts, queryFn: teacherService.getContacts });

export function useStartConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (c: Contact) => teacherService.startConversation(c),
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.conversations }),
  });
}

/* --------------------------- Class teacher -------------------------- */

export const useClassOverview = () =>
  useQuery({ queryKey: teacherKeys.classOverview, queryFn: teacherService.getClassOverview });

export const useClassStudents = () =>
  useQuery({ queryKey: teacherKeys.classStudents, queryFn: teacherService.getClassStudents });

export const useStudentProgress = () =>
  useQuery({ queryKey: teacherKeys.progress, queryFn: teacherService.getStudentProgress });

function useProgressMutation<T>(fn: (arg: T) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.progress }),
  });
}

export const useAddRemark = () => useProgressMutation((p: AddRemarkPayload) => teacherService.addRemark(p));
export const useDeleteRemark = () => useProgressMutation((id: string) => teacherService.deleteRemark(id));

export const useBroadcasts = () =>
  useQuery({ queryKey: teacherKeys.broadcasts, queryFn: teacherService.getBroadcasts });

export function useSendBroadcast() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: SendBroadcastPayload) => teacherService.sendBroadcast(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.broadcasts }),
  });
}

export const usePtms = () => useQuery({ queryKey: teacherKeys.ptms, queryFn: teacherService.getPtms });

function usePtmMutation<T>(fn: (arg: T) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teacherKeys.ptms });
      qc.invalidateQueries({ queryKey: teacherKeys.classOverview });
    },
  });
}

export const useSchedulePtm = () => usePtmMutation((p: SchedulePtmPayload) => teacherService.schedulePtm(p));
export const useUpdatePtmStatus = () =>
  usePtmMutation(({ id, status }: { id: string; status: PtmMeeting["status"] }) =>
    teacherService.updatePtmStatus(id, status),
  );
