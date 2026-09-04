import { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

// Componente para la habitación de perspectiva
function PerspectiveRoom() {
  const gridProps = {
    args: [40, 40],
    cellSize: 1,
    cellThickness: 1,
    cellColor: "#4b5563",
    sectionSize: 5,
    sectionThickness: 1.5,
    sectionColor: "#94a3b8",
    fadeDistance: 40
  };

  return (
    <group>
      {/* Suelo */}
      <Grid position={[0, -5, 0]} {...gridProps} />
      {/* Techo */}
      <Grid position={[0, 5, 0]} rotation={[Math.PI, 0, 0]} {...gridProps} />
      {/* Pared Izquierda */}
      <Grid position={[-10, 0, 0]} rotation={[0, 0, -Math.PI / 2]} {...gridProps} />
      {/* Pared Derecha */}
      <Grid position={[10, 0, 0]} rotation={[0, 0, Math.PI / 2]} {...gridProps} />
      {/* Pared de Fondo */}
      <Grid position={[0, 0, -10]} rotation={[Math.PI / 2, 0, 0]} {...gridProps} />
    </group>
  );
}

// Componente para un objeto interactivo
function InteractiveObject({ obj, mode, activeId, setActiveId }) {
  const meshRef = useRef();
  const isActive = activeId === obj.id;

  // Render geometries based on type
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
    <group position={obj.position}>
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
  const [transformMode, setTransformMode] = useState('translate'); // 'translate' | 'scale'
  const [activeId, setActiveId] = useState(null);

  const addObject = (type) => {
    const newObj = {
      id: Date.now(),
      type,
      position: [0, 0, 0],
      color: `hsl(${Math.random() * 360}, 70%, 60%)`
    };
    setObjects([...objects, newObj]);
    setActiveId(newObj.id);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const ext = file.name.split('.').pop().toLowerCase();

    const onLoadCustom = (sceneData) => {
      let sceneToUse = sceneData.scene || sceneData; // GLTF has .scene, OBJ is just a Group
      
      const newObj = {
        id: Date.now(),
        type: 'custom',
        position: [0, 0, 0],
        scene: sceneToUse.clone()
      };
      setObjects(prev => [...prev, newObj]);
      setActiveId(newObj.id);
    };

    if (ext === 'gltf' || ext === 'glb') {
      const loader = new GLTFLoader();
      loader.load(url, onLoadCustom, undefined, (error) => console.error("Error loading GLTF:", error));
    } else if (ext === 'obj') {
      const loader = new OBJLoader();
      loader.load(url, onLoadCustom, undefined, (error) => console.error("Error loading OBJ:", error));
    } else {
      alert("Formato no soportado. Por favor sube un archivo .gltf, .glb o .obj");
    }
  };

  return (
    <div className="lab-container">
      <div className="lab-controls">
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="filter-btn" onClick={() => addObject('cube')}>+ Cubo</button>
          <button className="filter-btn" onClick={() => addObject('sphere')}>+ Esfera</button>
          <button className="filter-btn" onClick={() => addObject('cylinder')}>+ Cilindro</button>
          
          <label className="filter-btn" style={{ cursor: 'pointer', background: 'var(--accent-color)', color: 'white', borderColor: 'var(--accent-color)' }}>
            + Importar Modelo (.gltf / .obj)
            <input type="file" accept=".gltf,.glb,.obj" style={{ display: 'none' }} onChange={handleFileUpload} />
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto', flexWrap: 'wrap' }}>
          <button 
            className={`filter-btn ${transformMode === 'translate' ? 'active' : ''}`}
            onClick={() => setTransformMode('translate')}
          >
            Modo: Mover
          </button>
          <button 
            className={`filter-btn ${transformMode === 'scale' ? 'active' : ''}`}
            onClick={() => setTransformMode('scale')}
          >
            Modo: Escalar
          </button>
          
          <button className="filter-btn" style={{ border: '1px solid #ef4444' }} onClick={() => { setObjects([]); setActiveId(null); }}>Limpiar Todo</button>
        </div>
      </div>

      <div className="canvas-wrapper" onPointerMissed={() => setActiveId(null)}>
        <Canvas camera={{ position: [5, 5, 10], fov: 60 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
          <directionalLight position={[-10, 5, -10]} intensity={0.5} />
          
          <PerspectiveRoom />

          {objects.map(obj => (
            <InteractiveObject 
              key={obj.id} 
              obj={obj} 
              mode={transformMode}
              activeId={activeId}
              setActiveId={setActiveId}
            />
          ))}

          <OrbitControls 
            makeDefault 
            enableDamping
            maxPolarAngle={Math.PI / 1.5} 
          />
          <Environment preset="city" />
        </Canvas>
      </div>
      <p className="lab-help">Selecciona un objeto haciendo clic para usar los controles (flechas) de movimiento y escalado. Haz clic en el fondo para de-seleccionar.</p>
    </div>
  );
}
