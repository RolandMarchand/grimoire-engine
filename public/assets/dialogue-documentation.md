# Dialogue System Configuration Reference

This document describes the dialogue system for the text RPG game engine.

## Top-Level Structure

| Property     | Type                      | Description                                 |
|--------------|---------------------------|---------------------------------------------|
| `characters` | Record<string, Character> | Character definitions for dialogue speakers |
| `dialogues`  | Record<string, Dialogue>  | Named dialogue trees                        |

## Characters

Characters define speakers that can be referenced in dialogue nodes.

| Property | Type   | Description                                         |
|----------|--------|-----------------------------------------------------|
| `name`   | string | Display name of the character                       |
| `color`  | string | Hex color code for character text (e.g., "#9b59b6") |

```yaml
characters:
  wizard:
    name: "Aldric"
    color: "#9b59b6"

  player:
    name: "Traveler"
    color: "#3498db"
```

## Dialogues

Each dialogue is a branching conversation tree with multiple nodes.

| Property | Type                         | Description                                |
|----------|------------------------------|--------------------------------------------|
| `start`  | string                       | Node ID where the dialogue begins          |
| `nodes`  | Record<string, DialogueNode> | Named nodes that make up the dialogue tree |

### Dialogue Nodes

Nodes are the building blocks of dialogue. Each node has exactly **one** of the following types:

- `message` - Display text with optional player choices
- `branch` - Conditional branching based on game state
- `sequence` - Execute multiple dialogue steps in order
- `events` - Execute event chains
- `wait` - Pause for a duration
- `null` - Exit the dialogue

## Node Types

### Message Node

Displays dialogue text with optional player response choices.

| Property  | Type          | Description                               |
|-----------|---------------|-------------------------------------------|
| `speaker` | string        | Character ID from the `characters` map    |
| `text`    | string        | Dialogue text (supports markup)           |
| `choices` | Array<Choice> | Optional player response options          |
| `next`    | string        | Optional next node if no choices provided |

**Choice Formats:**

Full object form:
```yaml
choices:
  - text: "Choice text shown to player"
    next: nodeId           # Next node to visit
    condition: functionName # Optional TS function returning boolean
    else: fallbackNodeId   # Optional node if condition fails
    events: anEvent        # Optional events to run on selection
```

Shorthand array form `[text, next]`:
```yaml
choices:
  - ["Simple choice", nextNode]
  - ["Conditional choice", nextNode]
```

**Example:**
```yaml
greeting:
  message:
    speaker: wizard
    text: "[i]Well, well...[/i] A visitor!"
    choices:
      - ["Who are you?", introduction]
      - ["I need help", helpCheck]
      - ["Goodbye", farewell]
```

### Branch Node

Routes to different nodes based on a condition.

| Property    | Type                                   | Description                                                                    |
|-------------|----------------------------------------|--------------------------------------------------------------------------------|
| `condition` | Record<string, Array<string> or string | TypeScript function name returning boolean (same as callFunctions from events) |
| `true`      | string                                 | Dialogue node ID to visit if condition is true                                 |
| `false`     | string                                 | Dialogue node ID to visit if condition is false                                |

**Example:**
```yaml
helpCheck:
  branch:
    condition: hasSpellbook
    true: magicHelp
    false: noSpellbook
```

### Sequence Node

Executes a dialogue node chain.

| Property   | Type              | Description                                     |
|------------|-------------------|-------------------------------------------------|
| `sequence` | DialogueNodeChain | Array of dialogue nodes to execute sequentially |

Sequences can include `message`, `events`, `wait`, or any other dialogue node type.

**Note:** when branching, the dialogue should go back to the sequence except if `null` is hit.

**Example:**
```yaml
bookOffer:
  sequence:
    - message:
        speaker: wizard
        text: "Take this spellbook. Use it wisely."

    - events:
        callFunctions:
          addItem: ["spellBook"]

    - wait: 1

    - message:
        speaker: wizard
        text: "Now go, practice your craft!"
        choices:
          - ["Thank you!", farewell]
    - null # Completely end the dialogue
```

### Wait Node

Pauses dialogue execution for a specified duration.

| Property | Type   | Description                                         |
|----------|--------|-----------------------------------------------------|
| `wait`   | number | Duration in seconds                                 |
| `next`   | string | Optional next node or sequence after wait completes |

**Example:**
```yaml
dramaticPause:
  wait: 2.5
  next: nextNode
```

### Exit Node

Ends the dialogue and returns to normal gameplay.

```yaml
# Note: "exit" is the name of the node
exit: null
```

## Text Markup

Dialogue text supports markup tags for formatting and display effects:

| Tag                       | Description  | Example                         |
|---------------------------|--------------|---------------------------------|
| `[i]...[/i]`              | Italic text  | `[i]whispers[/i]`               |
| `[b]...[/b]`              | Bold text    | `[b]Important![/b]`             |
| `[color=#hex]...[/color]` | Colored text | `[color=#ff0000]danger[/color]` |

Etc.

Use a BBCode library like JiLiZART/bbob.

## Triggering Dialogues

### From Room Actions

```yaml
rooms:
  cottage:
    actions:
      "Talk to wizard":
        dialogue: wizardMeeting  # Start at 'start' node

      "Ask about the garden":
        dialogue: wizardMeeting.gardenPath  # Jump to specific node
```

### From Events

```yaml
events:
  meetWizard:
    dialogue: wizardMeeting

  continueConversation:
    dialogue: wizardMeeting.gardenPath
```

## Complete Example

```yaml
version: 1

characters:
  wizard:
    name: "Aldric"
    color: "#9b59b6"

  player:
    name: "Traveler"
    color: "#3498db"

dialogues:
  wizardMeeting:
    start: greeting
    nodes:
      greeting:
        message:
          speaker: wizard
          text: "[i]Well, well...[/i] A visitor!"
          choices:
            - ["Who are you?", introduction]
            - ["I need help", helpCheck]
            - ["Goodbye", farewell]

      helpCheck:
        branch:
          condition: hasSpellbook
          true: magicHelp
          false: noSpellbook

      introduction:
        sequence:
          - message:
              speaker: wizard
              text: "I am Aldric the Ancient."

          - events:
              callFunctions:
                playSound: ["wizard_laugh"]

          - message:
              speaker: wizard
              text: "What brings you here?"
              choices:
                - text: "The garden"
                  next: gardenPath
                  events:
                    callFunctions:
                      setAskedAboutGarden: [true]

                - ["Magic training", magicHelp]
                - ["Nothing", greeting]

      gardenPath:
        message:
          speaker: wizard
          text: "Ah, the garden holds secrets..."
          choices:
            - text: "Tell me more"
              next: gardenDetails
              condition: getAskedAboutGarden
              else: notYet

            - ["Maybe later", greeting]

      notYet:
        message:
          speaker: wizard
          text: "Perhaps when we know each other better."
          choices:
            - ["Okay", greeting]

      magicHelp:
        message:
          speaker: wizard
          text: "Magic requires dedication and the right tools."
          choices:
            - ["What tools?", bookOffer]
            - ["I understand", greeting]

      bookOffer:
        sequence:
          - message:
              speaker: wizard
              text: "Take this spellbook. Use it wisely."

          - events:
              callFunctions:
                addItem: ["spellBook"]

          - wait: 1

          - message:
              speaker: wizard
              text: "Now go, practice your craft!"
              choices:
                - ["Thank you!", farewell]

      farewell:
        message:
          speaker: player
          text: "Goodbye, Aldric."
          next: exit

      exit: null

rooms:
  cottage:
    actions:
      "Talk to wizard":
        dialogue: wizardMeeting
```
