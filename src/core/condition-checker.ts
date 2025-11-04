import type { GameState, EventCheck, TestFunction } from './game-types';

export class ConditionChecker {
    private gameState: GameState;
    private customTests: Map<string, TestFunction>;

    constructor(gameState: GameState) {
        this.gameState = gameState;
        this.customTests = new Map();
        this.registerBuiltInTests();
    }

    private registerBuiltInTests(): void {

        this.registerTest('hasItem', (state, itemName) => {
            return state.inventory.includes(itemName);
        });
        
       
        this.registerTest('hasFlag', (state, flagName) => {
            return state.flag[flagName] === true;
        });
    }

    registerTest(name: string, testFn: TestFunction): void {
        this.customTests.set(name, testFn);
    }

    async evaluateCheck(check: EventCheck): Promise<boolean> {
        const testName = check.test;
        const args = check.arguments || [];

        const testFn = this.customTests.get(testName);
        
        if (!testFn) {
            console.error(`Unknown test function: ${testName}`);
            return false;
        }

        try {
            return testFn(this.gameState, ...args);
        } catch (error) {
            console.error(`Error evaluating check "${testName}":`, error);
            return false;
        }
    }
}