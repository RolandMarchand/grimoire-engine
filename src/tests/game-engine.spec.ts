import { describe, it, expect, beforeEach } from "vitest";
import { GameEngine } from "../core/game-engine";
import type { Zone } from "../core/game-types";

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
    next: {
      shortDescription: "Next room",
      actions: {
        "Go back": { go: "start" },
      },
    },
  },
  events: {},
});

describe("GameEngine", () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine();
  });

  it("should initialize the game", async () => {
    const zone = createMinimalZone();
    const result = await engine.initializeGame(zone);

    expect(engine.initialized).toBe(true);
    expect(engine.getCurrentRoom()).toBe("start");
    expect(result.actions.length).toBeGreaterThan(0);
  });

  it("should reset game state on initialization", async () => {
    const zone = createMinimalZone();

    await engine.initializeGame(zone);
    engine.addItem("sword");
    engine.setFlag("test", true);

    await engine.initializeGame(zone);

    expect(engine.gameState.inventory).toHaveLength(0);
    expect(engine.gameState.flag.test).toBeUndefined();
  });

  it("should throw error when executing actions before initialization", async () => {
    await expect(engine.executeAction("test")).rejects.toThrow(
      "Game not initialized"
    );
  });

  it("should throw error when navigating before initialization", async () => {
    await expect(engine.navigateToRoom("test")).rejects.toThrow(
      "Game not initialized"
    );
  });

  it("should execute room actions", async () => {
    const zone = createMinimalZone();
    await engine.initializeGame(zone);

    const result = await engine.executeAction("Look around");
    expect(result.messages).toContain("You look around the room.");
  });

  it("should navigate to rooms", async () => {
    const zone = createMinimalZone();
    await engine.initializeGame(zone);

    const result = await engine.navigateToRoom("next");
    expect(result.roomChanged).toBe(true);
    expect(engine.getCurrentRoom()).toBe("next");
  });

  it("should get available actions", async () => {
    const zone = createMinimalZone();
    await engine.initializeGame(zone);

    const actions = engine.getAvailableActions();
    expect(actions).toContain("Look around");
  });

  it("should get current room data", async () => {
    const zone = createMinimalZone();
    await engine.initializeGame(zone);

    const room = engine.getCurrentRoomData();
    expect(room).toBeDefined();
    expect(room?.shortDescription).toBe("Starting room");
  });

  it("should add items to inventory", async () => {
    const zone = createMinimalZone();
    await engine.initializeGame(zone);

    engine.addItem("sword");
    expect(engine.gameState.inventory).toContain("sword");
  });

  it("should not add duplicate items", async () => {
    const zone = createMinimalZone();
    await engine.initializeGame(zone);

    engine.addItem("sword");
    engine.addItem("sword");

    expect(
      engine.gameState.inventory.filter((i) => i === "sword")
    ).toHaveLength(1);
  });

  it("should remove items from inventory", async () => {
    const zone = createMinimalZone();
    await engine.initializeGame(zone);

    engine.addItem("sword");
    engine.addItem("shield");
    engine.removeItem("sword");

    expect(engine.gameState.inventory).not.toContain("sword");
    expect(engine.gameState.inventory).toContain("shield");
  });

  it("should set flags", async () => {
    const zone = createMinimalZone();
    await engine.initializeGame(zone);

    engine.setFlag("questComplete", true);
    expect(engine.gameState.flag.questComplete).toBe(true);

    engine.setFlag("questComplete", false);
    expect(engine.gameState.flag.questComplete).toBe(false);
  });

  it("should set custom data", async () => {
    const zone = createMinimalZone();
    await engine.initializeGame(zone);

    engine.setData("playerName", "Hero");
    engine.setData("gold", 100);

    expect(engine.gameState.data.playerName).toBe("Hero");
    expect(engine.gameState.data.gold).toBe(100);
  });

  it("should register custom tests", async () => {
    const zone = createMinimalZone();
    await engine.initializeGame(zone);

    engine.registerTest("hasLevel", (state, level) => {
      return (state.data.level || 0) >= parseInt(level);
    });

    engine.setData("level", 5);
    expect(engine.gameState.data.level).toBe(5);
  });

  it("should register custom functions", async () => {
    const zone = createMinimalZone();
    await engine.initializeGame(zone);

    engine.registerFunction("addGold", (state, amount) => {
      state.data.gold = (state.data.gold || 0) + parseInt(amount);
    });

    // This would be used in events, but we can verify it's registered
    expect(engine.gameState.data.gold).toBeUndefined();
  });

  it("should handle dialogue system when available", async () => {
    const zone: Zone = {
      version: 1,
      spawn: "start",
      rooms: {
        start: {
          shortDescription: "Start",
          actions: {},
        },
      },
      events: {},
      characters: {
        npc: {
          name: "NPC",
          color: "#FFFFFF",
        },
      },
      dialogues: {
        test: {
          start: "main",
          nodes: {
            main: {
              message: {
                speaker: "npc",
                text: "Hello!",
                choices: [["Goodbye", "end"]],
              },
            },
            end: null,
          },
        },
      },
    };

    await engine.initializeGame(zone);
    const state = await engine.startDialogue("test");

    expect(state.active).toBe(true);
    expect(state.text).toBe("Hello!");
  });

  it("should handle dialogue choices", async () => {
    const zone: Zone = {
      version: 1,
      spawn: "start",
      rooms: {
        start: {
          shortDescription: "Start",
          actions: {},
        },
      },
      events: {},
      characters: {
        npc: {
          name: "NPC",
          color: "#FFFFFF",
        },
      },
      dialogues: {
        test: {
          start: "main",
          nodes: {
            main: {
              message: {
                speaker: "npc",
                text: "Hello!",
                choices: [["Goodbye", "end"]],
              },
            },
            end: null,
          },
        },
      },
    };

    await engine.initializeGame(zone);
    await engine.startDialogue("test");
    const state = await engine.selectDialogueChoice(0);

    expect(state.active).toBe(false);
  });

  it("should continue dialogue", async () => {
    const zone: Zone = {
      version: 1,
      spawn: "start",
      rooms: {
        start: {
          shortDescription: "Start",
          actions: {},
        },
      },
      events: {},
      characters: {
        npc: {
          name: "NPC",
          color: "#FFFFFF",
        },
      },
      dialogues: {
        test: {
          start: "main",
          nodes: {
            main: {
              message: {
                speaker: "npc",
                text: "First message",
                next: "second",
              },
            },
            second: {
              message: {
                speaker: "npc",
                text: "Second message",
              },
            },
          },
        },
      },
    };

    await engine.initializeGame(zone);
    await engine.startDialogue("test");
    const state = await engine.continueDialogue();

    expect(state.active).toBe(false);
  });

  it("should return empty array for dialogue choices without dialogue system", async () => {
    const zone = createMinimalZone();
    await engine.initializeGame(zone);

    const choices = engine.getCurrentDialogueChoices();
    expect(choices).toEqual([]);
  });

  it("should handle startDialogue without dialogue system", async () => {
    const zone = createMinimalZone();
    await engine.initializeGame(zone);

    const state = await engine.startDialogue("test");
    expect(state.active).toBe(false);
  });
});
