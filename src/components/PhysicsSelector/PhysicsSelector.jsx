import React from 'react';
import {Dropdown} from 'primereact/dropdown';
import {useStore} from 'state/store';
import {PHYSICS_DATA} from 'dataset/physics';

export default function PhysicsSelector({className}) {
  const currentPhysics = useStore(state => state.currentPhysics);
  const setCurrentPhysics = useStore(state => state.setCurrentPhysics);

  return (
    <Dropdown
      className={className}
      value={currentPhysics}
      options={PHYSICS_DATA}
      onChange={e => {
        setCurrentPhysics(e.value);
      }}
      optionLabel="name"
      placeholder="Select a physics"
    />
  );
}
