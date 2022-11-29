import React from 'react';
import styled from 'styled-components';
import {useStore} from 'state/store';

export default function PbrMaterialItem({data}) {
  const selectedMaterialData = useStore(state => state.selectedMaterialData);
  const setSelectedMaterialData = useStore(
    state => state.setSelectedMaterialData,
  );

  const handleClick = () => {
    setSelectedMaterialData(data);
  };

  return (
    <Item onClick={handleClick} active={data.id === selectedMaterialData.id}>
      <Content>
        <Preview src={data.preview} />
        <Caption>
          <h1>{data.name}</h1>
          <p>Type: {data.type}</p>
        </Caption>
      </Content>
    </Item>
  );
}

const Item = styled.div`
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease-out;
  padding: 0.5em;
  background-color: ${props => (props.active ? '#daedfe' : 'transparent')};
  &:hover {
    background-color: #f0f7fd;
  }
`;

const Content = styled.div`
  position: relative;
  display: flex;
`;

const Preview = styled.img`
  width: 6em;
  height: 6em;
  border: 1px solid #606265;
`;
const Caption = styled.div`
  margin: 0 0 0 1em;
  padding: 0;
  > h1 {
    color: #222;
    font-weight: 400;
    font-size: 1.1em;
    margin: 0;
    padding: 0;
    line-height: 1.5;
  }
  > p {
    color: #aaa;
    font-weight: 100;
    font-size: 1em;
    margin: 0;
    padding: 0;
  }
`;
