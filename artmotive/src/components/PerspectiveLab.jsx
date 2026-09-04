import { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

// Componente para un plano con rejilla
function Wall({ position, rotation, gridColor, planeColor, visible }) {
  if (!visible) return null;
  return (
    <group position={position} rotation={rotation}>
      <Grid 
        args={[40, 40]} 
        cellSize={1} cellThickness={1} cellColor={gridColor} 
        sectionSize={5} sectionThickness={1.5} sectionColor={gridColor} 
        fadeDistance={40} 
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshBasicMaterial color={planeColor} transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// Componente para la habitación de perspectiva interactiva
function PerspectiveRoom({ walls }) {
  return (
    <group>
      <Wall position={[0, -5, 0]} rotation={[0, 0, 0]} gridColor="#22c55e" planeColor="#4ade80" visible={walls.floor} />
      <Wall position={[0, 5, 0]} rotation={[Math.PI, 0, 0]} gridColor="#eab308" planeColor="#fde047" visible={walls.ceiling} />
      <Wall position={[-10, 0, 0]} rotation={[0, 0, -Math.PI / 2]} gridColor="#ef4444" planeColor="#f87171" visible={walls.left} />
      <Wall position={[10, 0, 0]} rotation={[0, 0, Math.PI / 2]} gridColor="#3b82f6" planeColor="#60a5fa" visible={walls.right} />
      <Wall position={[0, 0, -10]} rotation={[Math.PI / 2, 0, 0]} gridColor="#a855f7" planeColor="#c084fc" visible={walls.back} />
    </group>
  );
}

// Componente para un objeto interactivo
function InteractiveObject({ obj, mode, activeId, setActiveId }) {
  const isActive = activeId === obj.id;

  let content = null;
  if (obj.type === 'cube') {
    content = (
      <mesh onClick={(e) => { e.stopPropagation(); setActiveId(obj.id); }}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color={obj.color} />
      </mesh>
    );
  } else if (obj.type === 'sphere') {
    content = (
      <mesh onClick={(e) => { e.stopPropagation(); setActiveId(obj.id); }}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial color={obj.color} />
      </mesh>
    );
  } else if (obj.type === 'cylinder') {
    content = (
      <mesh onClick={(e) => { e.stopPropagation(); setActiveId(obj.id); }}>
        <cylinderGeometry args={[1, 1, 3, 32]} />
        <meshStandardMaterial color={obj.color} />
      </mesh>
    );
  } else if (obj.type === 'custom' && obj.scene) {
    content = (
      <primitive 
        object={obj.scene} 
        onClick={(e) => { e.stopPropagation(); setActiveId(obj.id); }} 
      />
    );
  }

  return (
    <group position={obj.position} scale={obj.scale || [1,1,1]}>
      {isActive ? (
        <TransformControls mode={mode} makeDefault>
          {content}
        </TransformControls>
      ) : (
        content
      )}
    </group>
  );
}

export function PerspectiveLab() {
  const [objects, setObjects] = useState([]);
  const [transformMode, setTransformMode] = useState('translate');
  const [activeId, setActiveId] = useState(null);
  
  const [walls, setWalls] = useState({
    floor: true,
    ceiling: false,
    left: true,
    right: true,
    back: true
  });

  const toggleWall = (key) => {
    setWalls(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const addObject = (type) => {
    const newObj = {
      id: Date.now(),
      type,
      position: [0, 0, 0],
      scale: [1, 1, 1],
      color: `hsl(${Math.random() * 360}, 70%, 60%)`
    };
    setObjects(prev => [...prev, newObj]);
    setActiveId(newObj.id);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const ext = file.name.split('.').pop().toLowerCase();

    const onLoadCustom = (sceneData) => {
      let sceneToUse = sceneData.scene || sceneData;
      const newObj = {
        id: Date.now(),
        type: 'custom',
        position: [0, 0, 0],
        scale: [1, 1, 1],
        scene: sceneToUse.clone()
      };
      setObjects(prev => [...prev, newObj]);
      setActiveId(newObj.id);
    };

    if (ext === 'gltf' || ext === 'glb') {
      const loader = new GLTFLoader();
      loader.load(url, onLoadCustom, undefined, (err) => console.error(err));
    } else if (ext === 'obj') {
      const loader = new OBJLoader();
      loader.load(url, onLoadCustom, undefined, (err) => console.error(err));
    }
  };

  // Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!activeId) return;
      
      setObjects(prevObjects => prevObjects.map(obj => {
        if (obj.id !== activeId) return obj;
        
        let newPos = [...obj.position];
        let newScale = [...(obj.scale || [1,1,1])];
        const step = 0.5;
        const scaleStep = 0.1;

        switch (e.key) {
          case 'ArrowUp': newPos[2] -= step; break;
          case 'ArrowDown': newPos[2] += step; break;
          case 'ArrowLeft': newPos[0] -= step; break;
          case 'ArrowRight': newPos[0] += step; break;
          case 'w': case 'W': newPos[1] += step; break;
          case 's': case 'S': newPos[1] -= step; break;
          case '+': 
            newScale = [newScale[0] + scaleStep, newScale[1] + scaleStep, newScale[2] + scaleStep];
            break;
          case '-': 
            if (newScale[0] > 0.2) {
              newScale = [newScale[0] - scaleStep, newScale[1] - scaleStep, newScale[2] - scaleStep];
            }
            break;
          default: break;
        }

        return { ...obj, position: newPos, scale: newScale };
      }));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeId]);

  return (
    <div className="lab-container">
      <div className="lab-controls">
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: '100%' }}>
          <button className="filter-btn" onClick={() => addObject('cube')}>+ Cubo</button>
          <button className="filter-btn" onClick={() => addObject('sphere')}>+ Esfera</button>
          <button className="filter-btn" onClick={() => addObject('cylinder')}>+ Cilindro</button>
          <label className="filter-btn" style={{ cursor: 'pointer', background: 'var(--accent-color)', color: 'white', borderColor: 'var(--accent-color)' }}>
            + Importar 3D
            <input type="file" accept=".gltf,.glb,.obj" style={{ display: 'none' }} onChange={handleFileUpload} />
          </label>
          <button className="filter-btn" style={{ border: '1px solid #ef4444', marginLeft: 'auto' }} onClick={() => { setObjects([]); setActiveId(null); }}>Limpiar Todo</button>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: '100%', alignItems: 'center' }}>
          <span style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Transformar (Mouse):</span>
          <button className={`filter-btn ${transformMode === 'translate' ? 'active' : ''}`} onClick={() => setTransformMode('translate')}>Mover</button>
          <button className={`filter-btn ${transformMode === 'scale' ? 'active' : ''}`} onClick={() => setTransformMode('scale')}>Escalar</button>
          
          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)', margin: '0 10px' }}></div>
          
          <span style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Paredes:</span>
          <button className={`filter-btn ${walls.floor ? 'active' : ''}`} onClick={() => toggleWall('floor')}>Piso</button>
          <button className={`filter-btn ${walls.ceiling ? 'active' : ''}`} onClick={() => toggleWall('ceiling')}>Techo</button>
          <button className={`filter-btn ${walls.left ? 'active' : ''}`} onClick={() => toggleWall('left')}>Izq.</button>
          <button className={`filter-btn ${walls.right ? 'active' : ''}`} onClick={() => toggleWall('right')}>Der.</button>
          <button className={`filter-btn ${walls.back ? 'active' : ''}`} onClick={() => toggleWall('back')}>Fondo</button>
        </div>
      </div>

      <div className="canvas-wrapper" onPointerMissed={() => setActiveId(null)} tabIndex={0} style={{ outline: 'none' }}>
        <Canvas camera={{ position: [10, 10, 15], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
          <directionalLight position={[-10, 5, -10]} intensity={0.5} />
          
          <PerspectiveRoom walls={walls} />

          {objects.map(obj => (
            <InteractiveObject 
              key={obj.id} 
              obj={obj} 
              mode={transformMode}
              activeId={activeId}
              setActiveId={setActiveId}
            />
          ))}

          <OrbitControls makeDefault enableDamping maxPolarAngle={Math.PI / 1.1} />
          <Environment preset="city" />
        </Canvas>
      </div>
      <p className="lab-help">
        <strong>Selecciona un objeto.</strong> Teclado: <strong>Flechas</strong> = Frente/Atrás/Lados | <strong>W/S</strong> = Arriba/Abajo | <strong>+ / -</strong> = Escalar
      </p>
    </div>
  );
}
