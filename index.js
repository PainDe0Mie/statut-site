tcpp = require('tcp-ping');
const {
    Client,
    Collection,
    GatewayIntentBits,
    Partials,
    DiscordAPIError,
    EmbedBuilder
  } = require("discord.js");
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildBans,
      GatewayIntentBits.GuildEmojisAndStickers,
      GatewayIntentBits.GuildInvites,
    ],
    partials: [
      Partials.Channel,
      Partials.Message,
      Partials.User,
      Partials.GuildMember,
      Partials.Reaction,
      Partials.ThreadMember,
      Partials.GuildScheduledEvent,
    ],
  });

const config = require("./config.json");
client.config = config;

client.login(config.bottoken);

client.on('ready', async () => {
    console.log(`${client.user.tag} est bien lancé !`);
    client.user.setActivity("les machines", { type: "WATCHING" });

    const sites = [
        {
            addr: config.ipweb1,
            port: config.portweb,
            nameweb: config.nameweb1,
        },
        {
            addr: config.ipweb2,
            port: config.portweb,
            nameweb: config.nameweb2,
        },
        {
            addr: config.ipweb5,
            port: config.portweb,
            nameweb: config.nameweb5,
        },
        {
            addr: config.ipweb4,
            port: config.portweb,
            nameweb: config.nameweb4,
        },
        {
            addr: "cloudflare.com",
            port: config.portweb,
            nameweb: "Proxy cloudflare",
        },
		{
            addr: config.ipweb6,
            port: config.portweb,
            nameweb: config.nameweb6
        },
    ];

    try {
        const channel = client.channels.resolve(config.setchannel);
        let user = client.user.id
        let number = 100;
        let messages = (await channel.messages.fetch({ limit: number })).filter(m => m.author.id === user);
        if (messages.length <= 0) return;
        await channel.bulkDelete(messages);
         const start = new EmbedBuilder()
         .setColor("Red")
         .setDescription("*Chargement en cours...*")
         const msg = await channel.send({ embeds: [start] });

        var online = '🟢';
        var offline = '🔴';

        let previousStates = {};
        let previousConnections = {};

const logChannel = client.channels.resolve(config.setalerte);


setInterval(() => {
  const pingFields = sites.map(site => {
      return new Promise((resolve) => {
          tcpp.probe(site.addr, site.port, function (err, available) {
              tcpp.ping({ address: site.addr, port: site.port }, function (err, data) {
                  const web = available ? `${online} | [${site.nameweb}](https://${site.addr}) (${Math.floor(data.avg)}ms)` : `${offline} | [${site.nameweb}](https://${site.addr})`;

                  // Vérification de la connexion précédente
                  if (previousConnections[site.addr] !== available) {
                    if (available) {
                        // Site est de nouveau connecté, envoyer une alerte
                        const now = new Date().toLocaleString('fr-FR', { timeZone: "Europe/Paris" });
                        const availableConnectAlert = `Le site: \`\`${site.addr}\`\` est __redisponible__ à: **${now}**`;
                        logChannel.send(availableConnectAlert);
                    } else {
                        // Site a perdu sa connexion, envoyer une alerte
                        const now = new Date().toLocaleString('fr-FR', { timeZone: "Europe/Paris" });
                        const unavailableConnectAlert = `Le site \`\`${site.addr}\`\` est __down,__ détecté à: **${now}**`;
                        logChannel.send(unavailableConnectAlert);
                    }
                }

                  // Mettre à jour la connexion précédente
                  previousConnections[site.addr] = available;

                  resolve({
                      name: `☁️ - **${site.nameweb}**`,
                      value: web
                  });
              });
          });
      });
  });

  Promise.all(pingFields).then(fields => {
    const pingEmbed = new EmbedBuilder()
        .setTitle(":chart_with_upwards_trend: • Statut des services :")
        .setURL("https://stats.uptimerobot.com/DOlqPSjoz6")
        .setColor('#4285F4')
        .addFields(...fields)
        .addFields({ name: '_ _', value: '_ _', inline: true })
        .addFields({ name: `» Légende :`, value: `${online} = Service opérationnel \n${offline} = Service hors-ligne \n` })
        .setFooter({
            text: `Dernière actualisation : ${new Date().toLocaleString('fr-FR', { timeZone: "Europe/Paris" })}`
        });

    msg.edit({ embeds: [pingEmbed] });
}).catch(error => {
    console.error('Erreur lors de la mise à jour des champs de ping:', error);
});
}, 10000);
    } catch (erreur) {
        console.error('Erreur :', erreur);
    }
});