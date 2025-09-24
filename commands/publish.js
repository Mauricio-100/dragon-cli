// ~/dragon-cli/commands/publish.js
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { loadConfig } from '../utils/config.js'; // si tu as un utilitaire pour ça

export default async function publishCommand() {
  const config = await loadConfig();
  if (!config.bearerToken) {
    console.log(chalk.red('Erreur : Vous devez être connecté pour publier.'));
    return;
  }

  const spinner = ora('Préparation de la publication...').start();
  try {
    const packageJsonData = await fs.readFile('dragon.json', 'utf-8');
    const packageInfo = JSON.parse(packageJsonData);

    spinner.text = `Publication de '${packageInfo.name}@${packageInfo.version}'...`;
    
    // Ici tu peux ajouter la logique fetch POST pour publier le pack
    // ex: fetch(`${config.serverUrl}/packs/publish`, {...})

    spinner.succeed(chalk.green(`'${packageInfo.name}' a été publié avec succès !`));
  } catch (err) {
    spinner.fail(chalk.red(`Erreur de publication : ${err.message}`));
  }
}
