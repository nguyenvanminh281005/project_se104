import { socketManager } from './socket';

class WebRTCManager {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private iceCandidatesQueue: RTCIceCandidate[] = [];
  private isOfferAnswerSet = false;

  private readonly configuration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      // Add TURN servers for production
      // {
      //   urls: 'turn:your-turn-server.com:3478',
      //   username: 'username',
      //   credential: 'password'
      // }
    ],
  };

  constructor() {
    this.setupSocketListeners();
  }

  async initializePeerConnection(): Promise<RTCPeerConnection> {
    if (this.peerConnection) {
      this.closePeerConnection();
    }

    this.peerConnection = new RTCPeerConnection(this.configuration);
    this.setupPeerConnectionListeners();

    return this.peerConnection;
  }

  private setupPeerConnectionListeners(): void {
    if (!this.peerConnection) return;

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socketManager.sendIceCandidate(event.candidate);
      }
    };

    this.peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        this.onRemoteStreamAdded?.(this.remoteStream);
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      if (this.peerConnection) {
        console.log('Connection state:', this.peerConnection.connectionState);
        
        if (this.peerConnection.connectionState === 'disconnected' ||
            this.peerConnection.connectionState === 'failed' ||
            this.peerConnection.connectionState === 'closed') {
          this.onCallEnded?.();
        }
      }
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      if (this.peerConnection) {
        console.log('ICE connection state:', this.peerConnection.iceConnectionState);
      }
    };
  }

  private setupSocketListeners(): void {
    socketManager.on('call:offer', this.handleOffer.bind(this));
    socketManager.on('call:answer', this.handleAnswer.bind(this));
    socketManager.on('call:ice-candidate', this.handleIceCandidate.bind(this));
  }

  async getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.localStream;
    } catch (error) {
      console.error('Error getting user media:', error);
      throw error;
    }
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    try {
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await this.peerConnection.setLocalDescription(offer);
      this.isOfferAnswerSet = true;

      // Process queued ICE candidates
      this.processIceCandidatesQueue();

      return offer;
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }

  async createAnswer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    try {
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      this.isOfferAnswerSet = true;

      // Process queued ICE candidates
      this.processIceCandidatesQueue();

      return answer;
    } catch (error) {
      console.error('Error creating answer:', error);
      throw error;
    }
  }

  private async handleOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      await this.initializePeerConnection();
    }

    try {
      await this.peerConnection!.setRemoteDescription(offer);
      this.isOfferAnswerSet = true;

      // Add local stream to peer connection
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection!.addTrack(track, this.localStream!);
        });
      }

      // Process queued ICE candidates
      this.processIceCandidatesQueue();

      const answer = await this.createAnswer();
      socketManager.sendCallAnswer(answer);
    } catch (error) {
      console.error('Error handling offer:', error);
      throw error;
    }
  }

  private async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    try {
      await this.peerConnection.setRemoteDescription(answer);
      this.isOfferAnswerSet = true;

      // Process queued ICE candidates
      this.processIceCandidatesQueue();
    } catch (error) {
      console.error('Error handling answer:', error);
      throw error;
    }
  }

  private async handleIceCandidate(candidate: RTCIceCandidate): Promise<void> {
    if (!this.peerConnection) {
      console.warn('Received ICE candidate but peer connection not initialized');
      return;
    }

    if (!this.isOfferAnswerSet) {
      // Queue ICE candidates if offer/answer is not set yet
      this.iceCandidatesQueue.push(candidate);
      return;
    }

    try {
      await this.peerConnection.addIceCandidate(candidate);
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }

  private async processIceCandidatesQueue(): Promise<void> {
    if (!this.peerConnection || !this.isOfferAnswerSet) {
      return;
    }

    while (this.iceCandidatesQueue.length > 0) {
      const candidate = this.iceCandidatesQueue.shift();
      if (candidate) {
        try {
          await this.peerConnection.addIceCandidate(candidate);
        } catch (error) {
          console.error('Error adding queued ICE candidate:', error);
        }
      }
    }
  }

  addLocalStream(stream: MediaStream): void {
    this.localStream = stream;
    
    if (this.peerConnection) {
      stream.getTracks().forEach(track => {
        this.peerConnection!.addTrack(track, stream);
      });
    }
  }

  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = enabled;
      }
    }
  }

  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = enabled;
      }
    }
  }

  closePeerConnection(): void {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach(track => track.stop());
      this.remoteStream = null;
    }

    this.iceCandidatesQueue = [];
    this.isOfferAnswerSet = false;
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  // Callback functions (set by components)
  onRemoteStreamAdded?: (stream: MediaStream) => void;
  onCallEnded?: () => void;
}

export const webRTCManager = new WebRTCManager();
