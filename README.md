# Shadow & Steel

A modern real-time strategy game built with React, TypeScript, and p5.js, featuring classic RTS mechanics inspired by Command & Conquer.

![Game Screenshot](https://github.com/Lex-au/Shadow-Steel/blob/main/src/game/Demo/Prototype%20Build.png)

## Features

### Core Mechanics
- **Resource Management**: Crystal harvesting system with refineries and harvesters
- **Base Building**: Classic RTS construction system with power management
- **Unit Control**: Group selection, movement commands, and formation control
- **Combat System**: In development, with planned support for different unit types

### Technical Features
- **Modern Tech Stack**: Built with React 18, TypeScript, and p5.js
- **Efficient Rendering**: Optimized tile-based map system with viewport culling
- **Component Architecture**: Clean separation of game systems and entities
- **Terrain System**: Procedurally generated maps with multiple terrain types

### Current Systems
- **Map System**: 128x128 tile-based terrain with procedural generation
- **Camera System**: Smooth scrolling and edge-based movement
- **Input System**: Multi-unit selection, right-click commands
- **Resource System**: Crystal fields with harvesters and refineries
- **Building System**: Power-dependent structures with tech tree progression
- **UI System**: Minimap, building menu, and resource display

## Project Structure

```
src/
├── game/
│   ├── entities/     # Game entities (units, buildings)
│   ├── systems/      # Core game systems
│   ├── map/          # Map generation and rendering
│   ├── state/        # Game state management
│   ├── utils/        # Utility classes and helpers
│   └── factions/     # Faction-specific definitions
```

## Development Progress

- [x] Basic game engine architecture
- [x] Terrain generation and rendering
- [x] Building placement system
- [x] Resource gathering mechanics
- [x] Unit movement and pathfinding
- [x] Power management system
- [x] UI framework and building menu
- [ ] Combat system
- [ ] Multiplayer support
- [ ] Save/Load system
- [ ] Campaign missions

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Controls

- **Left Click**: Select units/buildings
- **Right Click**: Move selected units
- **Shift + Click**: Add to selection
- **H**: Halt selected units
- **B**: Deploy/undeploy MCV
- **WASD/Arrow Keys**: Move camera
- **Right Click + Drag**: Alternative camera movement

## Contributing

This project is currently in active development. Feel free to open issues for bugs or feature requests.

## License

MIT License - See LICENSE file for details