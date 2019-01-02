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
    RepoRef,
} from "@atomist/automation-client";
import { gatherFromFiles } from "@atomist/automation-client/lib/project/util/projectUtils";
import {
    CodeInspection,
    CodeInspectionRegistration,
    CodeInspectionResult,
    CommandListenerInvocation,
} from "@atomist/sdm";
import * as slack from "@atomist/slack-messages";
import _ = require("lodash");

const todoRegex = /\btodo\b/i;
const tbdRegex = /\btbd\b/i;

interface Todo {
    path: string;
    lineFrom1: number;
    lineContent: string;
}
/*
 * This does not need to be a transform. It does not change the project.
 * I just want to run a command with access to the project and this gets me that
 */
export const listTodoCodeInspection: CodeInspection<Todo[]> = async (project, inv) => {
    const todos: Todo[] = _.flatten(await gatherFromFiles(project, "**/*.md", async f => {
        const lines = (await f.getContent()).split("\n");
        const items = lines
            .filter(l => todoRegex.test(l) || tbdRegex.test(l))
            .map((l, i) => {
                const item = {
                    path: f.path,
                    lineFrom1: i + 1,
                    lineContent: l,
                };
                return item;
            });
        return items;
    }));
    return todos;
};

async function reportTodos(
    results: Array<CodeInspectionResult<Todo[]>>,
    inv: CommandListenerInvocation): Promise<void> {
    await Promise.all(results.map(async r =>
        inv.addressChannels(constructMessage(r.repoId, r.result)),
    ));
    return;
}

function constructMessage(projectId: RepoRef, todos: Todo[]): string {
    const header = slack.url(projectId.url, `${projectId.owner}/${projectId.repo}`);
    return header + "\n\n" + todos.map(t => `${t.path}:${t.lineFrom1} ${t.lineContent}`).join("\n");
}

export function listTodoNontransformRegistration(): CodeInspectionRegistration<Todo[]> {
    return {
        name: "listTodo",
        intent: ["list todos", "what needs done"],
        inspection: listTodoCodeInspection,
        onInspectionResults: reportTodos,
    };
}
