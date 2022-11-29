import React from 'react';
import styled from 'styled-components';
import PbrMaterialItem from './PbrMaterialItem';
import U3mMaterialItem from './U3mMaterialItem';
import {PBR_MATERIAL_DATA, U3M_MATERIAL_DATA} from 'dataset/materials';

export default function MaterialPanel({className}) {
  return (
    <Holder className={className}>
      {PBR_MATERIAL_DATA.map((data, index) => (
        <PbrMaterialItem key={index} data={data} />
      ))}
      {U3M_MATERIAL_DATA.map((data, index) => (
        <U3mMaterialItem key={index} data={data} />
      ))}
    </Holder>
  );
}

const Holder = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
  padding: 1em;
  gap: 0.2em;
`;
