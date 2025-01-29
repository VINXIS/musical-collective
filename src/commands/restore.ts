import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "./index.js";
import { fetchHMAC } from "../fetch.js";
import { siteUrl } from "../config.js";
import { ThingType } from "../types/thing.js";
import choose from "../choose.js";
import { changeStatusSoundcloud } from "../oauth/soundcloud.js";
import youtubeClient from "../oauth/youtube.js";
import confirm from "../confirm.js";

const command: Command = {
    data: new SlashCommandBuilder()
        .setName("restore")
        .setDescription("Restore a thing u created from the webring")
        .addStringOption(option =>
            option
                .setName("thing_type")
                .setDescription("The type of thing u want to restore")
                .addChoices([
                    {
                        name: "Word",
                        value: "words"
                    },
                    {
                        name: "Sound",
                        value: "sounds"
                    },
                    {
                        name: "Motion",
                        value: "motions"
                    },

                ])
                .setRequired(true)
        )
        .setDMPermission(false),
    run: async (interaction: ChatInputCommandInteraction) => {
        await interaction.deferReply();

        const thingType = interaction.options.getString("thing_type")! as ThingType;
        const thing = await choose(interaction, thingType, true);
        if (!thing)
            return;

        const confirmation = await confirm(interaction, `Are you sure you want to restore the ${thingType} \`${thing.title}\`?`);
        if (!confirmation)
            return;

        try {
            await fetchHMAC(siteUrl(`/api/${thingType}?discord=${interaction.user.id}&id=${thing.id}`), "PUT");
        } catch (e) {
            await interaction.followUp({ content: `An error occurred while restoring the ${thingType}\n\`\`\`\n${e}\n\`\`\``, ephemeral: true });
            return;
        }

        // Based on thingType, decide the functionality to perform in other places (yt/sc etc) it's a switch block cuz it shouldn't be too massive for each case
        switch (thingType) {
            case "words":
                break;
            case "sounds":
                if (!("soundcloudUrl" in thing) || !("youtubeUrl" in thing) || typeof thing.soundcloudUrl !== "string" || typeof thing.youtubeUrl !== "string") {
                    await interaction.followUp({ content: `The ${thingType} \`${thing.title}\` has been restored, but it was not found on SoundCloud/YouTube. If wanted, you can delete it with \/delete` });
                    return;
                }
                await changeStatusSoundcloud(thing.soundcloudUrl, "public");
                await youtubeClient.statusChange(thing.youtubeUrl, "public");
                break;
            case "motions":
                if (!("youtubeUrl" in thing) || typeof thing.youtubeUrl !== "string") {
                    await interaction.followUp({ content: `The ${thingType} \`${thing.title}\` has been restored, but it was not found on YouTube. If wanted, you can delete it with \/delete` });
                    return;
                }
                await youtubeClient.statusChange(thing.youtubeUrl, "public");
                break;
        }

        await interaction.followUp({ content: `The ${thingType} \`${thing.title}\` has been restored. If wanted, you can delete it with \/delete` });
    },
}

export default command;