import { InMemoryProject, NoParameters } from "@atomist/automation-client";
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
        const fakeInvocation = FakeInvocation.asPushAwareParametersInvocation();

        const result = await listTodoNontransform(inputProject, fakeInvocation);

        assert.strictEqual(fakeInvocation.messagesSent.length, 1);
        const message = fakeInvocation.messagesSent[0];
        assert(message.includes("blah blah TODO blah"));
    });
});
