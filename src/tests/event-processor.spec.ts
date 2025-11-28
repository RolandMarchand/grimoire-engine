import { describe, it, expect, beforeEach } from "vitest";
import { EventProcessor } from "../core/event-processor";
import { ConditionChecker } from "../core/condition-checker";
import { FunctionRegistry } from "../core/function-registry";
import type { GameState, Zone } from "../core/game-types";

const createGameState = (): GameState => ({
  currentRoom: "start",
  flag: {},
  inventory: [],
  data: {},
});

const createMinimalZone = (): Zone => ({
  version: 1,
  spawn: "start",
  rooms: {
    start: {
      shortDescription: "Starting room",
      longDescription: "You are in the starting room.",
      actions: {
        "Look around": { print: "You look around the room." },
      },
    },
  },
  events: {},
});

describe("EventProcessor", () => {
  let gameState: GameState;
  let zone: Zone;
  let conditionChecker: ConditionChecker;
  let functionRegistry: FunctionRegistry;
  let eventProcessor: EventProcessor;

  beforeEach(() => {
    gameState = createGameState();
    zone = createMinimalZone();
    conditionChecker = new ConditionChecker(gameState);
    functionRegistry = new FunctionRegistry(gameState);
    eventProcessor = new EventProcessor(
      gameState,
      zone,
      conditionChecker,
      functionRegistry
    );
  });

  it("should process print events", async () => {
    const event = { print: "Hello, adventurer!" };
    const result = await eventProcessor.processEventChain(event);

    expect(result.messages).toContain("Hello, adventurer!");
  });

  it("should process function call events", async () => {
    const event = {
      callFunctions: {
        addItem: ["sword"],
        setFlag: ["questComplete", "true"],
      },
    };

    const result = await eventProcessor.processEventChain(event);

    expect(gameState.inventory).toContain("sword");
    expect(gameState.flag.questComplete).toBe(true);
    expect(result.stateUpdated).toBe(true);
  });

  it("should process conditional events that pass", async () => {
    gameState.inventory.push("key");

    const event = {
      check: {
        test: "hasItem",
        arguments: ["key"],
      },
      print: "You unlock the door with your key.",
    };

    const result = await eventProcessor.processEventChain(event);
    expect(result.messages).toContain("You unlock the door with your key.");
  });

  it("should handle failed conditions with fallback", async () => {
    const event = {
      check: {
        test: "hasItem",
        arguments: ["key"],
        failed: { print: "The door is locked. You need a key." },
      },
      print: "You unlock the door.",
    };

    const result = await eventProcessor.processEventChain(event);
    expect(result.messages).toContain("The door is locked. You need a key.");
    expect(result.messages).not.toContain("You unlock the door.");
  });

  it("should skip events when check fails without fallback", async () => {
    const event = {
      check: {
        test: "hasItem",
        arguments: ["key"],
      },
      print: "You unlock the door.",
    };

    const result = await eventProcessor.processEventChain(event);
    expect(result.messages).toHaveLength(0);
  });

  it("should process event chains", async () => {
    const eventChain = [
      { print: "You find a treasure chest." },
      { callFunctions: { addItem: ["gold_coin"] } },
      { print: "You obtained a gold coin!" },
    ];

    const result = await eventProcessor.processEventChain(eventChain);

    expect(result.messages).toHaveLength(2);
    expect(result.messages).toContain("You find a treasure chest.");
    expect(result.messages).toContain("You obtained a gold coin!");
    expect(gameState.inventory).toContain("gold_coin");
  });

  it("should process go events", async () => {
    const event = { go: "nextRoom" };
    const result = await eventProcessor.processEventChain(event);

    expect(result.navigateTo).toBe("nextRoom");
  });

  it("should process dialogue events", async () => {
    const event = { dialogue: "greeting" };
    const result = await eventProcessor.processEventChain(event);

    expect(result.startDialogue).toBe("greeting");
  });

  it("should process nested chain events", async () => {
    const event = {
      chain: [
        { print: "First message" },
        { chain: { print: "Nested message" } },
      ],
    };

    const result = await eventProcessor.processEventChain(event);
    expect(result.messages).toContain("First message");
    expect(result.messages).toContain("Nested message");
  });

  it("should process named events from zone", async () => {
    zone.events.testEvent = { print: "Named event message" };

    const result = await eventProcessor.processEventChain("testEvent");
    expect(result.messages).toContain("Named event message");
  });

  it("should handle missing named events", async () => {
    const result = await eventProcessor.processEventChain("nonExistentEvent");
    expect(result.messages.some((msg) => msg.includes("Error"))).toBe(true);
  });

  it("should update rooms", async () => {
    zone.rooms.start = {
      shortDescription: "Old description",
      actions: {},
    };

    const event = {
      updateRooms: {
        start: {
          shortDescription: "New description",
        },
      },
    };

    await eventProcessor.processEventChain(event);
    expect(zone.rooms.start.shortDescription).toBe("New description");
  });

  it("should stop processing chain on navigation event", async () => {
    const eventChain = [
      { print: "First message" },
      { go: "nextRoom" },
      { print: "This should not appear" },
    ];

    const result = await eventProcessor.processEventChain(eventChain);
    expect(result.navigateTo).toBe("nextRoom");
    expect(result.messages).not.toContain("This should not appear");
  });

  it("should stop processing chain on dialogue event", async () => {
    const eventChain = [
      { print: "First message" },
      { dialogue: "greeting" },
      { print: "This should not appear" },
    ];

    const result = await eventProcessor.processEventChain(eventChain);
    expect(result.startDialogue).toBe("greeting");
    expect(result.messages).not.toContain("This should not appear");
  });
});
