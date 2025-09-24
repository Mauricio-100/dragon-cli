#!/usr/bin/env node

// =====================
// IMPORTS
// =====================
const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');
const chalk = require('chalk');
const ora = require('ora');
const figlet = require('figlet');
const gradient = require('gradient-string');
const axios = require('axios');
const { Command } = require('commander');

// =====================
// CONFIGURATION
// =====================
const CONFIG_DIR = path.join(os.homedir(), '.dragon');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

function ensureConfigDir() {
    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
}

function saveConfig(config) {
    ensureConfigDir();
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function loadConfig() {
    if (fs.existsSync(CONFIG_FILE)) {
        return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    }
    return {};
}

// =====================
// READLINE PROMPT
// =====================
function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
}

// =====================
// COMMANDES CLI
// =====================
const program = new Command();
program
    .name('drn')
    .description("Assistant IA personnel pour codage et automatisation")
    .version('6.0.0');

// ---------------------
// LOGIN
// ---------------------
program
    .command('login')
    .description('Se connecter à la plateforme Dragon')
    .option('-s, --server <url>', 'URL du serveur personnalisé')
    .action(async (options) => {
        const config = loadConfig();

        if (config.bearerToken) {
            console.log(chalk.yellow("Vous êtes déjà connecté. Utilisez `drn logout` pour vous déconnecter."));
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

            saveConfig({ bearerToken: data.api_token, serverUrl: API_BASE_URL });

            spinner.succeed(chalk.green('Connexion réussie ! Votre clé d\'accès a été sauvegardée.'));
            console.log(chalk.blue('Vous pouvez maintenant utiliser les commandes de la plateforme.'));
        } catch (err) {
            spinner.fail(chalk.red(`Erreur de connexion : ${err.message}`));
        }
    });

// ---------------------
// LOGOUT
// ---------------------
program
    .command('logout')
    .description('Se déconnecter de la plateforme')
    .action(() => {
        const spinner = ora('Déconnexion...').start();
        try {
            if (fs.existsSync(CONFIG_FILE)) fs.unlinkSync(CONFIG_FILE);
            spinner.succeed(chalk.green('Déconnexion réussie.'));
        } catch (err) {
            spinner.fail(chalk.red(`Erreur : ${err.message}`));
        }
    });

// ---------------------
// WHOAMI
// ---------------------
program
    .command('whoami')
    .description('Voir l’utilisateur actuellement connecté')
    .action(async () => {
        const config = loadConfig();
        if (!config.bearerToken) {
            console.log(chalk.yellow('Vous n’êtes pas connecté. Lancez `drn login`.'));
            return;
        }

        const spinner = ora('Vérification de votre identité...').start();
        try {
            const res = await axios.get(`${config.serverUrl}/auth/status`, {
                headers: { 'Authorization': `Bearer ${config.bearerToken}` }
            });
            const data = res.data;

            spinner.succeed(chalk.green('Connecté en tant que :'));
            console.log(chalk.cyan(`- Email: ${data.email}`));
            console.log(chalk.cyan(`- ID: ${data.id}`));
        } catch (err) {
            spinner.fail(chalk.red(`Impossible de vérifier : ${err.message}`));
        }
    });

// ---------------------
// INIT
// ---------------------
program
    .command('init')
    .description('Initialiser un nouveau Dracopack')
    .action(() => {
        console.log(chalk.cyan('Initialisation d’un Dracopack...'));
        const defaults = {
            name: path.basename(process.cwd()),
            version: "1.0.0",
            description: "Paquet d'automatisation Dragon",
            main: "cli.js",
            author: os.userInfo().username
        };
        fs.writeFileSync('dragon.json', JSON.stringify(defaults, null, 2));
        console.log(chalk.green('✅ Dracopack initialisé !'));
    });

// =====================
// SHELL DRAGON
// =====================
async function dragonShell() {
    console.clear();
    console.log(gradient.passion(figlet.textSync('DRAGON', { font: 'Standard' })));
    console.log(chalk.hex('#FF4500')('Bienvenue. Tapez vos commandes (`exit` pour quitter)'));

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    while (true) {
        const task = await new Promise(resolve => rl.question(chalk.bold.red('🐉 > '), resolve));
        if (task.toLowerCase() === 'exit') break;

        console.log(chalk.blue(`Vous avez demandé : ${task}`));
        // Ici on appellerait le serveur / IA pour traiter la commande
    }
    rl.close();
}

// =====================
// COMMANDE PAR DÉFAUT
// =====================
program.action(dragonShell);

// =====================
// LANCEMENT DU CLI
// =====================
program.parseAsync(process.argv);
