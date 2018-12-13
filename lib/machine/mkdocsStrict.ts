import { ExecuteGoal, GoalInvocation, spawnAndLog, spawnPromise } from "@atomist/sdm";


export const executeMkdocsStrict: ExecuteGoal = async (inv: GoalInvocation) => {
    return inv.configuration.sdm.projectLoader.doWithProject({
        credentials: inv.credentials,
        id: inv.id,
        readOnly: true,
        cloneOptions: { detachHead: true },
    }, async project => {
        const pipResult = await spawnAndLog(inv.progressLog,
            "pip", ["install", "-r", "requirements.txt"], { cwd: project.baseDir });
        if (pipResult.error || pipResult.code !== 0) {
            // this is an unexpected error. TODO: error might not exist?
            return { code: pipResult.status || 2, message: pipResult.error.message }
        }

        const mkdocsResult = await spawnPromise(
            "mkdocs", ["build", "--strict"], { cwd: project.baseDir });
        inv.progressLog.write(mkdocsResult.stdout);
        inv.progressLog.write(mkdocsResult.stderr);
        if (mkdocsResult.error) {
            // this is an unexpected error
            return { code: mkdocsResult.status || 2, message: mkdocsResult.error.message }
        }
        if (mkdocsResult.status !== 0) {
            // this is an expected kind of error; it means the tests failed
            inv.addressChannels(`mkdocs --strict failed on ${inv.id.sha} on ${inv.id.branch}: ${mkdocsResult.stderr}`);
            return { code: mkdocsResult.status || 1, message: mkdocsResult.stderr }
        }
        return { code: 0 };
    });
}
