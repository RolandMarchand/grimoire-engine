export type GameState = {
    currentRoom: string;
    flag: Record<string, boolean>;
    inventory: Array<string>;
    data: Record<string, any>;
};

export type Event = {
    print?: string;
    chain?: EventChain;
    go?: string;
    check?: EventCheck;
    callFunctions?: Record<string, Array<string> | undefined | null>;
    updateRooms?: Array<Record<string, Room>> | Record<string, Room>;
    dialogue?: string;
};

export type EventChain = Array<Event | string> | Event | string;

export type EventCheck = {
    test: string;
    arguments?: Array<string>;
    failed?: EventChain;
};

export type Room = {
    shortDescription?: string | null;
    longDescription?: string | null;
    onEntry?: EventChain | null;
    onExit?: EventChain | null;
    actions?: Record<string, EventChain | null> | null;
};

export type Character = {
    name: string;
    color: string;
};

export type DialogueChoice =
    | [string, string]
    | {
        text: string;
        next: string;
        condition?: string;
        else?: string;
        events?: EventChain;
    };

export type MessageNode = {
    speaker: string;
    text: string;
    choices?: Array<DialogueChoice>;
    next?: string;
};

export type BranchNode = {
    condition: string;
    true: string;
    false: string;
};

export type DialogueNode =
    | { message: MessageNode }
    | { branch: BranchNode }
    | { sequence: Array<string | DialogueNode> }
    | { events: EventChain; next?: string }
    | null;

export type Dialogue = {
    start: string;
    nodes: Record<string, DialogueNode>;
};

export type Zone = {
    version: number;
    spawn: string;
    rooms: Record<string, Room>;
    events: Record<string, Event>;
    characters?: Record<string, Character>;
    dialogues?: Record<string, Dialogue>;
};

export type EventResult = {
    messages: Array<string>;
    navigateTo?: string;
    stateUpdated: boolean;
    startDialogue?: string;
};

export type NavigationResult = {
    messages: Array<string>;
    actions: Array<string>;
    roomChanged: boolean;
    startDialogue?: string;
};

export type DialogueState = {
    active: boolean;
    dialogueName?: string;
    currentNode?: string;
    speaker?: Character;
    text?: string;
    choices?: Array<{ text: string; index: number }>;
};

export type TestFunction = (state: GameState, ...args: string[]) => boolean;

export type CallableFunction = (state: GameState, ...args: string[]) => void;