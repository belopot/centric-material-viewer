import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {useStore} from 'state/store';
import Vec2Input from 'components/Inputs/Vec2Input';
import FloatInput from 'components/Inputs/FloatInput';

export default function UVEditor() {
  const currentUV = useStore(state => state.currentUV);
  const setCurrentUV = useStore(state => state.setCurrentUV);

  const [repeatValue, setRepeatValue] = useState(currentUV.repeat);
  const [offsetValue, setOffsetValue] = useState(currentUV.offset);
  const [rotationValue, setRotationValue] = useState(currentUV.rotation);

  useEffect(() => {
    setCurrentUV({
      ...currentUV,
      repeat: repeatValue,
    });
  }, [repeatValue]);

  useEffect(() => {
    setCurrentUV({
      ...currentUV,
      offset: offsetValue,
    });
  }, [offsetValue]);

  useEffect(() => {
    setCurrentUV({
      ...currentUV,
      rotation: rotationValue,
    });
  }, [rotationValue]);

  return (
    <Holder>
      <Vec2Input
        title="Repeat"
        value={repeatValue}
        setValue={setRepeatValue}
        min={-100}
        max={100}
        step={0.05}
      />
      <Vec2Input
        title="Offset"
        value={offsetValue}
        setValue={setOffsetValue}
        min={-100}
        max={100}
        step={0.1}
      />
      <FloatInput
        title="Rotation"
        value={rotationValue}
        setValue={setRotationValue}
        min={0}
        max={360}
      />
    </Holder>
  );
}

const Holder = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1em;
  max-width: 20em;
  padding: 1em;
  border-radius: 0.4em;
`;
