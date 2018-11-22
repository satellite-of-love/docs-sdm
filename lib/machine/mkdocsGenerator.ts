import { GeneratorRegistration } from "@atomist/sdm";
import { GitHubRepoRef } from "@atomist/automation-client";
import { updateTitle } from "@atomist/sdm-pack-markdown";

// let's make a generator for a new mkdocs site, like this one.

export const MkdocsSiteGenerator: GeneratorRegistration = {
    name: "Mkdocs Site",
    intent: "create mkdocs site",
    startingPoint: GitHubRepoRef.from({
        owner: "atomist-seeds",
        repo: "mkdocs-site"
    }),
    transform: [updateTitle("README.md", "New Project")],
}

