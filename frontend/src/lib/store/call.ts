import { create } from 'zustand';
import { CallState, User } from '@/types';

interface CallStore extends CallState {
  // Call actions
  startCall: (receiver: User, callType: 'audio' | 'video') => void;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  setCallStatus: (status: CallState['callStatus']) => void;
  setLocalStream: (stream: MediaStream | undefined) => void;
  setRemoteStream: (stream: MediaStream | undefined) => void;
  setCaller: (caller: User | undefined) => void;
  setReceiver: (receiver: User | undefined) => void;
}

export const useCallStore = create<CallStore>((set, get) => ({
  isInCall: false,
  callType: null,
  caller: undefined,
  receiver: undefined,
  callStatus: 'idle',
  localStream: undefined,
  remoteStream: undefined,

  startCall: (receiver: User, callType: 'audio' | 'video') => {
    set({
      isInCall: true,
      callType,
      receiver,
      callStatus: 'calling',
    });
  },

  acceptCall: () => {
    set({
      isInCall: true,
      callStatus: 'connected',
    });
  },

  rejectCall: () => {
    const { localStream, remoteStream } = get();
    
    // Clean up streams
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
    }

    set({
      isInCall: false,
      callType: null,
      caller: undefined,
      receiver: undefined,
      callStatus: 'idle',
      localStream: undefined,
      remoteStream: undefined,
    });
  },

  endCall: () => {
    const { localStream, remoteStream } = get();
    
    // Clean up streams
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
    }

    set({
      isInCall: false,
      callType: null,
      caller: undefined,
      receiver: undefined,
      callStatus: 'ended',
      localStream: undefined,
      remoteStream: undefined,
    });

    // Reset to idle after a short delay
    setTimeout(() => {
      set({ callStatus: 'idle' });
    }, 2000);
  },

  setCallStatus: (status: CallState['callStatus']) => {
    set({ callStatus: status });
  },

  setLocalStream: (stream: MediaStream | undefined) => {
    set({ localStream: stream });
  },

  setRemoteStream: (stream: MediaStream | undefined) => {
    set({ remoteStream: stream });
  },

  setCaller: (caller: User | undefined) => {
    set({ caller });
  },

  setReceiver: (receiver: User | undefined) => {
    set({ receiver });
  },
}));
