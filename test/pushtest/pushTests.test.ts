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