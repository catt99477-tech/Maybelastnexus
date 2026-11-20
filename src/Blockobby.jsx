import { useEffect, useRef } from "preact/hooks";
import * as THREE from "three";

export default function BlockObby() {
  const mountRef = useRef(null);
  const stageRef = useRef(null);
  const controlsRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
  });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 35, 150);

    const camera = new THREE.PerspectiveCamera(
      70,
      mount.clientWidth / mount.clientHeight,
      0.1,
      250
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    // LIGHTING
    scene.add(new THREE.HemisphereLight(0xffffff, 0x557755, 1.2));

    const sun = new THREE.DirectionalLight(0xffffff, 1.1);
    sun.position.set(25, 50, 25);
    sun.castShadow = true;
    scene.add(sun);

    // PLAYER
    const player = new THREE.Group();

    function makePart(w, h, d, color, x, y, z) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial({ color })
      );
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      player.add(mesh);
      return mesh;
    }

    makePart(0.45, 0.9, 0.45, 0x2ecc71, -0.25, 0.45, 0);
    makePart(0.45, 0.9, 0.45, 0x2ecc71, 0.25, 0.45, 0);
    makePart(1, 1, 0.5, 0x3498db, 0, 1.4, 0);
    makePart(0.4, 0.9, 0.4, 0xf1c40f, -0.75, 1.4, 0);
    makePart(0.4, 0.9, 0.4, 0xf1c40f, 0.75, 1.4, 0);
    makePart(0.65, 0.65, 0.65, 0xf1c40f, 0, 2.25, 0);

    scene.add(player);

    // LEVEL
    const platforms = [];

    const levelData = [
      [0, -0.5, 0, 8, 1, 8, 0x95a5a6, "checkpoint", 1],
      [0, 0, -9, 4, 1, 5, 0xe74c3c, "normal"],
      [0, 1, -17, 4, 1, 5, 0xe67e22, "normal"],
      [0, 1.5, -24, 5, 0.4, 1.2, 0xff0055, "lava"],
      [0, 2, -31, 4, 1, 5, 0xf1c40f, "normal"],
      [0, 2.5, -40, 8, 1, 8, 0x2ecc71, "checkpoint", 2],
      [5, 3.5, -49, 3.5, 1, 3.5, 0x9b59b6, "normal"],
      [-5, 4.5, -57, 3.5, 1, 3.5, 0x1abc9c, "normal"],
      [0, 5.5, -66, 3.5, 1, 3.5, 0xe74c3c, "normal"],
      [0, 6, -76, 10, 1, 10, 0xf39c12, "checkpoint", 3],
    ];

    levelData.forEach(([x, y, z, w, h, d, color, type, stage]) => {
      const material = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.8,
      });

      if (type === "lava") {
        material.emissive = new THREE.Color(0xff0033);
        material.emissiveIntensity = 0.7;
      }

      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        material
      );

      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);

      platforms.push({ mesh, w, h, d, type, stage });
    });

    // CLOUDS
    const clouds = [];

    for (let i = 0; i < 16; i++) {
      const cloud = new THREE.Group();

      for (let j = 0; j < 4; j++) {
        const puff = new THREE.Mesh(
          new THREE.SphereGeometry(1.5, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0xffffff })
        );
        puff.position.set(j * 1.4, Math.random() * 0.5, 0);
        puff.scale.set(1.2, 0.7, 0.8);
        cloud.add(puff);
      }

      cloud.position.set(
        (Math.random() - 0.5) * 100,
        18 + Math.random() * 15,
        -Math.random() * 100
      );

      scene.add(cloud);
      clouds.push(cloud);
    }

    // GAME STATE
    const keys = {};
    const controls = controlsRef.current;

    let yaw = 0;
    let pitch = 0.35;
    let velY = 0;
    let onGround = false;
    let currentStage = 1;

    const spawn = new THREE.Vector3(0, 0.5, 0);

    function respawn() {
      player.position.copy(spawn);
      velY = 0;
      onGround = false;
    }

    respawn();

    // KEYBOARD
    const keyDown = (e) => {
      keys[e.code] = true;
      if (e.code === "Space") e.preventDefault();
    };

    const keyUp = (e) => {
      keys[e.code] = false;
    };

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    // CAMERA DRAG
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    const canvas = renderer.domElement;
    canvas.style.touchAction = "none";

    const pointerDown = (e) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };

    const pointerMove = (e) => {
      if (!dragging) return;

      yaw -= (e.clientX - lastX) * 0.006;
      pitch = Math.max(
        0.05,
        Math.min(1.25, pitch + (e.clientY - lastY) * 0.004)
      );

      lastX = e.clientX;
      lastY = e.clientY;
    };

    const pointerUp = () => {
      dragging = false;
    };

    canvas.addEventListener("pointerdown", pointerDown);
    canvas.addEventListener("pointermove", pointerMove);
    canvas.addEventListener("pointerup", pointerUp);
    canvas.addEventListener("pointercancel", pointerUp);

    // RESIZE
    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      if (!width || !height) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", resize);

    // ANIMATION
    let animationId;
    let previousTime = 0;

    function animate(time) {
      animationId = requestAnimationFrame(animate);

      const delta = Math.min((time - previousTime) / 16.67 || 1, 2);
      previousTime = time;

      // MOVEMENT
      const forward = new THREE.Vector3(
        -Math.sin(yaw), 0, -Math.cos(yaw)
      );

      const right = new THREE.Vector3(
        Math.cos(yaw), 0, -Math.sin(yaw)
      );

      const move = new THREE.Vector3();

      if (keys.KeyW || keys.ArrowUp || controls.forward) move.add(forward);
      if (keys.KeyS || keys.ArrowDown || controls.backward) move.sub(forward);
      if (keys.KeyD || keys.ArrowRight || controls.right) move.add(right);
      if (keys.KeyA || keys.ArrowLeft || controls.left) move.sub(right);

      if (move.lengthSq() > 0) {
        move.normalize().multiplyScalar(0.18 * delta);
        player.position.add(move);
        player.rotation.y = Math.atan2(move.x, move.z);
      }

      // JUMP AND GRAVITY
      if ((keys.Space || controls.jump) && onGround) {
        velY = 0.28;
        onGround = false;
      }

      const previousY = player.position.y;
      velY -= 0.014 * delta;
      player.position.y += velY * delta;
      onGround = false;

      // COLLISIONS
      for (const p of platforms) {
        const { x: px, y: py, z: pz } = p.mesh.position;

        const inX = Math.abs(player.position.x - px) < p.w / 2 + 0.4;
        const inZ = Math.abs(player.position.z - pz) < p.d / 2 + 0.4;
        const top = py + p.h / 2;

        const crossedTop = previousY >= top - 0.1 &&
          player.position.y <= top + 0.1;

        if (inX && inZ && crossedTop && velY <= 0) {
          if (p.type === "lava") {
            respawn();
            break;
          }

          player.position.y = top;
          velY = 0;
          onGround = true;

          if (p.type === "checkpoint" && p.stage > currentStage) {
            currentStage = p.stage;
            spawn.set(px, top, pz);

            if (stageRef.current) {
              stageRef.current.textContent = `Stage: ${currentStage} / 3`;
            }
          }
        }
      }

      if (player.position.y < -15) respawn();

      // CLOUDS
      clouds.forEach((cloud) => {
        cloud.position.x += 0.006 * delta;
        if (cloud.position.x > 60) cloud.position.x = -60;
      });

      // CAMERA
      const camDist = 9;

      camera.position.set(
        player.position.x + Math.sin(yaw) * Math.cos(pitch) * camDist,
        player.position.y + 2 + Math.sin(pitch) * camDist,
        player.position.z + Math.cos(yaw) * Math.cos(pitch) * camDist
      );

      camera.lookAt(
        player.position.x,
        player.position.y + 1.5,
        player.position.z
      );

      renderer.render(scene, camera);
    }

    animationId = requestAnimationFrame(animate);

    // CLEANUP
    return () => {
      cancelAnimationFrame(animationId);

      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      window.removeEventListener("resize", resize);

      canvas.removeEventListener("pointerdown", pointerDown);
      canvas.removeEventListener("pointermove", pointerMove);
      canvas.removeEventListener("pointerup", pointerUp);
      canvas.removeEventListener("pointercancel", pointerUp);

      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();

        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((m) => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      });

      renderer.dispose();

      if (mount.contains(canvas)) {
        mount.removeChild(canvas);
      }
    };
  }, []);

  function buttonProps(control) {
    return {
      onPointerDown: (e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        controlsRef.current[control] = true;
      },
      onPointerUp: (e) => {
        e.preventDefault();
        controlsRef.current[control] = false;
      },
      onPointerCancel: () => {
        controlsRef.current[control] = false;
      },
      onLostPointerCapture: () => {
        controlsRef.current[control] = false;
      },
    };
  }

  return (
    <div class="blockobby">
      <div class="obby-hud">
        <h2>BLOCK OBBY</h2>
        <p ref={stageRef}>Stage: 1 / 3</p>
        <small>Drag to rotate camera</small>
      </div>

      <div class="obby-controls">
        <div class="obby-dpad">
          <button {...buttonProps("forward")}>▲</button>
          <div>
            <button {...buttonProps("left")}>◀</button>
            <button {...buttonProps("backward")}>▼</button>
            <button {...buttonProps("right")}>▶</button>
          </div>
        </div>

        <button class="obby-jump" {...buttonProps("jump")}>
          JUMP
        </button>
      </div>

      <div class="obby-game" ref={mountRef} />

      <style>
        {`
          .blockobby {
            position: relative;
            width: 100%;
            height: 100%;
            min-height: 550px;
            overflow: hidden;
            background: #87ceeb;
            font-family: Arial, sans-serif;
            user-select: none;
            touch-action: none;
          }

          .obby-game {
            position: absolute;
            inset: 0;
            z-index: 1;
          }

          .obby-game canvas {
            display: block;
            width: 100%;
            height: 100%;
          }

          .obby-hud {
            position: absolute;
            top: 15px;
            left: 15px;
            z-index: 3;
            color: white;
            background: rgba(0,0,0,0.6);
            padding: 12px 18px;
            border-radius: 10px;
            pointer-events: none;
          }

          .obby-hud h2 {
            margin: 0 0 6px;
            font-size: 19px;
          }

          .obby-hud p {
            margin: 3px 0;
            font-size: 14px;
          }

          .obby-controls {
            position: absolute;
            bottom: 25px;
            left: 0;
            right: 0;
            z-index: 4;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            padding: 0 22px;
            pointer-events: none;
          }

          .obby-dpad {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 5px;
            pointer-events: auto;
          }

          .obby-dpad div {
            display: flex;
            gap: 5px;
          }

          .obby-controls button {
            border: 2px solid rgba(255,255,255,0.65);
            background: rgba(20,30,45,0.7);
            color: white;
            font-weight: bold;
            touch-action: none;
            user-select: none;
          }

          .obby-dpad button {
            width: 53px;
            height: 53px;
            border-radius: 13px;
            font-size: 23px;
          }

          .obby-jump {
            pointer-events: auto;
            width: 82px;
            height: 82px;
            border-radius: 50%;
            font-size: 16px;
            background: rgba(30,130,220,0.85) !important;
          }
        `}
      </style>
    </div>
  );
}