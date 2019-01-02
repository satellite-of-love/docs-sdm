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
            content: "blah blah TODO blah",
        });
        // tslint:disable-next-line
        inputProject.id = { url: "https://linkylinky" } as RepoRef;

        const results = await listTodoCodeInspection(inputProject, undefined);

        assert.strictEqual(results.length, 1);
        const one = results[0];
        assert.strictEqual(one.lineContent, "blah blah TODO blah");
    });
});
