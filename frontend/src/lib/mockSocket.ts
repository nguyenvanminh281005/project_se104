// Mock Socket.IO client for demo mode when backend is not available

class MockSocket {
  connected = false;
  id = 'mock-socket-id';
  private eventHandlers: { [key: string]: Function[] } = {};

  connect() {
    setTimeout(() => {
      this.connected = true;
      this.emit('connect');
      console.log('Mock Socket connected');
    }, 1000);
    return this;
  }

  disconnect() {
    this.connected = false;
    this.emit('disconnect', 'client disconnect');
    console.log('Mock Socket disconnected');
  }

  emit(event: string, data?: any) {
    console.log('Mock Socket emit:', event, data);
    // Simulate some responses for demo
    if (event === 'message:send') {
      setTimeout(() => {
        this.trigger('message:new', {
          id: Date.now().toString(),
          content: data.content,
          senderId: data.senderId || '1',
          receiverId: data.receiverId,
          timestamp: new Date(),
          isRead: false,
          messageType: 'text'
        });
      }, 500);
    }
  }

  on(event: string, callback: Function) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(callback);
  }

  off(event: string, callback?: Function) {
    if (callback && this.eventHandlers[event]) {
      this.eventHandlers[event] = this.eventHandlers[event].filter(cb => cb !== callback);
    } else {
      delete this.eventHandlers[event];
    }
  }

  private trigger(event: string, data?: any) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Mock Socket event handler error:', error);
        }
      });
    }
  }
}

// Mock io function
export const mockIo = (url: string, options?: any) => {
  console.log('Mock Socket.IO connecting to:', url, options);
  const socket = new MockSocket();
  
  // Auto connect after a delay to simulate real connection
  setTimeout(() => {
    socket.connect();
  }, 100);
  
  return socket;
};

export { MockSocket };
