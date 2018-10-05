import { CodeTransformRegistration, TransformResult, Project } from "@atomist/sdm";
import { doWithAllMatches, FileParser, MatchResult } from "@atomist/automation-client";
import { RemarkFileParser } from "@atomist/sdm-pack-markdown";
import { TreeNode } from "@atomist/tree-path";

const TbdNotice = "\n\n{!tbd.md!}";

export async function putTbdInEmptySections(project: Project): Promise<TransformResult> {
    const parser: FileParser<TreeNode> = new RemarkFileParser();
    let edited = false;
    await doWithAllMatches(project, parser, "**/*.md", "//heading/text", m => {
        console.log("This is something. name is " + m.$name);
        if (m.$parent.$children.length > 1) {
            // not empty
            return;
        }
        m.append(TbdNotice);
        edited = true;
    });
    console.log("edited = " + edited);
    (project as any).flush();
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