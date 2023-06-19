import * as THREE from 'three'
import { useEffect, useRef, useState } from "react";
import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import { 
  useCursor, MeshPortalMaterial,  CameraControls, Text, Sky
} from "@react-three/drei";
import { useRoute, useLocation } from 'wouter'
import { easing, geometry } from 'maath'

import { useGLTF } from '@react-three/drei'

import './App.css';

extend(geometry)
const GOLDENRATIO = 1.61803398875

function MountainAndRiver(props) {
  
  const mesh = useRef()
  const model = useGLTF('./models/mountain_and_river/optimized-mountain-and-river.glb')
  
  let mixer
  if (model.animations.length) {
    mixer = new THREE.AnimationMixer(model.scene);
    model.animations.forEach(clip => {
      const action = mixer.clipAction(clip)
      action.play();
    });
  }

  useFrame((state, delta) => {
     mixer?.update(delta)
  })
  return (
    <primitive ref={mesh} object={model.scene} {...props} />
  )
}

function HouseOnLake(props) {
  
  const mesh = useRef()
  const model = useGLTF('./models/house_on_lake/optimized-house-on-lake.gtlf')
  
  let mixer
  if (model.animations.length) {
    mixer = new THREE.AnimationMixer(model.scene);
    model.animations.forEach(clip => {
      const action = mixer.clipAction(clip)
      action.play();
    });
  }

  useFrame((state, delta) => {
     mixer?.update(delta)
  })
  return (
    <primitive ref={mesh} object={model.scene} {...props} />
  )
}

function KaioPlanet(props) {

  const model = useGLTF('./models/kaio-planet/optimized-kaio-planet.gltf')

  let mixer
  if (model.animations.length) {
      mixer = new THREE.AnimationMixer(model.scene);
      model.animations.forEach(clip => {
          const action = mixer.clipAction(clip)
          action.play();
      });
  }

  useFrame((state, delta) => {
     mixer?.update(delta)
     model.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) { //check callback is a mesh
          object.castShadow = true;
          object.receiveShadow = true;
          object.material.envMapIntensity = 10
      }
  });
  })

  return (
    <primitive object={model.scene} {...props} />
  )
  
}

function Frame({ id, name, bg, width = 1, height = GOLDENRATIO, children, ...props }) {
  const portal = useRef()
  const [, setLocation] = useLocation()
  const [, params] = useRoute('/item/:id')
  const [hovered, hover] = useState(false)
  const onClick = (e) => {
    e.stopPropagation()
    setLocation('/item/' + e.object.name)
  }
  useCursor(hovered)
  useFrame((state, dt) => easing.damp(portal.current, 'blend', params?.id === id ? 1 : 0, 0.2, dt))
  return (
    <group {...props}>
      <Text fontSize={0.2} anchorY="top" anchorX="left" lineHeight={0.8} position={[-0.375, 1.525, 0.01]} material-toneMapped={false}>
        {name}
      </Text>
      <Text  fontSize={0.1} anchorX="right" position={[0.4, 0.15, 0.01]} material-toneMapped={false}>
        Click on me
      </Text>
      <mesh name={id} position={[0, GOLDENRATIO / 2, 0]} 
        
        onClick={onClick}
        onPointerOver={(e) => hover(true)} onPointerOut={() => hover(false)}
      >
          <roundedPlaneGeometry args={[width, height, 0.1]} />
          <MeshPortalMaterial ref={portal} events={params?.id === id} side={THREE.DoubleSide}>
            <color attach="background" args={[bg]} />
            {children}
          </MeshPortalMaterial>
          
      </mesh>
    </group>
  )
}


function Rig({ position = new THREE.Vector3(0, 0, 2), focus = new THREE.Vector3(0, 0, 0) }) {
  const { controls, scene } = useThree()
  const [, params] = useRoute('/item/:id')
  useEffect(() => {
    const active = scene.getObjectByName(params?.id)
    if (active) {
      active.parent.localToWorld(position.set(0, GOLDENRATIO * 0.75, 0.25))
      active.parent.localToWorld(focus.set(0, GOLDENRATIO / 2, -2))
    }
    controls?.setLookAt(...position.toArray(), ...focus.toArray(), true)
  })
  return <CameraControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
}

function App() {
  const [location, setLocation] = useLocation()

  const goBackButton = () => {
    if( location !== '/')
    return <div className="button" onClick={() => {setLocation('/')}}>
        &lt; back
      </div> 
    else return ""      
  }
  return (
    <div 
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        top: 0
      }}
    >
      {goBackButton()}
      <Canvas 
        camera={{ position: [0, 0, 20], fov: 75 }}
      >
        <color attach="background" args={['#efefef']} />
          
      <group position={[0, -0.8, 0]}>
        <Frame 
          id="01" 
          name={`Kaio\nPlanet`} 
          bg="lightseagreen" 
          position={[-1.15, 0, 0]} 
          rotation={[0, 0.5, 0]}
        >
          <hemisphereLight intensity={1} rotation={[0, Math.PI * -0.35, 0]}/>  
          <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} />
          <KaioPlanet 
            scale={0.75} 
            position={[0.75, -0.2 , -2]} 
            rotation={[0, 0.25, 0]} 
          />
        </Frame>
        <Frame 
          id="02" 
          name={`House\non Lake`}
          position={[0, 0, -0.3]} 
          bg="red" 
          camera={{ fov: 75 }}
        >
          <hemisphereLight intensity={1} rotation={[0, Math.PI * -0.35, 0]}/>
          <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} />
          <HouseOnLake 
            scale={0.5} 
            position={[0.5, 0, -2]}
            rotation={[0, 0, 0]} 
          />
        </Frame>
        
        <Frame 
          id="03" 
          name={`Mountain\nand River`}
          bg="#d1d1ca" 
          position={[1.15, 0, 0]} 
          rotation={[0, -0.5, 0]}
        >
          <hemisphereLight intensity={1} rotation={[0, Math.PI * -0.35, 0]}/>
          <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} />

          <MountainAndRiver  
            scale={1} 
            position={[0, -7, -2]} 
            rotation={[0, 0, 0]} 
          />
        </Frame>
      </group>

      <Rig />
      </Canvas>
    </div>
  );
}

export default App;
