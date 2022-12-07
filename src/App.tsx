import type { Component } from 'solid-js';
import { Board } from './board/Board';

import { Header } from './Header';

export const App: Component = () => {
  return (
    <>
      <Header />
      <Board />
    </>
  );
};
