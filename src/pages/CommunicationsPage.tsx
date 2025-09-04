import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, Mic, MicOff, Video, VideoOff, Phone, PhoneOff, Radio } from 'lucide-react';
import { BroadcastAlerts } from '@/components/BroadcastAlerts';
import { useI18n } from '@/providers/I18nProvider';
import { useAuth } from '@/providers/AuthProvider';
import io, { Socket } from 'socket.io-client';

interface ChatMessage {
  id: string;
  channel: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
}

interface RadioChannel {
  id: string;
  name: string;
  active: boolean;
  participants: string[];
}

export default function CommunicationsPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('general');
  const [radioChannels, setRadioChannels] = useState<RadioChannel[]>([]);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [activeRadioChannel, setActiveRadioChannel] = useState<string | null>(null);
  const [videoCallActive, setVideoCallActive] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    // Initialize Socket.IO connection
    const newSocket = io(import.meta.env.VITE_SIGNALING_BASE || 'http://localhost:8080');
    setSocket(newSocket);

    // Load initial data
    loadInitialData();

    // Socket event listeners
    newSocket.on('chat_message', (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('radio_transmission', (data: any) => {
      console.log('Radio transmission:', data);
    });

    newSocket.on('video_offer', handleVideoOffer);
    newSocket.on('video_answer', handleVideoAnswer);
    newSocket.on('ice_candidate', handleIceCandidate);

    return () => {
      newSocket.close();
      stopVideoCall();
    };
  }, []);

  const loadInitialData = () => {
    // Initialize radio channels
    setRadioChannels([
      { id: 'tac1', name: 'TAC-1 (Main)', active: true, participants: ['Unit-06', 'Unit-09'] },
      { id: 'tac2', name: 'TAC-2 (Fire)', active: false, participants: [] },
      { id: 'admin', name: 'Admin', active: false, participants: ['Supervisor-1'] }
    ]);

    // Load existing messages (would come from API)
    setMessages([
      {
        id: '1',
        channel: 'general',
        userId: 'user1',
        userName: 'Dispatcher 1',
        message: 'Command center is operational',
        timestamp: new Date().toISOString()
      }
    ]);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !socket || !user) return;

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      channel: selectedChannel,
      userId: user.id,
      userName: user.name,
      message: newMessage.trim(),
      timestamp: new Date().toISOString()
    };

    socket.emit('send_chat_message', message);
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const startRadioTransmission = () => {
    if (!activeRadioChannel || !socket) return;
    
    setIsTransmitting(true);
    socket.emit('start_radio_transmission', { 
      channel: activeRadioChannel, 
      userId: user?.id 
    });

    // Start recording audio (simplified)
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        // Handle audio stream for radio transmission
        console.log('Started radio transmission');
      })
      .catch(err => console.error('Failed to start radio:', err));
  };

  const stopRadioTransmission = () => {
    setIsTransmitting(false);
    if (socket) {
      socket.emit('stop_radio_transmission', { 
        channel: activeRadioChannel, 
        userId: user?.id 
      });
    }
  };

  const startVideoCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      peerConnectionRef.current = peerConnection;

      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit('ice_candidate', event.candidate);
        }
      };

      setVideoCallActive(true);
      
      // Create offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      if (socket) {
        socket.emit('video_offer', offer);
      }

    } catch (error) {
      console.error('Failed to start video call:', error);
    }
  };

  const stopVideoCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setVideoCallActive(false);
  };

  const handleVideoOffer = async (offer: RTCSessionDescriptionInit) => {
    if (!peerConnectionRef.current) return;
    
    await peerConnectionRef.current.setRemoteDescription(offer);
    const answer = await peerConnectionRef.current.createAnswer();
    await peerConnectionRef.current.setLocalDescription(answer);
    
    if (socket) {
      socket.emit('video_answer', answer);
    }
  };

  const handleVideoAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (!peerConnectionRef.current) return;
    await peerConnectionRef.current.setRemoteDescription(answer);
  };

  const handleIceCandidate = async (candidate: RTCIceCandidate) => {
    if (!peerConnectionRef.current) return;
    await peerConnectionRef.current.addIceCandidate(candidate);
  };

  return (
    <div className="h-full p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('nav.comms')}</h1>
      </div>

      <Tabs defaultValue="chat" className="h-full">
        <TabsList>
          <TabsTrigger value="chat">Chat Channels</TabsTrigger>
          <TabsTrigger value="radio">Radio/PTT</TabsTrigger>
          <TabsTrigger value="video">Video Calls</TabsTrigger>
          <TabsTrigger value="broadcast">Broadcast Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="h-full grid grid-cols-4 gap-4">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="text-sm">Channels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {['general', 'incident-001', 'site-yst', 'command'].map(channel => (
                <Button
                  key={channel}
                  variant={selectedChannel === channel ? "default" : "outline"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setSelectedChannel(channel)}
                >
                  #{channel}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle className="text-sm">#{selectedChannel}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-96">
              <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                {messages
                  .filter(msg => msg.channel === selectedChannel)
                  .map(msg => (
                    <div key={msg.id} className="p-2 rounded bg-muted/50">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{msg.userName}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button onClick={sendMessage}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="radio" className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Radio Channels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {radioChannels.map(channel => (
                <div key={channel.id} className="flex items-center justify-between p-2 rounded border">
                  <div>
                    <div className="font-medium">{channel.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {channel.participants.length} participants
                    </div>
                  </div>
                  <Button
                    variant={activeRadioChannel === channel.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveRadioChannel(
                      activeRadioChannel === channel.id ? null : channel.id
                    )}
                  >
                    {activeRadioChannel === channel.id ? "Leave" : "Join"}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Push-to-Talk</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              {activeRadioChannel ? (
                <>
                  <div className="text-center">
                    <Badge variant="default">
                      Connected to {radioChannels.find(c => c.id === activeRadioChannel)?.name}
                    </Badge>
                  </div>
                  <Button
                    size="lg"
                    variant={isTransmitting ? "destructive" : "default"}
                    className="w-32 h-32 rounded-full"
                    onMouseDown={startRadioTransmission}
                    onMouseUp={stopRadioTransmission}
                    onTouchStart={startRadioTransmission}
                    onTouchEnd={stopRadioTransmission}
                  >
                    {isTransmitting ? (
                      <MicOff className="w-8 h-8" />
                    ) : (
                      <Mic className="w-8 h-8" />
                    )}
                  </Button>
                  <div className="text-sm text-center">
                    {isTransmitting ? "Transmitting..." : "Hold to Talk"}
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground">
                  Join a radio channel to start push-to-talk
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="video" className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Local Video</CardTitle>
            </CardHeader>
            <CardContent>
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-48 bg-black rounded"
              />
              <div className="flex gap-2 mt-2">
                <Button
                  variant={videoCallActive ? "destructive" : "default"}
                  onClick={videoCallActive ? stopVideoCall : startVideoCall}
                >
                  {videoCallActive ? (
                    <><VideoOff className="w-4 h-4 mr-2" /> End Call</>
                  ) : (
                    <><Video className="w-4 h-4 mr-2" /> Start Call</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Remote Video</CardTitle>
            </CardHeader>
            <CardContent>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-48 bg-black rounded"
              />
              <div className="text-sm text-muted-foreground mt-2">
                {videoCallActive ? "Connected" : "No active connection"}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="broadcast">
          <BroadcastAlerts currentUser={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}