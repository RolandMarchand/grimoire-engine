import type { 
    GameState, 
    Zone, 
    NavigationResult, 
    Room 
} from './game-types';
import { EventProcessor } from './event-processor';

export class RoomNavigator {
    private gameState: GameState;
    private zoneData: Zone;
    private eventProcessor: EventProcessor;

    constructor(gameState: GameState, zoneData: Zone, eventProcessor: EventProcessor) {
        this.gameState = gameState;
        this.zoneData = zoneData;
        this.eventProcessor = eventProcessor;
    }

    async navigateToRoom(roomName: string): Promise<NavigationResult> {
        const result: NavigationResult = {
            messages: [],
            actions: [],
            roomChanged: false
        };

        if (!this.zoneData.rooms[roomName]) {
            result.messages.push(`[Error: Room "${roomName}" does not exist]`);
            return result;
        }

        const currentRoomName = this.gameState.currentRoom;
        const currentRoom = this.zoneData.rooms[currentRoomName];
        const targetRoom = this.zoneData.rooms[roomName];

        if (currentRoom?.onExit) {
            const exitResult = await this.eventProcessor.processEventChain(currentRoom.onExit);
            result.messages.push(...exitResult.messages);

            if (exitResult.navigateTo && exitResult.navigateTo !== roomName) {
                console.warn(`onExit triggered navigation to ${exitResult.navigateTo}, aborting navigation to ${roomName}`);
                return this.navigateToRoom(exitResult.navigateTo);
            }

            if (exitResult.startDialogue) {
                result.startDialogue = exitResult.startDialogue;
            }
        }

        this.gameState.currentRoom = roomName;
        result.roomChanged = true;

        if (targetRoom.shortDescription) {
            result.messages.push(targetRoom.shortDescription);
        }
        if (targetRoom.longDescription) {
            result.messages.push(targetRoom.longDescription);
        }

        if (targetRoom.onEntry) {
            const entryResult = await this.eventProcessor.processEventChain(targetRoom.onEntry);
            result.messages.push(...entryResult.messages);

            if (entryResult.navigateTo) {
                console.log(`onEntry triggered navigation to ${entryResult.navigateTo}`);
                return this.navigateToRoom(entryResult.navigateTo);
            }

            if (entryResult.startDialogue) {
                result.startDialogue = entryResult.startDialogue;
            }
        }

        result.actions = this.getAvailableActions(roomName);

        return result;
    }

    getAvailableActions(roomName: string): Array<string> {
        const room = this.zoneData.rooms[roomName];
        
        if (!room || !room.actions) {
            return ["[Nothing]"];
        }

        const actions = Object.keys(room.actions);
        return actions.length > 0 ? actions : ["[Nothing]"];
    }

    async executeAction(actionName: string): Promise<NavigationResult> {
        const result: NavigationResult = {
            messages: [],
            actions: [],
            roomChanged: false
        };

        if (actionName === "[Nothing]") {
            result.messages.push("");
            result.actions = this.getAvailableActions(this.gameState.currentRoom);
            return result;
        }

        const currentRoomName = this.gameState.currentRoom;
        const currentRoom = this.zoneData.rooms[currentRoomName];

        if (!currentRoom || !currentRoom.actions) {
            result.messages.push(`[Error: No actions available in current room]`);
            return result;
        }

        const actionEventChain = currentRoom.actions[actionName];

        if (actionEventChain === undefined) {
            result.messages.push(`[Error: Action "${actionName}" not found]`);
            result.actions = this.getAvailableActions(currentRoomName);
            return result;
        }

        if (actionEventChain === null) {
            result.messages.push("");
            result.actions = this.getAvailableActions(currentRoomName);
            return result;
        }

        const actionResult = await this.eventProcessor.processEventChain(actionEventChain);
        result.messages.push(...actionResult.messages);

        if (actionResult.startDialogue) {
            result.startDialogue = actionResult.startDialogue;
            result.actions = this.getAvailableActions(currentRoomName);
        } else if (actionResult.navigateTo) {
            const navResult = await this.navigateToRoom(actionResult.navigateTo);
            result.messages.push(...navResult.messages);
            result.actions = navResult.actions;
            result.roomChanged = true;
            
            if (navResult.startDialogue) {
                result.startDialogue = navResult.startDialogue;
            }
        } else {
            result.actions = this.getAvailableActions(currentRoomName);
        }

        return result;
    }

    getCurrentRoom(): string {
        return this.gameState.currentRoom;
    }

    getCurrentRoomData(): Room | null {
        const roomName = this.gameState.currentRoom;
        return this.zoneData.rooms[roomName] || null;
    }

    updateZoneData(newZoneData: Zone): void {
        this.zoneData = newZoneData;
    }
}