// cli.ts
import React from 'react';
import { render } from 'ink';
import prompts from 'prompts';

import { Expense } from './expense.js';
import { Task } from './task.js';
import { GitHub } from './github.js';
import { AdvancedNumberGuessingGame } from './number.js';

type AppChoice = {
  title: string;
  value: React.ComponentType;
};

const choices: AppChoice[] = [
  {
    title: '💰 Expense Tracker – Manage your expenses and budgets',
    value: Expense
  },
  {
    title: '✅ Task Manager – Organize and track your tasks',
    value: Task
  },
  {
    title: '🐙 GitHub Explorer – Browse GitHub repositories and issues',
    value: GitHub
  },
  {
    title: '🎲 Number Guessing Game – Test your guessing skills',
    value: AdvancedNumberGuessingGame
  }
];

(async () => {
  const response = await prompts({
    type: 'select',
    name: 'component',
    message: '🚀 CLI Apps Collection – Select an application',
    choices
  });

  if (!response.component) {
    console.log('\n👋  Goodbye!');
    process.exit(0);
  }

  // Render the chosen Ink component
  render(React.createElement(response.component));
})();