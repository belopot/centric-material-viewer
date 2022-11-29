import React from 'react';
import styled from 'styled-components';
import PageTransition from 'components/PageTransition';
import ThreeViewer from 'components/ThreeViewer';
import PhysicsSelector from 'components/PhysicsSelector';
import MaterialPanel from 'components/MaterialPanel';

export default function Main() {
  return (
    <PageTransition>
      <Holder>
        <ViewerContainer>
          <ThreeViewer />
        </ViewerContainer>
        <Sidebar>
          <MaterialPanel />
        </Sidebar>
        <StyledPhysicsSelector />
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
  flex: 1;
  height: 100%;
`;

const Sidebar = styled.div`
  width: 20em;
  height: 100%;
  overflow: hidden;
  overflow-y: auto;
`;

const StyledPhysicsSelector = styled(PhysicsSelector)`
  position: absolute;
  top: 1.5em;
  left: 1em;
  z-index: 1;
`;
