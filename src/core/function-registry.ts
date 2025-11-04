import type { GameState, CallableFunction } from './game-types';

export class FunctionRegistry {
    private gameState: GameState;
    private functions: Map<string, CallableFunction>;

    constructor(gameState: GameState) {
        this.gameState = gameState;
        this.functions = new Map();
        this.registerBuiltInFunctions();
    }

    private registerBuiltInFunctions(): void {

        this.registerFunction('addItem', (state, itemName) => {
            if (itemName && !state.inventory.includes(itemName)) {
                state.inventory.push(itemName);
            }
        });

        this.registerFunction('removeItem', (state, itemName) => {
            const index = state.inventory.indexOf(itemName);
            if (index > -1) {
                state.inventory.splice(index, 1);
            }
        });

        this.registerFunction('setFlag', (state, flagName, value) => {
            const flagValue = value === 'false' ? false : true;
            state.flag[flagName] = flagValue;
        });
    }

    registerFunction(name: string, fn: CallableFunction): void {
        this.functions.set(name, fn);
    }

    async executeFunction(functionName: string, args: string[] = []): Promise<void> {
        const fn = this.functions.get(functionName);
        
        if (!fn) {
            console.warn(`Unknown function: ${functionName}`);
            return;
        }

        try {
            fn(this.gameState, ...args);
        } catch (error) {
            console.error(`Error executing function "${functionName}":`, error);
        }
    }

    async executeFunctions(callFunctions: Record<string, Array<string> | undefined | null>): Promise<void> {
        for (const [funcName, args] of Object.entries(callFunctions)) {
            const funcArgs = args || [];
            await this.executeFunction(funcName, funcArgs);
        }
    }
}