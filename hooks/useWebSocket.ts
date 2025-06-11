import { useEffect, useRef, useState, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';


const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/ws/system-log';

export type SystemLog = {
  id: number;
  user: {
    userId: number;
    username?: string;
  } | null;
  action: string;
  entityType: string;
  entityId: number;
  description: string;
  ipAddress: string;
  userAgent: string;
  logTime: string;
};

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const clientRef = useRef<Client | null>(null);
  const { toast } = useToast();

  const getToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }, []);

  const connect = useCallback(() => {
    if (clientRef.current?.connected) return;

    const token = getToken();
    if (!token) {
      console.error('No token found for WebSocket connection');
      setLastError('No authentication token found');
      return;
    }

    try {
      const client = new Client({
        webSocketFactory: () => new SockJS(WS_URL),
        connectHeaders: {
          Authorization: `Bearer ${token}`
        },
        debug: (str) => {
          console.log('STOMP Debug:', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      client.onConnect = () => {
        console.log('STOMP Connected');
        setIsConnected(true);
        setLastError(null);

        // Subscribe to system logs topic
        client.subscribe('/topic/system-logs', (message) => {
          try {
            const log: SystemLog = JSON.parse(message.body);
            console.log('System log received:', log);
            setLogs((prevLogs) => [log, ...prevLogs].slice(0, 10)); // Keep only last 10 logs
          } catch (error) {
            console.error('Error parsing system log:', error);
          }
        });
      };

      client.onStompError = (frame) => {
        console.error('STOMP Error:', frame);
        setLastError('STOMP connection error');
        toast({
          title: "WebSocket Error",
          description: "Failed to connect to real-time updates",
          variant: "destructive"
        });
      };

      client.onWebSocketClose = () => {
        console.log('WebSocket Closed');
        setIsConnected(false);
      };

      client.onWebSocketError = (event) => {
        console.error('WebSocket Error:', event);
        setLastError('WebSocket connection error');
        setIsConnected(false);
      };

      client.activate();
      clientRef.current = client;
    } catch (error) {
      console.error('Error creating STOMP client:', error);
      setLastError('Failed to create WebSocket connection');
    }
  }, [getToken, toast]);

  useEffect(() => {
    connect();

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [connect]);

  return {
    isConnected,
    lastError,
    logs,
  };
} 