'use client';

import React, { useEffect, useState } from 'react';
import { useCallStore } from '@/lib/store/call';
import { Avatar, Modal, Button } from '@/components/ui';
import { webRTCManager } from '@/lib/webrtc';

export const CallModal: React.FC = () => {
  const {
    isInCall,
    callType,
    caller,
    receiver,
    callStatus,
    endCall,
    acceptCall,
    setRemoteStream,
  } = useCallStore();

  const [showModal, setShowModal] = useState(false);
  const [autoCallTimeout, setAutoCallTimeout] = useState<NodeJS.Timeout | null>(null);

  // Show modal when in call or ringing
  useEffect(() => {
    setShowModal(isInCall || callStatus === 'ringing' || callStatus === 'calling');
  }, [isInCall, callStatus]);

  // Auto-call logic: if ringing and not answered in 15s, trigger auto-call
  useEffect(() => {
    if (callStatus === 'ringing') {
      const timeout = setTimeout(() => {
        // TODO: Call backend API to trigger auto-call sound
        endCall();
      }, 15000);
      setAutoCallTimeout(timeout);
      return () => clearTimeout(timeout);
    } else if (autoCallTimeout) {
      clearTimeout(autoCallTimeout);
      setAutoCallTimeout(null);
    }
  }, [callStatus, endCall, autoCallTimeout]);

  // WebRTC stream handlers
  useEffect(() => {
    webRTCManager.onRemoteStreamAdded = (stream) => {
      setRemoteStream(stream);
    };
    webRTCManager.onCallEnded = () => {
      endCall();
    };
    return () => {
      webRTCManager.onRemoteStreamAdded = undefined;
      webRTCManager.onCallEnded = undefined;
    };
  }, [endCall, setRemoteStream]);

  if (!showModal) return null;

  return (
    <Modal isOpen={showModal} onClose={endCall} title={
      callStatus === 'ringing' ? 'Incoming Call' : callType === 'video' ? 'Video Call' : 'Audio Call'
    } size="lg">
      <div className="flex flex-col items-center space-y-4">
        <Avatar
          src={caller?.avatar || receiver?.avatar}
          alt={caller?.username || receiver?.username || 'User'}
          size="xl"
          online={caller?.isOnline || receiver?.isOnline}
        />
        <div className="text-lg font-semibold">
          {caller?.username || receiver?.username}
        </div>
        <div className="text-gray-400">
          {callStatus === 'ringing' ? 'is calling you...' : callType === 'video' ? 'Video Call' : 'Audio Call'}
        </div>
        <div className="flex space-x-4 mt-4">
          {callStatus === 'ringing' && (
            <Button variant="primary" onClick={acceptCall}>
              Accept
            </Button>
          )}
          <Button variant="danger" onClick={endCall}>
            End Call
          </Button>
        </div>
        {/* Video/Audio Streams can be rendered here */}
        {/* <video autoPlay playsInline /> */}
      </div>
    </Modal>
  );
};
