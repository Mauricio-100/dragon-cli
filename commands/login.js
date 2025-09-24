import inquirer from 'inquirer';
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
    const res = await fetch("https://sarver-fullstack-4.onrender.com/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: answers.email,
        password: answers.password
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Erreur de connexion");
    }

    // créer dossier ~/.dragon si inexistant
    fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify({ token: data.token }, null, 2));
    console.log("✅ Connexion réussie ! Jeton sauvegardé dans ~/.dragon/config.json");
  } catch (err) {
    console.error("❌ Échec de la connexion :", err.message);
  }
}
