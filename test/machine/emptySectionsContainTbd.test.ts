import * as assert from "assert";
import { InMemoryProject } from "@atomist/sdm";
import { putTbdInEmptySections } from "../../lib/machine/emptySectionsContainTbd";

// how about a section with subsections? that is not empty right?

describe("putTbdInEmptySections transform", () => {
    it("does nothing on a project with no markdown", async () => {
        const projectWithNonMarkdownFile = InMemoryProject.of({
            path: "something.txt",
            content: markdownWithAnEmptySection(),
        });
        const result = await putTbdInEmptySections(projectWithNonMarkdownFile);
        assert(result.success);
        assert(!result.edited);
    });
});

function markdownWithAnEmptySection() {
    return `
Here is some stuff

## but here is no stuff

## and here is more stuff
`;
}