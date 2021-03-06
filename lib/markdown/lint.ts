/*
 * Copyright © 2019 Atomist, Inc.
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
    logger,
    Project,
} from "@atomist/automation-client";
import { doWithFiles } from "@atomist/automation-client/lib/project/util/projectUtils";
import {
    AutofixRegistration,
    CodeTransform,
} from "@atomist/sdm";
import { RemarkFileParser } from "@atomist/sdm-pack-markdown";

const noTrailingSpaces: CodeTransform = (p: Project, inv) => {
    return doWithFiles(p, "**/*.md", async f => {
        return f.replace(/ +$/gm, "");
    });
};

const spacingAfterListMarker: CodeTransform = (p: Project) => {
    return astUtils.doWithAllMatches(p, RemarkFileParser, "**/*.md", "//listItem", m => {
        // unordered list: one space
        const unordererListWithTooManySpaces = /^ *[*-]  +/;
        if (unordererListWithTooManySpaces.test(m.$value)) {
            m.$value = m.$value.replace(unordererListWithTooManySpaces, "* ");
        }

        // ordered list: two spaces. This is an override in .markdownlint.json
        // "list-marker-space": { "ol_multi": 2 }
        const orderedListWithSpaces = /^([0-9]\.) +/;
        if (orderedListWithSpaces.test(m.$value)) {
            m.$value = m.$value.replace(orderedListWithSpaces, "$1  ");
        }
    });
};

const noExtraBlankLines: CodeTransform = (p: Project, inv) => {
    return doWithFiles(p, "**/*.md", async f => {
        return f.replace(/\n\n+/g, "\n\n");
    });
};

export const lintAutofix: AutofixRegistration = {
    name: "markdown linting",
    transform: [noTrailingSpaces, spacingAfterListMarker, noExtraBlankLines],
};
