import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import { ThreeElement } from '@react-three/fiber'

declare module '@react-three/fiber' {
  interface ThreeElements {
    meshLineGeometry: ThreeElement<typeof MeshLineGeometry>
    meshLineMaterial: ThreeElement<typeof MeshLineMaterial>
  }
}
