// ~/dragon-cli/commands/whoami.js
import chalk from 'chalk';
import ora from 'ora';
import { loadConfig } from '../utils/config.js'; // si tu as un fichier utilitaire pour charger la config
import fetch from 'node-fetch';

export default async function whoamiCommand() {
  const config = await loadConfig();
  if (!config.bearerToken) {
    console.log(chalk.yellow('Vous n\'êtes pas connecté. Utilisez `drn login` pour vous connecter.'));
    return;
  }

  const spinner = ora('Vérification de votre identité...').start();
  try {
    const res = await fetch(`${config.serverUrl}/auth/status`, {
      headers: { 'Authorization': `Bearer ${config.bearerToken}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Session invalide ou expirée.');

    spinner.succeed(chalk.green('Vous êtes connecté en tant que :'));
    console.log(chalk.cyan(`- Email: ${data.email}`));
    console.log(chalk.cyan(`- User ID: ${data.id}`));
  } catch (err) {
    spinner.fail(chalk.red(`Impossible de vérifier l'identité : ${err.message}`));
    console.log(chalk.yellow('Votre session est peut-être expirée. Essayez de vous reconnecter avec `drn login`.'));
  }
}
