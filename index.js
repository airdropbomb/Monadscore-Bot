import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import fs from 'fs';
import axios from 'axios';
import pkg from 'https-proxy-agent';
const { HttpsProxyAgent } = pkg;
import { ethers } from 'ethers';

// Function to display the MonadScore banner
function printBanner() {
  console.clear();
  console.log(chalk.cyan(`
╔════════════════════════════════════════════════════╗
║              ⚡ MONADSCORE AUTO BOT ⚡              ║
║        Automate your MonadScore registration!      ║
║    Developed by: https://t.me/Offical_Im_kazuha    ║
║    GitHub: https://github.com/Kazuha787            ║
╠════════════════════════════════════════════════════╣
║  ██╗  ██╗ █████╗ ███████╗██╗   ██╗██╗  ██╗ █████╗  ║
║  ██║ ██╔╝██╔══██╗╚══███╔╝██║   ██║██║  ██║██╔══██╗ ║
║  █████╔╝ ███████║  ███╔╝ ██║   ██║███████║███████║ ║
║  ██╔═██╗ ██╔══██║ ███╔╝  ██║   ██║██╔══██║██╔══██║ ║
║  ██║  ██╗██║  ██║███████╗╚██████╔╝██║  ██║██║  ██║ ║
║  ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ║
╚════════════════════════════════════════════════════╝
`));
}

// Function to create a visually appealing section divider
function divider(text, color = "yellowBright") {
  console.log(chalk[color](`\n⚡━━━━━━━━━━ ${text} ━━━━━━━━━━⚡\n`));
}

// Function to center text dynamically
function centerText(text, color = "cyanBright") {
  const width = process.stdout.columns || 80;
  const padding = Math.max(0, Math.floor((width - text.length) / 2));
  return " ".repeat(padding) + chalk[color](text);
}

// Function to simulate a typing effect
async function typeEffect(text, color = "magentaBright") {
  for (const char of text) {
    process.stdout.write(chalk[color](char));
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  console.log();
}

printBanner();
console.log(centerText("=== 📢 Follow Me on GitHub: @Kazuha787 📢 ===\n", "blueBright"));
divider("MONADSCORE AUTO REGISTRATION");

// Function to generate random headers for API requests
function generateRandomHeaders() {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/115.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/14.0.3 Safari/605.1.15',
    'Mozilla/5.0 (Linux; Android 10; SM-G970F) AppleWebKit/537.36 Chrome/115.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0'
  ];
  return {
    'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9'
  };
}

// Function for delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Countdown timer animation
async function countdown(ms) {
  const seconds = Math.floor(ms / 1000);
  for (let i = seconds; i > 0; i--) {
    process.stdout.write(chalk.grey(`\r⏳ Waiting ${i} seconds... `));
    await delay(1000);
  }
  process.stdout.write('\r' + ' '.repeat(50) + '\r');
}

async function main() {
  const { useProxy } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'useProxy',
      message: chalk.magenta('🌐 Do you want to use a proxy?'),
      default: false,
    }
  ]);

  let proxyList = [];
  let proxyMode = null;
  if (useProxy) {
    const proxyAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'proxyType',
        message: chalk.magenta('🔄 Select proxy type:'),
        choices: ['Rotating', 'Static'],
      }
    ]);
    proxyMode = proxyAnswer.proxyType;
    try {
      const proxyData = fs.readFileSync('proxy.txt', 'utf8');
      proxyList = proxyData.split('\n').map(line => line.trim()).filter(Boolean);
      console.log(chalk.greenBright(`✅ Loaded ${proxyList.length} proxies.\n`));
    } catch (err) {
      console.log(chalk.yellow('⚠️ proxy.txt file not found, proceeding without proxy.\n'));
    }
  }

  const { count } = await inquirer.prompt([
    {
      type: 'input',
      name: 'count',
      message: chalk.magenta('🔢 Enter the number of referrals you want:'),
      validate: value => (isNaN(value) || value <= 0) ? '❌ Enter a valid number greater than 0!' : true
    }
  ]);

  const { ref } = await inquirer.prompt([
    {
      type: 'input',
      name: 'ref',
      message: chalk.magenta('🔗 Enter referral code:'),
    }
  ]);

  divider("ACCOUNT CREATION STARTED");

  const fileName = 'accounts.json';
  let accounts = fs.existsSync(fileName) ? JSON.parse(fs.readFileSync(fileName, 'utf8')) : [];

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < count; i++) {
    console.log(chalk.cyanBright(`\n🔥 ACCOUNT ${i + 1}/${count} 🔥`));

    let accountAxiosConfig = {
      timeout: 50000,
      headers: generateRandomHeaders(),
      proxy: false
    };

    if (useProxy && proxyList.length > 0) {
      let selectedProxy = (proxyMode === 'Rotating') ? proxyList[0] : proxyList.shift();
      if (!selectedProxy) {
        console.error(chalk.red("❌ No proxies left for static mode."));
        process.exit(1);
      }
      console.log(chalk.green(`🌍 Using proxy: ${selectedProxy}`));
      const agent = new HttpsProxyAgent(selectedProxy);
      accountAxiosConfig.httpAgent = agent;
      accountAxiosConfig.httpsAgent = agent;
    }

    let wallet = ethers.Wallet.createRandom();
    let walletAddress = wallet.address;
    console.log(chalk.greenBright(`✅ Ethereum wallet created: ${walletAddress}`));

    const payload = { wallet: walletAddress, invite: ref };
    const regSpinner = ora('🚀 Sending data to API...').start();

    try {
      await axios.post('https://mscore.onrender.com/user', payload, accountAxiosConfig);
      regSpinner.succeed(chalk.greenBright('✅ Successfully registered account'));
      successCount++;
      accounts.push({ walletAddress, privateKey: wallet.privateKey });
      fs.writeFileSync(fileName, JSON.stringify(accounts, null, 2));
      console.log(chalk.greenBright('💾 Account data saved.'));
    } catch (error) {
      regSpinner.fail(chalk.red(`❌ Failed for ${walletAddress}: ${error.message}`));
      failCount++;
    }

    console.log(chalk.yellow(`\n📊 Progress: ${i + 1}/${count} accounts registered. (✅ Success: ${successCount}, ❌ Failed: ${failCount})`));

    if (i < count - 1) {
      await countdown(Math.floor(Math.random() * (60000 - 30000 + 1)) + 30000);
    }
  }
  divider("REGISTRATION COMPLETE");
}

main();
