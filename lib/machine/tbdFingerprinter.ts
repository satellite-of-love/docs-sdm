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

import { projectUtils } from "@atomist/automation-client";
import {
    FingerprinterRegistration,
    FingerprinterResult,
    FingerprintListenerInvocation,
    PushImpactListenerInvocation,
} from "@atomist/sdm";

function sum(arr: number[]): number {
    return arr.reduce((a, b) => a + b, 0);
}

export const TbdFingerprintData = {
    name: "TbdCount",
    abbreviation: "tbd",
    version: "1.0",
};

function countOccurrences(ofRegExp: RegExp, inString: string): number {
    if (!ofRegExp.global) {
        throw new Error("You forgot to use a global regexp. Add a g");
    }
    return (inString.match(ofRegExp) || []).length;
}

async function calculateTbdFingerprint(cri: PushImpactListenerInvocation): Promise<FingerprinterResult> {
    const tbdCountsPerFile = await projectUtils.gatherFromFiles(cri.project,
        "docs/**/*.md",
        async (f): Promise<number> => {
            const tbds = countOccurrences(/\{!tbd.md!\}/g, await f.getContent());
            const todos = countOccurrences(/\bTODO\b/gi, await f.getContent());
            return tbds + todos;
        });
    const totalTbds = sum(tbdCountsPerFile);
    return {
        ...TbdFingerprintData,
        sha: "" + totalTbds,
        data: "" + totalTbds,
    };
}

export const TbdFingerprinterRegistration: FingerprinterRegistration = {
    name: "Count of TBDs",
    action: calculateTbdFingerprint,
};

export async function tbdFingerprintListener(inv: FingerprintListenerInvocation): Promise<void> {
    const tbdFingerprints = inv.fingerprints.filter(fr => fr.name === TbdFingerprintData.name);
    if (tbdFingerprints.length === 0) {
        return;
    }
    const last = tbdFingerprints[0];

    const message = `There are still ${last.data} TBDs to populate.`;
    return inv.addressChannels(message);
}
