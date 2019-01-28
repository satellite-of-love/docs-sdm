/*
 * Copyright © 2019 Atomist, Inc.
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
    doWithProject,
    ExecPromiseError,
    ExecPromiseResult,
    ExecuteGoal,
    ProjectAwareGoalInvocation,
} from "@atomist/sdm";

export const executeHtmlproof: ExecuteGoal = doWithProject(async (inv: ProjectAwareGoalInvocation) => {
    {
        const pipResult = await inv.spawn("pip", ["install", "-r", "requirements.txt"]);
        if (pipResult.code !== 0) {
            // this is unexpected
            const message = pipResult.error ? pipResult.error.message : "See the log for output";
            return { code: pipResult.status || 2, message };
        }
    }

    const errors: string[] = [];
    let mkdocsResult: ExecPromiseError | ExecPromiseResult;
    try {
        mkdocsResult = await inv.exec("mkdocs", ["build"]);
    } catch (e) {
        const epe = e as ExecPromiseError;
        await inv.addressChannels(`mkdocs failed on ${inv.id.sha} on ${inv.id.branch}: ${epe.message}`);
        errors.push(epe.message);
        mkdocsResult = epe;
    }
    inv.progressLog.write(mkdocsResult.stdout);
    inv.progressLog.write(mkdocsResult.stderr);

    {
        const r = await inv.spawn("bundle", ["install"]);
        if (r.code !== 0) {
            // this is unexpected
            const message = r.error ? r.error.message : "See the log for output";
            return { code: r.status || 2, message };
        }
    }

    let htlmproofResult: ExecPromiseError | ExecPromiseResult;
    try {
        htlmproofResult = await inv.exec("./htmlproof.sh", []);
    } catch (e) {
        const epe = e as ExecPromiseError;
        await inv.addressChannels(`htmlproofer failed on ${inv.id.sha} on ${inv.id.branch}: ${epe.message}`);
        errors.push(epe.message);
        htlmproofResult = epe;
    }
    inv.progressLog.write(htlmproofResult.stdout);
    inv.progressLog.write(htlmproofResult.stderr);

    return { code: errors.length };
});
