import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { Example, Snapshot } from '../math/engine';
import { sectionLoss } from '../math/engine';
import { makeLandscape } from './geometry';
import { number } from '../components/shared';

export interface CameraView { rotation: number; zoom: number; reset: number }

function ContextGuard({ onFailure }: { onFailure: () => void }) {
  const { gl } = useThree();
  useEffect(() => {
    const lost = (event: Event) => { event.preventDefault(); onFailure(); };
    gl.domElement.addEventListener('webglcontextlost', lost);
    return () => gl.domElement.removeEventListener('webglcontextlost', lost);
  }, [gl, onFailure]);
  return null;
}

function Camera({ view }: { view: CameraView }) {
  const { camera, gl, invalidate } = useThree();
  const controls = useRef<OrbitControls | null>(null);
  const destination = useRef<THREE.Vector3 | null>(null);
  useEffect(() => {
    const orbit = new OrbitControls(camera, gl.domElement);
    orbit.target.set(0, 0.9, 0);
    orbit.minDistance = 5; orbit.maxDistance = 22;
    orbit.minPolarAngle = 0.2; orbit.maxPolarAngle = Math.PI / 2 - 0.06;
    orbit.enablePan = false;
    orbit.addEventListener('change', () => invalidate());
    orbit.addEventListener('start', () => { destination.current = null; });
    orbit.update(); controls.current = orbit;
    return () => { orbit.dispose(); controls.current = null; };
  }, [camera, gl, invalidate]);
  useEffect(() => {
    const radius = 11 / view.zoom;
    const theta = 0.75 + view.rotation;
    destination.current = new THREE.Vector3(Math.sin(theta) * radius, radius * 0.6, Math.cos(theta) * radius);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      camera.position.copy(destination.current); destination.current = null; controls.current?.update();
    }
    invalidate();
  }, [view, camera, invalidate]);
  useFrame((_, delta) => {
    if (!destination.current) return;
    camera.position.lerp(destination.current, 1 - Math.exp(-10 * delta));
    controls.current?.update();
    if (camera.position.distanceTo(destination.current) < 0.005) destination.current = null;
    else invalidate();
  });
  return null;
}

function Label({ text, position, color = '#a8b5aa' }: { text: string; position: [number, number, number]; color?: string }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 96;
    const context = canvas.getContext('2d')!;
    context.font = '44px monospace'; context.textAlign = 'center'; context.textBaseline = 'middle';
    context.fillStyle = color; context.fillText(text, 256, 48);
    return new THREE.CanvasTexture(canvas);
  }, [text, color]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <sprite position={position} scale={[2.5, 0.47, 1]}><spriteMaterial map={texture} transparent depthTest={false}/></sprite>;
}

function Surface({ data, current, example, reset }: { data: ReturnType<typeof makeLandscape>; current: Snapshot; example: Example; reset: boolean }) {
  const { invalidate } = useThree();
  const geometry = useMemo(() => {
    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.Float32BufferAttribute(data.positions, 3));
    result.setIndex(data.indices); result.computeVertexNormals();
    const low = new THREE.Color('#405937'); const high = new THREE.Color('#24524f');
    const colors = data.samples.flatMap((p) => { const color = low.clone().lerp(high, p[1] / data.maxLoss); return [color.r, color.g, color.b]; });
    result.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return result;
  }, [data]);
  const grid = useMemo(() => new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(data.grid, 3)), [data]);
  const path = useMemo(() => new THREE.BufferGeometry().setFromPoints(data.path.map(p => new THREE.Vector3(p[0], p[1] + 0.025, p[2]))), [data]);
  const pathMaterial = useMemo(() => new THREE.LineBasicMaterial({ color: '#ff9c88', depthTest: false }), []);
  const pathLine = useMemo(() => new THREE.Line(path, pathMaterial), [path, pathMaterial]);
  const axes = useMemo(() => new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-3, 0, 3), new THREE.Vector3(3.35, 0, 3),
    new THREE.Vector3(-3, 0, 3), new THREE.Vector3(-3, 0, -3.35),
    new THREE.Vector3(-3, 0, 3), new THREE.Vector3(-3, 3.6, 3),
  ]), []);
  const marker = useRef<THREE.Group>(null);
  const initialMarker = useRef(data.marker);
  const displayedWeights = useRef([current.weights[0], current.weights[1]]);
  const projection = useMemo(() => new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3)), []);
  const floor = useMemo(() => {
    const points = [];
    for (let i = -3; i <= 3; i++) points.push(i, -0.025, -3, i, -0.025, 3, -3, -0.025, i, 3, -0.025, i);
    return new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  }, []);
  const gradientArrow = useMemo(() => {
    const g = current.gradient;
    const norm = Math.hypot(g[0], g[1]);
    if (norm < 1e-10) return null;
    return new THREE.ArrowHelper(new THREE.Vector3(-g[0] / norm, 0, -g[1] / norm), new THREE.Vector3(data.marker[0], 0.06, data.marker[2]), 0.9, '#c5f86b', 0.2, 0.12);
  }, [data, current]);
  useEffect(() => {
    invalidate();
    return () => { geometry.dispose(); grid.dispose(); path.dispose(); };
  }, [geometry, grid, path, invalidate]);
  useEffect(() => () => { axes.dispose(); pathMaterial.dispose(); projection.dispose(); floor.dispose(); }, [axes, pathMaterial, projection, floor]);
  useEffect(() => () => {
    if (gradientArrow) {
      gradientArrow.line.geometry.dispose(); gradientArrow.cone.geometry.dispose();
      for (const material of [gradientArrow.line.material, gradientArrow.cone.material]) {
        if (Array.isArray(material)) material.forEach(m => m.dispose()); else material.dispose();
      }
    }
  }, [gradientArrow]);
  useFrame((_, delta) => {
    if (!marker.current) return;
    const amount = reset || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 1 - Math.exp(-14 * delta);
    const weights = displayedWeights.current;
    for (let i = 0; i < 2; i++) weights[i] += (current.weights[i] - weights[i]) * amount;
    const moving = Math.max(...weights.map((w, i) => Math.abs(w - current.weights[i]))) > data.span * 0.0001;
    if (!moving) { weights[0] = current.weights[0]; weights[1] = current.weights[1]; }
    const x = (weights[0] - (data.bounds.min1 + data.bounds.max1) / 2) / data.span * 3;
    const z = (weights[1] - (data.bounds.min2 + data.bounds.max2) / 2) / data.span * 3;
    const y = sectionLoss(example, weights[0], weights[1], data.fixedW3) / data.maxLoss * 3.4;
    marker.current.position.set(x, y, z);
    const positions = projection.getAttribute('position');
    positions.setXYZ(0, x, 0, z); positions.setXYZ(1, x, y, z); positions.needsUpdate = true;
    if (moving) invalidate();
  });
  return <>
    <ambientLight intensity={0.75}/><hemisphereLight args={['#b5d4cb', '#1a2117', 1.3]}/>
    <directionalLight position={[4, 7, 2]} intensity={2.2} color="#d7f7b3"/>
    <directionalLight position={[-4, 3, -3]} intensity={1.4} color="#79dacc"/>
    <mesh geometry={geometry}><meshStandardMaterial vertexColors roughness={0.68} metalness={0.12} side={THREE.DoubleSide} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1}/></mesh>
    <lineSegments geometry={floor}><lineBasicMaterial color="#718677" transparent opacity={0.17}/></lineSegments>
    <lineSegments geometry={grid}><lineBasicMaterial color="#addcc4" transparent opacity={0.38}/></lineSegments>
    <lineSegments geometry={axes}><lineBasicMaterial color="#657567"/></lineSegments>
    {data.path.length > 1 && <primitive object={pathLine} renderOrder={3} dispose={null}/>}
    <lineSegments geometry={projection}><lineBasicMaterial color="#c5f86b" transparent opacity={0.6} depthTest={false}/></lineSegments>
    <group ref={marker} position={initialMarker.current}>
      <mesh><sphereGeometry args={[0.105, 20, 16]}/><meshBasicMaterial color="#c5f86b" depthTest={false}/></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[0.21, 0.012, 8, 40]}/><meshBasicMaterial color="#e3ffbd" depthTest={false}/></mesh>
    </group>
    {gradientArrow && <primitive object={gradientArrow}/>}
    <Label text="w₁" position={[3.6, 0, 3]}/><Label text="w₂" position={[-3.2, 0, -3.6]}/><Label text="L · USD²" position={[-3, 4, 3]}/>
    <Label text={number(data.bounds.min1, 2)} position={[-2.4, -0.45, 3.2]}/><Label text={number(data.bounds.max1, 2)} position={[3, -0.3, 3.2]}/>
    <Label text={number(data.bounds.max2, 2)} position={[-3.6, -0.2, 2.2]}/><Label text={number(data.bounds.min2, 2)} position={[-3.3, -0.3, -3]}/>
    <Label text={number(data.maxLoss, 0)} position={[-3, 3.4, 3]}/><Label text="0" position={[-3.4, 0.35, 3.3]}/>
  </>;
}

export default function Landscape3D({ example, history, view, onFailure }: { example: Example; history: readonly Snapshot[]; view: CameraView; onFailure: () => void }) {
  const data = useMemo(() => makeLandscape(example, history), [example, history]);
  return <div className="canvas-container" data-testid="landscape-3d" role="img" aria-label="Superficie interactiva de pérdida. Arrastra para rotar o utiliza los botones de cámara. Los ejes son peso uno, peso dos y pérdida en USD al cuadrado.">
    <Canvas frameloop="demand" dpr={[1, 1.7]} camera={{ position: [8, 6, 8], fov: 42 }} gl={{ antialias: true, alpha: true }}>
      <ContextGuard onFailure={onFailure}/><Camera view={view}/><Surface data={data} current={history[history.length - 1]} example={example} reset={history.length === 1}/>
    </Canvas>
    <div className="coordinate-key mono"><span>w₁: {number(data.bounds.min1, 3)} a {number(data.bounds.max1, 3)}</span><span>w₂: {number(data.bounds.min2, 3)} a {number(data.bounds.max2, 3)}</span><span>L: 0 a {number(data.maxLoss, 2)} USD²</span></div>
  </div>;
}
