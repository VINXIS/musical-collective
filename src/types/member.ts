import { ColorResolvable, EmbedBuilder } from "discord.js";
import config from "../../config.json" with { type: "json" };
import htmlGenerator from "../htmlGenerator.js";

export interface Member {
    discord: string;
    alias: string;
    site: string | null;
    addedRingToSite: boolean;
    color: string;
}

export function memberInfo(member: Member) {
    const embed = new EmbedBuilder()
        .setTitle('Member Information')
        .addFields(
            { name: 'Alias', value: member.alias || 'N/A', inline: true },
            { name: 'Site', value: member.site ? `<${member.site}>` : 'none', inline: true },
            { name: `Color for Words (${config.collective.site_url}/words)`, value: member.color || 'N/A' }
        )
        // Check if member.color is a #\d{6} hex code and set the color of the embed, if not check if it is \d{6} and add a # to the beginning, otherwise use the default embed color
        .setColor(/^#[A-Fa-f0-9]{6}$/.test(member.color) ? member.color as ColorResolvable: /^([A-Fa-f0-9]{6})$/.test(member.color) ? `#${member.color}` : null);

    if (member.site) {
        let htmlText = `**HTML for Site:** ${htmlGenerator(member.alias)}`;
        if (!member.addedRingToSite)
            htmlText += `\n\nConfirm your webring membership by adding the HTML to your site and running \`/confirm\``;
    
        embed.addFields({ name: 'Additional Information', value: htmlText });
    } else {
        embed.addFields({
            name: 'Site Not Provided',
            value: 'If you wish to add your site to fully join the webring, run `/change` to add your site URL'
        });
    }

    return embed;
}