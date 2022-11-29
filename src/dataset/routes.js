import Navbar from 'components/Navbar';

import React from 'react';
import Main from 'pages/Main';

const PageWithNavbar = ({component}) => {
  return (
    <>
      <Navbar />
      {component}
    </>
  );
};

export const PrimaryRoutes = [
  {
    path: '/',
    title: 'Main',
    component: <Main />,
  },
];
