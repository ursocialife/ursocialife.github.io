
import { MPMessage } from '../types';
import Peer from 'peerjs';

class MultiplayerService {
    private peer: any;
    private conn: any;
    private listeners: ((msg: MPMessage) => void)[] = [];
    public myCode: string | null = null;
    public isHost: boolean = false;

    constructor() {
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
                config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:global.stun.twilio.com:3478' }] }
            });
            
            this.peer.on('connection', (conn: any) => {
                if (this.conn && this.conn.open) { conn.close(); return; }
                this.conn = conn;
                this.setupConnection(onConnect);
            });

            this.peer.on('disconnected', () => {
                if (this.peer && !this.peer.destroyed) this.peer.reconnect();
            });

            this.peer.on('error', (err: any) => {
                if (this.conn && this.conn.open) {
                    const transient = ['network', 'server-error', 'socket-error', 'socket-closed', 'disconnected'];
                    if (transient.includes(err.type)) return;
                }
                onError(err.type === 'unavailable-id' ? "Code already in use." : "Host Error: " + (err.type || "Disconnected"));
            });
        } catch (e) {
            onError("Failed to initialize host.");
        }
    }

    public async joinGame(code: string, onConnect: () => void, onError: (err: string) => void) {
        await this.cleanup();
        const hostId = `cr-clone-room-${code}`;
        this.myCode = code;
        this.isHost = false;

        try {
            this.peer = new Peer(undefined, { 
                debug: 1,
                config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:global.stun.twilio.com:3478' }] }
            });
            
            let connectionTimeout: any;

            this.peer.on('open', () => {
                const conn = this.peer.connect(hostId, { reliable: true, serialization: 'json' });
                this.conn = conn;
                conn.on('open', () => { clearTimeout(connectionTimeout); this.setupConnection(onConnect); });
                conn.on('error', () => { clearTimeout(connectionTimeout); onError("Connection failed."); });
                connectionTimeout = setTimeout(() => { if (!this.conn || !this.conn.open) { onError("Connection timed out."); this.disconnect(); } }, 10000);
            });

            this.peer.on('disconnected', () => { if (this.peer && !this.peer.destroyed) this.peer.reconnect(); });

            this.peer.on('error', (err: any) => {
                if (this.conn && this.conn.open) {
                    const transient = ['network', 'server-error', 'socket-error', 'socket-closed', 'disconnected'];
                    if (transient.includes(err.type)) return;
                }
                onError(err.type === 'peer-unavailable' ? "Room not found." : "Guest Error: " + (err.type || "Disconnected"));
            });
        } catch(e) {
            onError("Failed to initialize client.");
        }
    }

    private setupConnection(onReady: () => void) {
        if (!this.conn) return;
        this.conn.on('data', (data: any) => { this.listeners.forEach(l => l(data as MPMessage)); });
        setTimeout(() => { if (this.conn && this.conn.open) onReady(); }, 500);
    }

    public send(msg: MPMessage) {
        if (this.conn && this.conn.open) {
            try { this.conn.send(msg); } catch (e) {}
        }
    }

    public onMessage(callback: (msg: MPMessage) => void) {
        this.listeners.push(callback);
        return () => { this.listeners = this.listeners.filter(l => l !== callback); };
    }

    public disconnect() {
        this.cleanup();
        this.isHost = false;
        this.myCode = null;
    }
}

export const mpService = new MultiplayerService();
