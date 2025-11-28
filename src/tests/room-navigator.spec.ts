import { describe, it, expect, beforeEach } from "vitest";
import { RoomNavigator } from "../core/room-navigator";
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

describe("RoomNavigator", () => {
  let gameState: GameState;
  let zone: Zone;
  let conditionChecker: ConditionChecker;
  let functionRegistry: FunctionRegistry;
  let eventProcessor: EventProcessor;
  let roomNavigator: RoomNavigator;

  beforeEach(() => {
    gameState = createGameState();

    zone = {
      version: 1,
      spawn: "entrance",
      rooms: {
        entrance: {
          shortDescription: "Cave Entrance",
          longDescription: "You stand at the entrance of a dark cave.",
          actions: {
            "Enter cave": { go: "cave" },
          },
        },
        cave: {
          shortDescription: "Dark Cave",
          longDescription: "The cave is dark and damp.",
          onEntry: { print: "You enter the cave cautiously." },
          onExit: { print: "You leave the cave." },
          actions: {
            "Go back": { go: "entrance" },
          },
        },
        treasure: {
          shortDescription: "Treasure Room",
          onEntry: {
            callFunctions: {
              addItem: ["treasure"],
            },
          },
          actions: {},
        },
      },
      events: {},
    };

    conditionChecker = new ConditionChecker(gameState);
    functionRegistry = new FunctionRegistry(gameState);
    eventProcessor = new EventProcessor(
      gameState,
      zone,
      conditionChecker,
      functionRegistry
    );
    roomNavigator = new RoomNavigator(gameState, zone, eventProcessor);
  });

  it("should navigate to a room", async () => {
    const result = await roomNavigator.navigateToRoom("entrance");

    expect(result.roomChanged).toBe(true);
    expect(gameState.currentRoom).toBe("entrance");
    expect(result.messages).toContain("Cave Entrance");
    expect(result.actions).toContain("Enter cave");
  });

  it("should include both short and long descriptions", async () => {
    const result = await roomNavigator.navigateToRoom("entrance");

    expect(result.messages).toContain("Cave Entrance");
    expect(result.messages).toContain(
      "You stand at the entrance of a dark cave."
    );
  });

  it("should trigger onEntry events", async () => {
    const result = await roomNavigator.navigateToRoom("cave");

    expect(result.messages).toContain("You enter the cave cautiously.");
  });

  it("should trigger onExit events", async () => {
    gameState.currentRoom = "cave";
    const result = await roomNavigator.navigateToRoom("entrance");

    expect(result.messages).toContain("You leave the cave.");
  });

  it("should execute function calls in onEntry", async () => {
    await roomNavigator.navigateToRoom("treasure");

    expect(gameState.inventory).toContain("treasure");
  });

  it("should handle navigation triggered by onEntry", async () => {
    zone.rooms.redirect = {
      shortDescription: "Redirect Room",
      onEntry: { go: "cave" },
      actions: {},
    };

    const result = await roomNavigator.navigateToRoom("redirect");

    expect(gameState.currentRoom).toBe("cave");
    expect(result.messages).toContain("Dark Cave");
  });

  it("should handle navigation triggered by onExit", async () => {
    zone.rooms.locked = {
      shortDescription: "Locked Room",
      onExit: { go: "entrance" },
      actions: {},
    };

    gameState.currentRoom = "locked";
    await roomNavigator.navigateToRoom("cave");

    expect(gameState.currentRoom).toBe("entrance");
  });

  it("should handle missing rooms", async () => {
    const result = await roomNavigator.navigateToRoom("nonexistent");

    expect(result.roomChanged).toBe(false);
    expect(result.messages.some((msg) => msg.includes("Error"))).toBe(true);
  });

  it("should execute room actions", async () => {
    await roomNavigator.navigateToRoom("entrance");
    const result = await roomNavigator.executeAction("Enter cave");

    expect(result.roomChanged).toBe(true);
    expect(gameState.currentRoom).toBe("cave");
  });

  it("should handle null action events", async () => {
    zone.rooms.entrance.actions!["Do nothing"] = null;
    await roomNavigator.navigateToRoom("entrance");

    const result = await roomNavigator.executeAction("Do nothing");

    expect(result.roomChanged).toBe(false);
    expect(result.messages).toContain("");
  });

  it("should handle [Nothing] action", async () => {
    await roomNavigator.navigateToRoom("entrance");
    const result = await roomNavigator.executeAction("[Nothing]");

    expect(result.messages).toContain("");
  });

  it("should handle missing actions", async () => {
    await roomNavigator.navigateToRoom("entrance");
    const result = await roomNavigator.executeAction("Invalid action");

    expect(result.messages.some((msg) => msg.includes("Error"))).toBe(true);
  });

  it("should get available actions", () => {
    const actions = roomNavigator.getAvailableActions("entrance");
    expect(actions).toContain("Enter cave");
  });

  it("should return [Nothing] for rooms without actions", () => {
    zone.rooms.empty = {
      shortDescription: "Empty Room",
      actions: {},
    };

    const actions = roomNavigator.getAvailableActions("empty");
    expect(actions).toEqual(["[Nothing]"]);
  });

  it("should return [Nothing] for rooms with null actions", () => {
    zone.rooms.noactions = {
      shortDescription: "No Actions Room",
    };

    const actions = roomNavigator.getAvailableActions("noactions");
    expect(actions).toEqual(["[Nothing]"]);
  });

  it("should get current room data", () => {
    gameState.currentRoom = "entrance";
    const room = roomNavigator.getCurrentRoomData();

    expect(room).toBeDefined();
    expect(room?.shortDescription).toBe("Cave Entrance");
  });

  it("should return null for missing current room", () => {
    gameState.currentRoom = "nonexistent";
    const room = roomNavigator.getCurrentRoomData();

    expect(room).toBeNull();
  });

  it("should handle actions that trigger dialogue", async () => {
    zone.rooms.entrance.actions!["Talk"] = { dialogue: "greeting" };
    await roomNavigator.navigateToRoom("entrance");

    const result = await roomNavigator.executeAction("Talk");

    expect(result.startDialogue).toBe("greeting");
  });

  it("should handle actions with event chains", async () => {
    zone.rooms.entrance.actions!["Search"] = [
      { print: "You search the area." },
      { callFunctions: { addItem: ["coin"] } },
      { print: "You found a coin!" },
    ];
    await roomNavigator.navigateToRoom("entrance");

    const result = await roomNavigator.executeAction("Search");

    expect(result.messages).toContain("You search the area.");
    expect(result.messages).toContain("You found a coin!");
    expect(gameState.inventory).toContain("coin");
  });

  it("should update zone data", () => {
    const newZone: Zone = {
      version: 2,
      spawn: "newstart",
      rooms: {
        newstart: {
          shortDescription: "New Room",
          actions: {},
        },
      },
      events: {},
    };

    roomNavigator.updateZoneData(newZone);

    const actions = roomNavigator.getAvailableActions("newstart");
    expect(actions).toEqual(["[Nothing]"]);
  });
});
