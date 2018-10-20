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

import { asSpawnCommand, RemoteRepoRef } from "@atomist/automation-client";
import { lastLinesLogInterpreter } from "@atomist/sdm";
import { spawnBuilder } from "@atomist/sdm-pack-build";

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
};
