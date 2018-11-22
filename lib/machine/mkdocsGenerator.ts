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

import { GitHubRepoRef } from "@atomist/automation-client";
import { GeneratorRegistration } from "@atomist/sdm";
import { updateTitle } from "@atomist/sdm-pack-markdown";

// let's make a generator for a new mkdocs site, like this one.

export const MkdocsSiteGenerator: GeneratorRegistration = {
    name: "Mkdocs Site",
    intent: "create mkdocs site",
    startingPoint: GitHubRepoRef.from({
        owner: "atomist-seeds",
        repo: "mkdocs-site",
    }),
    transform: [updateTitle("README.md", "New Project")],
};
