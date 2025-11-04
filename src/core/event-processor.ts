import type { 
    GameState, 
    Zone, 
    Event, 
    EventChain, 
    EventResult, 
    Room 
} from './game-types';
import { ConditionChecker } from './condition-checker';
import { FunctionRegistry } from './function-registry';

export class EventProcessor {
    private gameState: GameState;
    private zoneData: Zone;
    private conditionChecker: ConditionChecker;
    private functionRegistry: FunctionRegistry;

    constructor(
        gameState: GameState, 
        zoneData: Zone,
        conditionChecker: ConditionChecker,
        functionRegistry: FunctionRegistry
    ) {
        this.gameState = gameState;
        this.zoneData = zoneData;
        this.conditionChecker = conditionChecker;
        this.functionRegistry = functionRegistry;
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

        if (event.check) {
            const checkPassed = await this.conditionChecker.evaluateCheck(event.check);
            
            if (!checkPassed) {
                if (event.check.failed) {
                    return this.processEventChain(event.check.failed);
                }
                return result;
            }
            
        }

        if (event.print) {
            result.messages.push(event.print);
        }

        if (event.callFunctions) {
            await this.functionRegistry.executeFunctions(event.callFunctions);
            result.stateUpdated = true;
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