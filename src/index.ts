import { AttachmentPayload, ChatInputCommandInteraction, Client, DiscordAPIError, GatewayIntentBits, Message, REST, Routes } from "discord.js";
import * as config from "../config.json";
import { commands } from "./commands";

const rest = new REST({ version: "10" }).setToken(config.discord.token);
(async () => {
    console.log("Started refreshing slash (/) commands.");

    await rest.put(
        Routes.applicationCommands(config.discord.client_id),
        { body: commands.map(c => c.data) }
    );
})()
    .then(() => console.log(`Successfully refreshed slash (/) command`))
    .catch((error) => console.error("An error has occurred in refreshing slash (/) command", error));

const discordClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
    ],
});

discordClient.login(config.discord.token).then(() => {
    console.log("Logged in as " + discordClient.user?.tag);
});

discordClient.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = commands.find(c => c.data.name === interaction.commandName);
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found`);
        return;
    }

    try {
        await command.run(interaction);
    } catch (err) {
        if (!err)
            return;
        
        console.error(err);

        if (!(err instanceof DiscordAPIError))
            return;

        if (err.code === 50027) {
            await interaction.channel?.send(`Ur command timed out Lol try again <@${interaction.user.id}>`);
            await interaction.deleteReply();
        } else {
            await respond(interaction, { content: `The command was unable to be fulfilled.\nA discord error (code \`${err.code}\`) was received:\n\`\`\`\n${err.message}\n\`\`\`` });
        }
    }   
});

export async function respond (interaction: ChatInputCommandInteraction, messageData: { content?: string, files?: AttachmentPayload[] | string[], ephemeral?: boolean }) {
    if (interaction.replied || interaction.deferred)
        return interaction.editReply(messageData);
    else
        return interaction.reply(messageData);
}