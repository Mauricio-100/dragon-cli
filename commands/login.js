#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');
const axios = require('axios');
const chalk = require('chalk');
const ora = require('ora');
const { Command } = require('commander');

const CONFIG_DIR = path.join(os.homedir(), '.dragon');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// ======== UTILITAIRES ========
async function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

async function saveConfig(config) {
  await ensureConfigDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

async function loadConfig() {
  try {
    const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

function askQuestion(query) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

// ======== PROGRAMME ========
const program = new Command();
program.name('drn').description('Votre assistant IA pour le codage et l’automatisation.').version('6.0.0');

// ======== LOGIN ========
program
  .command('login')
  .option('-s, --server <url>', 'URL du serveur personnalisé')
  .description('Se connecter à la plateforme Dragon')
  .action(async options => {
    const config = await loadConfig();
    if (config.bearerToken) {
      console.log(chalk.yellow('Déjà connecté. Utilisez `drn logout` pour vous déconnecter.'));
      return;
    }

    const email = await askQuestion('Email: ');
    const password = await askQuestion('Mot de passe: ');

    const spinner = ora('Connexion en cours...').start();
    try {
      const API_BASE_URL = options.server || config.serverUrl || 'https://sarver-fullstack-4.onrender.com';
      const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password }, {
        headers: { 'Content-Type': 'application/json' }
      });

      const data = res.data;
      await saveConfig({ bearerToken: data.api_token, serverUrl: API_BASE_URL });
      spinner.succeed(chalk.green('Connexion réussie ! Clé sauvegardée.'));
      console.log(chalk.blue('Vous pouvez maintenant utiliser le CLI.'));
    } catch (err) {
      spinner.fail(chalk.red(`Erreur de connexion : ${err.response?.data?.error || err.message}`));
    }
  });

// ======== LOGOUT ========
program
  .command('logout')
  .description('Se déconnecter de Dragon')
  .action(async () => {
    const spinner = ora('Déconnexion...').start();
    try {
      fs.unlinkSync(CONFIG_FILE);
      spinner.succeed(chalk.green('Déconnexion réussie.'));
    } catch (err) {
      if (err.code === 'ENOENT') spinner.warn(chalk.yellow('Vous n’étiez pas connecté.'));
      else spinner.fail(chalk.red(`Erreur : ${err.message}`));
    }
  });

// ======== WHOAMI ========
program
  .command('whoami')
  .description('Vérifie l’utilisateur actuellement connecté')
  .action(async () => {
    const config = await loadConfig();
    if (!config.bearerToken) {
      console.log(chalk.yellow('Pas connecté. Utilisez `drn login`.'));
      return;
    }

    const spinner = ora('Vérification...').start();
    try {
      const res = await axios.get(`${config.serverUrl}/auth/status`, {
        headers: { 'Authorization': `Bearer ${config.bearerToken}` }
      });
      spinner.succeed(chalk.green('Connecté en tant que :'));
      console.log(chalk.cyan(`- Email: ${res.data.email}`));
      console.log(chalk.cyan(`- ID: ${res.data.id}`));
    } catch (err) {
      spinner.fail(chalk.red(`Impossible de vérifier l'identité : ${err.response?.data?.error || err.message}`));
    }
  });

// ======== INIT DRACOPACK ========
program
  .command('init')
  .description('Initialiser un nouveau Dracopack')
  .action(async () => {
    const defaults = {
      name: path.basename(process.cwd()),
      version: "1.0.0",
      description: "Paquet d’automatisation pour Dragon",
      main: "cli.js",
      author: os.userInfo().username
    };
    fs.writeFileSync('dragon.json', JSON.stringify(defaults, null, 2), 'utf-8');
    console.log(chalk.green('✅ Dracopack initialisé !'));
  });

// ======== SHELL DRAGON ========
async function dragonShell() {
  console.clear();
  console.log(chalk.magenta('Bienvenue dans le shell Dragon ! Tapez "exit" pour quitter.'));
  while (true) {
    const task = await askQuestion(chalk.bold.red('🐉 > '));
    if (task.toLowerCase() === 'exit') break;
    if (task.trim() !== '') console.log(chalk.blue(`Vous avez tapé : ${task}`));
  }
}

// ======== ACTION PAR DÉFAUT ========
program.action(dragonShell);

// ======== LANCEMENT ========
program.parse(process.argv);
