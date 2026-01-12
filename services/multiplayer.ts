
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
            try { 
                this.conn.removeAllListeners();
                this.conn.close(); 
            } catch(e){}
        }
        if (this.peer) {
            try { 
                this.peer.removeAllListeners();
                this.peer.destroy(); 
            } catch(e){}
        }
        this.conn = null;
        this.peer = null;
        this.myCode = null;
        // Small delay to ensure sockets close
        return new Promise(resolve => setTimeout(resolve, 100));
    }

    public async initHost(code: string, onConnect: () => void, onError: (err: string) => void) {
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
                
                if (this.conn && this.conn.open) {
                    conn.close();
                    return;
                }

                this.conn = conn;
                this.setupConnection(onConnect);
            });

            this.peer.on('disconnected', () => {
                console.warn('Host: Disconnected from signaling server. Attempting to reconnect peer...');
                if (this.peer && !this.peer.destroyed) {
                    this.peer.reconnect();
                }
            });

            this.peer.on('error', (err: any) => {
                console.error('Host: Peer error:', err);
                
                // Ignore signaling errors if we have an active P2P data connection
                if (this.conn && this.conn.open) {
                    const transientErrors = ['network', 'server-error', 'socket-error', 'socket-closed', 'disconnected'];
                    if (transientErrors.includes(err.type)) {
                        console.warn(`Host: Signaling error "${err.type}" ignored as P2P is active.`);
                        return;
                    }
                }

                if (err.type === 'unavailable-id') {
                    onError("Code already in use. Try again.");
                } else if (err.type === 'peer-unavailable') {
                    // Host usually doesn't get this
                } else {
                    onError("Host Error: " + (err.type || "Lost connection to server."));
                }
            });
        } catch (e) {
            console.error(e);
            onError("Failed to initialize host.");
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
                });

                connectionTimeout = setTimeout(() => {
                    if (!this.conn || !this.conn.open) {
                        onError("Connection timed out. Check code.");
                        this.disconnect();
                    }
                }, 10000);
            });

            this.peer.on('disconnected', () => {
                console.warn('Guest: Disconnected from signaling server. Reconnecting...');
                if (this.peer && !this.peer.destroyed) {
                    this.peer.reconnect();
                }
            });

            this.peer.on('error', (err: any) => {
                console.error('Guest: Peer error:', err);

                if (this.conn && this.conn.open) {
                    const transientErrors = ['network', 'server-error', 'socket-error', 'socket-closed', 'disconnected'];
                    if (transientErrors.includes(err.type)) {
                        console.warn(`Guest: Signaling error "${err.type}" ignored as P2P is active.`);
                        return;
                    }
                }

                if (err.type === 'peer-unavailable') {
                    clearTimeout(connectionTimeout);
                    onError("Room not found. Check the code.");
                    this.disconnect();
                } else {
                    onError("Guest Error: " + (err.type || "Lost connection to server."));
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

        this.conn.on('close', () => {
            console.log("P2P Connection closed");
        });

        setTimeout(() => {
            if (this.conn && this.conn.open) {
                onReady();
            }
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
