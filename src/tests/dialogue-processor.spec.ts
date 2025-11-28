import { describe, it, expect, beforeEach } from "vitest";
import { DialogueProcessor } from "../core/dialogue-processor";
import { ConditionChecker } from "../core/condition-checker";
import { FunctionRegistry } from "../core/function-registry";
import { EventProcessor } from "../core/event-processor";
import type { GameState, Zone, Dialogue, Character } from "../core/game-types";

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
      actions: {},
    },
  },
  events: {},
});

describe("DialogueProcessor", () => {
  let gameState: GameState;
  let dialogues: Record<string, Dialogue>;
  let characters: Record<string, Character>;
  let conditionChecker: ConditionChecker;
  let functionRegistry: FunctionRegistry;
  let zone: Zone;
  let eventProcessor: EventProcessor;
  let dialogueProcessor: DialogueProcessor;

  beforeEach(() => {
    gameState = createGameState();
    zone = createMinimalZone();

    characters = {
      merchant: {
        name: "Merchant",
        color: "#FFD700",
      },
      guard: {
        name: "Guard",
        color: "#808080",
      },
    };

    dialogues = {
      greeting: {
        start: "welcome",
        nodes: {
          welcome: {
            message: {
              speaker: "merchant",
              text: "Welcome to my shop!",
              choices: [
                ["Buy item", "buy"],
                ["Leave", "goodbye"],
              ],
            },
          },
          buy: {
            message: {
              speaker: "merchant",
              text: "That will be 50 gold.",
              next: "goodbye",
            },
          },
          goodbye: {
            message: {
              speaker: "merchant",
              text: "Come back soon!",
            },
          },
        },
      },
    };

    conditionChecker = new ConditionChecker(gameState);
    functionRegistry = new FunctionRegistry(gameState);
    eventProcessor = new EventProcessor(
      gameState,
      zone,
      conditionChecker,
      functionRegistry
    );
    dialogueProcessor = new DialogueProcessor(
      gameState,
      dialogues,
      characters,
      conditionChecker,
      eventProcessor
    );
  });

  it("should start a dialogue", async () => {
    const state = await dialogueProcessor.startDialogue("greeting");

    expect(state.active).toBe(true);
    expect(state.speaker?.name).toBe("Merchant");
    expect(state.text).toBe("Welcome to my shop!");
    expect(state.choices).toHaveLength(2);
  });

  it("should handle dialogue with simple choices", async () => {
    await dialogueProcessor.startDialogue("greeting");
    const state = await dialogueProcessor.selectChoice(0);

    expect(state.active).toBe(true);
    expect(state.text).toBe("That will be 50 gold.");
  });

  it("should continue dialogue without choices", async () => {
    await dialogueProcessor.startDialogue("greeting");
    await dialogueProcessor.selectChoice(0);

    const state = await dialogueProcessor.continueDialogue();

    // Dialogue ends after showing final message without next or choices
    expect(state.active).toBe(false);
  });

  it("should handle conditional choices", async () => {
    dialogues.conditional = {
      start: "check",
      nodes: {
        check: {
          message: {
            speaker: "guard",
            text: "What do you want?",
            choices: [
              {
                text: "Use key",
                next: "success",
                condition: "hasItem",
                else: "nokey", // This causes immediate redirect when condition fails
              },
              ["Leave", "end"],
            ],
          },
        },
        success: {
          message: {
            speaker: "guard",
            text: "You may pass.",
          },
        },
        nokey: {
          message: {
            speaker: "guard",
            text: "You need a key!",
          },
        },
        end: null,
      },
    };

    dialogueProcessor.updateData(dialogues, characters);

    // Without key - the conditional choice should redirect to nokey node
    let state = await dialogueProcessor.startDialogue("conditional");

    // Since condition fails and there's an else branch, we get redirected to nokey
    expect(state.text).toBe("You need a key!");
    expect(state.choices).toBeUndefined(); // No choices shown due to redirect
  });

  it("should handle branch nodes", async () => {
    dialogues.branching = {
      start: "check",
      nodes: {
        check: {
          branch: {
            condition: "hasItem",
            true: "haskey",
            false: "nokey",
          },
        },
        haskey: {
          message: {
            speaker: "guard",
            text: "You have a key!",
          },
        },
        nokey: {
          message: {
            speaker: "guard",
            text: "No key found.",
          },
        },
      },
    };

    dialogueProcessor.updateData(dialogues, characters);
    const state = await dialogueProcessor.startDialogue("branching");

    expect(state.text).toBe("No key found.");
  });

  it("should handle sequence nodes", async () => {
    dialogues.sequence = {
      start: "seq",
      nodes: {
        seq: {
          sequence: [
            {
              message: {
                speaker: "merchant",
                text: "First message",
              },
            },
            {
              message: {
                speaker: "merchant",
                text: "Second message",
              },
            },
          ],
        },
      },
    };

    dialogueProcessor.updateData(dialogues, characters);
    let state = await dialogueProcessor.startDialogue("sequence");

    expect(state.text).toBe("First message");
  });

  it("should handle event nodes", async () => {
    dialogues.withEvents = {
      start: "events",
      nodes: {
        events: {
          events: {
            callFunctions: {
              addItem: ["reward"],
            },
          },
          next: "after",
        },
        after: {
          message: {
            speaker: "merchant",
            text: "Here is your reward!",
          },
        },
      },
    };

    dialogueProcessor.updateData(dialogues, characters);
    const state = await dialogueProcessor.startDialogue("withEvents");

    expect(gameState.inventory).toContain("reward");
    expect(state.text).toBe("Here is your reward!");
  });

  it("should handle choice events", async () => {
    dialogues.choiceEvents = {
      start: "main",
      nodes: {
        main: {
          message: {
            speaker: "merchant",
            text: "Choose wisely.",
            choices: [
              {
                text: "Take gold",
                next: "end",
                events: {
                  callFunctions: {
                    addItem: ["gold"],
                  },
                },
              },
            ],
          },
        },
        end: null,
      },
    };

    dialogueProcessor.updateData(dialogues, characters);
    await dialogueProcessor.startDialogue("choiceEvents");
    await dialogueProcessor.selectChoice(0);

    expect(gameState.inventory).toContain("gold");
  });

  it("should parse dialogue references with node", async () => {
    const state = await dialogueProcessor.startDialogue("greeting.buy");
    expect(state.text).toBe("That will be 50 gold.");
  });

  it("should handle missing dialogue gracefully", async () => {
    const state = await dialogueProcessor.startDialogue("nonexistent");
    expect(state.active).toBe(false);
  });

  it("should handle invalid choice selection", async () => {
    await dialogueProcessor.startDialogue("greeting");
    const state = await dialogueProcessor.selectChoice(999);

    expect(state.active).toBe(false);
  });

  it("should return current choices data", async () => {
    await dialogueProcessor.startDialogue("greeting");
    const choices = dialogueProcessor.getCurrentChoicesData();

    expect(choices).toHaveLength(2);
    expect(Array.isArray(choices[0])).toBe(true);
  });

  it("should handle null nodes", async () => {
    dialogues.ending = {
      start: "final",
      nodes: {
        final: {
          message: {
            speaker: "merchant",
            text: "Goodbye!",
            next: "end",
          },
        },
        end: null,
      },
    };

    dialogueProcessor.updateData(dialogues, characters);
    await dialogueProcessor.startDialogue("ending");
    const state = await dialogueProcessor.continueDialogue();

    expect(state.active).toBe(false);
  });
});
