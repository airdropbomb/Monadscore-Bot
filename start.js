import fs from 'fs/promises';
import axios from 'axios';
import cfonts from 'cfonts';
import chalk from 'chalk';
import ora from 'ora';
import readline from 'readline';
import { Wallet } from 'ethers';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';

function print_banner() {
  console.clear();
  cfonts.say('MONADSCORE BOT', {
    font: 'block',
    align: 'center',
    colors: ['cyanBright'],
  });
  console.log(chalk.cyan(`
 █████╗ ██████╗ ██████╗     ███╗   ██╗ ██████╗ ██████╗ ███████╗
██╔══██╗██╔══██╗██╔══██╗    ████╗  ██║██╔═══██╗██╔══██╗██╔════╝
███████║██║  ██║██████╔╝    ██╔██╗ ██║██║   ██║██║  ██║█████╗  
██╔══██║██║  ██║██╔══██╗    ██║╚██╗██║██║   ██║██║  ██║██╔══╝  
██║  ██║██████╔╝██████╔╝    ██║ ╚████║╚██████╔╝██████╔╝███████╗
╚═╝  ╚═╝╚═════╝ ╚═════╝     ╚═╝  ╚═══╝ ╚═════╝ ╚═════╝ ╚══════╝
  `));
}

function delay(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

function centerText(text, color = 'greenBright') {
  const terminalWidth = process.stdout.columns || 80;
  const textLength = text.length;
  const padding = Math.max(0, Math.floor((terminalWidth - textLength) / 2));
  return ' '.repeat(padding) + chalk[color](text);
}

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/102.0'
];

function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

function getHeaders() {
  return {
    'User-Agent': getRandomUserAgent(),
    'Accept': 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
    'origin': 'https://monadscore.xyz',
    'referer': 'https://monadscore.xyz/'
  };
}

function getAxiosConfig(proxy) {
  const config = {
    headers: getHeaders(),
    timeout: 60000
  };
  if (proxy) {
    config.httpsAgent = newAgent(proxy);
  }
  return config;
}

function newAgent(proxy) {
  if (proxy.startsWith('http://')) {
    return new HttpsProxyAgent(proxy);
  } else if (proxy.startsWith('socks4://') || proxy.startsWith('socks5://')) {
    return new SocksProxyAgent(proxy);
  } else {
    console.log(chalk.red(`❌ Unsupported proxy type: ${proxy}`));
    return null;
  }
}

async function readAccounts() {
  try {
    const data = await fs.readFile('accounts.json', 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(chalk.red(`⚠️ Error reading accounts.json: ${error.message}`));
    return [];
  }
}

async function claimTask(walletAddress, taskId, proxy) {
  const url = 'https://mscore.onrender.com/user/claim-task';
  const payload = { wallet: walletAddress, taskId };

  try {
    const response = await axios.post(url, payload, getAxiosConfig(proxy));
    return response.data && response.data.message
      ? response.data.message
      : '✅ Task claimed successfully, but no server message.';
  } catch (error) {
    return `❌ Task ${taskId} failed: ${error.response?.data?.message || error.message}`;
  }
}

async function processAccount(account, index, total, proxy) {
  const { walletAddress, privateKey } = account;
  console.log(`\n`);
  console.log(chalk.cyanBright('╔' + '═'.repeat(78) + '╗'));
  console.log(chalk.cyanBright(`║ ${chalk.bold.whiteBright(`Processing Account ${index + 1}/${total}`)} ${' '.repeat(42 - (index + 1).toString().length - total.toString().length)}║`));
  console.log(chalk.cyanBright(`║ Wallet: ${chalk.yellowBright(walletAddress)} ${' '.repeat(42 - walletAddress.length)}║`));
  console.log(chalk.cyanBright('╚' + '═'.repeat(78) + '╝'));

  let wallet;
  try {
    wallet = new Wallet(privateKey);
  } catch (error) {
    console.error(chalk.red(`❌ Error creating wallet: ${error.message}`));
    return;
  }

  const tasks = ['task003', 'task002', 'task001'];
  for (let i = 0; i < tasks.length; i++) {
    const spinnerTask = ora({ text: `⏳ Claiming Task ${i + 1}/3 ...`, spinner: 'dots2', color: 'cyan' }).start();
    const msg = await claimTask(walletAddress, tasks[i], proxy);
    if (msg.toLowerCase().includes('successfully') || msg.toLowerCase().includes('berhasil')) {
      spinnerTask.succeed(chalk.greenBright(` ✅ Task ${i + 1}/3 claimed: ${msg}`));
    } else {
      spinnerTask.fail(chalk.red(` ❌ Task ${i + 1}/3 failed: ${msg}`));
    }
  }
}

async function run() {
  print_banner();
  console.log(centerText("=== 🔥 Follow Me on GitHub: @Kazuha787 🔥 ===\n", 'cyanBright'));

  const accounts = await readAccounts();
  if (accounts.length === 0) {
    console.log(chalk.red('⚠️ No accounts found in accounts.json.'));
    return;
  }

  for (let i = 0; i < accounts.length; i++) {
    try {
      await processAccount(accounts[i], i, accounts.length, null);
    } catch (error) {
      console.error(chalk.red(`⚠️ Error processing account ${i + 1}: ${error.message}`));
    }
  }

  console.log(chalk.magentaBright('\n🚀 All tasks completed! Waiting 24 hours before retrying... ⏳'));
  await delay(86400);
  run();
}

run();
