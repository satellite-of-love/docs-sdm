import { Project } from "@atomist/automation-client";
import { doWithFiles } from "@atomist/automation-client/lib/project/util/projectUtils";
import { AutofixRegistration, CodeTransform } from "@atomist/sdm";

const noTrailingSpaces: CodeTransform = (p: Project, inv) => {
    return doWithFiles(p, "**/*.md", async f => {
        return f.replace(/ +$/gm, "");
    });
};

export const lintAutofix: AutofixRegistration = {
    name: "markdown linting",
    transform: [noTrailingSpaces],
};
