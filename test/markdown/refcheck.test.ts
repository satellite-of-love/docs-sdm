import { InMemoryProject } from "@atomist/automation-client";
import * as assert from "assert";
import { inspectReferences } from "../../lib/markdown/refcheck";
// import { countUpInOrderedLists } from "../../lib/markdown/lint";

describe("those darn link references", () => {
    it("is ok with a defined link ref", async () => {
        const md = `Blah blah

I want to [link to a thing][named-this]. So there.

[named-this]: https://here-it-is.com (Informative Name)

blah blah blah.
`;

        const p = InMemoryProject.of({ path: "something.md", content: md });
        const result = await inspectReferences.inspection(p, undefined);

        assert.strictEqual(result.comments.length, 0);
    });

    it("complains about a referenced link that is not defined", async () => {
        const md = `Blah blah

I want to [link to a thing][named-this]. So there.

[named-something-else]: https://here-it-is.com (Informative Name)

blah blah blah.
`;

        const p = InMemoryProject.of({ path: "something.md", content: md });
        const result = await inspectReferences.inspection(p, undefined);

        assert.strictEqual(result.comments.length, 1);
    });
});
