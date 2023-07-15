const { Client, Intents, MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const puppeteer = require('puppeteer');
const axios = require('axios');
const levelingSystem = require('./levelingsystem');
//Muting SysteM
const mutingSystem = require('./mutingSystem');

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGES,
  ],
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  levelingSystem.init(client);
});

client.on('messageCreate', (message) => {
  mutingSystem.checkSpam(message);
  if (message.content.startsWith('+')) {
    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'help') {
      const embed = new MessageEmbed()
        .setTitle('Bot Commands')
        .setDescription('List of available commands:')
        .addField('+help', 'Displays this help message', false)
        .addField('+command1', 'Description of command 1', false)
        .addField('+command2', 'Description of command 2', false);
      // Add more commands as needed

      message.author.send({ embeds: [embed] })
        .then(() => {
          message.channel.send('📬 Sent you a DM with the list of commands.');
        })
        .catch((error) => {
          console.error(`Failed to send DM to ${message.author.tag}:`, error);
          message.channel.send('❌ Failed to send you a DM with the list of commands.');
        });
    } else if (command === 'meme') {
      axios.get('https://meme-api.com/gimme')
        .then((response) => {
          const { title, url, subreddit, postLink } = response.data;
          const embed = new MessageEmbed()
            .setTitle(title)
            .setURL(postLink)
            .setImage(url)
            .setFooter(`Subreddit: ${subreddit}`);

          message.channel.send({ embeds: [embed] });
        })
        .catch((error) => {
          console.error('Failed to fetch meme:', error);
          message.channel.send('❌ Failed to fetch a meme. Please try again later.');
        });
    } else if (command === 'level') {
      const user = message.mentions.users.first() || message.author;
      const xp = levelingSystem.getXP(user.id);
      const level = levelingSystem.getLevel(xp); // Calculate level based on XP
      message.channel.send(`**${user.tag}** is currently at Level ${level}.`);
    } else if (command === 'xp') {
      const user = message.mentions.users.first() || message.author;
      const xp = levelingSystem.getXP(user.id);
      message.channel.send(`**${user.tag}** has **${xp}** XP points.`);
    } else if (command === 'leaderboard') {
      const xpData = levelingSystem.getXPData();
      const leaderboard = Object.entries(xpData)
        .sort((a, b) => b[1] - a[1])
        .map(([userId, xp], index) => `**${index + 1}.** <@${userId}> - ${xp} XP`)
        .join('\n');

      const embed = new MessageEmbed()
        .setTitle('Leaderboard')
        .setDescription(leaderboard);

      message.channel.send({ embeds: [embed] });
    } else if (command === 'start') {
      startAternosServer()
        .then(() => {
          message.channel.send('Aternos server started successfully.');
        })
        .catch((error) => {
          console.error('An error occurred:', error);
          message.channel.send('An error occurred while starting the Aternos server.');
        });
    }
  }
});


// const prefix = '+';

// client.on('ready', () => {
//   console.log(`Logged in as ${client.user.tag}`);
// });

// client.on('interactionCreate', async (interaction) => {
//   if (!interaction.isCommand() || !interaction.inGuild()) return;

//   if (interaction.commandName === 'ttt') {
//     const player1 = interaction.user;
//     const player2 = interaction.options.getUser('user');

//     if (!player2) {
//       return interaction.reply({ content: 'Please mention a user to play with.', ephemeral: true });
//     }

//     const board = Array(9).fill('');
//     const currentPlayer = player1;
//     const buttons = [];
//     const rowIds = ['0', '1', '2'];

//     for (let i = 0; i < 9; i++) {
//       const row = Math.floor(i / 3);
//       const col = i % 3;

//       const button = new MessageButton()
//         .setCustomId(`${i}`)
//         .setLabel('\u200B')
//         .setStyle('SECONDARY');

//       buttons.push(button);
//     }

//     const rowComponents = [];
//     for (let i = 0; i < 3; i++) {
//       const rowComponent = new MessageActionRow();
//       rowComponent.addComponents(buttons.slice(i * 3, (i + 1) * 3));
//       rowComponents.push(rowComponent);
//     }

//     const embed = generateBoardEmbed(board);
//     const gameMessage = await interaction.reply({ embeds: [embed], components: rowComponents });

//     const collector = gameMessage.createMessageComponentCollector({
//       filter: (i) => i.user.id === currentPlayer.id && i.isButton(),
//       time: 600000,
//     });

//     collector.on('collect', async (i) => {
//       const position = parseInt(i.customId);

//       if (board[position] !== '') {
//         return i.reply({ content: 'Invalid move! Please select an empty position.', ephemeral: true });
//       }

//       const symbol = currentPlayer.id === player1.id ? '❌' : '⭕';
//       board[position] = symbol;

//       embed.spliceFields(0, 1, { name: '\u200B', value: getBoardString(board) });
//       i.update({ embeds: [embed] });

//       if (checkWin(board, symbol)) {
//         collector.stop();
//         return interaction.channel.send(`Congratulations ${currentPlayer}! You won the game!`);
//       }

//       if (checkDraw(board)) {
//         collector.stop();
//         return interaction.channel.send("It's a draw! The game has ended in a tie.");
//       }

//       currentPlayer = currentPlayer.id === player1.id ? player2 : player1;
//     });

//     collector.on('end', () => {
//       gameMessage.edit({ content: 'The game has ended.', components: [] });
//     });
//   }
// });

// function generateBoardEmbed(board) {
//   const embed = new MessageEmbed()
//     .setTitle('Tic Tac Toe')
//     .setDescription('Game in progress')
//     .addField('\u200B', getBoardString(board))
//     .setFooter('Click the buttons to make your move');

//   return embed;
// }

// function getBoardString(board) {
//   let boardString = '';
//   for (let i = 0; i < 9; i += 3) {
//     boardString += board.slice(i, i + 3).map((cell) => (cell !== '' ? cell : '⬛')).join(' ') + '\n';
//   }
//   return boardString;
// }

// function checkWin(board, symbol) {
//   const winConditions = [
//     [0, 1, 2], // Top row
//     [3, 4, 5], // Middle row
//     [6, 7, 8], // Bottom row
//     [0, 3, 6], // Left column
//     [1, 4, 7], // Middle column
//     [2, 5, 8], // Right column
//     [0, 4, 8], // Top-left to bottom-right diagonal
//     [2, 4, 6], // Top-right to bottom-left diagonal
//   ];

//   for (const [a, b, c] of winConditions) {
//     if (board[a] === symbol && board[b] === symbol && board[c] === symbol) {
//       return true;
//     }
//   }

//   return false;
// }

// function checkDraw(board) {
//   return board.every((position) => position !== '');
// }

const fs = require('fs');
const prefix = '+';
const dataFilePath = './data.json';

// Ensure the data file exists
if (!fs.existsSync(dataFilePath)) {
  fs.writeFileSync(dataFilePath, '{}');
}

// Load the data from the file
let data = {};
try {
  const rawData = fs.readFileSync(dataFilePath);
  if (rawData.length > 0) {
    data = JSON.parse(rawData);
  }
} catch (error) {
  console.error('Failed to parse data file:', error);
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'beg') {
    const lastBegTimestamp = data[message.author.id]?.lastBegTimestamp || 0;
    const cooldown = 5000; // 5 seconds

    if (Date.now() - lastBegTimestamp < cooldown) {
      const remainingCooldown = (lastBegTimestamp + cooldown - Date.now()) / 1000;
      return message.channel.send(`Please wait ${remainingCooldown.toFixed(1)} seconds before begging again.`);
    }

    const outcome = getRandomOutcome();

    if (outcome === 'no_money') {
      const embed = new MessageEmbed()
        .setTitle('EW, A FILTHY BEGGER!')
        .setDescription('GIVE HIM NO MONEY!')
        .setColor('#FF0000')
        .addField('You received:', '$0');

      message.channel.send({ embeds: [embed] });
    } else if (outcome === 'money') {
      const amount = getRandomAmount(1, 100);
      const embed = new MessageEmbed()
        .setTitle('Aww, poor beggar!')
        .setDescription('Here, have this money.')
        .setColor('#00FF00')
        .addField('You received:', `$${amount}`);

      message.channel.send({ embeds: [embed] });

      // Update user's money in the data object
      if (!data[message.author.id]) {
        data[message.author.id] = {
          wallet: 0,
          inventory: [],
        };
      }
      data[message.author.id].wallet += amount;
      data[message.author.id].lastBegTimestamp = Date.now();

      // Save the updated data to the file
      fs.writeFileSync(dataFilePath, JSON.stringify(data));
    }
  } else if (command === 'wallet') {
    const userMoney = data[message.author.id]?.wallet || 0;

    const embed = new MessageEmbed()
      .setTitle('Wallet')
      .setDescription(`You have: $${userMoney}`);

    message.channel.send({ embeds: [embed] });
  } else if (command === 'shop') {
    const embed = new MessageEmbed()
      .setTitle('Shop')
      .setDescription('Available items:')
      .addField('Fishing Pole', '$100');

    const userMoney = data[message.author.id]?.wallet || 0;
    const fishingPolePrice = 100;
    const canAffordFishingPole = userMoney >= fishingPolePrice;
    const hasFishingPole = data[message.author.id]?.inventory.includes('Fishing Pole');

    const buyButton = new MessageButton()
      .setCustomId('buy_fishing_pole')
      .setLabel('Buy Fishing Pole')
      .setStyle(canAffordFishingPole && !hasFishingPole ? 'SUCCESS' : 'SECONDARY')
      .setDisabled(!canAffordFishingPole || hasFishingPole);

    const row = new MessageActionRow().addComponents(buyButton);

    message.channel.send({ embeds: [embed], components: [row] });
  } else if (command === 'inventory') {
    const inventory = data[message.author.id]?.inventory || [];

    if (inventory.length === 0) {
      message.channel.send("You don't have any items in your inventory.");
    } else {
      const embed = new MessageEmbed()
        .setTitle('Inventory')
        .setDescription('Your items:')
        .addField('\u200B', inventory.join('\n') || 'None');

      message.channel.send({ embeds: [embed] });
    }
  } else if (command === 'fish') {
    const fishMessages = [
      'You fished a Salmon -$25',
      'You fished a Rusty Can -$0',
      'You fished a PufferFish -$50',
    ];
    const randomFishMessage = fishMessages[Math.floor(Math.random() * fishMessages.length)];

    message.channel.send(randomFishMessage);

    const item = randomFishMessage.split(' ')[2];
    const value = parseInt(randomFishMessage.split(' ')[3]);

    if (!data[message.author.id]?.inventory) {
      data[message.author.id] = {
        wallet: 0,
        inventory: [],
      };
    }

    data[message.author.id].inventory.push(item);
    data[message.author.id].wallet += value;

    // Save the updated data to the file
    fs.writeFileSync(dataFilePath, JSON.stringify(data));
  } else if (command === 'sell') {
    const itemToSell = args.join(' ');

    if (!itemToSell) {
      return message.channel.send('Please specify an item to sell.');
    }

    const inventory = data[message.author.id]?.inventory || [];
    const itemIndex = inventory.findIndex((item) => item.toLowerCase() === itemToSell.toLowerCase());

    if (itemIndex === -1) {
      return message.channel.send("You don't have that item in your inventory.");
    }

    const item = inventory[itemIndex];
    const value = getItemValue(item);

    data[message.author.id].wallet += value;
    data[message.author.id].inventory.splice(itemIndex, 1);

    // Save the updated data to the file
    fs.writeFileSync(dataFilePath, JSON.stringify(data));

    message.channel.send(`You sold ${item} for $${value}.`);
  }
});

client.on('interactionCreate', (interaction) => {
  if (!interaction.isButton() || !interaction.inGuild()) return;

  if (interaction.customId === 'buy_fishing_pole') {
    const userMoney = data[interaction.user.id]?.wallet || 0;
    const fishingPolePrice = 100;

    if (userMoney < fishingPolePrice) {
      return interaction.reply({ content: 'You do not have enough money to buy the Fishing Pole.', ephemeral: true });
    }

    const hasFishingPole = data[interaction.user.id]?.inventory.includes('Fishing Pole');
    if (hasFishingPole) {
      return interaction.reply({ content: 'You already have the Fishing Pole.', ephemeral: true });
    }

    // Deduct the price from the user's money
    data[interaction.user.id].wallet -= fishingPolePrice;
    data[interaction.user.id].inventory.push('Fishing Pole');

    // Save the updated data to the file
    fs.writeFileSync(dataFilePath, JSON.stringify(data));

    interaction.reply('Congratulations! You have purchased the Fishing Pole.');
  }
});
// Returns a random outcome: 'no_money' or 'money'
function getRandomOutcome() {
  const outcomes = ['no_money', 'money'];
  const randomIndex = Math.floor(Math.random() * outcomes.length);
  return outcomes[randomIndex];
}

// Returns a random amount between min (inclusive) and max (inclusive)
function getRandomAmount(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getItemValue(item) {
  switch (item.toLowerCase()) {
    case 'salmon':
      return 25;
    case 'rusty can':
      return 0;
    case 'pufferfish':
      return 50;
    default:
      return 0;
  }
}





client.login(process.env.token);
