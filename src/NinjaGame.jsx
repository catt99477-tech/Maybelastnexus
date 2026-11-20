import { useEffect, useRef } from 'preact/hooks';
import * as THREE from 'three';

export default function NinjaGame() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#91bde0');
    scene.fog = new THREE.Fog('#91bde0', 45, 115);

    const camera = new THREE.PerspectiveCamera(
      55,
      mount.clientWidth / mount.clientHeight,
      0.1,
      250
    );

    camera.position.set(19, 15, 24);
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    mount.appendChild(renderer.domElement);

    const world = new THREE.Group();
    scene.add(world);

    // LIGHTING
    scene.add(new THREE.HemisphereLight('#d9edff', '#344d45', 2.2));

    const sunlight = new THREE.DirectionalLight('#ffe2ae', 3.5);
    sunlight.position.set(-20, 30, 15);
    sunlight.castShadow = true;
    sunlight.shadow.mapSize.set(2048, 2048);
    sunlight.shadow.camera.left = -35;
    sunlight.shadow.camera.right = 35;
    sunlight.shadow.camera.top = 35;
    sunlight.shadow.camera.bottom = -35;
    scene.add(sunlight);

    const fillLight = new THREE.PointLight('#6cbfff', 35, 60);
    fillLight.position.set(10, 8, -10);
    scene.add(fillLight);

    // MATERIALS
    const mat = (color, roughness = 0.85, metalness = 0) =>
      new THREE.MeshStandardMaterial({
        color,
        roughness,
        metalness,
      });

    const grass = mat('#548b45');
    const grassLight = mat('#78a951');
    const dirt = mat('#62432f');
    const rock = mat('#555d6b');
    const rockLight = mat('#84909b');
    const wood = mat('#68412d');
    const darkWood = mat('#382b30');
    const roofMat = mat('#263449');
    const cream = mat('#e8d8b8');
    const red = mat('#a9273b');
    const gold = mat('#e8b94e', 0.3, 0.65);
    const dark = mat('#171d2b');
    const cloth = mat('#26364d');

    const waterMat = new THREE.MeshStandardMaterial({
      color: '#38b9d6',
      roughness: 0.18,
      metalness: 0.25,
      transparent: true,
      opacity: 0.85,
      emissive: '#07516b',
      emissiveIntensity: 0.35,
    });

    const glowMat = new THREE.MeshStandardMaterial({
      color: '#68eaff',
      emissive: '#20cfff',
      emissiveIntensity: 2.5,
      roughness: 0.25,
    });

    // HELPERS
    function box(parent, x, y, z, sx, sy, sz, material) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(sx, sy, sz),
        material
      );

      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    }

    function cylinder(parent, x, y, z, top, bottom, height, material, sides = 12) {
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(top, bottom, height, sides),
        material
      );

      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    }

    function sphere(parent, x, y, z, radius, material, scale = [1, 1, 1]) {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 12, 10),
        material
      );

      mesh.position.set(x, y, z);
      mesh.scale.set(...scale);
      mesh.castShadow = true;
      parent.add(mesh);
      return mesh;
    }

    // FLOATING ISLAND
    const island = new THREE.Group();
    world.add(island);

    const islandBase = new THREE.Mesh(
      new THREE.CylinderGeometry(15, 9, 7, 64, 4),
      dirt
    );

    islandBase.position.y = -1.8;
    islandBase.castShadow = true;
    islandBase.receiveShadow = true;
    island.add(islandBase);

    const islandTop = new THREE.Mesh(
      new THREE.CylinderGeometry(15, 15, 0.8, 64),
      grass
    );

    islandTop.position.y = 1.7;
    islandTop.receiveShadow = true;
    island.add(islandTop);

    // GRASS DETAILS
    for (let i = 0; i < 180; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(Math.random()) * 14;

      const tuft = new THREE.Mesh(
        new THREE.ConeGeometry(
          0.08 + Math.random() * 0.09,
          0.25 + Math.random() * 0.25,
          4
        ),
        Math.random() > 0.5 ? grassLight : grass
      );

      tuft.position.set(
        Math.cos(angle) * radius,
        2.15,
        Math.sin(angle) * radius
      );

      tuft.rotation.z = Math.random() * 0.3;
      island.add(tuft);
    }

    // FLOATING ROCK FORMATIONS
    for (let i = 0; i < 42; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 8 + Math.random() * 5;

      const boulder = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.5 + Math.random() * 1.3, 1),
        Math.random() > 0.5 ? rock : dirt
      );

      boulder.position.set(
        Math.cos(angle) * radius,
        -3 - Math.random() * 3,
        Math.sin(angle) * radius
      );

      boulder.rotation.set(Math.random(), Math.random(), Math.random());
      boulder.scale.y = 1.5;
      island.add(boulder);
    }

    // TREES
    const trees = [];

    function makeTree(x, z, size = 1) {
      const tree = new THREE.Group();

      cylinder(
        tree, 0, 1.3 * size, 0,
        0.22 * size, 0.36 * size, 2.6 * size,
        wood, 9
      );

      const leafColors = ['#24583d', '#31754a', '#438953'];

      for (let i = 0; i < 4; i++) {
        const leaves = new THREE.Mesh(
          new THREE.IcosahedronGeometry((1.2 - i * 0.15) * size, 1),
          mat(leafColors[i % leafColors.length])
        );

        leaves.position.y = (2.5 + i * 0.65) * size;
        leaves.scale.set(1, 0.75, 1);
        leaves.castShadow = true;
        tree.add(leaves);
      }

      tree.position.set(x, 2, z);
      island.add(tree);
      trees.push(tree);
    }

    makeTree(-10, -7, 1.2);
    makeTree(10, -8, 1.1);
    makeTree(-11, 5, 0.85);
    makeTree(11, 5, 1.25);
    makeTree(-7, 10, 0.8);
    makeTree(7, 10, 0.9);

    // JAPANESE DOJO
    const dojo = new THREE.Group();
    island.add(dojo);

    // Main building
    box(dojo, 0, 4, -8, 7, 4, 5, cream);

    // Dark foundation
    box(dojo, 0, 2, -8, 7.5, 0.5, 5.5, darkWood);

    // Front wooden beams
    for (const x of [-3.2, 0, 3.2]) {
      box(dojo, x, 4, -5.43, 0.22, 3.8, 0.25, darkWood);
    }

    // Door
    box(dojo, 0, 3.5, -5.48, 2.1, 2.8, 0.12, darkWood);

    // Door panels
    for (const x of [-0.55, 0.55]) {
      box(dojo, x, 3.5, -5.56, 0.85, 2.5, 0.08, wood);
    }

    // Roof
    const roof = new THREE.Mesh(
      new THREE.CylinderGeometry(5.8, 5.8, 1.1, 4),
      roofMat
    );

    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1, 1, 0.65);
    roof.position.set(0, 6.6, -8);
    roof.castShadow = true;
    dojo.add(roof);

    // Roof ridge
    box(dojo, 0, 7.1, -8, 7.5, 0.25, 0.35, gold);

    // Roof decorative ends
    for (const x of [-5.2, 5.2]) {
      sphere(dojo, x, 6.5, -8, 0.35, gold);
    }

    // DOJO SIGN
    box(dojo, 0, 5.1, -5.65, 2.5, 0.65, 0.12, darkWood);

    // TORII GATE
    const gate = new THREE.Group();
    island.add(gate);

    for (const x of [-2.5, 2.5]) {
      box(gate, x, 4, 0, 0.55, 5.5, 0.55, red);
      box(gate, x, 1.8, 0, 0.85, 0.35, 0.85, darkWood);
    }

    box(gate, 0, 6.7, 0, 7, 0.55, 0.85, red);
    box(gate, 0, 6.2, 0, 5.8, 0.25, 0.6, darkWood);

    gate.position.set(0, 1.8, 5);

    // STONE PATH
    for (let i = 0; i < 9; i++) {
      const stoneTile = new THREE.Mesh(
        new THREE.BoxGeometry(2.3, 0.18, 1.2),
        rockLight
      );

      stoneTile.position.set(0, 2.22, 3 - i * 1.1);
      stoneTile.rotation.y = (Math.random() - 0.5) * 0.12;
      island.add(stoneTile);
    }

    // LANTERNS
    function makeLantern(x, z) {
      const lantern = new THREE.Group();

      cylinder(lantern, 0, 0.5, 0, 0.18, 0.22, 1, darkWood);
      box(lantern, 0, 1.1, 0, 0.9, 0.8, 0.9, darkWood);
      box(lantern, 0, 1.1, 0, 0.65, 0.6, 0.65, glowMat);
      box(lantern, 0, 1.6, 0, 1.1, 0.15, 1.1, darkWood);
      cylinder(lantern, 0, 1.8, 0, 0, 0.45, 0.45, darkWood);

      lantern.position.set(x, 2.2, z);
      island.add(lantern);
    }

    makeLantern(-5, 2);
    makeLantern(5, 2);
    makeLantern(-5, -5);
    makeLantern(5, -5);

    // WATERFALLS
    const waterfalls = [];

    for (const x of [-7, 7]) {
      const waterfall = new THREE.Mesh(
        new THREE.PlaneGeometry(2.4, 9),
        waterMat
      );

      waterfall.position.set(x, -5.3, 0);
      waterfall.rotation.x = 0.08;
      world.add(waterfall);
      waterfalls.push(waterfall);

      // Waterfall glow
      const glow = new THREE.PointLight('#30cfff', 12, 12);
      glow.position.set(x, -4, 1);
      world.add(glow);
    }

    // WATER BELOW ISLAND
    const ocean = new THREE.Mesh(
      new THREE.PlaneGeometry(250, 250),
      new THREE.MeshStandardMaterial({
        color: '#287da9',
        roughness: 0.25,
        metalness: 0.25,
      })
    );

    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = -12;
    world.add(ocean);

    // CRYSTALS
    const crystals = [];

    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 11 + Math.random() * 2;

      const crystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.65 + Math.random() * 0.6),
        glowMat
      );

      crystal.position.set(
        Math.cos(angle) * radius,
        2.8 + Math.random() * 2,
        Math.sin(angle) * radius
      );

      crystal.rotation.z = 0.3;
      island.add(crystal);
      crystals.push(crystal);
    }

    // FLOATING ISLANDS IN DISTANCE
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const radius = 29 + Math.random() * 8;

      const mini = new THREE.Group();

      const miniBase = new THREE.Mesh(
        new THREE.CylinderGeometry(4, 2, 3, 8),
        dirt
      );

      miniBase.position.y = -1;
      mini.add(miniBase);

      const miniTop = new THREE.Mesh(
        new THREE.CylinderGeometry(4, 4, 0.5, 8),
        grass
      );

      miniTop.position.y = 0.75;
      mini.add(miniTop);

      mini.position.set(
        Math.cos(angle) * radius,
        -1 + Math.random() * 8,
        Math.sin(angle) * radius
      );

      world.add(mini);

      // Tiny trees on distant islands
      for (let j = 0; j < 3; j++) {
        const tinyTree = new THREE.Mesh(
          new THREE.ConeGeometry(0.8, 2, 6),
          mat('#286143')
        );

        tinyTree.position.set(
          (Math.random() - 0.5) * 5,
          2,
          (Math.random() - 0.5) * 5
        );

        mini.add(tinyTree);
      }
    }

    // CLOUDS
    const clouds = [];

    for (let i = 0; i < 18; i++) {
      const cloud = new THREE.Group();

      for (let j = 0; j < 5; j++) {
        const puff = new THREE.Mesh(
          new THREE.SphereGeometry(1.5 + Math.random(), 10, 8),
          new THREE.MeshStandardMaterial({
            color: '#ffffff',
            roughness: 1,
            transparent: true,
            opacity: 0.75,
          })
        );

        puff.position.set(
          (Math.random() - 0.5) * 4,
          Math.random(),
          (Math.random() - 0.5) * 2
        );

        puff.scale.y = 0.55;
        cloud.add(puff);
      }

      cloud.position.set(
        (Math.random() - 0.5) * 100,
        10 + Math.random() * 20,
        (Math.random() - 0.5) * 100
      );

      scene.add(cloud);
      clouds.push(cloud);
    }

    // NINJA CHARACTER
    const ninja = new THREE.Group();
    island.add(ninja);

    // Body
    box(ninja, 0, 3.5, 0, 1.1, 1.5, 0.75, dark);

    // Head
    box(ninja, 0, 4.8, 0, 1.05, 1.05, 0.95, dark);

    // Face covering
    box(ninja, 0, 4.55, 0.5, 0.85, 0.3, 0.12, red);

    // Eyes
    const eyeMat = mat('#f1e5c9');

    box(ninja, -0.23, 4.9, 0.5, 0.16, 0.1, 0.08, eyeMat);
    box(ninja, 0.23, 4.9, 0.5, 0.16, 0.1, 0.08, eyeMat);

    // Headband
    box(ninja, 0, 5.3, 0, 1.12, 0.16, 1.02, red);
    box(ninja, 0.65, 5.3, -0.1, 0.7, 0.13, 0.16, red);

    // Belt
    box(ninja, 0, 2.8, 0, 1.18, 0.2, 0.8, gold);

    // Legs
    const legs = [];

    for (const x of [-0.3, 0.3]) {
      const leg = box(ninja, x, 1.9, 0, 0.43, 1.6, 0.48, cloth);
      legs.push(leg);
    }

    // Arms
    const arms = [];

    for (const x of [-0.8, 0.8]) {
      const arm = box(ninja, x, 3.6, 0, 0.38, 1.35, 0.45, dark);
      arms.push(arm);
    }

    // Sword on back
    const sword = new THREE.Group();

    box(sword, 0, 1.2, 0, 0.15, 2.1, 0.12, gold);
    box(sword, 0, 0.05, 0, 0.25, 0.55, 0.22, wood);
    box(sword, 0, 0.35, 0, 0.5, 0.12, 0.25, gold);

    sword.position.set(0.85, 3.1, -0.25);
    sword.rotation.z = -0.35;
    ninja.add(sword);

    ninja.position.set(0, 2.2, 2);

    // DECORATIVE PARTICLES
    const particleCount = 160;
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 38;
      particlePositions[i * 3 + 1] = Math.random() * 18;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 38;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(particlePositions, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
      color: '#fff0c2',
      size: 0.13,
      transparent: true,
      opacity: 0.8,
    });

    const particles = new THREE.Points(
      particleGeometry,
      particleMaterial
    );

    scene.add(particles);

    // ANIMATION
    let running = true;
    let animationFrame;
    const clock = new THREE.Clock();

    function animate() {
      if (!running) return;

      animationFrame = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();

      // Floating crystals
      crystals.forEach((crystal, i) => {
        crystal.rotation.y += 0.012;
        crystal.position.y += Math.sin(time * 1.5 + i) * 0.003;
      });

      // Floating clouds
      clouds.forEach((cloud, i) => {
        cloud.position.x += 0.004 + (i % 3) * 0.002;

        if (cloud.position.x > 60) {
          cloud.position.x = -60;
        }
      });

      // Floating particles
      const positions = particleGeometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += 0.008;
      
        if (positions[i * 3 + 1] > 19) {
          positions[i * 3 + 1] = 0;
        }
      }
      
      particleGeometry.attributes.position.needsUpdate = true;
      
      ninja.position.y = 2.2 + Math.sin(time * 2) * 0.06;
      
      camera.position.x = 19 + Math.sin(time * 0.12) * 0.5;
      camera.lookAt(0, 2.5, 0);
      
      renderer.render(scene, camera);
      }
      
      function resize() {
        const width = mount.clientWidth;
        const height = mount.clientHeight;
      
        if (!width || !height) return;
      
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
      
      window.addEventListener('resize', resize);
      
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(mount);
      
      animate();
      
      return () => {
        running = false;
        cancelAnimationFrame(animationFrame);
      
        window.removeEventListener('resize', resize);
        resizeObserver.disconnect();
      
        scene.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
      
          if (object.material) {
            const materials = Array.isArray(object.material)
              ? object.material
              : [object.material];
      
            materials.forEach((material) => material.dispose());
          }
        });
      
        renderer.dispose();
      
        if (mount.contains(renderer.domElement)) {
          mount.removeChild(renderer.domElement);
        };
      };
      }, []);
      
      return (
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: 'min(75vh, 700px)',
            minHeight: '420px',
            overflow: 'hidden',
            borderRadius: '16px',
            background: '#91bde0',
          }}
        >
          <div
            ref={mountRef}
            style={{
              position: 'absolute',
              inset: 0,
            }}
          />
      
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              padding: '12px 18px',
              borderRadius: '12px',
              background: 'rgba(12,20,35,0.78)',
              color: 'white',
              fontFamily: 'sans-serif',
              pointerEvents: 'none',
            }}
          >
            <div style={{ fontSize: '19px', fontWeight: 'bold' }}>
              🥷 NINJA LEGENDS
            </div>
            <div style={{ fontSize: '11px', opacity: 0.75, marginTop: '4px' }}>
              THE FLOATING ISLAND
            </div>
          </div>
        </div>
      );
      }
