# Data Structures

### Questions

- Where's Queue?

Just use an array.

```lua
local Queue = {1, 2, 3}
local Popped = table.remove(Queue, 1)
```

- Where's Stack?

Just use an array.

```lua
local Stack = {1, 2, 3}
local Popped = table.remove(Stack)
```

- Where's LinkedList?

Just use an array.

- Where's ArrayList?

Just use an array.

TLDR: I removed some of the more list-like data structures because it's far more efficient in Luau to use an array. You don't
need to have some overcomplicated data structure to use as an array.