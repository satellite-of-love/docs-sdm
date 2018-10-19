import { PushImpactListenerInvocation } from '@atomist/sdm';
import { TbdFingerprinterRegistration } from './../../lib/machine/tbdFingerprinter';
import { InMemoryProject, FingerprintData, Project } from '@atomist/automation-client';
import * as assert from "assert";

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

        assert.deepEqual(fingerprint2.data, "2");
        assert.deepEqual(fingerprint3.data, "3");

        assert(fingerprint2.sha !== fingerprint3.sha);
    });

    it("Handles a file with no TBD", async () => {

        const projectWithZero = InMemoryProject.of({
            path: "docs/something.md",
            content: "# I am all full empty section\n\nYay me",
        });

        const fingerprint0 = await invoke(projectWithZero);

        assert.deepEqual(fingerprint0.data, "0");
    });
});