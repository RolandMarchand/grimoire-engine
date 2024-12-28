import * as yaml from "js-yaml"
import { z } from 'zod'

type EventChain = Array<string | Event> | string | Event;

type EventCheck = {
    test: string,
    arguments?: Array<string> | null
    failed?: EventChain | null
}

type Event = {
    print?: string | null,
    chain?: EventChain | null,
    go?: string | null,
    check?: EventCheck | null,
    callFunctions?: Map<string, Array<string> | null | undefined> | null
};

type Room = {
    shortDescription?: string | null,
    longDescription?: string | null,
    onEntry?: EventChain | null,
    onExit?: EventChain | null,
    actions?: Map<string, EventChain | null> | null
};

type Zone = {
    rooms: Map<string, Room>,
    events: Map<string, Event>,
    spawn: string
};

const LazyEventChain: z.ZodType<EventChain> = z.lazy(() => EventChain);

const EventCheck: z.ZodType<EventCheck> = z.object({
    test: z.string().trim(),
    arguments: z.array(z.string().trim()).nullish(),
    failed: LazyEventChain.nullish()
});

const Event: z.ZodType<Event> = z.object({
    print: z.string().trim().nullish(),
    chain: LazyEventChain.nullish(),
    go: z.string().trim().nullish(),
    check: EventCheck.nullish(),
    callFunctions: z.map(z.string().trim(), z.array(z.string().trim()).nullish()).nullish()
});

const EventChain: z.ZodType<EventChain> = 
    z.union([z.array(z.union([z.string().trim(), Event])), z.string().trim(), Event]);

const Room: z.ZodType<Room> = z.object({
    shortDescription: z.string().trim().nullish(),
    longDescription: z.string().trim().nullish(),
    onEntry: EventChain.nullish(),
    onExit: EventChain.nullish(),
    actions: z.map(z.string().trim(), EventChain.nullable()).nullish()
});

const Zone: z.ZodType<Zone> = z.object({
    rooms: z.map(z.string().trim(), Room),
    events: z.map(z.string().trim(), Event),
    spawn: z.string().trim()
}).strict();

try {
    let yamlText: string = "";

    await fetch('/gdd/test.yml')
    .then(response => response.text())
    .then(fileContents => {
        yamlText = fileContents;
    });

    const zone = yaml.load(yamlText);
    const validZone = Zone.parse(zone);
} catch (error) {
    if (error instanceof z.ZodError) {
        console.error('Validation errors:', error.errors);
    } else {
        console.error('YAML parsing error:', error);
    }
}
