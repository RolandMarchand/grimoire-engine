import * as yaml from "js-yaml"
import { z } from 'zod'

type Event = {
    print?: string;
    chain?: EventChain,
    go?: string,
    check?: EventCheck,
    callFunctions?: Record<string, Array<string> | undefined | null>,
    updateRooms?: Array<Record<string, Room>> | Record<string, Room>,
    dialogue?: string,
}

type EventChain = Array<Event | string> | Event | string;

type EventCheck = {
    test: string,
    arguments?: Array<string>,
    failed?: EventChain,
}

type Character = {
    name: string;
    color: string;
};

type DialogueChoice =
    | [string, string]
    | {
        text: string;
        next: string;
        condition?: string;
        else?: string;
        events?: EventChain;
    };

type MessageNode = {
    speaker: string;
    text: string;
    choices?: Array<DialogueChoice>;
    next?: string | null;
};

type BranchNode = {
    condition: string;
    true: string;
    false: string;
};

type DialogueNode =
    | { message: MessageNode }
    | { branch: BranchNode }
    | { sequence: Array<string | DialogueNode> }
    | { events: EventChain; next?: string | null }
    | null;

type Dialogue = {
    start: string;
    nodes: Record<string, DialogueNode>;
};

const Event: z.ZodType<Event> = z.lazy(() => z.object({
    print: z.string().trim(),
    chain: EventChain,
    go: z.string().trim().min(1),
    check: EventCheck,
    callFunctions: z.record(
        z.string().trim().min(1),
        z.array(z.string().trim()).nullish()),
    updateRooms: z.union([
        z.array(z.record(z.string().trim().min(1), Room)),
        z.record(z.string().trim().min(1), Room)
    ]),
    dialogue: z.string().trim().min(1),
    addRoom: z.record(z.string().trim().min(1), Room),
    removeRoom: z.union([
        z.string().trim().min(1),
        z.array(z.string().trim().min(1))
    ]),
}).strict().partial());

const EventChain: z.ZodType<EventChain> = z.lazy(() => z.union([
    z.array(z.union([
        z.string().trim(),
        Event,
    ])),
    z.string().trim(),
    Event,
]));

const EventCheck: z.ZodType<EventCheck> = z.lazy(() => z.object({
    test: z.string().trim().min(1),
    arguments: z.array(z.string().trim().min(1)).optional(),
    failed: EventChain.optional(),
}).strict());

const Room = z.object({
    shortDescription: z.string().trim().nullish(),
    longDescription: z.string().trim().nullish(),
    onEntry: EventChain.nullish(),
    onExit: EventChain.nullish(),
    actions: z.record(z.string().trim().min(1), EventChain.nullable()).nullish(),
}).strict().partial();

const Character = z.object({
    name: z.string().trim().min(1),
    color: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/),
}).strict();

const DialogueChoice: z.ZodType<DialogueChoice> = z.lazy(() => z.union([
    z.tuple([z.string().trim().min(1), z.string().trim().min(1)]),
    z.object({
        text: z.string().trim().min(1),
        next: z.string().trim().min(1),
        condition: z.string().trim().min(1).optional(),
        else: z.string().trim().min(1).optional(),
        events: EventChain.optional(),
    }).strict()
]));

const MessageNode: z.ZodType<MessageNode> = z.lazy(() => z.object({
    speaker: z.string().trim().min(1),
    text: z.string().trim().min(1),
    choices: z.array(DialogueChoice).optional(),
    next: z.string().trim().min(1).nullable().optional(),
}).strict());

const BranchNode = z.object({
    condition: z.string().trim().min(1),
    true: z.string().trim().min(1),
    false: z.string().trim().min(1),
}).strict();

const DialogueNode: z.ZodType<DialogueNode> = z.lazy(() => z.union([
    z.object({ message: MessageNode }).strict(),
    z.object({ branch: BranchNode }).strict(),
    z.object({ sequence: z.array(z.union([z.string().trim().min(1), DialogueNode])) }).strict(),
    z.object({ events: EventChain, next: z.string().trim().min(1).nullable().optional() }).strict(),
    z.null(),
]));

const Dialogue = z.object({
    start: z.string().trim().min(1),
    nodes: z.record(z.string().trim().min(1), DialogueNode),
}).strict().superRefine((dialogue, ctx) => {

    if (!(dialogue.start in dialogue.nodes)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Start node "${dialogue.start}" does not exist in nodes`,
            path: ['start']
        });
    }

    
    const referencedNodes = new Set<string>([dialogue.start]);
    const nodesWithExits = new Set<string>();

  
    const extractReferences = (node: DialogueNode, nodeName: string) => {
        if (node === null) {
            nodesWithExits.add(nodeName);
            return;
        }

        if ('message' in node) {
            const msg = node.message;
            
            if (msg.choices && msg.choices.length > 0) {
                nodesWithExits.add(nodeName);
                msg.choices.forEach(choice => {
                    if (Array.isArray(choice)) {
                        referencedNodes.add(choice[1]);
                    } else {
                        referencedNodes.add(choice.next);
                        if (choice.else) {
                            referencedNodes.add(choice.else);
                        }
                    }
                });
            } else if (msg.next !== undefined) {
                nodesWithExits.add(nodeName);
                if (msg.next !== null) {
                    referencedNodes.add(msg.next);
                }
            }
        }

        if ('branch' in node) {
            nodesWithExits.add(nodeName);
            referencedNodes.add(node.branch.true);
            referencedNodes.add(node.branch.false);
        }

        if ('sequence' in node) {
            nodesWithExits.add(nodeName);
            node.sequence.forEach(item => {
                if (typeof item === 'string') {
                    referencedNodes.add(item);
                } else if (item && typeof item === 'object') {
                    extractReferences(item, `${nodeName}[sequence]`);
                }
            });
        }

        if ('events' in node) {
            if (node.next !== undefined) {
                nodesWithExits.add(nodeName);
                if (node.next !== null) {
                    referencedNodes.add(node.next);
                }
            }
        }
    };


    Object.entries(dialogue.nodes).forEach(([nodeName, node]) => {
        extractReferences(node, nodeName);
    });


    referencedNodes.forEach(refNode => {
        if (!(refNode in dialogue.nodes)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Referenced node "${refNode}" does not exist in nodes`,
                path: ['nodes']
            });
        }
    });


    Object.keys(dialogue.nodes).forEach(nodeName => {
        if (nodeName !== dialogue.start && !referencedNodes.has(nodeName)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Node "${nodeName}" is unreachable (nothing references it)`,
                path: ['nodes', nodeName],
                fatal: false
            });
        }
    });

    Object.entries(dialogue.nodes).forEach(([nodeName, node]) => {
        if (node !== null && !nodesWithExits.has(nodeName)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Node "${nodeName}" is a dead end (no choices, next, or exit)`,
                path: ['nodes', nodeName],
                fatal: false
            });
        }
    });
});

const Zone = z.object({
    version: z.number(),
    spawn: z.string().trim(),
    rooms: z.record(z.string().trim().min(1), Room),
    events: z.record(z.string().trim().min(1), Event),
    characters: z.record(z.string().trim().min(1), Character).optional(),
    dialogues: z.record(z.string().trim().min(1), Dialogue).optional(),
}).strict().required().refine(data => data.spawn in data.rooms, {
    message: "Spawn room must exist in rooms",
    path: ["spawn"]
}).superRefine((zone, ctx) => {
    if (!zone.dialogues) return;

    const referencedDialogues = new Set<string>();


    const checkEventForDialogue = (event: any) => {
        if (!event) return;
        
        if (typeof event === 'string') {
            const namedEvent = zone.events[event];
            if (namedEvent) checkEventForDialogue(namedEvent);
            return;
        }

        if (event.dialogue) {
            const dialogueName = event.dialogue.split('.')[0];
            referencedDialogues.add(dialogueName);
        }

        if (event.chain) {
            const chains = Array.isArray(event.chain) ? event.chain : [event.chain];
            chains.forEach(checkEventForDialogue);
        }
    };


    Object.values(zone.rooms).forEach(room => {
        if (room.actions) {
            Object.values(room.actions).forEach(action => {
                if (action) checkEventForDialogue(action);
            });
        }
        if (room.onEntry) checkEventForDialogue(room.onEntry);
        if (room.onExit) checkEventForDialogue(room.onExit);
    });


    Object.values(zone.events).forEach(event => {
        checkEventForDialogue(event);
    });


    Object.keys(zone.dialogues).forEach(dialogueName => {
        if (!referencedDialogues.has(dialogueName)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Dialogue "${dialogueName}" is never triggered (orphaned)`,
                path: ['dialogues', dialogueName],
                fatal: false
            });
        }
    });


    referencedDialogues.forEach(dialogueName => {
        if (!(dialogueName in zone.dialogues)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Referenced dialogue "${dialogueName}" does not exist`,
                path: ['dialogues']
            });
        }
    });

    if (zone.characters) {
        Object.entries(zone.dialogues).forEach(([dialogueName, dialogue]) => {
            Object.entries(dialogue.nodes).forEach(([nodeName, node]) => {
                if (node && 'message' in node) {
                    const speaker = node.message.speaker;
                    if (!(speaker in zone.characters!)) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: `Speaker "${speaker}" in dialogue "${dialogueName}.${nodeName}" is not defined in characters`,
                            path: ['dialogues', dialogueName, 'nodes', nodeName]
                        });
                    }
                }
            });
        });
    }
});

type Zone = z.infer<typeof Zone>;
type Room = z.infer<typeof Room>;

export type GameState = {
    currentRoom: string;
    flag: Record<string, boolean>;
    inventory: Array<string>;
    data: Record<string, any>;
}

export async function getZone(): Promise<Zone | null> {
    try {
        let yamlText: string = "";
    
        await fetch('/assets/test.yml')
        .then(response => response.text())
        .then(fileContents => {
                yamlText = fileContents;
        });
    
        const zoneYAML = yaml.load(yamlText);
        const zone = Zone.parse(zoneYAML);
        return zone;
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('Validation errors:', error.errors);
            error.errors.forEach(err => {
                console.error(`  - ${err.path.join('.')}: ${err.message}`);
            });
        } else {
            console.error('YAML parsing error:', error);
        }

        return null;
    }
    
}
