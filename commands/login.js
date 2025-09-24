import axios from 'axios';
import chalk from 'chalk';
import ora from 'ora';
import { saveConfig, loadConfig } from '../utils/config.js'; // adapte selon ton projet
import { askQuestion } from '../utils/readline.js'; // adapte selon ton projet

program
  .command('login')
  .description('Connectez-vous à la plateforme Dragon.')
  .option('-s, --server <url>', 'Spécifier une URL de serveur personnalisée')
  .action(async (options) => {
    const config = await loadConfig();
    if (config.bearerToken) {
      console.log(chalk.yellow('Vous êtes déjà connecté. Utilisez `drn logout` pour vous déconnecter d\'abord.'));
      return;
    }

    console.log(chalk.cyan('Veuillez entrer vos identifiants pour la plateforme Dragon.'));
    const email = await askQuestion('Email: ');
    const password = await askQuestion('Mot de passe: ');

    const spinner = ora('Connexion en cours...').start();
    try {
        const API_BASE_URL = options.server || config.serverUrl || 'https://sarver-fullstack-4.onrender.com';

        const { data } = await axios.post(`${API_BASE_URL}/auth/login`, {
            email,
            password
        });

        // On suppose ici que le login renvoie directement le token API final
        await saveConfig({ bearerToken: data.api_token, serverUrl: API_BASE_URL });

        spinner.succeed(chalk.green('Connexion réussie ! Votre clé d\'accès a été sauvegardée.'));
        console.log(chalk.blue('Vous pouvez maintenant utiliser les commandes de la plateforme.'));

    } catch (err) {
        spinner.fail(chalk.red(`Erreur de connexion : ${err.response?.data?.error || err.message}`));
    }
  });
