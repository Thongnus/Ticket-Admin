import { useEffect, useRef, useState, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { fetchWithAuth } from "@/app/admin/page";


const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/ws/system-log';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export type SystemLog = {
  id: number;
  logId?: number;
  user: {
    userId: number;
    username?: string;
  } | null;
  action: string;
  entityType: string;
  entityId: number;
  description: string;
  ipAddress: string | null;
  userAgent: string | null;
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
        setIsConnected(true);
        setLastError(null);
        client.subscribe('/topic/system-logs', (message) => {
          try {
            const log: SystemLog = JSON.parse(message.body);
            const logId = Number(log.id ?? log.logId);
            setLogs((prevLogs) => {
              if (prevLogs.some(l => l.id === logId)) return prevLogs;
              return [{ ...log, id: logId }, ...prevLogs].slice(0, 10);
            });
            console.log("SOCKET LOG RECEIVED:", { ...log, id: logId });
          } catch (error) {
            console.error('Error parsing system log:', error);
          }
        });
      };

      client.onStompError = (frame) => {
        setLastError('STOMP connection error');
        toast({
          title: "WebSocket Error",
          description: "Failed to connect to real-time updates",
          variant: "destructive"
        });
      };

      client.onWebSocketClose = () => {
        setIsConnected(false);
      };

      client.onWebSocketError = (event) => {
        setLastError('WebSocket connection error');
        setIsConnected(false);
      };

      client.activate();
      clientRef.current = client;
    } catch (error) {
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

  // Fetch logs từ API khi load trang
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetchWithAuth("/system/logs");
        if (res.ok) {
          const data = await res.json();
          setLogs(Array.isArray(data)
            ? data.map(log => ({ ...log, id: Number(log.id ?? log.logId) })).slice(0, 10)
            : []
          );
        }
      } catch (e) {
        // ignore
      }
    };
    fetchLogs();
  }, []);

  return {
    isConnected,
    lastError,
    logs,
  };
} 