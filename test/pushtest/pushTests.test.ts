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

import { IsMkdocsProject } from './../../lib/pushtest/pushTests';
import * as assert from "assert";
import { InMemoryProject } from "@atomist/automation-client";
import { PushListenerInvocation } from '@atomist/sdm';

describe("push tests for mkdocs projects", () => {
    it("identifies a mkdocs project", async () => {
        const MkdocsProject = InMemoryProject.of({
            path: "mkdocs.yml",
            content: `site_name: Pretend Site`
        });
        const result = await IsMkdocsProject.mapping({ project: MkdocsProject } as any as PushListenerInvocation);
        assert(result);
    });

    it("does not identify an empty project as mkdocs", async () => {
        const EmptyProject = InMemoryProject.of();
        const result = await IsMkdocsProject.mapping({ project: EmptyProject } as any as PushListenerInvocation);
        assert(!result);
    });
});