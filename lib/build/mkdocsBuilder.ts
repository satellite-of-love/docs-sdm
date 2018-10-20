import { spawnBuilder } from "@atomist/sdm-pack-build";
import { lastLinesLogInterpreter } from "@atomist/sdm";
import { RemoteRepoRef, asSpawnCommand } from "@atomist/automation-client";

export const mkdocsBuilder = {
    name: "mkdocs build",
    builder: spawnBuilder({
        name: "mkdocs spawn builder",
        logInterpreter: lastLinesLogInterpreter("Here is some log bits:", 10),
        projectToAppInfo: async p => {
            return {
                name: p.id.repo,
                version: p.id.sha,
                id: p.id as RemoteRepoRef,
            };
        },
        commands: [
            "pip install -r requirements.txt",
            "mkdocs build",
        ].map(m => asSpawnCommand(m)),
    }),
}