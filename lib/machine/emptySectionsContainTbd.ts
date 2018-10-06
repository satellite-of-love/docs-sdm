import { CodeTransformRegistration, TransformResult, Project } from "@atomist/sdm";
import { doWithAllMatches, FileParser, MatchResult, doWithFiles } from "@atomist/automation-client";
import { RemarkFileParser } from "@atomist/sdm-pack-markdown";
import { TreeNode } from "@atomist/tree-path";

const EmptySectionTbd = "\n\n{!tbd.md!}";
const EmptyFileTbd = "{!tbd.md!}\n";


export async function putTbdInEmptySections(project: Project): Promise<TransformResult> {
    let edited = false;
    await doWithAllMatches(project, RemarkFileParser, "docs/**/*.md", "//heading", m => {
        if (m.$children.length <= 1) { // the "text" child doesn't count
            m.append(EmptySectionTbd);
            edited = true;
        }
    });
    await doWithAllMatches(project, RemarkFileParser, "docs/**/*.md", "/root", m => {
        if (m.$children.length === 0) { // only whitespace
            m.append(EmptyFileTbd);
            edited = true;
        }
    });
    (project as any).flush(); // apply updates to matches
    console.log("edited =  " + edited);
    return {
        edited,
        target: project,
        success: true
    }
}

export const PutTbdInEmptySectionsCommand: CodeTransformRegistration = {
    name: "PutTbdInEmptySectionsCommand",
    intent: "put tbd in empty sections",
    transform: putTbdInEmptySections

}