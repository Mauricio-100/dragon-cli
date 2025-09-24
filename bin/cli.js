#!/usr/bin/env node
import { Command } from 'commander';
import login from '../commands/login.js';
import init from '../commands/init.js';
import publish from '../commands/publish.js';
import install from '../commands/install.js';
import whoami from '../commands/whoami.js';
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const program = new Command();
program
  .name('drn')
  .description('Dragon CLI – gestion des Dracopacks')
  .version('0.1.0');

rogram
  .command('init')
  .description('Initialise un nouveau Dracopack dans le dossier actuel.')
  .action(initCommand);

program
  .command('login')
  .description('Se connecter à la plateforme Dragon')
  .action(login);

program
  .command('publish')
  .description('Publier le paquet courant')
  .action(publish);

program
  .command('install <name>')
  .description('Installer un paquet depuis Dragon')
  .action(install);

program
  .command('whoami')
  .description('Afficher l’utilisateur connecté')
  .action(whoami);

program.parse();
