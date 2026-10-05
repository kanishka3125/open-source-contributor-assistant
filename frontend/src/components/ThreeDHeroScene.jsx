import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * ThreeDHeroScene — GitHub Logo 3D Edition
 * -----------------------------------------
 * Renders an interactive, drag-rotatable 3D extruded GitHub Octocat/mark logo.
 * Built entirely with Three.js ShapeGeometry + ExtrudeGeometry from the
 * official GitHub SVG mark path data.
 *
 * Interactions:
 *  - Auto slow rotation (ambient spin)
 *  - Drag-to-rotate on mouse/touch
 *  - Subtle mouse parallax on hover
 *  - Floating orbital commit-node particles
 */
export default function ThreeDHeroScene({ theme = "light", className = "" }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 460;
    const height = mount.clientHeight || 420;

    // ── Scene & Camera ──────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 500);
    camera.position.set(0, 0, 14);

    // ── Renderer ────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    // ── Theme Colors ─────────────────────────────────────────────
    const isDark = theme === "dark";
    const logoColor = isDark ? 0xf0f6ff : 0x1a1a2e;
    const logoEdgeColor = isDark ? 0xffffff : 0x24292f;
    const particleColor = isDark ? 0x94a3b8 : 0x6b7280;
    const bgGlowColor = isDark ? 0x1e293b : 0xf1f5f9;

    // ── Lighting ─────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, isDark ? 0.6 : 0.8));

    const keyLight = new THREE.DirectionalLight(0xffffff, isDark ? 1.8 : 2.0);
    keyLight.position.set(6, 8, 8);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(isDark ? 0x38bdf8 : 0x6366f1, 0.8, 40);
    fillLight.position.set(-5, -4, 3);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(isDark ? 0x34d399 : 0x0ea5e9, 0.5, 40);
    rimLight.position.set(5, -6, -4);
    scene.add(rimLight);

    // ── Master Group ─────────────────────────────────────────────
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // ── Build GitHub Mark Shape from SVG Path ────────────────────
    // GitHub's official mark SVG viewBox 0 0 98 96, centered & scaled to [-3.5, 3.5]
    // We trace the outer silhouette as a THREE.Shape using cubic bezier curves.
    const SVG_SCALE = 7 / 98; // map 98px → 7 units
    const OFFSET_X = -49 * SVG_SCALE; // center X
    const OFFSET_Y = -48 * SVG_SCALE; // center Y (flip Y because SVG Y is down)

    // Helper: convert SVG coords to Three.js coords
    const sx = (x) => x * SVG_SCALE + OFFSET_X;
    const sy = (y) => -(y * SVG_SCALE + OFFSET_Y); // Flip Y

    // Official GitHub mark outline as a closed Shape
    const shape = new THREE.Shape();

    // The path traced from GitHub's SVG mark (simplified for Three.js)
    // Original path: https://github.com/logos
    shape.moveTo(sx(48.854), sy(0));
    shape.bezierCurveTo(sx(21.839), sy(0), sx(0), sy(22), sx(0), sy(49.217));
    shape.bezierCurveTo(sx(0), sy(70.848), sx(13.993), sy(89.358), sx(33.405), sy(95.907));
    shape.bezierCurveTo(sx(35.832), sy(96.376), sx(36.72), sy(94.862), sx(36.72), sy(93.569));
    shape.bezierCurveTo(sx(36.72), sy(92.423), sx(36.664), sy(89.288), sx(36.637), sy(85.97));
    shape.bezierCurveTo(sx(23.054), sy(88.881), sx(20.178), sy(79.872), sx(20.178), sy(79.872));
    shape.bezierCurveTo(sx(17.969), sy(74.123), sx(14.762), sy(72.616), sx(14.762), sy(72.616));
    shape.bezierCurveTo(sx(10.337), sy(69.633), sx(15.096), sy(69.694), sx(15.096), sy(69.694));
    shape.bezierCurveTo(sx(20.004), sy(70.026), sx(22.58), sy(74.728), sx(22.58), sy(74.728));
    shape.bezierCurveTo(sx(26.927), sy(82.27), sx(33.97), sy(80.024), sx(36.808), sy(78.786));
    shape.bezierCurveTo(sx(37.267), sy(75.643), sx(38.529), sy(73.401), sx(39.927), sy(72.138));
    shape.bezierCurveTo(sx(28.975), sy(70.855), sx(17.462), sy(66.594), sx(17.462), sy(47.544));
    shape.bezierCurveTo(sx(17.462), sy(42.099), sx(19.405), sy(37.664), sx(22.678), sy(34.234));
    shape.bezierCurveTo(sx(22.161), sy(32.955), sx(20.477), sy(27.876), sx(23.17), sy(21.046));
    shape.bezierCurveTo(sx(23.17), sy(21.046), sx(27.24), sy(19.693), sx(36.607), sy(26.078));
    shape.bezierCurveTo(sx(40.571), sy(24.963), sx(44.818), sy(24.404), sx(49.054), sy(24.386));
    shape.bezierCurveTo(sx(53.29), sy(24.404), sx(57.539), sy(24.963), sx(61.507), sy(26.078));
    shape.bezierCurveTo(sx(70.869), sy(19.693), sx(74.939), sy(21.046), sx(74.939), sy(21.046));
    shape.bezierCurveTo(sx(77.634), sy(27.876), sx(75.952), sy(32.955), sx(75.435), sy(34.234));
    shape.bezierCurveTo(sx(78.711), sy(37.664), sx(80.641), sy(42.099), sx(80.641), sy(47.544));
    shape.bezierCurveTo(sx(80.641), sy(66.638), sx(69.108), sy(70.836), sx(58.124), sy(72.087));
    shape.bezierCurveTo(sx(59.87), sy(73.629), sx(61.42), sy(76.659), sx(61.42), sy(81.24));
    shape.bezierCurveTo(sx(61.42), sy(87.958), sx(61.366), sy(93.403), sx(61.366), sy(95.025));
    shape.bezierCurveTo(sx(61.366), sy(96.334), sx(62.238), sy(97.864), sx(64.695), sy(97.395));
    shape.bezierCurveTo(sx(84.079), sy(90.827), sx(98), sy(72.332), sx(98), sy(49.217));
    shape.bezierCurveTo(sx(98), sy(22), sx(75.862), sy(0), sx(48.854), sy(0));
    shape.closePath();

    // ── Extrude the GitHub Mark shape ───────────────────────────
    const extrudeSettings = {
      depth: 0.65,
      bevelEnabled: true,
      bevelThickness: 0.12,
      bevelSize: 0.1,
      bevelSegments: 5,
    };

    const extrudeGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    // Center the geometry
    extrudeGeo.computeBoundingBox();
    const bbox = extrudeGeo.boundingBox;
    const centerX = (bbox.max.x + bbox.min.x) / 2;
    const centerY = (bbox.max.y + bbox.min.y) / 2;
    const centerZ = (bbox.max.z + bbox.min.z) / 2;
    extrudeGeo.translate(-centerX, -centerY, -centerZ);

    // Main logo material — polished, slightly metallic
    const logoMat = new THREE.MeshStandardMaterial({
      color: logoColor,
      roughness: isDark ? 0.25 : 0.18,
      metalness: isDark ? 0.7 : 0.45,
    });

    const logoMesh = new THREE.Mesh(extrudeGeo, logoMat);
    masterGroup.add(logoMesh);

    // ── Glowing wireframe overlay ─────────────────────────────────
    const wireGeo = new THREE.EdgesGeometry(extrudeGeo, 15);
    const wireMat = new THREE.LineBasicMaterial({
      color: logoEdgeColor,
      transparent: true,
      opacity: isDark ? 0.25 : 0.12,
    });
    const wireMesh = new THREE.LineSegments(wireGeo, wireMat);
    masterGroup.add(wireMesh);

    // ── Floating Commit Particles ─────────────────────────────────
    const particleCount = 60;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      const r = 4.5 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i] = r * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = r * Math.cos(phi);
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: particleColor,
      size: 0.06,
      transparent: true,
      opacity: isDark ? 0.55 : 0.35,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ── Small floating cube nodes ─────────────────────────────────
    const cubeGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const nodeCubes = [];
    const nodeCount = 8;
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 3.8 + (i % 2) * 0.6;
      const cubeMat = new THREE.MeshStandardMaterial({
        color: isDark ? 0x38bdf8 : 0x1a1a2e,
        roughness: 0.2,
        metalness: 0.6,
      });
      const cube = new THREE.Mesh(cubeGeo, cubeMat);
      cube.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.6,
        (Math.random() - 0.5) * 1.5
      );
      cube.userData = { angle, radius, speed: 0.005 + (i % 3) * 0.003, phase: i * 0.8 };
      scene.add(cube);
      nodeCubes.push(cube);
    }

    // ── Interaction: Drag-to-Rotate + Parallax ────────────────────
    let isDragging = false;
    let previousMouse = { x: 0, y: 0 };
    let targetRotX = 0;
    let targetRotY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const onMouseMove = (e) => {
      const rect = mount.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = nx * 0.35;
      mouseY = ny * 0.25;

      if (isDragging) {
        const dx = e.clientX - previousMouse.x;
        const dy = e.clientY - previousMouse.y;
        targetRotY += dx * 0.012;
        targetRotX += dy * 0.012;
        previousMouse = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseDown = (e) => {
      isDragging = true;
      previousMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => { isDragging = false; };

    mount.addEventListener("mousemove", onMouseMove);
    mount.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    // ── Resize ────────────────────────────────────────────────────
    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // ── Animation Loop ────────────────────────────────────────────
    let rafId;
    const startTime = performance.now();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = (performance.now() - startTime) / 1000;

      // Ambient gentle spin
      if (!isDragging) {
        targetRotY += 0.004;
      }

      // Smooth damp towards target + parallax
      masterGroup.rotation.y += (targetRotY + mouseX - masterGroup.rotation.y) * 0.07;
      masterGroup.rotation.x += (targetRotX - mouseY - masterGroup.rotation.x) * 0.07;

      // Subtle logo breathe
      const breathe = 1 + Math.sin(t * 1.4) * 0.018;
      logoMesh.scale.set(breathe, breathe, 1);
      wireMesh.scale.set(breathe, breathe, 1);

      // Orbit floating cube nodes
      for (const cube of nodeCubes) {
        cube.userData.angle += cube.userData.speed;
        const a = cube.userData.angle;
        const r = cube.userData.radius;
        cube.position.x = Math.cos(a) * r;
        cube.position.y = Math.sin(a) * r * 0.6;
        cube.position.z = Math.sin(t * 0.8 + cube.userData.phase) * 0.8;
        cube.rotation.x += 0.02;
        cube.rotation.y += 0.02;
      }

      // Slow particle field rotation
      particles.rotation.y = t * 0.025;
      particles.rotation.z = t * 0.01;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mouseup", onMouseUp);
      mount.removeEventListener("mousemove", onMouseMove);
      mount.removeEventListener("mousedown", onMouseDown);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      extrudeGeo.dispose();
      logoMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      cubeGeo.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, [theme]);

  return (
    <div className={`three-d-hero-container ${className}`.trim()}>
      <div className="three-d-canvas-wrapper" ref={mountRef} />
    </div>
  );
}
