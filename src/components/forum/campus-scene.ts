import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { footprint } from '@/content/enstab';

export type CampusView = 'arrival' | 'orbit' | 'close' | 'top' | 'lab';

const frames: Record<CampusView, { eye: number[]; aim: number[]; zoom: number }> = {
  arrival: { eye: [158, 41, -135], aim: [1, 9, 4], zoom: 1.0 },
  orbit: { eye: [163, 152, -168], aim: [17, 4, -1], zoom: 0.96 },
  close: { eye: [107, 22, -63], aim: [27, 7, -13], zoom: 0.9 },
  top: { eye: [0, 269, 0.05], aim: [0, 0, 0], zoom: 0.98 },
  lab: { eye: [146, 118, -139], aim: [2, 6, 2], zoom: 1.02 },
};

export function mountCampus(host: HTMLElement) {
  const renderer = new T.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.65));
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  host.appendChild(renderer.domElement);

  const scene = new T.Scene();
  scene.fog = new T.FogExp2(0x213952, 0.0024);
  const camera = new T.PerspectiveCamera(43, 1, 0.7, 1050);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.minPolarAngle = 0.0001;
  controls.maxPolarAngle = Math.PI * 0.494;
  controls.rotateSpeed = 0.48;
  controls.mouseButtons.RIGHT = T.MOUSE.ROTATE;
  controls.touches.ONE = T.TOUCH.ROTATE;
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');

  const ambient = new T.HemisphereLight(0x82b6ed, 0x31455f, 1.18);
  scene.add(ambient);
  const sun = new T.DirectionalLight(0xffd6ac, 1.35);
  sun.position.set(-104, 140, 55);
  scene.add(sun);
  const rim = new T.DirectionalLight(0x6baef7, 0.72);
  rim.position.set(85, 65, -115);
  scene.add(rim);

  const surface = (color: number) => new T.MeshStandardMaterial({ color, roughness: 0.88 });
  const concrete = surface(0xc8c3ae);
  const plaster = surface(0xe6e6e0);
  const asphalt = surface(0x71848a);
  const blue = surface(0x286387);
  const glass = surface(0x396c82);
  const grass = surface(0x718575);
  const trunk = surface(0x6a6254);
  const vegetation = surface(0x576e5c);
  const pavers = surface(0x9d8e80);
  const pavingImage = document.createElement('canvas');
  pavingImage.width = pavingImage.height = 128;
  const paving = pavingImage.getContext('2d')!;
  paving.fillStyle = '#333939';
  paving.fillRect(0, 0, 128, 128);
  for (let row = 0; row < 8; row++) {
    for (let column = -1; column < 8; column++) {
      const tone = 102 + ((row * 17 + column * 23 + 31) % 24);
      paving.fillStyle = `rgb(${tone}, ${tone - 5}, ${tone - 10})`;
      paving.fillRect(column * 16 + (row % 2) * 8 + 1, row * 16 + 1, 15, 15);
    }
  }
  const pavingTexture = new T.CanvasTexture(pavingImage);
  pavingTexture.colorSpace = T.SRGBColorSpace;
  pavingTexture.wrapS = pavingTexture.wrapT = T.RepeatWrapping;
  pavingTexture.repeat.set(14, 7);
  pavingTexture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  pavers.map = pavingTexture;
  const litGlass = new T.MeshStandardMaterial({
    color: 0xb58352,
    emissive: 0xffb96b,
    emissiveIntensity: 0.72,
    roughness: 0.34,
  });

  const boxGeometry = new T.BoxGeometry(1, 1, 1);
  const boxInstances = new Map<T.Material, T.Matrix4[]>();
  const stamp = new T.Object3D();
  function box(
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    mat: T.Material,
    angle = 0,
  ) {
    stamp.position.set(x, y, z);
    stamp.rotation.y = angle;
    stamp.scale.set(w, h, d);
    stamp.updateMatrix();
    const instances = boxInstances.get(mat) ?? [];
    instances.push(stamp.matrix.clone());
    boxInstances.set(mat, instances);
  }

  box(0, -1.05, 0, 780, 1.6, 690, asphalt);
  box(66, -0.17, -42, 67, 0.5, 93, pavers, -0.74);
  box(101, 0.02, -28, 17, 0.21, 68, grass, -0.74);
  box(76, 0.01, -51, 12, 0.19, 46, grass, -0.74);
  box(30, -0.15, -92, 390, 0.28, 12, surface(0x263343), 0.4);
  box(-86, 0.08, 57, 38, 0.27, 38, grass);
  box(39, 0.05, -63, 38, 0.22, 34, grass, -0.46);
  box(-47, 0.06, 61, 28, 0.23, 22, grass, -0.29);
  box(-36, 0.1, 72, 132, 0.32, 3.6, concrete, -0.2);

  // OSM supplies the exterior perimeter. The footage guides the interior and massing.
  const plan = new T.Shape();
  footprint.forEach(([x, z], i) => (i ? plan.lineTo(x, -z) : plan.moveTo(x, -z)));
  plan.closePath();
  const court = new T.Path();
  court.moveTo(-42, 14);
  court.quadraticCurveTo(-39, 24, -25, 21);
  court.lineTo(15, 10);
  court.lineTo(25, 1);
  court.lineTo(22, -10);
  court.lineTo(-27, 0);
  court.quadraticCurveTo(-43, 3, -42, 14);
  plan.holes.push(court);
  function extrude(height: number, y: number, top: T.Material, sides: T.Material) {
    const geometry = new T.ExtrudeGeometry(plan, { depth: height, bevelEnabled: false });
    geometry.rotateX(-Math.PI / 2);
    const mesh = new T.Mesh(geometry, [top, sides]);
    mesh.position.y = y;
    scene.add(mesh);
    return mesh;
  }
  extrude(0.28, 0.22, concrete, concrete);
  extrude(10.2, 0.5, plaster, concrete);
  const cap = extrude(0.55, 10.7, plaster, plaster);
  const edges = new T.LineSegments(
    new T.EdgesGeometry(cap.geometry),
    new T.LineBasicMaterial({
      color: 0x819397,
      transparent: true,
      opacity: 0.42,
    }),
  );
  edges.position.y = 10.72;
  scene.add(edges);
  const surveyGeometry = new T.BufferGeometry().setFromPoints(
    [...footprint, footprint[0]].map(([x, z]) => new T.Vector3(x, 11.32, z)),
  );
  const surveyMaterial = new T.LineBasicMaterial({
    color: 0xffbd79,
    transparent: true,
    opacity: 0,
    depthTest: false,
    toneMapped: false,
  });
  const survey = new T.Line(surveyGeometry, surveyMaterial);
  survey.renderOrder = 4;
  scene.add(survey);

  const signed = footprint.reduce((acc, [x, z], i) => {
    const [nx, nz] = footprint[(i + 1) % footprint.length];
    return acc + x * nz - nx * z;
  }, 0);
  footprint.forEach(([x, z], i) => {
    const [nx, nz] = footprint[(i + 1) % footprint.length];
    const dx = nx - x,
      dz = nz - z;
    const length = Math.hypot(dx, dz);
    if (length < 6) return;
    const ox = (Math.sign(signed) * dz) / length;
    const oz = (-Math.sign(signed) * dx) / length;
    const angle = -Math.atan2(dz, dx);
    box(
      (x + nx) / 2 + ox * 0.25,
      9.5,
      (z + nz) / 2 + oz * 0.25,
      length - 0.25,
      0.6,
      0.54,
      plaster,
      angle,
    );
    const count = Math.floor(length / 4.5);
    for (let index = 0; index < count; index += 1) {
      const f = (index + 0.5) / count;
      for (const y of [3, 6.3]) {
        box(
          x + dx * f + ox * 0.16,
          y,
          z + dz * f + oz * 0.16,
          2.4,
          1.45,
          0.38,
          (index * 7 + i * 11 + y) % 5 < 1.5 ? litGlass : y === 3 ? blue : glass,
          angle,
        );
      }
    }
  });
  box(-57, 12.3, -12, 25, 2.2, 18, plaster, -0.29);
  box(-57, 13.6, -12, 21, 0.5, 15, concrete, -0.29);
  box(-6, 12.15, -28, 30, 1.7, 12, plaster, -0.26);
  box(14, 12.85, -17, 9, 3.1, 9, blue);
  const dome = new T.Mesh(
    new T.SphereGeometry(4.5, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    plaster,
  );
  dome.position.set(-41, 11.23, 11);
  dome.scale.y = 0.58;
  scene.add(dome);
  box(-20, 0.05, -7, 21, 0.22, 9, grass, -0.26);
  for (let i = 0; i < 6; i += 1) {
    const x = -15 + i * 5;
    const z = 8 + i * 0.9;
    box(x, 3, z, 0.55, 5.7, 0.55, plaster);
    box(x, 5.9, z, 0.62, 0.55, 8, concrete, -0.22);
  }
  box(-2.5, 5.9, 10.3, 28, 0.6, 0.65, plaster, -0.18);
  box(25, 11.85, 27, 35, 1.45, 19, concrete, -0.27);
  box(24, 12.7, 27, 30, 0.26, 15, plaster, -0.27);
  // The satellite view and façade photo guide the shape of the pavilion and approach.
  const pavilion = new T.Mesh(new T.CylinderGeometry(12.2, 12.2, 10.1, 36), blue);
  pavilion.position.set(8, 5.12, -43);
  pavilion.scale.z = 0.85;
  scene.add(pavilion);
  const pavilionRoof = new T.Mesh(new T.CylinderGeometry(12.65, 12.65, 0.65, 36), plaster);
  pavilionRoof.position.set(8, 10.34, -43);
  pavilionRoof.scale.z = 0.85;
  scene.add(pavilionRoof);
  for (let i = 0; i < 14; i++) {
    const angle = (Math.PI * 2 * i) / 14;
    box(
      8 + Math.cos(angle) * 12.23,
      5.6,
      -43 + Math.sin(angle) * 10.39,
      0.22,
      8.6,
      0.46,
      concrete,
      -angle,
    );
  }
  const entry = { x: 55, z: -12, angle: -0.87 };
  const entryGlass = surface(0x324753);
  box(entry.x, 6.4, entry.z, 17.5, 11.7, 0.75, entryGlass, entry.angle);
  for (let column = -4; column <= 4; column++) {
    const spacing = column * 2;
    box(
      entry.x + spacing * 0.645,
      6.4,
      entry.z + spacing * 0.764,
      0.16,
      11.8,
      0.96,
      concrete,
      entry.angle,
    );
  }
  for (const height of [0.55, 4.25, 8.15, 12.25]) {
    box(entry.x, height, entry.z, 17.8, 0.23, 0.99, concrete, entry.angle);
  }
  box(57, 4.9, -14, 19.2, 0.43, 6.8, concrete, entry.angle);
  box(58, 0.17, -15, 19, 0.41, 8, plaster, entry.angle);

  const inscription = document.createElement('canvas');
  inscription.width = 512;
  inscription.height = 112;
  const lettering = inscription.getContext('2d')!;
  lettering.clearRect(0, 0, 512, 112);
  lettering.fillStyle = '#ffe0ae';
  lettering.font = 'bold 70px sans-serif';
  lettering.textAlign = 'center';
  lettering.textBaseline = 'middle';
  lettering.fillText('ENSTAB', 256, 59);
  const signTexture = new T.CanvasTexture(inscription);
  signTexture.colorSpace = T.SRGBColorSpace;
  const sign = new T.Mesh(
    new T.PlaneGeometry(16, 3.5),
    new T.MeshBasicMaterial({ map: signTexture, transparent: true, depthWrite: false }),
  );
  sign.position.set(55.45, 10.1, -12.38);
  sign.rotation.y = Math.PI + entry.angle;
  scene.add(sign);

  const lampGlass = new T.MeshBasicMaterial({ color: 0xffc985, toneMapped: false });
  const haloCanvas = document.createElement('canvas');
  haloCanvas.width = haloCanvas.height = 64;
  const brush = haloCanvas.getContext('2d')!;
  const radial = brush.createRadialGradient(32, 32, 0, 32, 32, 32);
  radial.addColorStop(0, 'rgba(255,183,105,0.86)');
  radial.addColorStop(0.28, 'rgba(255,177,96,0.4)');
  radial.addColorStop(1, 'rgba(255,165,78,0)');
  brush.fillStyle = radial;
  brush.fillRect(0, 0, 64, 64);
  const haloTexture = new T.CanvasTexture(haloCanvas);
  const haloMaterial = new T.MeshBasicMaterial({
    map: haloTexture,
    transparent: true,
    depthWrite: false,
    opacity: 0.7,
    blending: T.AdditiveBlending,
    toneMapped: false,
  });
  for (const [x, z] of [
    [-83, 75],
    [-66, 64],
    [-49, 51],
    [-25, 67],
    [4, 65],
    [35, 67],
    [64, 70],
    [-66, 98],
    [-23, 100],
    [-69, 119],
    [-20, 119],
    [62, -31],
    [69, -47],
    [79, -58],
    [88, -68],
    [98, -78],
  ]) {
    box(x, 2.6, z, 0.24, 5, 0.24, blue);
    box(x, 5.15, z, 0.9, 0.31, 0.64, lampGlass);
    const halo = new T.Mesh(new T.PlaneGeometry(23, 23), haloMaterial);
    halo.rotation.x = -Math.PI / 2;
    halo.position.set(x, 0.36, z);
    scene.add(halo);
  }

  const crown = new T.IcosahedronGeometry(1, 1);
  const trees = [
    [-93, 50],
    [-87, 65],
    [-98, 70],
    [-83, 76],
    [-67, 70],
    [-52, 57],
    [-31, 68],
    [-13, 68],
    [45, -66],
    [50, -60],
    [43, -51],
    [61, -59],
    [-89, 10],
    [-93, 21],
    [93, 67],
  ];
  trees.forEach(([x, z], i) => {
    const size = 2.5 + (i % 4) * 0.35;
    box(x, 1.35, z, 0.5, 2.7, 0.5, trunk);
    const tree = new T.Mesh(crown, vegetation);
    tree.position.set(x, size + 1.6, z);
    tree.scale.set(size, size * 1.13, size);
    tree.rotation.y = i * 0.78;
    scene.add(tree);
  });
  const frond = new T.BufferGeometry();
  frond.setAttribute(
    'position',
    new T.Float32BufferAttribute(
      [0, 0, 0, 2.5, 1.45, 0.52, 7.4, -1.4, 0, 0, 0, 0, 7.4, -1.4, 0, 2.5, 1.45, -0.52],
      3,
    ),
  );
  frond.computeVertexNormals();
  const palmLeaf = new T.MeshStandardMaterial({ color: 0x4b6d53, side: T.DoubleSide });
  for (const [index, [x, z]] of [
    [-105, 90],
    [-87, 110],
    [-14, 100],
    [31, 100],
    [83, 89],
    [-110, 146],
  ].entries()) {
    const height = 9.7 + (index % 3);
    box(x, height / 2, z, 0.55, height, 0.55, trunk);
    for (let leaf = 0; leaf < 9; leaf++) {
      const canopy = new T.Mesh(frond, palmLeaf);
      canopy.position.set(x, height, z);
      canopy.rotation.y = (leaf * 2 * Math.PI) / 9 + index * 0.75;
      canopy.scale.setScalar(0.7 + (leaf % 3) * 0.14);
      scene.add(canopy);
    }
  }
  for (const [material, matrices] of boxInstances) {
    const mesh = new T.InstancedMesh(boxGeometry, material, matrices.length);
    matrices.forEach((matrix, index) => mesh.setMatrixAt(index, matrix));
    mesh.computeBoundingSphere();
    scene.add(mesh);
  }

  let travel = 0;
  let current: CampusView = 'orbit';
  function draw() {
    renderer.render(scene, camera);
  }
  function resize() {
    const { clientWidth: width, clientHeight: height } = host;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.fov = camera.aspect < 1 ? 54 : 43;
    camera.clearViewOffset();
    if (width >= 780) camera.setViewOffset(width, height, -width * 0.12, 0, width, height);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    draw();
  }
  function move(next: CampusView, immediate = false) {
    current = next;
    cancelAnimationFrame(travel);
    const frame = frames[next];
    const start = performance.now();
    const fromEye = camera.position.clone();
    const fromAim = controls.target.clone();
    const fromZoom = camera.zoom;
    const eye = new T.Vector3(...(frame.eye as [number, number, number]));
    const aim = new T.Vector3(...(frame.aim as [number, number, number]));
    function tick(now: number) {
      const p = immediate || still.matches ? 1 : Math.min((now - start) / 750, 1);
      const amount = p * p * (3 - 2 * p);
      camera.position.lerpVectors(fromEye, eye, amount);
      controls.target.lerpVectors(fromAim, aim, amount);
      camera.zoom = T.MathUtils.lerp(fromZoom, frame.zoom, amount);
      camera.updateProjectionMatrix();
      controls.update();
      draw();
      if (p < 1) travel = requestAnimationFrame(tick);
    }
    tick(start);
  }
  const stop = () => cancelAnimationFrame(travel);
  controls.addEventListener('change', draw);
  controls.addEventListener('start', stop);
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  move('arrival', true);
  resize();
  return {
    move,
    scrub(from: CampusView, to: CampusView, progress: number) {
      stop();
      current = progress < 0.5 ? from : to;
      const start = frames[from];
      const end = frames[to];
      const amount = still.matches
        ? Number(progress >= 0.5)
        : progress * progress * (3 - 2 * progress);
      const blend = (a: number, b: number) => T.MathUtils.lerp(a, b, amount);
      camera.position.set(
        blend(start.eye[0], end.eye[0]),
        blend(start.eye[1], end.eye[1]),
        blend(start.eye[2], end.eye[2]),
      );
      controls.target.set(
        blend(start.aim[0], end.aim[0]),
        blend(start.aim[1], end.aim[1]),
        blend(start.aim[2], end.aim[2]),
      );
      camera.zoom = blend(start.zoom, end.zoom);
      const tracing = from === 'arrival' && to === 'close' && !still.matches;
      surveyGeometry.setDrawRange(
        0,
        tracing ? Math.floor((footprint.length + 1) * Math.min(1, amount * 1.45)) : 0,
      );
      surveyMaterial.opacity = tracing ? Math.sin(Math.PI * progress) : 0;
      camera.updateProjectionMatrix();
      controls.update();
      draw();
    },
    zoom(amount: number) {
      stop();
      camera.zoom = T.MathUtils.clamp(camera.zoom * amount, 0.7, 3);
      camera.updateProjectionMatrix();
      draw();
    },
    reset() {
      move(current);
    },
    dispose() {
      stop();
      observer.disconnect();
      controls.dispose();
      const geometries = new Set<T.BufferGeometry>();
      const materials = new Set<T.Material>();
      scene.traverse((object) => {
        if (object instanceof T.Mesh || object instanceof T.Line) {
          geometries.add(object.geometry);
          const list = Array.isArray(object.material) ? object.material : [object.material];
          list.forEach((material) => materials.add(material));
        }
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      haloTexture.dispose();
      pavingTexture.dispose();
      signTexture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
