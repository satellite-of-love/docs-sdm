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

import { Project } from "@atomist/automation-client";
import { doWithFiles } from "@atomist/automation-client/lib/project/util/projectUtils";
import {
    doWithProject,
    ExecuteGoal,
    ExecuteGoalResult,
    ProgressLog,
    ProjectAwareGoalInvocation,
} from "@atomist/sdm";
import { S3 } from "aws-sdk";
import * as mime from "mime-types";
import * as path from "path";
import { promisify } from "util";

const s3 = new S3();

function putObject(params: S3.Types.PutObjectRequest): () => Promise<S3.Types.PutObjectOutput> {
    return promisify<S3.Types.PutObjectOutput>(cb => s3.putObject(params, cb));
}

export const executePublishToS3: ExecuteGoal = doWithProject(
    doIt, { readOnly: true });

export async function doIt(inv: ProjectAwareGoalInvocation): Promise<ExecuteGoalResult> {
    if (!inv.id.sha) {
        return { code: 99, message: "SHA is not defined. I need that" };
    }
    try {
        const result = await pushToS3(s3, inv.progressLog, inv.project, {
            bucketName: "docs-build.atomist.com",
            globPattern: "site/**/*",
            pathPrefix: inv.id.sha,
            public: true,
        });
        inv.progressLog.write("URL: " + result.url);
        await inv.addressChannels("Hey check this out: " + result.url);
    } catch (e) {
        return { code: 98, message: e.message };
    }
    return {

        code: 0,
    };
}

async function pushToS3(s3: S3, progressLog: ProgressLog, project: Project, params: {
    bucketName: string,
    globPattern: string,
    pathPrefix: string,
    public: boolean,
}) {
    const { bucketName, globPattern, pathPrefix } = params;
    const keyPrefix = pathPrefix.endsWith("/") ? pathPrefix : pathPrefix + "/";
    await doWithFiles(project, globPattern, async file => {
        const content = await file.getContent();
        const key = keyPrefix + file.path;
        const acl = params.public ? "public-read" : undefined;
        const contentType = mime.lookup(file.path);
        console.log(`File: ${file.path}, contentType: ${contentType}`);
        if (!contentType) {
            progressLog.write("WARNING: No content-type found for " + file.path);
        }
        console.log("Publishing to " + key + " with ACL " + acl);
        await putObject({
            Bucket: bucketName,
            Key: key,
            Body: content,
            ACL: acl,
            ContentType: contentType,
        })();
        // .catch(err => {
        //     console.log("HERE I AM IN THIS THING");
        //     console.log(err);
        // });
    });

    return { url: `https://s3.amazonaws.com/${bucketName}/${keyPrefix}` };
}
