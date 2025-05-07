# TODO
- Complete story ending for Librarians
- Complete story ending for Cinderwoods
- Complete story ending for Pariahs
- Expand on weapon classes
- Expand on moral dilemmas
- Expand on map and environments
- Expand on NPC personalities and stories

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

#### Attack
- Single round resolution
- Victory requires higher attack points than opponent
- Stats composing attack points are consumed until the opponent's death in this order:
  1. Damaging items
  2. 1/3 of remaining weapon durability
  3. Grit
  4. Health & armor
- 1/2 of the lost health is restored after victory
- Grit is fully restored after victory
- 1/9 of remaining weapon durability is consumed
- Weapon and armor durability are not restored
- If the player owns a grape seed, it will be consumed upon death during combat and the player will be revived out of combat
- Armor transfers a percentage of health damage to armor durability

#### Inspect
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
- Up to 4 items allowed
- Consumable items destroyed after combat
- Non-consumable items retained

#### Escape
- Success based on dice roll
- Higher success rate at low health
- Special items can aid escape
- Failed attempts risk damage
- Not immediately leaving the room or re-entering it will cause the fight to reoccur

#### Dodge
- Not an option during combat
- Has a chance to occur upon taking damage
- While attacking, negates 4/5 of the opponent's attack points
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

## Endings

### Death
- Achieved after dying in battle or by a trap
- Shortest ending
- Encourages a retry from the previous save or from the beginning

### Neutral
- Achieved after failing at least one main quest and completing another
- Main quests are failed by not following the moral framework of the followed faction
- Punished by the factions with failed main quests
- Made a scapegoat out of the faction with a completed main quest

### Bad
- Achieved after failing every main quest
- The player was extremely morally inconsistent
- Express existential dread and eternal punishment

### Rosevine
- Achieved after succeeding the main Rosevine quest
- Requires no failed main quests
- The Rosevines have a seemingly positive heritage and moral code, but the sect was built upon a lie. You discover that the original monk who transcribed the founding figure's beliefs omitted a crucial fact: the founder was a blasphemous dragon, immortal, and fundamentally different from all other beings. The monk adapted the founder's teachings to suit mortal beings but never practiced them himself. To conceal the inconsistencies in the teachings, he allowed the sect to evolve over time. In the present day, the sect is healthy and morally upright. They hold the belief that all truths are good and all lies are evil, so if you choose to remain silent, you'll betray your own faith, failing the quest. But if you reveal the truth about your findings, you will face severe punishment and be branded a liar, continuing the quest. This will provoke Moon Blackthorn, Lord of Thorns, to challenge you in a competitive ritual. During this ritual, you will lose all four limbs, have your tongue cut out, and be blinded and deafened. You'll then be placed in a sealed wooden box in a dark basement until your natural death. Since murder is forbidden within the sect, you will be kept alive with food and water. Thirty years later, after descending into madness, you will overhear a guard during feeding time mention that your ideas are finally gaining traction. End of the playthrough.

#### True Rosevine
- Same as Rosevine ending
- Requires choosing the Rosevine class
- Bonus Rosevine lore

### Cinderwood
- Achieved after succeeding the main Cinderwood quest
- Requires no failed main quests

#### True Cinderwood
- Same as Cinderwood ending
- Requires choosing the Cinderwood class
- Bonus Cinderwood lore

### Librarian
- Achieved after succeeding the main Librarian quest
- Requires no failed main quests

#### True Librarian
- Same as Librarian ending
- Requires choosing the Librarian class
- Bonus Librarian lore

### Exaltation
- Achieved after finishing the game with no quest rewards
- "The only winning move is not to play"
- No permanent save allowed
- Hardest ending
- Meet a Prime Being of your choice

#### True Exaltation
- Same as Exaltation ending
- Requires choosing the Pariah class
- Bonus Pariah lore

## Classes

- The player chooses a starting class at the beginning of the game
- Class doesn't force a main quest onto the player
- But following the class's respective main quest grants a special ending

### Rosevine
- Religious flagellant following the teachings of the Rosevines
- Analog to the mage in classic RPGs
- Focus on quests and survivability
- High health
- High grit
- Starts with rags and flail
- 3/4 of the lost health is restored after victory instead of 1/2

### Cinderwood
- Zealot warrior holding unquestionable loyalty to to the Warlord of Cinderwood
- Analog to the fighter in classic RPGs
- Focus on combat, improving armory and maintaining equipment
- High health
- Low grit
- Starts with armor and spear
- All armor doubles blocked damage and durability

### Librarian
- Knowledge bounty hunter contracted by the Great Library
- Analog to the thief in classic RPGs
- Focus on item use and exploration
- Low health
- Low grit
- Starts with coat, pen, and lockpick
- Items have 1/3 chance of not being consumed upon usage
- Max 5 items used instead of four

## Pariah
- Excommunicated reject of their home state
- Analog to the peasant or depraved in classic RPGs
- Focus on freedom of build and game knowledge
- Low health
- Low grit
- No starting equipment
- No special skill

## Development Phases

### Core Engine (Sprint 1)
- Setup Vue 3 project with Composition API
- Basic routing system
- State management (reactive singleton)
- Save/load system using localStorage

### Story Engine (Sprint 2)
- Story node parser
- Choice system
- Condition checking (requirements/consequences)
- Basic inventory system

### Game Mechanics (Sprint 3)
- Time management
- Resource management (money, items)
- Character stats
- Location system

### Content Management (Sprint 4)
- Story data structure
- Event system
- Relationship system
- Achievement system

### UI/UX (Sprint 5)
- Text display component
- Choice buttons
- Inventory interface
- Stats display
- Map component
- Save/load interface
