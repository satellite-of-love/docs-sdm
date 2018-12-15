/*
 * Copyright © 2018 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
    Project,
    RemoteRepoRef,
} from "@atomist/automation-client";
import {
    lastLinesLogInterpreter,
} from "@atomist/sdm";
import {
    Builder,
    BuilderRegistration,
    spawnBuilder,
} from "@atomist/sdm-pack-build";

const logInterpreter = lastLinesLogInterpreter("Tail of build log:", 10);

const projectToAppInfo = async (p: Project) => {
    return {
        name: p.id.repo,
        version: p.id.sha,
        id: p.id as RemoteRepoRef,
    };
};

function mkdocsBuilder(options: { strict: boolean }): Builder {
    const mkdocsStrictArg = options.strict ? ["--strict"] : [];
    return spawnBuilder({
        name: "mkdocs spawn builder",
        logInterpreter,
        projectToAppInfo,
        commands: [
            { command: "pip", args: ["install", "-r", "requirements.txt"] },
            { command: "mkdocs", args: ["build"].concat(mkdocsStrictArg) },
        ],
    });
}

export function mkdocsBuilderRegistration(
    options: { strict: boolean } = { strict: false }): BuilderRegistration {
    return {
        name: "mkdocs build",
        builder: mkdocsBuilder(options),
    };
}
