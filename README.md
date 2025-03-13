# Shadow & Steel

A modern real-time strategy game built with React, TypeScript, and p5.js, featuring classic RTS mechanics inspired by Command & Conquer.

![Game Screenshot](https://images.unsplash.com/photo-1614107707379-283a65774553?auto=format&fit=crop&w=1200&q=80)

## Features

### Core Mechanics
- **Resource Management**: Advanced crystal harvesting system with refineries and harvesters
  - Crystal nodes with satellite resource points
  - Regenerating resources tied to node health
  - Visual connection lines between nodes and resources
  - Modern visual effects with electric sparks and glows
- **Base Building**: Classic RTS construction system with power management
  - Multiple building categories (Construction, Infantry, Vehicles, Defense)
  - Tech tree progression with building requirements
  - Power-dependent structures affecting radar and other systems
- **Unit Control**: Comprehensive unit management system
  - Group selection with drag box
  - Advanced movement commands
  - Formation control
  - Unit state visualization (health, status, cargo)
- **Combat System**: In development, with planned support for different unit types

### Technical Features
- **Modern Tech Stack**: Built with React 18, TypeScript, and p5.js
- **Efficient Rendering**: 
  - Optimized tile-based map system with viewport culling
  - Performance-optimized particle systems
  - Smart rendering based on visibility
- **Audio System**:
  - Dynamic music system with multiple tracks
  - Faction-specific themes
  - Smooth crossfading between tracks
  - Interactive jukebox with playback controls
  - Volume control and track progress
- **Component Architecture**: Clean separation of game systems and entities
  - Modern UI component system
  - Modular game systems
  - Event-driven architecture
- **Terrain System**: 
  - Procedurally generated maps with multiple terrain types
  - Advanced noise-based terrain generation
  - Multiple buildable zones
  - Decorative fauna system

### Current Systems
- **Map System**: 
  - 128x128 tile-based terrain
  - Multiple terrain zones with varying properties
  - Fauna overlay system for visual variety
  - Optimized rendering with culling
- **Camera System**: 
  - Smooth scrolling
  - Edge-based movement
  - Minimap navigation
  - Viewport tracking
- **Input System**: 
  - Multi-unit selection
  - Drag selection system
  - Right-click commands
  - Minimap interaction
- **Resource System**: 
  - Crystal fields with harvesters
  - Node-based resource generation
  - Visual connection system
  - Modern particle effects
- **Building System**: 
  - Power-dependent structures
  - Tech tree progression
  - Multiple building categories
  - Modern UI with tooltips
- **UI System**: 
  - Minimap with radar scanning
  - Modern building menu
  - Resource display
  - Options bar
  - Glass effect components
  - Music player with controls

## Project Structure

```
src/
├── game/
│   ├── Demo/              # Demo and example content
│   ├── Music/            # Game music tracks
│   │   ├── AEGIS/       # AEGIS faction music
│   │   ├── Misc/        # Miscellaneous tracks
│   │   └── Raven/       # Raven faction music
│   ├── Terrain Assets/  # Map and environment art
│   │   ├── Desert tiles zone 1/  # Primary buildable terrain
│   │   ├── Desert tiles zone 2/  # Secondary terrain
│   │   ├── Desert tiles zone 3/  # Rough terrain
│   │   ├── Fauna/              # Decorative elements
│   │   ├── Resource/          # Resource node assets
│   │   ├── Rock Terrain/     # Rock formations
│   │   └── Rocks/           # Individual rock assets
│   ├── entities/           # Game entities
│   │   ├── Building.ts    # Building entity implementation
│   │   ├── CrystalNode.ts # Resource node entity
│   │   ├── Entity.ts      # Base entity interface
│   │   ├── Harvester.ts   # Resource collector unit
│   │   ├── MCV.ts         # Mobile Construction Vehicle
│   │   ├── Resource.ts    # Resource point entity
│   │   └── Unit.ts        # Base unit implementation
│   ├── systems/           # Core game systems
│   │   ├── AudioSystem.ts    # Music and sound management
│   │   ├── InputSystem.ts    # User input handling
│   │   ├── MapSystem.ts      # Map state management
│   │   ├── MenuSystem.ts     # Game menu handling
│   │   ├── RenderSystem.ts   # Graphics rendering
│   │   ├── ResourceSystem.ts # Resource management
│   │   ├── UISystem.ts       # User interface
│   │   └── UnitSystem.ts     # Unit management
│   ├── map/               # Map generation and rendering
│   │   ├── GameMap.ts     # Main map implementation
│   │   └── Terrain.ts     # Terrain type definitions
│   ├── state/            # Game state management
│   │   └── GameState.ts  # Central game state
│   ├── utils/           # Utility classes
│   │   ├── Camera.ts    # Camera controls
│   │   ├── Particle.ts  # Particle effects
│   │   └── Vector.ts    # Vector mathematics
│   ├── factions/       # Faction definitions
│   │   └── buildings.ts # Building configurations
│   ├── config/        # Game configuration
│   │   ├── terrain.ts # Terrain assets config
│   │   └── tracks.ts  # Music track definitions
│   └── ui/           # User interface components
       ├── components/ # UI building blocks
       │   ├── BuildGrid.ts    # Building selection grid
       │   ├── BuildMenu.ts    # Construction menu
       │   ├── CategoryTabs.ts # Menu category tabs
       │   ├── OptionsBar.ts   # Bottom options bar
       │   ├── ResourcePanel.ts # Resource display
       │   └── Sidebar.ts      # Main game sidebar
       ├── utils/      # UI utilities
       │   ├── animation.ts   # Animation system
       │   ├── performance.ts # Performance optimization
       │   └── types.ts      # UI type definitions
       ├── GridSystem.ts     # Grid layout system
       ├── MinimapSystem.ts  # Minimap rendering
       ├── TooltipSystem.ts  # Tooltip management
       └── constants.ts      # UI theme constants
```

## Development Progress

### Completed Features
- [x] Basic game engine architecture
- [x] Advanced terrain generation system
- [x] Building placement system
- [x] Resource gathering mechanics
- [x] Unit movement and pathfinding
- [x] Power management system
- [x] Modern UI framework
- [x] Minimap with radar system
- [x] Resource node system
- [x] Multiple terrain zones
- [x] Fauna decoration system
- [x] Modern visual effects
- [x] Performance optimizations
- [x] Dynamic music system

### In Development
### Production Systems
- [ ] Unit Production
  - [ ] Production queue management
  - [ ] Build progress visualization
  - [ ] Unit emergence animations
  - [ ] Rally point system
  - [ ] Production cancellation
  - [ ] Resource refund system
  - [ ] Multiple queue support

### Unit Systems
- [ ] Basic Infantry
  - [ ] Riflemen squads
  - [ ] Engineers
  - [ ] Medics
  - [ ] Special forces
  - [ ] Squad formations
  - [ ] Unit veterancy

- [ ] Vehicles
  - [ ] Light vehicles (APCs, Recon)
  - [ ] Heavy tanks
  - [ ] Artillery units
  - [ ] Support vehicles
  - [ ] Aircraft integration

### Combat Systems
- [ ] Engagement Mechanics
  - [ ] Range-based combat
  - [ ] Damage types
  - [ ] Armor system
  - [ ] Line of sight
  - [ ] Fog of war

- [ ] Base Defense
  - [ ] Automated turrets
  - [ ] Defense structures
  - [ ] Base walls
  - [ ] Repair systems

### Tech Systems
- [ ] Research Tree
  - [ ] Technology prerequisites
  - [ ] Unit upgrades
  - [ ] Building upgrades
  - [ ] Special abilities

### Mission Systems
- [ ] Campaign Mode
  - [ ] Story missions
  - [ ] Mission objectives
  - [ ] Scripted events
  - [ ] Cutscene system

- [ ] Skirmish Mode
  - [ ] AI opponents
  - [ ] Random maps
  - [ ] Victory conditions
  - [ ] Difficulty levels

### Core Features
- [ ] Save/Load System
  - [ ] Game state serialization
  - [ ] Campaign progress
  - [ ] Achievement system

### Art Assets
- [ ] Terrain Assets
  - [x] Desert terrain tiles (3 zones)
  - [x] Rock formations
  - [x] Resource nodes
  - [x] Decorative fauna
  - [ ] Rock formations
  - [ ] Resource nodes
  - [ ] Decorative elements
  - [ ] Transition tiles
  - [ ] Weather effects

- [ ] Unit Assets
  - [ ] Infantry sprites
    - [ ] Rifleman
    - [ ] Engineer
    - [ ] Medic
    - [ ] Special forces
  - [ ] Vehicle sprites
    - [ ] MCV
    - [ ] Harvester
    - [ ] Tank
    - [ ] APC
    - [ ] Artillery

- [ ] Building Assets
  - [ ] Power Plant
  - [ ] Barracks
  - [ ] Factory
  - [ ] Turret
  - [ ] Radar
  - [ ] Lab
  - [ ] Refinery
  - [ ] Silo

- [ ] Effect Assets
  - [ ] Building construction
  - [ ] Unit emergence
  - [ ] Weapon effects
  - [ ] Explosions
  - [ ] Resource collection
  - [ ] Power-up effects
  - [ ] Shield effects

- [ ] UI Assets
  - [ ] Command icons
  - [ ] Status indicators
  - [ ] Resource icons
  - [ ] Menu backgrounds
  - [ ] Button states
  - [ ] Progress bars
  - [ ] Minimap elements

- [ ] Faction Themes
  - [ ] RAVEN faction
    - [ ] Unit designs
    - [ ] Building architecture
    - [ ] Color schemes
    - [ ] Faction logo
  - [ ] Future faction designs
    - [ ] Unique visual styles
    - [ ] Distinct color palettes
    - [ ] Faction-specific effects

- [ ] Multiplayer Support
  - [ ] Player synchronization
  - [ ] Network architecture
  - [ ] Lobby system
  - [ ] Match history

### Polish & Optimization
- [ ] Performance
  - [ ] Pathfinding optimization
  - [ ] Render batching
  - [ ] Asset streaming
  - [ ] Memory management
  - [ ] Sprite sheet optimization
  - [ ] Texture atlasing
  - [ ] LOD system for units

- [ ] Visual Effects
  - [ ] Combat effects
  - [ ] Building destruction
  - [ ] Weather system
  - [ ] Day/night cycle
  - [ ] Particle systems
  - [ ] Environmental effects
  - [ ] Lighting engine

- [ ] Audio
  - [ ] Positional audio
  - [ ] Unit responses
  - [ ] Ambient sounds
  - [ ] Combat effects
  - [ ] Building ambience
  - [ ] UI feedback sounds

### Quality of Life
- [ ] Advanced Controls
  - [ ] Custom keybindings
  - [ ] Control groups
  - [ ] Waypoint system
  - [ ] Command queuing
  - [ ] Visual feedback
  - [ ] Command previews

- [ ] UI Improvements
  - [ ] Unit status panels
  - [ ] Advanced tooltips
  - [ ] Context menus
  - [ ] Strategic zoom
  - [ ] Build previews
  - [ ] Range indicators
  - [ ] Path visualization

## Getting Started

### Prerequisites

Before running the project, ensure you have:
- Node.js 18.0.0 or higher
- npm 9.0.0 or higher

### Dependencies
The project uses the following core dependencies:
- React 18.3.1 - Modern UI framework
- p5.js 1.9.1 - Creative coding library for graphics and interaction
- TypeScript 5.5.3 - Type safety and modern JavaScript features
- Vite 5.4.2 - Fast development server and build tool
- Lucide React 0.344.0 - Modern icon library

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Tools
The project includes:
- ESLint 9.9.1 - Code linting and style enforcement
- TypeScript ESLint 8.3.0 - TypeScript-specific linting
- Tailwind CSS 3.4.1 - Utility-first CSS framework
- Autoprefixer 10.4.18 - CSS vendor prefix automation
- PostCSS 8.4.35 - CSS transformation tool

## Controls

### Basic Controls
- **Selection**
  - Left Click: Select unit/building
  - Shift + Click: Add to selection
  - Left Click + Drag: Selection box
  - Double Click: Select all units of type

- **Movement**
  - Right Click: Move selected units
  - Right Click + Drag: Alternative camera
  - Alt + Click: Attack move
  - Ctrl + Click: Force attack

### Keyboard Commands
- **Unit Control**
  - H: Halt units
  - B: Deploy/undeploy MCV
  - G: Guard position
  - A: Attack move
  - S: Stop action
  - F: Formation mode

- **Camera Control**
  - WASD/Arrow Keys: Move camera
  - Q/E: Rotate camera
  - Space: Center on selection
  - Tab: Cycle through units

- **Production**
  - 1-0: Control groups
  - R: Repeat last build
  - Shift + Click: Queue multiple

- **Interface**
  - ESC: Menu/Jukebox
  - F10: Game options
  - F12: Screenshot
  - Alt + Enter: Toggle fullscreen

### Music Controls
- Open jukebox with ESC menu
- Play/pause current track
- Skip between tracks
- Toggle repeat and shuffle modes
- Adjust volume
- Track progress bar with seeking

### Building
- Click building in sidebar to select
- Click on map to place
- Right-click to cancel placement
- Buildings require power and prerequisites

### Resource Gathering
- Build Refinery near crystal fields
- Harvesters automatically collect resources
- Resources regenerate over time when depleted
- Crystal nodes power nearby resource points

## Contributing

This project is currently in active development. Feel free to open issues for bugs or feature requests.

## License

MIT License - See LICENSE file for details