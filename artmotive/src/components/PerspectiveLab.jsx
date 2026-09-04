import { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment } from '@react-three/drei';

export function PerspectiveLab() {
  const [objects, setObjects] = useState([]);

  // Generate a random position slightly elevated so it sits on the grid
  const getRandomPosition = () => [
    (Math.random() - 0.5) * 5,
    Math.random() * 2 + 0.5,
    (Math.random() - 0.5) * 5
  ];

  const addObject = (type) => {
    const newObj = {
      id: Date.now(),
      type,
      position: getRandomPosition(),
      color: `hsl(${Math.random() * 360}, 70%, 60%)`
    };
    setObjects([...objects, newObj]);
  };

  return (
    <div className="lab-container">
      <div className="lab-controls">
        <button className="filter-btn" onClick={() => addObject('cube')}>+ Cubo</button>
        <button className="filter-btn" onClick={() => addObject('sphere')}>+ Esfera</button>
        <button className="filter-btn" onClick={() => addObject('cylinder')}>+ Cilindro</button>
        <button className="filter-btn" style={{ marginLeft: 'auto', border: '1px solid #ef4444' }} onClick={() => setObjects([])}>Limpiar</button>
      </div>

      <div className="canvas-wrapper">
        <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          
          <Grid 
            position={[0, 0, 0]} 
            args={[20, 20]} 
            cellSize={1} 
            cellThickness={1} 
            cellColor="#4b5563" 
            sectionSize={5} 
            sectionThickness={1.5} 
            sectionColor="#94a3b8" 
            fadeDistance={30} 
          />

          {objects.map(obj => (
            <mesh key={obj.id} position={obj.position} castShadow>
              {obj.type === 'cube' && <boxGeometry args={[1, 1, 1]} />}
              {obj.type === 'sphere' && <sphereGeometry args={[0.6, 32, 32]} />}
              {obj.type === 'cylinder' && <cylinderGeometry args={[0.5, 0.5, 1.5, 32]} />}
              <meshStandardMaterial color={obj.color} />
            </mesh>
          ))}

          <OrbitControls 
            makeDefault 
            minPolarAngle={0} 
            maxPolarAngle={Math.PI / 2} 
            enablePan={false}
          />
          <Environment preset="city" />
        </Canvas>
      </div>
      <p className="lab-help">Utiliza el mouse o tus dedos para rotar la cámara y observar la perspectiva de los objetos sobre la grilla.</p>
    </div>
  );
}
