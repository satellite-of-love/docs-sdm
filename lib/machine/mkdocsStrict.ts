import {
    ExecuteGoal,
    GoalInvocation, spawnAndLog, spawnPromise, execPromise, ExecPromiseError
} from "@atomist/sdm";


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
            // this is unexpected
            const message = pipResult.error ? pipResult.error.message : "See the log for output";
            return { code: pipResult.status || 2, message }
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


async function demoExecPromise() {
    try {
        const dockerPushResult = await execPromise("docker", ["push", "anImageTag"]);
        const description = `docker push completed successfully. 
            Stdout: ${dockerPushResult.stdout}
            Stderr: ${dockerPushResult.stderr}`;
    } catch (e) {
        const epe = e as ExecPromiseError;
        if (e.error) {
            // an exception happened starting it up
            throw e;
        }
        const description = `Exit code: ${e.status}, stderr: ${e.stderr}`;
    }
}


async function demoSpawnAndLog(inv: GoalInvocation) {
    const dockerPushResult = await spawnAndLog(inv.progressLog,
        "docker", ["push", "anImageTag"]);
    if (dockerPushResult.error) {
        return {
            code: 1,
            message: dockerPushResult.error.message
        }
    }
    if (dockerPushResult.status !== 0) {
        return {
            code: dockerPushResult.status,
            message: "See the log for output",
        }
    }
    const description = `docker push completed successfully. 
            Stdout: ${dockerPushResult.stdout}
            Stderr: ${dockerPushResult.stderr}`;
    // do stuff with output
}


async function demoSpawnPromise(inv: GoalInvocation) {
    const dockerPushResult = await spawnPromise("docker", ["push", "anImageTag"]);
    if (dockerPushResult.error) {
        return { code: 1, message: dockerPushResult.error.message }
    }
    if (dockerPushResult.status !== 0) {
        inv.addressChannels(`docker push failed on ${inv.id.sha} on ${inv.id.branch}: ${dockerPushResult.stderr}`);
        return { code: dockerPushResult.status || 1, message: dockerPushResult.stderr }
    }
    const description = `docker push completed successfully. 
            Stdout: ${dockerPushResult.stdout}
            Stderr: ${dockerPushResult.stderr}`;
    // do stuff with output
}