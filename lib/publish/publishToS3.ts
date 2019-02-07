import {
    doWithProject, ExecuteGoal, ExecuteGoalResult,
    ProjectAwareGoalInvocation,
} from "@atomist/sdm";

export const executePublishToS3: ExecuteGoal = doWithProject(
    async (inv: ProjectAwareGoalInvocation): Promise<ExecuteGoalResult> => {
        inv.addressChannels("Let's pretend I just published the docs to S3");
        return {
            code: 0,
        };
    }, { readOnly: true });
