"use client";
import { Canvas, extend } from "@react-three/fiber";
import {
  useGLTF,
  useTexture,
  Environment,
  Lightformer,
} from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import Band from "../band";
import AuthCard from "./AuthCard";
import LoginForm from "./LoginForm";
import { toast } from "sonner";
import { useEffect } from "react";


extend({ MeshLineGeometry, MeshLineMaterial });
useGLTF.preload("/assets/3d/card.glb");
useTexture.preload("/assets/images/tag_texture.png");

interface Auth3DBackgroundProps {
  sessionExpired?: boolean
  redirectUrl?: string
}

export default function Auth3DBackground({ sessionExpired, redirectUrl }: Auth3DBackgroundProps) {
  useEffect(() => {
    if (sessionExpired) {
      toast.warning('Your session has expired. Please sign in again.', {
        duration: 5000,
        id: 'session-expired', // prevents duplicate toasts
      })
    }
  }, [sessionExpired])
  return (
    <div className="flex w-full h-screen absolute top-0 left-0 z-0">
      <AuthCard
        title="Welcome"
        subtitle=""
        >
          <LoginForm redirectUrl={redirectUrl} />
      </AuthCard>
    <Canvas
      camera={{ position: [0, 0, 13], fov: 25 }}
      style={{ backgroundColor: "transparent" }}
    >
      <ambientLight intensity={Math.PI} />
      <Physics
        debug={false}
        interpolate
        gravity={[0, -40, 0]}
        timeStep={1 / 60}
      >
        <Band />
      </Physics>
      <Environment background blur={0.75}>
        <Lightformer
          intensity={2}
          color="white"
          position={[0, -1, 5]}
          rotation={[0, 0, Math.PI / 3]}
          scale={[100, 0.1, 1]}
        />
        <Lightformer
          intensity={3}
          color="white"
          position={[-1, -1, 1]}
          rotation={[0, 0, Math.PI / 3]}
          scale={[100, 0.1, 1]}
        />
        <Lightformer
          intensity={3}
          color="white"
          position={[1, 1, 1]}
          rotation={[0, 0, Math.PI / 3]}
          scale={[100, 0.1, 1]}
        />
        <Lightformer
          intensity={10}
          color="white"
          position={[-10, 0, 14]}
          rotation={[0, Math.PI / 2, Math.PI / 3]}
          scale={[100, 10, 1]}
        />
      </Environment>
    </Canvas>

          </div>
  );
}