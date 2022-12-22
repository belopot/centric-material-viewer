import React, {useCallback, useEffect, useRef, useState} from 'react';
import styled from 'styled-components';

import {RadioButton} from 'primereact/radiobutton';

import {useStore} from 'state/store';
import parseU3mFile from 'utils/parseU3mFile';
import urlToBlob from 'utils/urlToBlob';
import blobToArray from 'utils/blobToArray';

import PlaceholderImage from 'assets/images/image-placeholder.png';
import Loader from 'components/Loader';
import {DEFAULT_MATERIAL} from 'dataset/materials';

export default function U3mMaterialItem({data}) {
  const selectedMaterialData = useStore(state => state.selectedMaterialData);
  const setSelectedMaterialData = useStore(
    state => state.setSelectedMaterialData,
  );

  const [fetching, setFetching] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [material, setMaterial] = useState(DEFAULT_MATERIAL);

  const previewRef = useRef();

  //Fetch material
  const fetchMaterial = useCallback(async () => {
    if (fetching) {
      return;
    }

    setFetching(true);

    try {
      const blob = await urlToBlob(data.url);
      const arrayBuffer = await blobToArray(blob);
      const result = await parseU3mFile(arrayBuffer);

      // Set preview
      previewRef.current.src = result.preview;

      // Set materials
      setMaterials(result.materials);

      // Set default material
      setMaterial(result.materials[0]);
    } finally {
      setFetching(false);
    }
  }, [data, fetching]);

  useEffect(() => {
    fetchMaterial();
  }, [data]);

  return (
    <Item active={material.id === selectedMaterialData.id}>
      <Loader visible={fetching} size={30} />
      <Content
        onClick={e => {
          setSelectedMaterialData(material);
        }}
      >
        <MaterialTap>
          <Preview ref={previewRef} src={PlaceholderImage} />
          <Caption>
            <h1>{data.name}</h1>
            <p>Type: {data.type}</p>
          </Caption>
        </MaterialTap>
        {materials.length > 1 && (
          <Materials>
            {materials.map((mat, index) => (
              <div key={index} className="field-radiobutton">
                <RadioButton
                  inputId={mat.id}
                  name="material"
                  value={mat}
                  onChange={e => {
                    setTimeout(() => {
                      setMaterial(e.value);
                      setSelectedMaterialData(e.value);
                    }, 500);
                  }}
                  checked={material.id === mat.id}
                />
                <label htmlFor={mat.id}>{mat.name}</label>
              </div>
            ))}
          </Materials>
        )}
      </Content>
    </Item>
  );
}

const Item = styled.div`
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease-out;
  padding: 0.5em;
  background-color: ${props => (props.active ? '#a2d0fa' : 'transparent')};
`;

const Content = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
`;

const MaterialTap = styled.div`
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
    color: #888;
    font-weight: 100;
    font-size: 1em;
    margin: 0;
    padding: 0;
  }
`;

const Materials = styled.div`
  padding-top: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.2em;
`;
