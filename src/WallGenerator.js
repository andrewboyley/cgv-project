import * as THREE from "three";
import NoiseGenerator from "./lib/NoiseGenerator";
import Constants from "./Constants";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Group } from "three";

class WallGenerator {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.noiseGenerator = new NoiseGenerator();
    // this.normalMap = new THREE.TextureLoader().load(
    //   "assets/normal_maps/snow_normal.jpg"
    // );
    this.wallTexture = new THREE.TextureLoader().load(
      "assets/textures/snow_wall.jpg"
    );
  }

  async createWall(type) {
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: this.wallTexture,
    });

    wallMaterial.normalMap = this.normalMap;
    var sideWallGeometry = new THREE.PlaneBufferGeometry(
      this.width,
      this.height,
      1, 1
    );
    var wallGroup = new THREE.Group();

    var topPlaneGeometry = new THREE.PlaneBufferGeometry(
      this.width,
      this.width,
      4,
      4,
    );
    this.applyNoise(4, topPlaneGeometry);

    wallGroup.add(this.generatePlane(0, topPlaneGeometry, wallMaterial));

    // add barbed wires based on a chance
    if (Math.random() > 0.8)
      wallGroup.add(await this.loadBarbedWireModel());

    switch (type) {
      case 0: // side walls front facing
        wallGroup.add(this.generatePlane(1, sideWallGeometry, wallMaterial));
        wallGroup.add(this.generatePlane(2, sideWallGeometry, wallMaterial));
        break;
      case 1: // side walls side facing
        wallGroup.add(this.generatePlane(1, sideWallGeometry, wallMaterial));
        wallGroup.add(this.generatePlane(2, sideWallGeometry, wallMaterial));
        //wallGroup.add(await this.createSideLogWalls());
        wallGroup.rotateY(Math.PI / 2);
        break;
      case 2: // protruding wall facing forward
        wallGroup.add(this.generatePlane(1, sideWallGeometry, wallMaterial));
        wallGroup.add(this.generatePlane(2, sideWallGeometry, wallMaterial));
        wallGroup.add(this.generatePlane(3, sideWallGeometry, wallMaterial));
        wallGroup.add(await this.createSideLogWalls());
        break;
      case 3: // protruding wall facing backward
        wallGroup.add(this.generatePlane(1, sideWallGeometry, wallMaterial));
        wallGroup.add(this.generatePlane(2, sideWallGeometry, wallMaterial));
        wallGroup.add(this.generatePlane(3, sideWallGeometry, wallMaterial));
        wallGroup.add(await this.createSideLogWalls());
        wallGroup.rotateY(Math.PI);
        break;
      case 4: // protruding wall facing right
        wallGroup.add(this.generatePlane(1, sideWallGeometry, wallMaterial));
        wallGroup.add(this.generatePlane(2, sideWallGeometry, wallMaterial));
        wallGroup.add(this.generatePlane(3, sideWallGeometry, wallMaterial));
        wallGroup.add(await this.createSideLogWalls());
        wallGroup.rotateY(Math.PI / 2);
        break;
      case 5: // protruding wall facing left
        wallGroup.add(this.generatePlane(1, sideWallGeometry, wallMaterial));
        wallGroup.add(this.generatePlane(2, sideWallGeometry, wallMaterial));
        wallGroup.add(this.generatePlane(3, sideWallGeometry, wallMaterial));
        wallGroup.add(await this.createSideLogWalls());
        wallGroup.rotateY(-Math.PI / 2);
        break;
      case 6: // corner, left, down empty
        wallGroup.add(this.generatePlane(2, sideWallGeometry, wallMaterial));
        wallGroup.add(this.generatePlane(3, sideWallGeometry, wallMaterial));
        break;
      case 7: // corner, right, down empty
        wallGroup.add(this.generatePlane(1, sideWallGeometry, wallMaterial));
        wallGroup.add(this.generatePlane(3, sideWallGeometry, wallMaterial));
        wallGroup.add(await this.createSideLogWalls());
        break;
      case 8: // corners left up empty
        wallGroup.add(this.generatePlane(1, sideWallGeometry, wallMaterial));
        wallGroup.add(this.generatePlane(3, sideWallGeometry, wallMaterial));
        wallGroup.rotateY(Math.PI);
        break;
      case 9: // corners right up empty
        wallGroup.add(this.generatePlane(2, sideWallGeometry, wallMaterial));
        wallGroup.add(this.generatePlane(3, sideWallGeometry, wallMaterial));
        //wallGroup.add(await this.createSideLogWalls());
        wallGroup.rotateY(Math.PI);
        break;
      case 10: // T junction, down empty
        wallGroup.add(this.generatePlane(3, sideWallGeometry, wallMaterial));
        //wallGroup.add(await this.createSideLogWalls());
        break;
      case 11:
        wallGroup.add(this.generatePlane(3, sideWallGeometry, wallMaterial));
        wallGroup.rotateY(Math.PI);
        break;
      case 12:
        wallGroup.add(this.generatePlane(3, sideWallGeometry, wallMaterial));
        wallGroup.rotateY(-Math.PI / 2);
        break;
      case 13:
        wallGroup.add(this.generatePlane(3, sideWallGeometry, wallMaterial));
        wallGroup.rotateY(Math.PI / 2);
        break;
      case 15: // completely alone:
        wallGroup.add(this.generatePlane(1, sideWallGeometry, wallMaterial));
        wallGroup.add(this.generatePlane(2, sideWallGeometry, wallMaterial));
        wallGroup.add(this.generatePlane(3, sideWallGeometry, wallMaterial));
        wallGroup.add(this.generatePlane(4, sideWallGeometry, wallMaterial));
        wallGroup.add(await this.createSideLogWalls());
        break;
    }
    wallGroup.name = "wall"
    return wallGroup;
  }

  loadLogWallModel() {
    const loader = new GLTFLoader();
    const path = "assets/models/";
    const extension = ".glb";
    return new Promise((resolve, reject) => {
      loader.load(path + "LogWall2" + extension, (gltf) => {
        const scene = gltf.scene;
        scene.scale.set(3, 3, 4);
        scene.rotateY(-Math.PI / 2)
        scene.position.y = -10;
        scene.position.z = 15;
        resolve(scene);
      }),
        reject
    })
  }

  loadBarbedWireModel() {
    const loader = new GLTFLoader();
    const path = "assets/models/";
    const extension = ".glb";
    return new Promise((resolve, reject) => {
      loader.load(path + "BarbedWire" + extension, (gltf) => {
        const scene = gltf.scene;
        scene.scale.set(3 / 4, 3 / 4, 1 / 4);
        scene.position.y = 13;
        scene.rotateY(Math.random() * Math.PI / 2)
        scene.rotateY((1 / 3) * Math.random() * Math.PI / 2)

        scene.position.x = -13;
        resolve(scene);
      }),
        reject
    })
  }

  async createSideLogWalls() {
    const logWall = await this.loadLogWallModel();
    return logWall;

  }

  generatePlane(config, geometry, material) {
    switch (config) {
      case 0:
        var topPlane = new THREE.Mesh(geometry, material);
        topPlane.receiveShadow = true;
        topPlane.castShadow = true;
        topPlane.rotateX(-Math.PI / 2);
        topPlane.position.y = this.height / 2;
        return topPlane;
      case 1:
        var wallOne = new THREE.Mesh(geometry, material);
        wallOne.receiveShadow = true;
        wallOne.castShadow = true;
        wallOne.position.z = this.width / 2;
        return wallOne;
      case 2:
        var wallTwo = new THREE.Mesh(geometry, material);
        wallTwo.receiveShadow = true;
        wallTwo.castShadow = true;
        wallTwo.rotateY(Math.PI);
        wallTwo.position.z = -this.width / 2;
        return wallTwo;
      case 3:
        var wallThree = new THREE.Mesh(geometry, material);
        wallThree.receiveShadow = true;
        wallThree.castShadow = true;
        wallThree.rotateY(-Math.PI / 2);
        wallThree.position.x = -this.width / 2;
        return wallThree;
      case 4:
        var wallFour = new THREE.Mesh(geometry, material);
        wallFour.receiveShadow = true;
        wallFour.castShadow = true;
        wallFour.rotateY(Math.PI / 2);
        wallFour.position.x = this.width / 2;
        return wallFour;
    }
  }

  applyNoise(segments, geometry, seed) {
    var noise = this.noiseGenerator.generateNoiseMap(segments, segments, seed);

    var vertices = geometry.attributes.position.array;

    for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
      vertices[j + 2] += noise[i] * 4;
    }
  }

  genBinaryString(x, y, grid, maze) {
    // y is x, x is z
    // a binary string specifying the neighbours of cell in thick grid
    // the string in order is: up down left right
    if (x == 0 && y == 2) {
      return "0001";
    }
    if (x == 2 * maze.height && y == 2 * maze.width - 2) {
      return "0010";
    }

    if (y == 0 || y == 2 * maze.height) {
      return "1100"; // wall type 0
    }
    if (x == 0 || x == 2 * maze.width) {
      return "0011"; // wall type 0 rotated
    }



    //TODO: potentially change the orientation of the maze
    let up = grid[y][x + 1]; //grid[maze.getThickIndex(x + 1, y)];
    let down = grid[y][x - 1]; //grid[maze.getThickIndex(x - 1, y)];
    let left = grid[y - 1][x]; //grid[maze.getThickIndex(x, y - 1)];
    let right = grid[y + 1][x]; //grid[maze.getThickIndex(x, y + 1)];

    let binaryString = "";

    binaryString = binaryString.concat(up ? "1" : "0");
    binaryString = binaryString.concat(down ? "1" : "0");
    binaryString = binaryString.concat(left ? "1" : "0");
    binaryString = binaryString.concat(right ? "1" : "0");
    return binaryString;
  }

  getWallConfig(binaryString) {
    switch (binaryString) {
      case "0000":
        return 15; // completely alone
      case "0001":
        return 5; // protruding facing left
      case "0010":
        return 4; // protruding facing right
      case "0100":
        return 3; // protruding facing up/backward
      case "1000":
        return 2; // protruding facing down/forward
      case "1100":
        return 0; // vertical walls
      case "0011":
        return 1;
      case "1001": // corners left down empty
        return 6;
      case "1010": // corners right down empty
        return 7;
      case "0101": // corners left up empty
        return 8;
      case "0110": // corners right up empty
        return 9;
      case "1011": // T, down empty
        return 10;
      case "0111": // T, up empty
        return 11;
      case "1101": // T, left empty
        return 12;
      case "1110": // T, right empty
        return 13;
      case "1111": // cross
        return 14;
      default:
        return 0; // parallel walls
    }
  }
}

export default WallGenerator;
