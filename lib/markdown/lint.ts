import { astUtils, logger, Project } from "@atomist/automation-client";
import { doWithFiles } from "@atomist/automation-client/lib/project/util/projectUtils";
import { AutofixRegistration, CodeTransform } from "@atomist/sdm";
import { RemarkFileParser } from "@atomist/sdm-pack-markdown";

const noTrailingSpaces: CodeTransform = (p: Project, inv) => {
    return doWithFiles(p, "**/*.md", async f => {
        return f.replace(/ +$/gm, "");
    });
};

export const spacingAfterListMarker: CodeTransform = (p: Project) => {
    return astUtils.doWithAllMatches(p, RemarkFileParser, "**/*.md", "//listItem", m => {
        // unordered list: one space
        const unordererListWithTooManySpaces = /^[*-]  +/;
        if (unordererListWithTooManySpaces.test(m.$value)) {
            m.$value = m.$value.replace(unordererListWithTooManySpaces, "* ");
        }

        // ordered list: two spaces. This is an override in .markdownlint.json
        // "list-marker-space": { "ol_multi": 2 }
        const orderedListWithSpaces = /^([0-9]\.) +/;
        if (orderedListWithSpaces.test(m.$value)) {
            m.$value = m.$value.replace(orderedListWithSpaces, "$1  ");
        }
    });
};

export const lintAutofix: AutofixRegistration = {
    name: "markdown linting",
    transform: [noTrailingSpaces, spacingAfterListMarker],
};
