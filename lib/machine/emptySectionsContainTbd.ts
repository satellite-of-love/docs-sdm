import { CodeTransformRegistration, TransformResult, Project } from "@atomist/sdm";


export async function putTbdInEmptySections(project: Project): Promise<TransformResult> {
    return {
        edited: false,
        target: project,
        success: true
    }
}

export const PutTbdInEmptySectionsCommand: CodeTransformRegistration = {
    name: "PutTbdInEmptySectionsCommand",
    intent: "put tbd in empty sections",
    transform: putTbdInEmptySections

}