import React from 'react';
import styled from 'styled-components';
import MaterialItem from './MaterialItem';
import {MATERIAL_DATA} from 'dataset/materials';

export default function MaterialPanel({className}) {
  return (
    <Holder className={className}>
      {MATERIAL_DATA.map((data, index) => (
        <MaterialItem key={index} data={data} />
      ))}
    </Holder>
  );
}

const Holder = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
  padding: 1em;
`;
