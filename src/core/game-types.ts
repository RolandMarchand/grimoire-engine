
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

export type Zone = {
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

export type NavigationResult = {
    messages: Array<string>;
    actions: Array<string>;
    roomChanged: boolean;
};

export type TestFunction = (state: GameState, ...args: string[]) => boolean;

export type CallableFunction = (state: GameState, ...args: string[]) => void;