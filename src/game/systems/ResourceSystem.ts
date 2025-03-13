import { GameState } from '../state/GameState';
import { Vector } from '../utils/Vector';
import { Resource } from '../entities/Resource';
import { CrystalNode } from '../entities/CrystalNode';

const RESOURCE_CONFIG = {
  NODES_PER_MAP: 2, // Reduced to 1 near spawn + 1 far node
  CRYSTALS_PER_NODE: 8,
  INITIAL_SPAWN_RADIUS: 300, // Increased distance for first node
  FAR_SPAWN_RADIUS: 600, // Increased distance for far nodes
  MIN_SPACING: 100, // Minimum distance between resources
};

export class ResourceSystem {
  private nodes: CrystalNode[] = [];

  constructor(private gameState: GameState) {
    // Store nodes in game state
    this.gameState.nodes = this.nodes;
    // Initialize resources
    this.spawnInitialResources();
  }

  public update(): void {
    // Update nodes and their crystals
    this.gameState.nodes.forEach(node => node.update());
    this.gameState.resources.forEach(resource => {
      resource.update();
    });
  }

  private spawnInitialResources(): void {
    // Spawn one node near the player's MCV
    if (this.gameState.mcv) {
      let spawnSuccess = false;
      const mcvPos = this.gameState.mcv.position;
      
      // Try multiple angles to ensure we find a valid spot
      for (let attempt = 0; attempt < 8; attempt++) {
        const angle = (Math.PI * 2 * attempt) / 8; // Evenly spaced angles
        const distance = RESOURCE_CONFIG.INITIAL_SPAWN_RADIUS; // Full initial radius
        const position = new Vector(
          mcvPos.x + Math.cos(angle) * distance,
          mcvPos.y + Math.sin(angle) * distance
        );
        
        if (this.isValidSpawnLocation(position)) {
          this.createResourceNode(position);
          spawnSuccess = true;
          break;
        }
      }
      
      // If we couldn't spawn at the preferred distance, try closer
      if (!spawnSuccess) {
        for (let distance = RESOURCE_CONFIG.INITIAL_SPAWN_RADIUS; distance >= 200; distance -= 25) {
          for (let attempt = 0; attempt < 8; attempt++) {
            const angle = (Math.PI * 2 * attempt) / 8;
            const position = new Vector(
              mcvPos.x + Math.cos(angle) * distance,
              mcvPos.y + Math.sin(angle) * distance
            );
            
            if (this.isValidSpawnLocation(position)) {
              this.createResourceNode(position);
              spawnSuccess = true;
              break;
            }
          }
          if (spawnSuccess) break;
        }
      }
    }
    
    // Add remaining nodes around the map
    while (this.nodes.length < RESOURCE_CONFIG.NODES_PER_MAP) {
      const spawnPoint = this.findValidSpawnPoint();
      if (spawnPoint) {
        this.createResourceNode(spawnPoint);
      }
    }
  }

  private createResourceNode(position: Vector): void {
    const node = new CrystalNode(position, this.gameState);
    this.nodes.push(node);
    this.gameState.nodes.push(node);
    
    // Create satellite crystals around the node
    for (let i = 0; i < RESOURCE_CONFIG.CRYSTALS_PER_NODE; i++) {
      const angle = (Math.PI * 2 * i) / RESOURCE_CONFIG.CRYSTALS_PER_NODE;
      const distance = 80 + Math.random() * 20; // Slightly larger radius for better visibility
      const crystalPos = new Vector(
        position.x + Math.cos(angle) * distance,
        position.y + Math.sin(angle) * distance
      );
      
      const crystal = new Resource(crystalPos, node, this.gameState);
      this.gameState.resources.push(crystal);
    }
  }

  private findValidSpawnPoint(): Vector | null {
    const basePos = this.gameState.mcv ? 
      this.gameState.mcv.position : 
      new Vector(this.gameState.map.worldWidth / 2, this.gameState.map.worldHeight / 2);

    const minDistance = RESOURCE_CONFIG.INITIAL_SPAWN_RADIUS * 2; // Keep far nodes away from initial node
    
    // Try several times to find a valid spawn point
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = RESOURCE_CONFIG.FAR_SPAWN_RADIUS * (1 + Math.random() * 0.5);
      const position = new Vector(
        basePos.x + Math.cos(angle) * distance,
        basePos.y + Math.sin(angle) * distance
      );
      
      // Ensure far nodes are actually far from the starting position
      if (this.isValidSpawnLocation(position) && position.distance(basePos) >= minDistance) {
        return position;
      }
    }
    
    return null;
  }

  private isValidSpawnLocation(position: Vector): boolean {
    // Check map boundaries
    if (position.x < 0 || position.x > this.gameState.map.worldWidth - 48 ||
        position.y < 0 || position.y > this.gameState.map.worldHeight - 48) {
      return false;
    }
    
    // Check distance from other nodes
    for (const node of this.gameState.nodes) {
      if (position.distance(node.position) < RESOURCE_CONFIG.MIN_SPACING * 2) {
        return false;
      }
    }
    
    // Check distance from buildings
    for (const building of this.gameState.buildings) {
      if (position.distance(building.position) < RESOURCE_CONFIG.MIN_SPACING) {
        return false;
      }
    }
    
    // Check distance from MCV
    if (this.gameState.mcv && position.distance(this.gameState.mcv.position) < RESOURCE_CONFIG.MIN_SPACING) {
      return false;
    }
    
    return true;
  }
}