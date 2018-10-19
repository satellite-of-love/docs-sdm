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

import { FingerprintData, InMemoryProject, Project } from "@atomist/automation-client";
import { PushImpactListenerInvocation } from "@atomist/sdm";
import * as assert from "assert";
import { TbdFingerprinterRegistration } from "./../../lib/machine/tbdFingerprinter";

describe("Fingerprinting a project for TBD count", () => {

    async function invoke(project: Project): Promise<FingerprintData> {
        const inv = { project } as any as PushImpactListenerInvocation;
        const result = await TbdFingerprinterRegistration.action(inv);
        return result as FingerprintData;
    }
    it("notices addition of a TBD", async () => {

        const projectWithTwo = InMemoryProject.of({
            path: "docs/something.md",
            content: "# I am an empty section\n\n{!tbd.md!}\n\n{!tbd.md!}",
        });

        const projectWithThree = InMemoryProject.of({
            path: "docs/something.md",
            content: "# I am an empty section\n\n{!tbd.md!}\n\n{!tbd.md!}",
        }, { path: "docs/something-else.md", content: "{!tbd.md!}" });

        const fingerprint2 = await invoke(projectWithTwo);
        const fingerprint3 = await invoke(projectWithThree);

        assert.strictEqual(fingerprint2.data, "2");
        assert.strictEqual(fingerprint3.data, "3");

        assert(fingerprint2.sha !== fingerprint3.sha);
    });

    it("Handles a file with no TBD", async () => {

        const projectWithZero = InMemoryProject.of({
            path: "docs/something.md",
            content: "# I am all full empty section\n\nYay me",
        });

        const fingerprint0 = await invoke(projectWithZero);

        assert.strictEqual(fingerprint0.data, "0");
    });
});
