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

    it("puts TBD in an empty section of a markdown file", async () => {
        const projectWithMarkdownFile = InMemoryProject.of({
            path: "something.md",
            content: markdownWithAnEmptySection(),
        });
        const result = await putTbdInEmptySections(projectWithMarkdownFile);
        assert(result.success);
        assert(result.edited);

        const newContent = (await projectWithMarkdownFile.getFile("something.md")).getContentSync();
        assert(newContent.includes(`## but here is no stuff

{!tbd.md!}

`), newContent);
        // there is one empty section, so there should be one tbd
        assert.strictEqual(newContent.match(/tbd.md/g).length, 1);
    })

    it("Adds TBD to an empty markdown file", async () => {
        const projectWithEmptyMarkdownFile = InMemoryProject.of({
            path: "something.md",
            content: "",
        });
        const result = await putTbdInEmptySections(projectWithEmptyMarkdownFile);
        assert(result.success);
        assert(result.edited);

        const newContent = (await projectWithEmptyMarkdownFile.getFile("something.md")).getContentSync();
        assert.strictEqual(newContent, "{!tbd.md!}\n");
    });
});

function markdownWithAnEmptySection() {
    return `
Here is some stuff

## but here is no stuff

## and here is more stuff

This section has things in it.
`;
}