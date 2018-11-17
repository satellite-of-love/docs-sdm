import { pushTest, PushListenerInvocation } from "@atomist/sdm";

export const IsMkdocsProject = pushTest(
    "IsMkdocsProject",
    (pli: PushListenerInvocation): Promise<boolean> => {
        return pli.project.hasFile("mkdocs.yml");
    })
