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
    GitProject,
    HandlerContext,
    logger,
    Project,
    RepoRef,
} from "@atomist/automation-client";
import { doWithFiles } from "@atomist/automation-client/lib/project/util/projectUtils";
import {
    doWithProject,
    ExecuteGoal,
    ExecuteGoalResult,
    ProjectAwareGoalInvocation,
    slackWarningMessage,
} from "@atomist/sdm";
import {
    SlackMessage,
} from "@atomist/slack-messages";
import { Credentials, S3 } from "aws-sdk";
import * as fs from "fs-extra";
import * as mime from "mime-types";
import * as path from "path";
import { promisify } from "util";

function putObject(s3: S3, params: S3.Types.PutObjectRequest): () => Promise<S3.Types.PutObjectOutput> {
    return promisify<S3.Types.PutObjectOutput>(cb => s3.putObject(params, cb));
}

export const executePublishToS3: ExecuteGoal = doWithProject(
    doIt, { readOnly: true });

export async function doIt(inv: ProjectAwareGoalInvocation): Promise<ExecuteGoalResult> {
    if (!inv.id.sha) {
        return { code: 99, message: "SHA is not defined. I need that" };
    }
    try {
        const s3 = new S3({
            credentials: new Credentials(inv.configuration.sdm.aws.accessKey, inv.configuration.sdm.aws.secretKey),
        });
        const result = await pushToS3(s3, inv.project, {
            bucketName: "docs-sdm.atomist.com",
            region: "us-west-2",
            globPattern: "site/**/*",
            pathTranslation: filepath => inv.id.sha + "/" + filepath.replace("site/", ""),
            indexPath: inv.id.sha + "/",
        });
        inv.progressLog.write("URL: " + result.url);
        inv.progressLog.write(result.warnings.join("\n"));
        inv.progressLog.write(`${result.fileCount} files uploaded to ${result.url}`);

        if (result.warnings.length > 0) {
            await inv.addressChannels(formatWarningMessage(result.url, result.warnings, inv.id, inv.context));
        }

        return {
            code: 0,
            externalUrls: [{ label: "Check it out!", url: result.url }],
        };
    } catch (e) {
        return { code: 98, message: e.message };
    }
}

function formatWarningMessage(url: string, warnings: string[], id: RepoRef, ctx: HandlerContext): SlackMessage {
    return slackWarningMessage("Some files were not uploaded to S3", warnings.join("\n"), ctx, {
        author_name: `published docs from ${id.owner}/${id.repo}#${id.sha.substr(0, 7)}`,
        author_link: url,
    });
}

async function pushToS3(s3: S3, project: Project, params: {
    bucketName: string,
    region: string,
    globPattern: string,
    pathTranslation: (filePath: string) => string,
    indexPath: string,
}): Promise<{ url: string, warnings: string[], fileCount: number }> {
    const { bucketName, globPattern, pathTranslation, region, indexPath } = params;
    const warnings: string[] = [];
    let fileCount = 0;
    await doWithFiles(project, globPattern, async file => {
        fileCount++;
        const key = pathTranslation(file.path);

        const contentType = mime.lookup(file.path);
        if (contentType === false) {
            warnings.push("Not uploading: Unable to determine content type for " + file.path);
            return;
        }

        const content = await fs.readFile((project as GitProject).baseDir +
            path.sep + file.path); // replace with file.getContentBuffer when that makes it into automation-client

        logger.info(`File: ${file.path}, key, ${key}, contentType: ${contentType}`);
        await putObject(s3, {
            Bucket: bucketName,
            Key: key,
            Body: content,
            ContentType: contentType,
        })();
        logger.info("OK! Published to " + key);
    });

    return {
        url: `http://${bucketName}.s3-website.${region}.amazonaws.com/${indexPath}`,
        warnings,
        fileCount,
    };
}
