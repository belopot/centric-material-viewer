import React, {useEffect, useRef} from 'react';
import styled from 'styled-components';
import {useMeasure} from 'react-use';

import {useStore} from 'state/store';
import {ENVIRONMENT_DATA} from 'dataset/environments';

import Loader from 'components/Loader';
import ThreeEngine from './libs/ThreeEngine';

export default function ThreeViewer() {
  // Lights
  const sunInfo = useStore(state => state.sunInfo);
  const setSunInfo = useStore(state => state.setSunInfo);
  const firstEmbientInfo = useStore(state => state.firstEmbientInfo);
  const setFirstEmbientInfo = useStore(state => state.setFirstEmbientInfo);
  const secondEmbientInfo = useStore(state => state.secondEmbientInfo);
  const setSecondEmbientInfo = useStore(state => state.setSecondEmbientInfo);

  // Env
  const activeEnvironmentIndex = useStore(
    state => state.activeEnvironmentIndex,
  );
  const envBackgroundEnabled = useStore(state => state.envBackgroundEnabled);
  const currentOrientation = useStore(state => state.currentOrientation);
  const setCurrentOrientation = useStore(state => state.setCurrentOrientation);
  const currentExposure = useStore(state => state.currentExposure);
  const setCurrentExposure = useStore(state => state.setCurrentExposure);

  const selectedMaterialData = useStore(state => state.selectedMaterialData);
  const currentPhysics = useStore(state => state.currentPhysics);

  const loaderVisible = useStore(state => state.loaderVisible);
  const setLoaderVisible = useStore(state => state.setLoaderVisible);

  const [holderRef, holderMeasure] = useMeasure();
  const canvasHolderRef = useRef(null);
  const threeEngineRef = useRef(null);

  //Initialize
  useEffect(() => {
    //Three Engine's Store Interface to only set store state
    const storeInterface = {
      setLoaderVisible,
      setCurrentExposure,
      setSunInfo,
      setFirstEmbientInfo,
      setSecondEmbientInfo,
    };

    //Three engine
    threeEngineRef.current = new ThreeEngine(
      canvasHolderRef.current,
      storeInterface,
    );

    return () => {
      if (threeEngineRef.current) {
        threeEngineRef.current.dispose();
      }
    };
  }, []);

  //Resize
  useEffect(() => {
    threeEngineRef.current.requestRenderIfNotRequested();
  }, [holderMeasure]);

  //Load model
  useEffect(() => {
    if (currentPhysics) {
      threeEngineRef.current.loadModel(currentPhysics.model);
    }
  }, [currentPhysics]);

  //Change material
  useEffect(() => {
    if (selectedMaterialData) {
      threeEngineRef.current.setMaterialToMeshes(selectedMaterialData);
    }
  }, [selectedMaterialData]);

  //Update envmap
  useEffect(() => {
    if (threeEngineRef.current) {
      threeEngineRef.current.updateEnvmap(
        activeEnvironmentIndex,
        envBackgroundEnabled,
      );
      setCurrentOrientation(ENVIRONMENT_DATA[activeEnvironmentIndex].azimuth);
      setCurrentExposure(ENVIRONMENT_DATA[activeEnvironmentIndex].exposure);
    }
  }, [threeEngineRef.current, activeEnvironmentIndex]);

  useEffect(() => {
    if (threeEngineRef.current) {
      threeEngineRef.current.enableEnvmap(envBackgroundEnabled);
    }
  }, [threeEngineRef.current, envBackgroundEnabled]);

  //Update env orientation
  useEffect(() => {
    if (threeEngineRef.current) {
      threeEngineRef.current.updateEnvOrientation(
        activeEnvironmentIndex,
        currentOrientation,
      );
    }
  }, [threeEngineRef.current, activeEnvironmentIndex, currentOrientation]);

  //Update env exposure
  useEffect(() => {
    if (threeEngineRef.current) {
      threeEngineRef.current.updateEnvExposure(currentExposure);
    }
  }, [threeEngineRef.current, currentExposure]);

  //Update sun light
  useEffect(() => {
    if (threeEngineRef.current) {
      threeEngineRef.current.updateSunLight(sunInfo);
    }
  }, [threeEngineRef.current, sunInfo]);

  //Update ambient light1
  useEffect(() => {
    if (threeEngineRef.current) {
      threeEngineRef.current.updateAmbientLight1(firstEmbientInfo);
    }
  }, [threeEngineRef.current, firstEmbientInfo]);

  //Update ambient light2
  useEffect(() => {
    if (threeEngineRef.current) {
      threeEngineRef.current.updateAmbientLight2(secondEmbientInfo);
    }
  }, [threeEngineRef.current, secondEmbientInfo]);

  return (
    <Holder ref={holderRef}>
      <Loader visible={loaderVisible} label="Loading assets" />
      <CanvasHolder ref={canvasHolderRef} />
    </Holder>
  );
}

const Holder = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const CanvasHolder = styled.div`
  width: 100%;
  height: 100%;
  canvas {
    width: 100% !important;
    height: 100% !important;
    background-color: #2d2d2d;
  }
`;
