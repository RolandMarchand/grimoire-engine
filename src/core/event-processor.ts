import type { GameState } from "./game-definition";

type Event = {
    print?: string;
    chain?: EventChain;
    go?: string;
    updateRooms?: Array<Record<string, Room>> | Record<string, Room>;
    addRoom?: Record<string, Room>;
    removeRoom?: string | Array<string>;
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

type PendingChange = 
  | { type: 'addRoom', roomName: string, roomData: Room }
  | { type: 'removeRoom', roomName: string }
  | { type: 'updateRoom', roomName: string, updates: Partial<Room> };

export type EventResult = {
    messages: Array<string>;
    navigateTo?: string;
    stateUpdated: boolean;
};

export class EventProcessor {
    private zoneData: Zone;
    private pendingChanges: Array<PendingChange> = [];

    constructor(zoneData: Zone) {
        this.zoneData = zoneData;
    }

    async processEventChain(eventChain: EventChain): Promise<EventResult> {
        const result: EventResult = {
            messages: [],
            stateUpdated: false
        };

        this.pendingChanges = [];
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

        this.applyPendingChanges();

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

        if (event.addRoom) {
            this.executeAddRoom(event.addRoom);
            result.stateUpdated = true;
        }

        if (event.removeRoom){
            this.executeRemoveRoom(event.removeRoom);
            result.stateUpdated = true;
        }

        return result;
    }

    private executeAddRoom(roomToAdd: Record<string, Room>): void{
        for (const [roomName, roomData] of Object.entries(roomToAdd)){
            this.pendingChanges.push({
                type: 'addRoom',
                roomName,
                roomData
            });
        }
    }

    private executeRemoveRoom(roomNames: string | Array<string>): void{
        const namesToRemove = Array.isArray(roomNames) ? roomNames : [roomNames];

        for (const roomName of namesToRemove){
            this.pendingChanges.push({
                type: 'removeRoom',
                roomName
            });
        }
    }

    private executeUpdateRooms(updateRooms: Array<Record<string, Room>> | Record<string, Room>): void {
        const roomUpdates = Array.isArray(updateRooms) ? updateRooms : [updateRooms];

        for (const updateRecord of roomUpdates) {
            for (const [roomName, updates] of Object.entries(updateRecord)) {
                this.pendingChanges.push({
                    type: 'updateRoom',
                    roomName,
                    updates
                });
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

    private applyPendingChanges(): void {
        for (const change of this.pendingChanges) {
            switch (change.type) {
                case 'addRoom':
                    if (this.zoneData.rooms[change.roomName]) {
                        console.warn(`Room "${change.roomName}" already exists, overwriting`);
                    }
                    this.zoneData.rooms[change.roomName] = change.roomData;
                    break;

                case 'removeRoom':
                    if (!this.zoneData.rooms[change.roomName]) {
                        console.warn(`Room "${change.roomName}" not found for removal`);
                        break;
                    }
                    delete this.zoneData.rooms[change.roomName];
                    break;

                case 'updateRoom':
                    if (!this.zoneData.rooms[change.roomName]) {
                        console.warn(`Room "${change.roomName}" not found for update`);
                        break;
                    }
                    const existingRoom = this.zoneData.rooms[change.roomName];
                    this.zoneData.rooms[change.roomName] = {
                        ...existingRoom,
                        ...change.updates
                    };
                    break;
            }
        }

        this.pendingChanges = [];
    }
}