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

import { InMemoryProject } from "@atomist/automation-client";
import * as assert from "assert";
import { putTbdInEmptySections } from "../../lib/machine/emptySectionsContainTbd";

// how about a section with subsections? that is not empty right?

describe("putTbdInEmptySections transform", () => {
    it("does nothing on a project with no markdown", async () => {
        const projectWithNonMarkdownFile = InMemoryProject.of({
            path: "docs/something.txt",
            content: markdownWithAnEmptySection(),
        });
        const result = await putTbdInEmptySections(projectWithNonMarkdownFile);
        assert(result.success);
        assert(!result.edited);
    });

    it("puts TBD in an empty section of a markdown file", async () => {
        const projectWithMarkdownFile = InMemoryProject.of({
            path: "docs/something.md",
            content: markdownWithAnEmptySection(),
        });
        const result = await putTbdInEmptySections(projectWithMarkdownFile);
        assert(result.success);
        assert(result.edited);

        const newContent = (await projectWithMarkdownFile.getFile("docs/something.md")).getContentSync();
        assert(newContent.includes(`## but here is no stuff

{!tbd.md!}

`), newContent);
        // there is one empty section, so there should be one tbd
        assert.strictEqual(newContent.match(/tbd.md/g).length, 1);
    });

    it("Adds TBD to an empty markdown file", async () => {
        const projectWithEmptyMarkdownFile = InMemoryProject.of({
            path: "docs/something.md",
            content: "",
        });
        const result = await putTbdInEmptySections(projectWithEmptyMarkdownFile);
        assert(result.success);
        assert(result.edited);

        const newContent = (await projectWithEmptyMarkdownFile.getFile("docs/something.md")).getContentSync();
        assert.strictEqual(newContent, "{!tbd.md!}\n");
    });
});

function markdownWithAnEmptySection(): string {
    return `
Here is some stuff

## but here is no stuff

## and here is more stuff

This section has things in it.
`;
}
