import { describe, it, expect, beforeEach } from "vitest";
import { ConditionChecker } from "../core/condition-checker";
import type { GameState } from "../core/game-types";

const createGameState = (): GameState => ({
  currentRoom: "start",
  flag: {},
  inventory: [],
  data: {},
});

describe("ConditionChecker", () => {
  let gameState: GameState;
  let checker: ConditionChecker;

  beforeEach(() => {
    gameState = createGameState();
    checker = new ConditionChecker(gameState);
  });

  it("should check if player has an item", async () => {
    gameState.inventory.push("key");

    const hasKey = await checker.evaluateCheck({
      test: "hasItem",
      arguments: ["key"],
    });
    expect(hasKey).toBe(true);

    const hasSword = await checker.evaluateCheck({
      test: "hasItem",
      arguments: ["sword"],
    });
    expect(hasSword).toBe(false);
  });

  it("should check if a flag is set", async () => {
    gameState.flag["doorUnlocked"] = true;

    const flagSet = await checker.evaluateCheck({
      test: "hasFlag",
      arguments: ["doorUnlocked"],
    });
    expect(flagSet).toBe(true);

    const enemyFlag = await checker.evaluateCheck({
      test: "hasFlag",
      arguments: ["enemyDefeated"],
    });
    expect(enemyFlag).toBe(false);
  });

  it("should register and use custom test functions", async () => {
    checker.registerTest("hasGold", (state, amount) => {
      const goldAmount = parseInt(amount);
      return (state.data.gold || 0) >= goldAmount;
    });

    gameState.data.gold = 100;

    const hasEnoughGold = await checker.evaluateCheck({
      test: "hasGold",
      arguments: ["50"],
    });
    expect(hasEnoughGold).toBe(true);

    const hasTooMuchGold = await checker.evaluateCheck({
      test: "hasGold",
      arguments: ["150"],
    });
    expect(hasTooMuchGold).toBe(false);
  });

  it("should return false for unknown test functions", async () => {
    const result = await checker.evaluateCheck({
      test: "unknownTest",
      arguments: [],
    });
    expect(result).toBe(false);
  });

  it("should handle test function errors gracefully", async () => {
    checker.registerTest("errorTest", () => {
      throw new Error("Test error");
    });

    const result = await checker.evaluateCheck({
      test: "errorTest",
      arguments: [],
    });
    expect(result).toBe(false);
  });
});
