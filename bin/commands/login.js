import inquirer from 'inquirer';
import axios from 'axios';
import fs from 'fs';
import os from 'os';
import path from 'path';

const CONFIG_PATH = path.join(os.homedir(), '.dragon', 'config.json');

export default async function login() {
  const answers = await inquirer.prompt([
    { name: 'email', message: 'Email :' },
    { type: 'password', name: 'password', message: 'Mot de passe :' }
  ]);

  try {
    const { data } = await axios.post('https://sarver-fullstack-4.onrender.com/auth/login', {
      email: answers.email,
      password: answers.password
    });

    // créer dossier ~/.dragon si inexistant
    fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify({ token: data.token }, null, 2));
    console.log('✅ Connexion réussie ! Jeton sauvegardé dans ~/.dragon/config.json');
  } catch (err) {
    console.error('❌ Échec de la connexion :', err.response?.data?.error || err.message);
  }
}
