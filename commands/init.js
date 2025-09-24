// ~/dragon-cli/commands/init.js
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import chalk from 'chalk';

export default async function initCommand() {
  console.log(chalk.cyan('Initialisation d\'un nouveau Dracopack...'));
  const defaults = {
    name: path.basename(process.cwd()),
    version: "1.0.0",
    description: "Un paquet d'automatisation pour la plateforme Dragon.",
    main: "cli.js",
    author: os.userInfo().username
  };
  await fs.writeFile('dragon.json', JSON.stringify(defaults, null, 2));
  console.log(chalk.green('✅ Dracopack initialisé ! Le fichier `dragon.json` a été créé.'));
}
