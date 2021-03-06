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
    astUtils,
    Project,
} from "@atomist/automation-client";
import {
    AutofixRegistration,
    CodeTransformRegistration,
    TransformResult,
} from "@atomist/sdm";
import { RemarkFileParser } from "@atomist/sdm-pack-markdown";

const EmptySectionTbd = "\n\n{!tbd.md!}";
const EmptyFileTbd = "{!tbd.md!}\n";

export async function putTbdInEmptySections(project: Project): Promise<TransformResult> {
    let edited = false;
    await astUtils.doWithAllMatches(project, RemarkFileParser, "docs/**/*.md", "//heading", m => {
        if (m.$children.length <= 1) { // the "text" child doesn't count
            m.append(EmptySectionTbd);
            edited = true;
        }
    });
    await astUtils.doWithAllMatches(project, RemarkFileParser, "docs/**/*.md", "/root", m => {
        if (m.$children.length === 0) { // only whitespace
            m.append(EmptyFileTbd);
            edited = true;
        }
    });
    (project as any).flush(); // apply updates to matches
    return {
        edited,
        target: project,
        success: true,
    };
}

export const PutTbdInEmptySectionsCommand: CodeTransformRegistration = {
    name: "PutTbdInEmptySectionsCommand",
    intent: "put tbd in empty sections",
    transform: putTbdInEmptySections,

};

export const PutTbdInEmptySectionsAutofix: AutofixRegistration = {
    name: "PutTbdInEmptySectionsAutofix",
    transform: putTbdInEmptySections,
};
