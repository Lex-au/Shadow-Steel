import { Unit } from '../entities/Unit';
import { Building } from '../entities/Building';
import { Resource } from '../entities/Resource';
import { Player } from '../entities/Player';
import { MCV } from '../entities/MCV';
import { Vector } from '../utils/Vector';
import { BuildingDefinition } from '../factions/buildings';
import { GameMap } from '../map/GameMap';
import { Camera } from '../utils/Camera';
import { CrystalNode } from '../entities/CrystalNode';

export class GameState {
  public map: GameMap;
  public camera: Camera;
  public players: Player[];
  public units: Unit[];
  public systems: any;
  public buildings: Building[];
  public resources: Resource[];
  public nodes: CrystalNode[] = [];
  public selectedEntities: (Unit | Building)[];
  public buildingToPlace: BuildingDefinition | null = null;
  public powerGenerated: number = 0;
  public powerUsed: number = 0;
  public money: number = 10000;
  public isPowerShortage: boolean = false;
  public mcv: MCV | null = null;
  public isBaseDeployed: boolean = false;
  public keyPressed: number | null = null;
  public p: p5;
  public isMenuOpen: boolean = false;
  public menuTab: 'controls' | 'jukebox' | null = null;
  public volume: number = 0.2;
  public trackProgress: number = 0;
  public isPlaying: boolean = false;
  public isRepeat: boolean = false;
  public isShuffle: boolean = false;
  public currentTrack: number = Math.floor(Math.random() * 7); // Random initial track
  public keybindings: {
    moveUp: number;
    moveDown: number;
    moveLeft: number;
    moveRight: number;
    halt: number;
    deploy: number;
    escape: number;
  } = {
    moveUp: 87, // W
    moveDown: 83, // S
    moveLeft: 65, // A
    moveRight: 68, // D
    halt: 72, // H
    deploy: 66, // B
    escape: 27, // ESC
  };
  
  constructor(p: p5) {
    this.p = p;
    this.camera = new Camera(p, this);
    this.map = new GameMap(p, this);
    this.players = [];
    this.units = [];
    this.buildings = [];
    this.resources = [];
    this.selectedEntities = [];
    
    // Create initial MCV
    this.mcv = new MCV(new Vector(100, 100), 'player1', this);
    
    // Create a test unit
    const unit = new Unit(new Vector(200, 200), 'player1', this);
    this.units.push(unit);
  }

  public setBaseDeployed(deployed: boolean): void {
    this.isBaseDeployed = deployed;
  }

  public createBuilding(position: Vector, buildingDef: BuildingDefinition, playerId: string): Building | null {
    // Check if position is buildable
    if (!this.map.isBuildable(position) || this.isBuildingOverlap(position) || this.money < buildingDef.cost) {
      return null;
    }
    
    // Deduct building cost
    this.money -= buildingDef.cost;
    
    const building = new Building(position, buildingDef, playerId, this);
    this.buildings.push(building);
    
    // Update power values
    if (buildingDef.powerUsage < 0) {
      this.powerGenerated -= buildingDef.powerUsage; // Convert negative to positive
    } else {
      this.powerUsed += buildingDef.powerUsage;
    }
    
    // Update power shortage status
    this.isPowerShortage = this.powerUsed > this.powerGenerated;
    
    return building;
  }

  public removePowerFromBuilding(building: Building): void {
    if (building.definition.powerUsage < 0) {
      this.powerGenerated += building.definition.powerUsage; // Remove power generation
    } else {
      this.powerUsed -= building.definition.powerUsage;
    }
    
    // Update power shortage status
    this.isPowerShortage = this.powerUsed > this.powerGenerated;
  }

  public addMoney(amount: number): void {
    this.money += amount;
  }

  private isBuildingOverlap(position: Vector): boolean {
    const BUILDING_SIZE = 48; // Standard building size
    
    // Check overlap with existing buildings
    const buildingOverlap = this.buildings.some(building => {
      // Check if the rectangles overlap
      return position.x < building.position.x + BUILDING_SIZE &&
             position.x + BUILDING_SIZE > building.position.x &&
             position.y < building.position.y + BUILDING_SIZE &&
             position.y + BUILDING_SIZE > building.position.y;
    });
    
    // Check overlap with deployed MCV
    const mcvOverlap = this.mcv?.isDeployed && 
      position.x < this.mcv.position.x + BUILDING_SIZE &&
      position.x + BUILDING_SIZE > this.mcv.position.x &&
      position.y < this.mcv.position.y + BUILDING_SIZE &&
      position.y + BUILDING_SIZE > this.mcv.position.y;
    
    return buildingOverlap || mcvOverlap;
  }
}