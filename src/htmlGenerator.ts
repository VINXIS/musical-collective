import * as config from "../config.json";

export default function htmlGenerator(alias: string) {
    return `\`\`\`html
    <div class="${config.collective.name_condensed}Webring">
        <a href="${config.collective.site_url}" title="Collective">${config.collective.name}</a>
        <div class="${config.collective.name_condensed}WebringButtons">
            <a href="/ring?action=prev&from=${alias}" title="Previous">←</a>
            <a href="/ring?action=rand&from=${alias}" title="Random">Random</a>
            <a href="/ring?action=next&from=${alias}" title="Next">→</a>
        </div>
    </div>
\`\`\``;
}