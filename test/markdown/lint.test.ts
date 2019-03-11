import { InMemoryProject } from "@atomist/automation-client";
import * as assert from "assert";
import { countUpInOrderedLists } from "../../lib/markdown/lint";

describe("MD029/ol-prefix", () => {
    it("can make a list count upward", async () => {
        const md = `Blah blah

# So.

1.  this is
3.  an ordered list
`;

        const p = InMemoryProject.of({ path: "something.md", content: md });
        const result = await countUpInOrderedLists(p, undefined, undefined);

        const newContent = await p.findFileSync("something.md").getContentSync();

        assert(newContent.includes("2.  an ordered list"), newContent);

    });
});
