import type { GameState } from "./game-definition";

type Event = {
    print?: string;
    chain?: EventChain;
    go?: string;
    updateRooms?: Array<Record<string, Room>> | Record<string, Room>;
};

type EventChain = Array<Event | string> | Event | string;

type Room = {
    shortDescription?: string | null;
    longDescription?: string | null;
    onEntry?: EventChain | null;
    onExit?: EventChain | null;
    actions?: Record<string, EventChain | null> | null;
};

type Zone = {
    version: number;
    spawn: string;
    rooms: Record<string, Room>;
    events: Record<string, Event>;
};

export type EventResult = {
    messages: Array<string>;
    navigateTo?: string;
    stateUpdated: boolean;
};

export class EventProcessor {
    private zoneData: Zone;

    constructor(zoneData: Zone) {
        this.zoneData = zoneData;
    }

    async processEventChain(eventChain: EventChain): Promise<EventResult> {
        const result: EventResult = {
            messages: [],
            stateUpdated: false
        };

        const events = this.normalizeEventChain(eventChain);

        for (const event of events) {
            const eventResult = await this.processSingleEvent(event);
            
            result.messages.push(...eventResult.messages);
            result.stateUpdated = result.stateUpdated || eventResult.stateUpdated;
            
            if (eventResult.navigateTo) {
                result.navigateTo = eventResult.navigateTo;
                break;
            }
        }

        return result;
    }

    private async processSingleEvent(event: Event | string): Promise<EventResult> {
        const result: EventResult = {
            messages: [],
            stateUpdated: false
        };

        if (typeof event === 'string') {
            const eventName = event.trim();
            const namedEvent = this.zoneData.events[eventName];
            
            if (!namedEvent) {
                console.error(`Event "${eventName}" not found in zone events`);
                result.messages.push(`[Error: Event "${eventName}" not found]`);
                return result;
            }
            
            return this.processSingleEvent(namedEvent);
        }

        if (event.print) {
            result.messages.push(event.print);
        }

        if (event.updateRooms) {
            this.executeUpdateRooms(event.updateRooms);
            result.stateUpdated = true;
        }

        if (event.go) {
            result.navigateTo = event.go.trim();
            return result;
        }

        if (event.chain) {
            const chainResult = await this.processEventChain(event.chain);
            result.messages.push(...chainResult.messages);
            result.stateUpdated = result.stateUpdated || chainResult.stateUpdated;
            
            if (chainResult.navigateTo) {
                result.navigateTo = chainResult.navigateTo;
            }
        }

        return result;
    }

    private executeUpdateRooms(updateRooms: Array<Record<string, Room>> | Record<string, Room>): void {
        const roomUpdates = Array.isArray(updateRooms) ? updateRooms : [updateRooms];

        for (const updateRecord of roomUpdates) {
            for (const [roomName, roomUpdates] of Object.entries(updateRecord)) {
                if (!this.zoneData.rooms[roomName]) {
                    console.warn(`Room "${roomName}" not found for update`);
                    continue;
                }

                const existingRoom = this.zoneData.rooms[roomName];
                this.zoneData.rooms[roomName] = {
                    ...existingRoom,
                    ...roomUpdates
                };
            }
        }
    }

    private normalizeEventChain(eventChain: EventChain): Array<Event | string> {
        if (Array.isArray(eventChain)) {
            return eventChain;
        }
        return [eventChain];
    }

    updateZoneData(newZoneData: Zone): void {
        this.zoneData = newZoneData;
    }
}