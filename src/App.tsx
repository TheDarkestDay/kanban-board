import type { Component } from 'solid-js';
import { Board } from './Board';

import { Header } from './Header';

export const App: Component = () => {
  return (
    <>
      <Header />
      <Board />
    </>
  );
};
