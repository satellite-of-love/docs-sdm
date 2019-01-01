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
    NoParameters,
    RepoRef,
} from "@atomist/automation-client";
import { PushAwareParametersInvocation } from "@atomist/sdm";
import * as assert from "assert";
import { listTodoNontransform } from "./../../lib/machine/listTodoCommand";

class FakeInvocation {

    public static asPushAwareParametersInvocation(): PushAwareParametersInvocation<NoParameters> & FakeInvocation {
        return new FakeInvocation() as unknown as PushAwareParametersInvocation<NoParameters> & FakeInvocation;
    }
    public messagesSent: string[] = [];

    public async addressChannels(str: string): Promise<void> {
        this.messagesSent.push(str);
        return;
    }
}

describe("listing TODOs in docs", () => {
    it("lists some TODOs", async () => {
        const inputProject = InMemoryProject.of({
            path: "docs/something.md",
            content: "blah blah TODO blah",
        });
        // tslint:disable-next-line
        inputProject.id = { url: "https://linkylinky" } as RepoRef;
        const fakeInvocation = FakeInvocation.asPushAwareParametersInvocation();

        const result = await listTodoNontransform(inputProject, fakeInvocation);

        assert.strictEqual(fakeInvocation.messagesSent.length, 1);
        const message = fakeInvocation.messagesSent[0];
        assert(message.includes("blah blah TODO blah"));
    });
});
