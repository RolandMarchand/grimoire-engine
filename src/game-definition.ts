import * as yaml from "js-yaml"
import { z } from 'zod'

type Event = {
    print?: string;
    chain?: EventChain,
    go?: string,
    check?: EventCheck,
    callFunctions?: Record<string, Array<string> | undefined | null>,
    updateRooms?: Array<Record<string, Room>> | Record<string, Room>
}

type EventChain = Array<Event | string> | Event | string;

type EventCheck = {
    test: string,
    arguments?: Array<string>,
    failed?: EventChain,
}

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

const Zone = z.object({
    spawn: z.string().trim(),
    rooms: z.record(z.string().trim().min(1), Room),
    events: z.record(z.string().trim().min(1), Event),
    // TODO: Improve the data validation.
}).strict().required().refine(data => data.spawn in data.rooms, {
    message: "Spawn room must exist in rooms",
    path: ["spawn"]
});

type Zone = z.infer<typeof Zone>;
type Room = z.infer<typeof Room>;

try {
    let yamlText: string = "";

    await fetch('/assets/test.yml')
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
