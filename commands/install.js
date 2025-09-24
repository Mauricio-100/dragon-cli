// ~/dragon-cli/commands/install.js
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { loadConfig } from '../utils/config.js'; // si tu as un utilitaire pour ça

export default async function installCommand(packageName) {
  const config = await loadConfig();
  if (!config.bearerToken) {
    console.log(chalk.red('Erreur : Vous devez être connecté pour installer un paquet.'));
    return;
  }

  const spinner = ora(`Recherche de '${packageName}' sur la plateforme...`).start();
  try {
    // Ici tu mets la logique fetch pour récupérer le pack depuis le serveur
    // ex:
    // const res = await fetch(`${config.serverUrl}/packs/download/${packageName}`, {
    //   headers: { 'Authorization': `Bearer ${config.bearerToken}` }
    // });
    // const data = await res.json();

    // Simuler l'installation
    spinner.text = `Installation de '${packageName}'...`;
    await fs.mkdir(path.join('.dragon_packs', packageName), { recursive: true });

    spinner.succeed(chalk.green(`'${packageName}' a été installé avec succès !`));
  } catch (err) {
    spinner.fail(chalk.red(`L'installation a échoué : ${err.message}`));
  }
}
