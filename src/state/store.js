import create from 'zustand';
import {PBR_MATERIAL_DATA} from 'dataset/materials';
import {PHYSICS_DATA} from 'dataset/physics';
import {DEFAULT_UV} from 'dataset/uv';

export const useStore = create((set, get) => ({
  // Loader
  loaderVisible: false,
  setLoaderVisible: v => set({loaderVisible: v}),
  // Menu
  menuVisible: false,
  setMenuVisible: v => set({menuVisible: v}),
  // Lights
  sunInfo: {
    enabled: true,
    color: '#FFFDEC',
    intensity: 1.2,
  },
  setSunInfo: v => set({sunInfo: v}),
  firstEmbientInfo: {
    enabled: true,
    color: '#b1dbff',
    intensity: 1,
  },
  setFirstEmbientInfo: v => set({firstEmbientInfo: v}),
  secondEmbientInfo: {
    enabled: true,
    color: '#4cadff',
    intensity: 0.6,
  },
  setSecondEmbientInfo: v => set({secondEmbientInfo: v}),
  // Env
  activeEnvironmentIndex: 0,
  setActiveEnvironmentIndex: v => set({activeEnvironmentIndex: v}),
  envBackgroundEnabled: false,
  setEnvBackgroundEnabled: v => set({envBackgroundEnabled: v}),
  currentOrientation: 0,
  setCurrentOrientation: v => set({currentOrientation: v}),
  currentExposure: 1,
  setCurrentExposure: v => set({currentExposure: v}),
  // Material Data
  selectedMaterialData: PBR_MATERIAL_DATA[0],
  setSelectedMaterialData: v => set({selectedMaterialData: v}),
  // Physics selector
  currentPhysics: PHYSICS_DATA[1],
  setCurrentPhysics: v => set({currentPhysics: v}),
  // UV Editor
  currentUV: DEFAULT_UV,
  setCurrentUV: v => set({currentUV: v}),
}));
