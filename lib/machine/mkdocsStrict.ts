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
    ExecuteGoal,
    GoalInvocation,
    spawnAndLog,
    spawnPromise,
} from "@atomist/sdm";


export const executeMkdocsStrict: ExecuteGoal = async (inv: GoalInvocation) => {
    return inv.configuration.sdm.projectLoader.doWithProject({
        credentials: inv.credentials,
        id: inv.id,
        readOnly: true,
        cloneOptions: { detachHead: true },
    }, async project => {
        const pipResult = await spawnAndLog(inv.progressLog,
            "pip", ["install", "-r", "requirements.txt"], { cwd: project.baseDir });
        if (pipResult.error || pipResult.code !== 0) {
            // this is unexpected
            const message = pipResult.error ? pipResult.error.message : "See the log for output";
            return { code: pipResult.status || 2, message }
        }


        const mkdocsResult = await spawnPromise(
            "mkdocs", ["build", "--strict"], { cwd: project.baseDir });
        inv.progressLog.write(mkdocsResult.stdout);
        inv.progressLog.write(mkdocsResult.stderr);
        if (mkdocsResult.error) {
            // this is an unexpected error
            return { code: mkdocsResult.status || 2, message: mkdocsResult.error.message }
        }
        if (mkdocsResult.status !== 0) {
            // this is an expected kind of error; it means the tests failed
            inv.addressChannels(`mkdocs --strict failed on ${inv.id.sha} on ${inv.id.branch}: ${mkdocsResult.stderr}`);
            return { code: mkdocsResult.status || 1, message: mkdocsResult.stderr }
        }
        return { code: 0 };
    });
}