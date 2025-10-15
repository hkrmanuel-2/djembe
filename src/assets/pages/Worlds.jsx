import { Canvas } from "@react-three/fiber";

function Box() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}

export default function Worlds() {
  return (
    <Canvas>
      <ambientLight />
      <Box />
    </Canvas>
  );
}
