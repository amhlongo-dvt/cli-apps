import React from 'react';
import { render, Text } from "ink"

const App = () => (
  <Text>
    Hello, <Text color="green"></Text>!
  </Text>
);

render(<App />);