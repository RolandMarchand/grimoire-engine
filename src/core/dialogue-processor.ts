import type {
    GameState,
    Dialogue,
    DialogueNode,
    MessageNode,
    BranchNode,
    DialogueChoice,
    Character,
    DialogueState,
} from './game-types';
import type { EventProcessor } from './event-processor';
import type { ConditionChecker } from './condition-checker';

export class DialogueProcessor {
    private dialogues: Record<string, Dialogue>;
    private characters: Record<string, Character>;
    private conditionChecker: ConditionChecker;
    private eventProcessor: EventProcessor;
    private currentDialogue: string | null = null;
    private sequenceQueue: Array<string | DialogueNode> = [];
    private currentChoicesData: Array<DialogueChoice> = [];

    constructor(
        _gameState: GameState,
        dialogues: Record<string, Dialogue>,
        characters: Record<string, Character>,
        conditionChecker: ConditionChecker,
        eventProcessor: EventProcessor
    ) {
        this.dialogues = dialogues;
        this.characters = characters;
        this.conditionChecker = conditionChecker;
        this.eventProcessor = eventProcessor;
    }

    async startDialogue(ref: string): Promise<DialogueState> {
        const { name, node } = this.parseDialogueReference(ref);

        if (!this.dialogues[name]) {
            console.error(`Dialogue "${name}" not found`);
            return { active: false };
        }

        this.currentDialogue = name;
        const dialogue = this.dialogues[name];
        const startNode = node || dialogue.start;

        return await this.processNode(startNode);
    }

    async selectChoice(choiceIndex: number): Promise<DialogueState> {
        if (!this.currentDialogue || choiceIndex >= this.currentChoicesData.length) {
            return { active: false };
        }

        const choiceData = this.currentChoicesData[choiceIndex];

        if (!Array.isArray(choiceData) && choiceData.events) {
            await this.eventProcessor.processEventChain(choiceData.events);
        }

        const nextNode = Array.isArray(choiceData) ? choiceData[1] : choiceData.next;
        return await this.processNode(nextNode);
    }

    async continueDialogue(): Promise<DialogueState> {
        if (this.sequenceQueue.length > 0) {
            const nextInSequence = this.sequenceQueue.shift()!;
            if (typeof nextInSequence === 'string') {
                return await this.processNode(nextInSequence);
            }
            return await this.processDialogueNode(nextInSequence);
        }

        return { active: false };
    }

    getCurrentChoicesData(): Array<DialogueChoice> {
        return this.currentChoicesData;
    }

    private async processNode(nodeId: string): Promise<DialogueState> {
        if (!this.currentDialogue) {
            return { active: false };
        }

        const dialogue = this.dialogues[this.currentDialogue];
        const node = dialogue.nodes[nodeId];

        if (!node) {
            console.error(`Node "${nodeId}" not found in dialogue "${this.currentDialogue}"`);
            return { active: false };
        }

        return await this.processDialogueNode(node);
    }

    private async processDialogueNode(node: DialogueNode): Promise<DialogueState> {
        if (node === null) {
            this.currentDialogue = null;
            this.sequenceQueue = [];
            this.currentChoicesData = [];
            return { active: false };
        }

        if ('message' in node) {
            return await this.processMessage(node.message);
        }

        if ('branch' in node) {
            return await this.processBranch(node.branch);
        }

        if ('sequence' in node) {
            return this.processSequence(node.sequence);
        }

        if ('events' in node) {
            await this.eventProcessor.processEventChain(node.events);
            if (node.next) {
                return this.processNode(node.next);
            }
            if (this.sequenceQueue.length > 0) {
                const nextInSequence = this.sequenceQueue.shift()!;
                if (typeof nextInSequence === 'string') {
                    return this.processNode(nextInSequence);
                }
                return await this.processDialogueNode(nextInSequence);
            }
            return { active: false };
        }

        return { active: false };
    }

    private async processMessage(node: MessageNode): Promise<DialogueState> {
        const speaker = this.characters[node.speaker];

        if (!node.choices) {
            this.currentChoicesData = [];
            return {
                active: true,
                speaker,
                text: node.text,
                choices: undefined,
                currentNode: node.next,
            };
        }

        const validChoices: Array<{ text: string; index: number }> = [];
        this.currentChoicesData = [];

        for (let i = 0; i < node.choices.length; i++) {
            const choice = node.choices[i];

            if (Array.isArray(choice)) {
                validChoices.push({ text: choice[0], index: i });
                this.currentChoicesData.push(choice);
                continue;
            }

            if (choice.condition) {
                const passed = await this.conditionChecker.evaluateCheck({
                    test: choice.condition,
                    arguments: []
                });

                if (!passed) {
                    if (choice.else) {
                        return this.processNode(choice.else);
                    }
                    continue;
                }
            }

            validChoices.push({ text: choice.text, index: i });
            this.currentChoicesData.push(choice);
        }

        return {
            active: true,
            speaker,
            text: node.text,
            choices: validChoices,
        };
    }

    private async processBranch(node: BranchNode): Promise<DialogueState> {
        const condition = node.condition.split(":");
        const result = await this.conditionChecker.evaluateCheck({
            test: condition[0],
            arguments: [condition[1]]
        });

        const nextNode = result ? node.true : node.false;
        return this.processNode(nextNode);
    }

    private async processSequence(sequence: Array<string | DialogueNode>): Promise<DialogueState> {
        if (sequence.length === 0) {
            return { active: false };
        }

        this.sequenceQueue = sequence.slice(1);
        const firstNode = sequence[0];

        if (typeof firstNode === 'string') {
            return this.processNode(firstNode);
        }

        return await this.processDialogueNode(firstNode);
    }

    private parseDialogueReference(ref: string): { name: string; node?: string } {
        const parts = ref.split('.');
        return {
            name: parts[0],
            node: parts[1],
        };
    }

    updateData(
        dialogues: Record<string, Dialogue>,
        characters: Record<string, Character>
    ): void {
        this.dialogues = dialogues;
        this.characters = characters;
    }
}
