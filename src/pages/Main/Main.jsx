import React from 'react';
import styled from 'styled-components';
import {Divider} from 'primereact/divider';

import PageTransition from 'components/PageTransition';
import ThreeViewer from 'components/ThreeViewer';
import PhysicsSelector from 'components/PhysicsSelector';
import MaterialPanel from 'components/MaterialPanel';
import UVEditor from 'components/UVEditor';

export default function Main() {
  return (
    <PageTransition>
      <Holder>
        <ViewerContainer>
          <ThreeViewer />
          <ControlContainer>
            <h3 className="mt-2 mb-2">Physics selector</h3>
            <PhysicsSelector className="w-full" />
            <Divider />
            <h3 className="mt-3 mb-1">UV editor</h3>
            <UVEditor />
          </ControlContainer>
        </ViewerContainer>
        <Sidebar>
          <MaterialPanel />
        </Sidebar>
      </Holder>
    </PageTransition>
  );
}

const Holder = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

const ViewerContainer = styled.div`
  position: relative;
  flex: 1;
  height: 100%;
`;

const Sidebar = styled.div`
  width: 25em;
  height: 100%;
  overflow: hidden;
  overflow-y: auto;
`;

const ControlContainer = styled.div`
  position: absolute;
  top: 1.5em;
  left: 1em;
  z-index: 1;
  background-color: white;
  border-radius: 4px;
  padding: 1em;
`;
