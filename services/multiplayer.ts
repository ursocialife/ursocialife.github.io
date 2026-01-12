
import { MPMessage } from '../types';
import Peer from 'peerjs';

class MultiplayerService {
    private peer: any;
    private conn: any;
    private listeners: ((msg: MPMessage) => void)[] = [];
    public myCode: string | null = null;
    public isHost: boolean = false;

    constructor() {
        // Deferred initialization
    }

    public generateCode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    private async cleanup() {
        if (this.conn) {
            try { this.conn.close(); } catch(e){}
        }
        if (this.peer) {
            try { this.peer.destroy(); } catch(e){}
        }
        this.conn = null;
        this.peer = null;
        this.myCode = null;
        // NOTE: We do NOT clear listeners here because the UI components (App.tsx) 
        // rely on persistent subscriptions that survive session restarts.
        
        // Small delay to ensure sockets close
        return new Promise(resolve => setTimeout(resolve, 100));
    }

    public async initHost(code: string, onConnect: () => void, onError: (err: string) => void) {
        if (typeof Peer === 'undefined') {
            console.error("PeerJS not loaded");
            onError("Multiplayer library not loaded");
            return;
        }

        await this.cleanup();

        const peerId = `cr-clone-room-${code}`;
        this.myCode = code;
        this.isHost = true;

        try {
            this.peer = new Peer(peerId, { 
                debug: 1,
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:global.stun.twilio.com:3478' }
                    ]
                }
            });
            
            this.peer.on('open', (id: string) => {
                console.log('Room created:', id);
            });

            this.peer.on('connection', (conn: any) => {
                console.log('Peer connected');
                
                // If we already have a connection, close the new one (1v1 only)
                if (this.conn && this.conn.open) {
                    conn.close();
                    return;
                }

                this.conn = conn;
                this.setupConnection(onConnect);
            });

            this.peer.on('disconnected', () => {
                console.warn('Peer disconnected from server. Attempting reconnect...');
                if (this.peer && !this.peer.destroyed) {
                    this.peer.reconnect();
                }
            });

            this.peer.on('error', (err: any) => {
                console.error('Peer error:', err);
                if (err.type === 'unavailable-id') {
                    onError("Code already in use. Try again.");
                } else if (err.type === 'peer-unavailable') {
                    // Host shouldn't get this usually
                } else if (['network', 'server-error', 'socket-error', 'socket-closed'].includes(err.type)) {
                     // If we have an active P2P connection, we can ignore signaling errors
                     if (!this.conn || !this.conn.open) {
                         // Don't spam error if we are reconnecting
                     }
                } else {
                    // Fatal errors
                    onError("Error: " + (err.type || "Unknown"));
                }
            });
        } catch (e) {
            console.error(e);
            onError("Failed to initialize peer.");
        }
    }

    public async joinGame(code: string, onConnect: () => void, onError: (err: string) => void) {
        if (!code || code.length !== 6) {
            onError("Invalid code format.");
            return;
        }

        await this.cleanup();

        const hostId = `cr-clone-room-${code}`;
        this.myCode = code;
        this.isHost = false;

        try {
            this.peer = new Peer(undefined, { 
                debug: 1,
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:global.stun.twilio.com:3478' }
                    ]
                }
            });
            
            let connectionTimeout: any;

            this.peer.on('open', () => {
                const conn = this.peer.connect(hostId, { 
                    reliable: true,
                    serialization: 'json'
                });
                
                this.conn = conn;

                conn.on('open', () => {
                    console.log("Connected to host");
                    clearTimeout(connectionTimeout);
                    this.setupConnection(onConnect);
                });

                conn.on('error', (err: any) => {
                    console.error("Connection error:", err);
                    clearTimeout(connectionTimeout);
                    onError("Connection failed.");
                });
                
                conn.on('close', () => {
                    console.log("Connection closed");
                    // onError("Host disconnected"); // Optional: depends on game state
                });

                // Fail safe timeout
                connectionTimeout = setTimeout(() => {
                    if (!this.conn || !this.conn.open) {
                        onError("Connection timed out. Check code or try again.");
                        this.disconnect();
                    }
                }, 8000);
            });

            this.peer.on('error', (err: any) => {
                console.error('Peer error:', err);
                if (err.type === 'peer-unavailable') {
                    clearTimeout(connectionTimeout);
                    onError("Room not found. Check the code.");
                    this.disconnect();
                } else if (['network', 'server-error', 'socket-error'].includes(err.type)) {
                    // Retry logic handled internally by PeerJS or user manual retry
                } else {
                    onError("Client Error: " + (err.type || "Unknown"));
                }
            });
        } catch(e) {
            onError("Failed to initialize client.");
        }
    }

    private setupConnection(onReady: () => void) {
        if (!this.conn) return;

        this.conn.on('data', (data: any) => {
            this.listeners.forEach(l => l(data as MPMessage));
        });

        // Small delay to ensure connection is stable before triggering game start
        setTimeout(() => {
            onReady();
        }, 500);
    }

    public send(msg: MPMessage) {
        if (this.conn && this.conn.open) {
            try {
                this.conn.send(msg);
            } catch (e) {
                console.warn("Failed to send message", e);
            }
        }
    }

    public onMessage(callback: (msg: MPMessage) => void) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    public disconnect() {
        this.cleanup();
        this.isHost = false;
        this.myCode = null;
    }
}

export const mpService = new MultiplayerService();
