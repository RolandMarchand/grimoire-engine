import { reactive, readonly } from 'vue';
import type { 
    GameState, 
    Zone, 
    NavigationResult,
    Room,
    DialogueState
} from './game-types';
import { EventProcessor } from './event-processor';
import { RoomNavigator } from './room-navigator';
import { ConditionChecker } from './condition-checker';
import { FunctionRegistry } from './function-registry';
import { DialogueProcessor } from './dialogue-processor';

export class GameEngine {
    private _gameState: GameState;
    private _zoneData: Zone;
    private eventProcessor: EventProcessor;
    private roomNavigator: RoomNavigator;
    private conditionChecker: ConditionChecker;
    private functionRegistry: FunctionRegistry;
    private dialogueProcessor: DialogueProcessor | null = null;
    private _initialized: boolean = false;

    constructor() {
        this._gameState = reactive<GameState>({
            currentRoom: '',
            flag: {},
            inventory: [],
            data: {}
        });

        this._zoneData = reactive<Zone>({
            version: 1,
            spawn: '',
            rooms: {},
            events: {}
        });

        this.conditionChecker = new ConditionChecker(this._gameState);
        this.functionRegistry = new FunctionRegistry(this._gameState);
        this.eventProcessor = new EventProcessor(
            this._gameState,
            this._zoneData,
            this.conditionChecker,
            this.functionRegistry
        );
        this.roomNavigator = new RoomNavigator(
            this._gameState,
            this._zoneData,
            this.eventProcessor
        );
    }

    get gameState() {
        return readonly(this._gameState);
    }

    get zoneData() {
        return readonly(this._zoneData);
    }

    get initialized() {
        return this._initialized;
    }

    async initializeGame(zone: Zone): Promise<NavigationResult> {
        Object.assign(this._zoneData, zone);
        
        this._gameState.currentRoom = zone.spawn;
        this._gameState.flag = {};
        this._gameState.inventory = [];
        this._gameState.data = {};

        if (zone.dialogues && zone.characters) {
            this.dialogueProcessor = new DialogueProcessor(
                this._gameState,
                zone.dialogues,
                zone.characters,
                this.conditionChecker,
                this.eventProcessor
            );
        }

        this._initialized = true;

        return await this.roomNavigator.navigateToRoom(zone.spawn);
    }

    async executeAction(actionName: string): Promise<NavigationResult> {
        if (!this._initialized) {
            throw new Error('Game not initialized. Call initializeGame() first.');
        }
        return await this.roomNavigator.executeAction(actionName);
    }

    async navigateToRoom(roomName: string): Promise<NavigationResult> {
        if (!this._initialized) {
            throw new Error('Game not initialized. Call initializeGame() first.');
        }
        return await this.roomNavigator.navigateToRoom(roomName);
    }

    async startDialogue(ref: string): Promise<DialogueState> {
        if (!this.dialogueProcessor) {
            console.error('No dialogue system initialized');
            return { active: false };
        }
        return await this.dialogueProcessor.startDialogue(ref);
    }

    async selectDialogueChoice(choiceIndex: number): Promise<DialogueState> {
        if (!this.dialogueProcessor) {
            return { active: false };
        }
        return await this.dialogueProcessor.selectChoice(choiceIndex);
    }

    async continueDialogue(): Promise<DialogueState> {
        if (!this.dialogueProcessor) {
            return { active: false };
        }
        return await this.dialogueProcessor.continueDialogue();
    }

    getCurrentDialogueChoices(): any[] {
        if (!this.dialogueProcessor) {
            return [];
        }
        return this.dialogueProcessor.getCurrentChoicesData();
    }

    getAvailableActions(): string[] {
        return this.roomNavigator.getAvailableActions(this._gameState.currentRoom);
    }

    getCurrentRoom(): string {
        return this._gameState.currentRoom;
    }

    getCurrentRoomData(): Room | null {
        return this.roomNavigator.getCurrentRoomData();
    }

    addItem(item: string): void {
        if (!this._gameState.inventory.includes(item)) {
            this._gameState.inventory.push(item);
        }
    }

    removeItem(item: string): void {
        const index = this._gameState.inventory.indexOf(item);
        if (index > -1) {
            this._gameState.inventory.splice(index, 1);
        }
    }

    setFlag(flag: string, value: boolean): void {
        this._gameState.flag[flag] = value;
    }

    setData(key: string, value: any): void {
        this._gameState.data[key] = value;
    }

    registerTest(name: string, testFn: (state: GameState, ...args: string[]) => boolean): void {
        this.conditionChecker.registerTest(name, testFn);
    }

    registerFunction(name: string, fn: (state: GameState, ...args: string[]) => void): void {
        this.functionRegistry.registerFunction(name, fn);
    }
}

export const gameEngine = new GameEngine();