import { Response } from 'express';

export interface RealtimeClient {
  id: string;
  userId: string;
  role: string;
  name: string;
  res: Response;
  connectedAt: Date;
}

export type RealtimeEventType = 
  | 'TRANSACTION_CREATED'
  | 'TRANSACTION_COMPLETED'
  | 'TRANSACTION_CANCELLED'
  | 'TRANSACTION_UPDATED'
  | 'BALANCE_UPDATED'
  | 'KILL_SWITCH_UPDATED'
  | 'RATE_UPDATED'
  | 'USER_STATUS_CHANGED'
  | 'SYSTEM_ALERT';

class RealtimeService {
  private clients = new Map<string, RealtimeClient>();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Heartbeat toutes les 25 secondes pour maintenir la connexion ouverte à travers les proxys et pare-feux
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 25000);
  }

  /**
   * Enregistre un nouveau client SSE connecté
   */
  public registerClient(client: RealtimeClient) {
    this.clients.set(client.id, client);
    console.log(`🔌 [SSE REALTIME] Client connecté : ${client.name} (${client.role}) [ID: ${client.id}] - Total actifs : ${this.clients.size}`);

    // Message d'accueil de confirmation
    this.sendEventToClient(client, 'CONNECTED', {
      clientId: client.id,
      timestamp: new Date().toISOString(),
      activeClients: this.clients.size,
    });
  }

  /**
   * Retire un client lors de sa déconnexion
   */
  public removeClient(clientId: string) {
    const client = this.clients.get(clientId);
    if (client) {
      this.clients.delete(clientId);
      console.log(`❌ [SSE REALTIME] Client déconnecté : ${client.name} [ID: ${clientId}] - Total actifs : ${this.clients.size}`);
    }
  }

  /**
   * Diffuse un événement en temps réel à TOUS les clients connectés (0 délai)
   */
  public broadcast(eventType: RealtimeEventType, data: any) {
    const count = this.clients.size;
    if (count === 0) return;

    for (const client of this.clients.values()) {
      this.sendEventToClient(client, eventType, data);
    }
    console.log(`⚡ [SSE BROADCAST] Événement '${eventType}' diffusé instantanément à ${count} client(s).`);
  }

  /**
   * Envoie un événement à un rôle spécifique (ex: uniquement aux agents Haïti ou aux admins)
   */
  public sendToRole(role: string, eventType: RealtimeEventType, data: any) {
    let sent = 0;
    for (const client of this.clients.values()) {
      if (client.role === role || client.role === 'admin') {
        this.sendEventToClient(client, eventType, data);
        sent++;
      }
    }
    console.log(`⚡ [SSE ROLE] Événement '${eventType}' envoyé à ${sent} client(s) [Rôle : ${role}].`);
  }

  /**
   * Envoie un événement ciblé à un utilisateur précis
   */
  public sendToUser(userId: string, eventType: RealtimeEventType, data: any) {
    for (const client of this.clients.values()) {
      if (client.userId === userId) {
        this.sendEventToClient(client, eventType, data);
      }
    }
  }

  /**
   * Formate et écrit le payload SSE selon la spécification standard W3C text/event-stream
   */
  private sendEventToClient(client: RealtimeClient, eventType: string, data: any) {
    try {
      const payload = JSON.stringify(data);
      client.res.write(`event: ${eventType}\ndata: ${payload}\n\n`);
    } catch (err) {
      console.error(`Erreur d'envoi SSE au client ${client.id}:`, err);
      this.removeClient(client.id);
    }
  }

  /**
   * Envoie un ping de maintien de session
   */
  private sendHeartbeat() {
    const pingData = `: ping ${Date.now()}\n\n`;
    for (const client of this.clients.values()) {
      try {
        client.res.write(pingData);
      } catch {
        this.removeClient(client.id);
      }
    }
  }

  /**
   * Statistiques en temps réel
   */
  public getStats() {
    return {
      connectedClientsCount: this.clients.size,
      clients: Array.from(this.clients.values()).map(c => ({
        id: c.id,
        userId: c.userId,
        name: c.name,
        role: c.role,
        connectedAt: c.connectedAt,
      })),
    };
  }
}

export const realtimeService = new RealtimeService();
