import { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

function Wall({ position, rotation, gridColor, planeColor, visible, receiveShadow }) {
  if (!visible) return null;
  return (
    <group position={position} rotation={rotation}>
      <Grid 
        args={[40, 40]} 
        cellSize={1} cellThickness={1} cellColor={gridColor} 
        sectionSize={5} sectionThickness={1.5} sectionColor={gridColor} 
        fadeDistance={40} 
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow={receiveShadow}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color={planeColor} transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function PerspectiveRoom({ walls, receiveShadow }) {
  return (
    <group>
      <Wall position={[0, -5, 0]} rotation={[0, 0, 0]} gridColor="#22c55e" planeColor="#4ade80" visible={walls.floor} receiveShadow={receiveShadow} />
      <Wall position={[0, 5, 0]} rotation={[Math.PI, 0, 0]} gridColor="#eab308" planeColor="#fde047" visible={walls.ceiling} receiveShadow={receiveShadow} />
      <Wall position={[-10, 0, 0]} rotation={[0, 0, -Math.PI / 2]} gridColor="#ef4444" planeColor="#f87171" visible={walls.left} receiveShadow={receiveShadow} />
      <Wall position={[10, 0, 0]} rotation={[0, 0, Math.PI / 2]} gridColor="#3b82f6" planeColor="#60a5fa" visible={walls.right} receiveShadow={receiveShadow} />
      <Wall position={[0, 0, -10]} rotation={[Math.PI / 2, 0, 0]} gridColor="#a855f7" planeColor="#c084fc" visible={walls.back} receiveShadow={receiveShadow} />
    </group>
  );
}

function InteractiveObject({ obj, mode, activeId, setActiveId, updateObject }) {
  const isActive = activeId === obj.id;
  const clickHandler = (e) => { e.stopPropagation(); setActiveId(obj.id); };

  let content = null;

  if (obj.type === 'lamp') {
    content = (
      <group onClick={clickHandler}>
        <mesh castShadow>
          <coneGeometry args={[0.5, 1, 16]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <spotLight 
          position={[0, -0.5, 0]} 
          angle={Math.PI / 4} 
          penumbra={0.2} 
          intensity={obj.intensity} 
          color={obj.color} 
          castShadow 
          distance={20}
        />
        <mesh position={[0, -0.5, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial color={obj.color} />
        </mesh>
      </group>
    );
  } else if (obj.type === 'candle') {
    content = (
      <group onClick={clickHandler}>
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.4, 16]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
        <pointLight 
          position={[0, 0.5, 0]} 
          intensity={obj.intensity} 
          color={obj.color} 
          distance={15} 
          decay={2} 
          castShadow 
        />
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color={obj.color} />
        </mesh>
      </group>
    );
  } else if (obj.type === 'cube') {
    content = (
      <mesh onClick={clickHandler} castShadow receiveShadow>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color={obj.color} />
      </mesh>
    );
  } else if (obj.type === 'sphere') {
    content = (
      <mesh onClick={clickHandler} castShadow receiveShadow>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial color={obj.color} />
      </mesh>
    );
  } else if (obj.type === 'cylinder') {
    content = (
      <mesh onClick={clickHandler} castShadow receiveShadow>
        <cylinderGeometry args={[1, 1, 3, 32]} />
        <meshStandardMaterial color={obj.color} />
      </mesh>
    );
  } else if (obj.type === 'custom' && obj.scene) {
    // Enable shadows on custom models
    obj.scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    content = <primitive object={obj.scene} onClick={clickHandler} />;
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
  const [darkMode, setDarkMode] = useState(false);
  
  const [walls, setWalls] = useState({
    floor: true,
    ceiling: false,
    left: true,
    right: true,
    back: true
  });

  const activeObj = objects.find(o => o.id === activeId);

  const toggleWall = (key) => setWalls(prev => ({ ...prev, [key]: !prev[key] }));

  const addObject = (type) => {
    const isLight = type === 'lamp' || type === 'candle';
    const newObj = {
      id: Date.now(),
      type,
      position: [0, isLight ? 3 : 0, 0],
      scale: [1, 1, 1],
      color: type === 'candle' ? '#ffaa00' : type === 'lamp' ? '#ffffff' : `hsl(${Math.random() * 360}, 70%, 60%)`,
      intensity: isLight ? (type === 'lamp' ? 50 : 10) : undefined
    };
    setObjects(prev => [...prev, newObj]);
    setActiveId(newObj.id);
  };

  const updateObject = (id, updates) => {
    setObjects(prev => prev.map(obj => obj.id === id ? { ...obj, ...updates } : obj));
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

    if (ext === 'gltf' || ext === 'glb') new GLTFLoader().load(url, onLoadCustom);
    else if (ext === 'obj') new OBJLoader().load(url, onLoadCustom);
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
          case '+': newScale = [newScale[0] + scaleStep, newScale[1] + scaleStep, newScale[2] + scaleStep]; break;
          case '-': if (newScale[0] > 0.2) newScale = [newScale[0] - scaleStep, newScale[1] - scaleStep, newScale[2] - scaleStep]; break;
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
      <div className="lab-controls" style={{ background: darkMode ? '#111' : 'var(--surface-color)' }}>
        
        {/* Objetos y Luces */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: '100%', alignItems: 'center' }}>
          <button className="filter-btn" onClick={() => addObject('cube')}>+ Cubo</button>
          <button className="filter-btn" onClick={() => addObject('sphere')}>+ Esfera</button>
          <button className="filter-btn" onClick={() => addObject('cylinder')}>+ Cilindro</button>
          <label className="filter-btn" style={{ cursor: 'pointer', background: 'var(--surface-color)', color: 'var(--text-main)' }}>
            + Importar 3D
            <input type="file" accept=".gltf,.glb,.obj" style={{ display: 'none' }} onChange={handleFileUpload} />
          </label>

          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)', margin: '0 10px' }}></div>
          
          <button className="filter-btn" style={{ borderColor: '#fde047', color: '#fde047' }} onClick={() => addObject('lamp')}>💡 Lámpara</button>
          <button className="filter-btn" style={{ borderColor: '#fb923c', color: '#fb923c' }} onClick={() => addObject('candle')}>🕯️ Vela</button>

          <button className="filter-btn" style={{ border: '1px solid #ef4444', marginLeft: 'auto' }} onClick={() => { setObjects([]); setActiveId(null); }}>Limpiar Todo</button>
        </div>

        {/* Transformación y Entorno */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: '100%', alignItems: 'center', marginTop: '10px' }}>
          <span style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Transformar:</span>
          <button className={`filter-btn ${transformMode === 'translate' ? 'active' : ''}`} onClick={() => setTransformMode('translate')}>Mover</button>
          <button className={`filter-btn ${transformMode === 'scale' ? 'active' : ''}`} onClick={() => setTransformMode('scale')}>Escalar</button>
          
          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)', margin: '0 10px' }}></div>
          
          <span style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Paredes:</span>
          <button className={`filter-btn ${walls.floor ? 'active' : ''}`} onClick={() => toggleWall('floor')}>Piso</button>
          <button className={`filter-btn ${walls.ceiling ? 'active' : ''}`} onClick={() => toggleWall('ceiling')}>Techo</button>
          <button className={`filter-btn ${walls.left ? 'active' : ''}`} onClick={() => toggleWall('left')}>Izq.</button>
          <button className={`filter-btn ${walls.right ? 'active' : ''}`} onClick={() => toggleWall('right')}>Der.</button>
          <button className={`filter-btn ${walls.back ? 'active' : ''}`} onClick={() => toggleWall('back')}>Fondo</button>

          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)', margin: '0 10px' }}></div>
          
          <button 
            className="filter-btn" 
            style={{ background: darkMode ? '#3b82f6' : 'transparent', color: darkMode ? '#fff' : 'var(--text-muted)' }} 
            onClick={() => setDarkMode(!darkMode)}
          >
            🌙 Modo Noche
          </button>
        </div>

        {/* Edición de Luces Activas */}
        {activeObj && (activeObj.type === 'lamp' || activeObj.type === 'candle') && (
          <div style={{ display: 'flex', gap: '15px', width: '100%', alignItems: 'center', marginTop: '10px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
            <span style={{color: 'var(--text-main)', fontSize: '0.9rem'}}>Configurar Luz Seleccionada:</span>
            
            <input 
              type="color" 
              value={activeObj.color} 
              onChange={(e) => updateObject(activeObj.id, { color: e.target.value })}
              style={{ cursor: 'pointer' }}
            />
            
            <label style={{color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px'}}>
              Intensidad:
              <input 
                type="range" 
                min="0" max="100" step="1" 
                value={activeObj.intensity} 
                onChange={(e) => updateObject(activeObj.id, { intensity: parseFloat(e.target.value) })}
              />
            </label>
          </div>
        )}
      </div>

      <div className="canvas-wrapper" onPointerMissed={() => setActiveId(null)} tabIndex={0} style={{ outline: 'none' }}>
        <Canvas shadows camera={{ position: [10, 10, 15], fov: 50 }}>
          {/* Si no es modo oscuro, mostramos las luces globales */}
          {!darkMode && (
            <>
              <ambientLight intensity={0.4} />
              <directionalLight position={[10, 20, 10]} intensity={1.0} castShadow />
            </>
          )}
          
          <PerspectiveRoom walls={walls} receiveShadow />

          {objects.map(obj => (
            <InteractiveObject 
              key={obj.id} 
              obj={obj} 
              mode={transformMode}
              activeId={activeId}
              setActiveId={setActiveId}
              updateObject={updateObject}
            />
          ))}

          <OrbitControls makeDefault enableDamping maxPolarAngle={Math.PI / 1.1} />
          {/* Desactivar environment map si está oscuro para oscuridad total */}
          {!darkMode && <Environment preset="city" />}
        </Canvas>
      </div>
      <p className="lab-help">
        <strong>Selecciona un objeto.</strong> Teclado: <strong>Flechas</strong> = Frente/Atrás/Lados | <strong>W/S</strong> = Arriba/Abajo | <strong>+ / -</strong> = Escalar
      </p>
    </div>
  );
}
