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
    InMemoryProject,
    RepoRef,
} from "@atomist/automation-client";
import * as assert from "assert";
import { listTodoCodeInspection } from "./../../lib/machine/listTodoCommand";

describe("listing TODOs in docs", () => {
    it("lists some TODOs", async () => {
        const inputProject = InMemoryProject.of({
            path: "docs/something.md",
            content: "#Line 1\n\nblah blah *TODO blah\n\n## more stuff",
        });
        // tslint:disable-next-line
        inputProject.id = { url: "https://linkylinky" } as RepoRef;

        const results = await listTodoCodeInspection(inputProject, undefined);

        assert.strictEqual(results.length, 1);
        const one = results[0];
        assert.strictEqual(one.lineContent, "blah blah *TODO blah");
        assert.strictEqual(one.lineFrom1, 3);
        assert.strictEqual(one.emphasis, 1);
    });

    it("orders TODOs by asterisks", async () => {
        const inputProject = InMemoryProject.of({
            path: "docs/something.md",
            content: "#Line 1\n\nblah blah TODO blah\n\n## more stuff\ntwo star **TODO",
        },
            {
                path: "docs/somethingElse.md",
                content: "#Line 1\n\nOne star *TODO\n\n## more stuff",
            });
        // tslint:disable-next-line
        inputProject.id = { url: "https://linkylinky" } as RepoRef;

        const results = await listTodoCodeInspection(inputProject, undefined);

        const lines = results.map(r => r.lineContent);
        assert.strictEqual(results.length, 3);
        assert.deepStrictEqual(lines, ["two star **TODO", "One star *TODO", "blah blah TODO blah"]);
    });
});
