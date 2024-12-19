# Untitled RPG Game Design Document

## Overview
This document outlines the core gameplay mechanics, systems, and design principles for an RPG focused on moral choices, exploration, and tactical combat.

## Core Game Loop

### 1. Quest Phase
Each game loop begins with a moral dilemma presented to the player. These dilemmas, similar to the Trolley Problem, have no objectively correct answers. During this phase:
- Players learn about relevant characters and context
- The environment provides crucial background information
- Some quests are mandatory for progression, while others remain optional

### 2. Exploration Phase
Players explore the environment to:
- Discover potential solutions through items, characters, or knowledge
- Experience vivid, unique scenes that provide intrinsic rewards
- Uncover branching quests that affect their playthrough
- Access new rooms and zones as they progress

During exploration, players:
- Encounter enemies that engage the combat system
- Manage resources that deplete through combat
- Discover secrets that enhance engagement
- Navigate survival elements that raise exploration stakes

### 3. Consequence Phase
After resolving each dilemma, players experience:
- Emotional payoff through narrative consequences
- World modifications that affect:
  - Quest availability and status
  - Environmental changes
  - Access to new areas
- Character progression through:
  - Item acquisition
  - Stat improvements
  - Environmental benefits

## Save System

### Permanent Saves
- Available after completing major quests
- Accessible from any point in the game
- Created automatically after character creation

### Quick Saves
- Single slot system
- Only created when using "quit and save"
- Lost when loading a permanent save
- Cannot be loaded after death
- Discourages decision reversal

## Combat System

### Core Mechanics
Combat is turn-based and exclusively 1v1, featuring:

#### Attack Phase
- Single round resolution
- Victory requires higher attack points than opponent
- Stats composing attack points are consumed until the opponent's death in this order:
  1. Damaging items
  2. 1/3 of remaining weapon durability
  3. Grit
  4. Health
- Health is restored to pre-attack levels after victory
- Grit is fully restored after victory
- Weapon durability is not restored
- Grape seeds provide revival option with:
  - Full health restoration
  - Unlimited usage per fight

#### Inspection Phase
- Enemy stats begin hidden
- Initial inspection:
  - Reveals enemy information
  - Risks minor damage
  - Includes dodge chance
- Subsequent inspections:
  - Free action
  - No turn cost
  - Encourages tactical planning

#### Item Usage
- Checkbox system for item selection
- Multiple items allowed per turn
- Consumable items destroyed after combat
- Non-consumable items retained
- Situational effectiveness rules
- Overkill prevention system

#### Escape Mechanics
- Success based on dice roll
- Higher success rate at low health
- Special items can aid escape
- Failed attempts risk damage

#### Dodging
- Not an option during combat
- Has a chance to occur upon taking damage
- While attacking, negates 1/3 of the opponent's attack points
- While inspecting or escaping, negates all damage
- Dodge chance improves with:
  - Lower health
  - Equipment bonuses
  - Item bonuses

## Item System
- Persistent short descriptions
- Long descriptions inform of stats and usage
- Long descriptions hidden until revealed through:
  - Active use
  - NPC dialogue
  - Environmental discovery
- Dynamic stat display based on player knowledge