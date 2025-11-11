# Text RPG Game Configuration Reference

This document describes the YAML configuration format for a data-driven text RPG game.

## Top-Level Structure

| Property | Type | Description |
|----------|------|-------------|
| `spawn` | string | Name of the room the player will start the game in |
| `rooms` | Record<string, Room> | Names and definitions of all the rooms |
| `events` | Record<string, Room> | Names and definitions of all the events |
| `version` | number | Version of the game API |

## Version

Contains the current game API version number.

No future version of the API is planned, but this field remains for future compatibility.

## Rooms

Each room in the `rooms` map is defined by the following properties:

>**Note:** Each room identifier must be unique.

| Property | Type | Description |
|----------|------|-------------|
| `shortDescription` | string | Brief 1-2 sentence description shown in room listings |
| `longDescription` | string | Detailed description shown when examining the room |
| `onEntry` | EventChain | Events triggered when entering the room |
| `onExit` | EventChain | Events triggered when leaving the room |
| `actions` | Record<string, EventChain> | Available actions in this room |

### Actions
The `actions` map defines interactive options available to the player:
- Key: Text shown to the player in the action menu
- Value: Either an event name or an anonymous event definition

```yaml
actions:
  "Open the chest": "chestEvent"
  "Look around":
    print: "You see nothing unusual."
```

## Events

Events in the `events` map define game behaviors and can contain:

| Property | Type | Description |
|----------|------|-------------|
| `print` | string | Text to display to the player |
| `chain` | Eventchain | Sequence of events to trigger after completion |
| `go` | string | Room name to move the player to |
| `check` | CheckConfig | Conditional test before running the event |
| `updateRooms` | Record<string, Room> | Room modifications to apply |
| `callFunctions` | Record<string, Array<string> or string | TypeScript functions to call paired with their optional string arguments |

### Check Configuration

The `check` property allows conditional event execution. If the check fails, the event won't occur, but instead the optional `failed` event will occur.

| Property | Type | Description |
|----------|------|-------------|
| `test` | string | TypeScript test function returning a boolean |
| `arguments` | Array<string> | Arguments to the test function |
| `failed` | EventChain | Events triggered instead in case of test failure |

### Room Updates

When modifying a room's properties in an event, you can selectively update specific fields while leaving others unchanged. The system uses a partial update approach, meaning only the fields you explicitly specify will be modified. Fields can be deleted by setting them to `null`.

```yaml
updateRooms:
  "roomName":
    shortDescription: "New description"
    actions:
      "New Action": "newEvent" # add or replace new events
      "Remove Action": null    # null removes existing actions
```

### Event Chains

Outside of event definitions, different syntaxes for events are supported
according to type `Array<string | Event> | string | Event`:
- Event name
- Anonymous event
- List of event names or anonymous events

```yaml
rooms:
  "mainRoom":
    onEntry: "actionName"  # event name
    onExit:                # anonymous event
      print: "action!"
    actions:
      "My action":          # event list
        - "actionName"      # event name
        - print: "action!"  # anonymous event
```

## Dialogue



## Best Practices

1. Use descriptive room and event names for maintainability
2. Keep `shortDescription` concise and `longDectription` detailed
3. Use anonymous events sparingly - named events are easier to maintain
4. Document custom TypeScript test functions separately
5. Consider event chains carefully to avoid infinite loops

## Examples

```yaml
version: 1

spawn: entrance

rooms:
  entrance:
    shortDescription: "A dimly lit cave entrance"
    longDescription: "Cool air flows from the dark passage ahead..."
    actions:
      "Enter cave": "enterCave"
      "Examine walls":
        print: "The walls are rough limestone"

events:
  enterCave:
    check:
      test: hasLight
      failed:
        print: "It's too dark to proceed safely"
    print: "You venture into the cave"
    go: "caveInterior"
```

```yaml
version: 1

spawn: cottage

rooms:
  cottage:
    shortDescription: "A cozy stone cottage with a wooden door"
    longDescription: "This small cottage has a thatched roof and warm fireplace. A sturdy wooden door leads outside to the garden."
    actions:
      "Check fireplace":
        print: "The fire crackles warmly, keeping the cottage cozy"
      "Exit to garden": "goToGarden"
      "Look at mysterious book": "examineBook"

  garden:
    shortDescription: "An overgrown garden with stone walls"
    longDescription: "Wild roses climb the ancient stone walls. A mysterious archway stands among the tangled vines, and a path leads back to the cottage."
    onEntry: "gardenArrival"
    actions:
      "Examine archway": "checkArchway"
      "Return inside": "returnToCottage"
      "Pick roses":
        check:
          test: hasGloves
          failed:
            print: "The thorns look too sharp to handle safely"
        print: "You carefully gather a bouquet of wild roses"

events:
  goToGarden:
    print: "You step outside into the sunlit garden"
    go: "garden"

  returnToCottage:
    print: "You head back into the warm cottage"
    go: "cottage"

  gardenArrival:
    print: "A gentle breeze carries the scent of roses"

  examineBook:
    print: "You find an ancient spellbook covered in mysterious runes"
    chain:
      - print: "As you open it, some pages glow faintly"
      - updateRooms:
          garden:
            actions:
              "Cast spell": "castMagic"

  checkArchway:
    check:
      test: hasSpellbook
      failed:
        print: "The archway seems dormant"
    print: "The archway hums with magical energy"
    chain:
      - print: "Perhaps the right spell could activate it..."
```
