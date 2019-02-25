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

import { buttonForCommand, logger } from "@atomist/automation-client";
import {
    allOf,
    Autofix,
    Fingerprint,
    goal,
    goals,
    ImmaterialGoals,
    isMaterialChange,
    lastLinesLogInterpreter,
    not,
    PushTest,
    SoftwareDeliveryMachine,
    SoftwareDeliveryMachineConfiguration,
    whenPushSatisfies,
} from "@atomist/sdm";
import {
    createSoftwareDeliveryMachine,
    gitHubGoalStatus,
    goalState,
} from "@atomist/sdm-core";
import { Build } from "@atomist/sdm-pack-build";
import { executePublishToS3 } from "../publish/publishToS3";
import {
    mkdocsBuilderRegistration,
} from "./../build/mkdocsBuilder";
import {
    AlphabetizeGlossaryAutofix,
    AlphabetizeGlossaryCommand,
} from "./alphabetizeGlossary";
import {
    PutTbdInEmptySectionsAutofix,
    PutTbdInEmptySectionsCommand,
} from "./emptySectionsContainTbd";
import {
    executeHtmlproof,
    MkdocsBuildAfterCheckout,
} from "./htmlproof";
import {
    listTodoCodeInspectionRegistration,
} from "./listTodoCommand";
import { MkdocsSiteGenerator } from "./mkdocsGenerator";
import { executeMkdocsStrict } from "./mkdocsStrict";
import {
    TbdFingerprinterRegistration,
    tbdFingerprintListener,
} from "./tbdFingerprinter";

export function machine(
    configuration: SoftwareDeliveryMachineConfiguration,
): SoftwareDeliveryMachine {

    logger.info("The configured log level is: " + configuration.logging.level);

    const sdm = createSoftwareDeliveryMachine({
        name: "Atomist Documentation Software Delivery Machine",
        configuration,
    });

    sdm.addCodeTransformCommand(PutTbdInEmptySectionsCommand);
    sdm.addCodeTransformCommand(AlphabetizeGlossaryCommand);

    sdm.addCodeInspectionCommand(listTodoCodeInspectionRegistration());

    const autofix = new Autofix().with(PutTbdInEmptySectionsAutofix)
        .with(AlphabetizeGlossaryAutofix);

    const fingerprint = new Fingerprint().with(TbdFingerprinterRegistration)
        .withListener(tbdFingerprintListener);

    const build = new Build("mkdocs build")
        .with(mkdocsBuilderRegistration());

    const strictMkdocsBuild = goal(
        { displayName: "mkdocs strict" },
        executeMkdocsStrict);

    const htmlproof = goal(
        { displayName: "htmlproof" },
        executeHtmlproof,
        { logInterpreter: lastLinesLogInterpreter("bummer", 10) })
        .withProjectListener(MkdocsBuildAfterCheckout);

    const publish = goal({ displayName: "publishToS3" },
        executePublishToS3,
        { logInterpreter: lastLinesLogInterpreter("no S3 for you", 10) })
        .withProjectListener(MkdocsBuildAfterCheckout);

    const mkDocsGoals = goals("mkdocs")
        .plan(autofix, fingerprint)
        .plan(build).after(autofix)
        .plan(strictMkdocsBuild).after(build)
        .plan(publish).after(build)
        .plan(htmlproof).after(publish);

    sdm.withPushRules(
        whenPushSatisfies(allOf(IsMkdocsProject, not(isMaterialChange({
            extensions: ["md", "html"],
            files: ["mkdocs.yml"],
        })))).itMeans("Nothing about the markdown changed")
            .setGoals(ImmaterialGoals.andLock()),
        whenPushSatisfies(IsMkdocsProject)
            .setGoals(mkDocsGoals),
    );

    sdm.addGeneratorCommand(MkdocsSiteGenerator);

    sdm.addExtensionPacks(
        goalState(),
        gitHubGoalStatus(),
    );

    sdm.addCommand({
        name: "TestTheButton",
        intent: "push me",
        listener: async cli => {
            return cli.addressChannels({
                text: "Push the button",
                attachments: [{
                    fallback: "poo", actions: [buttonForCommand({ text: "Here" }, "TestTheButton")],
                }],
            });
        },
    });

    return sdm;
}

const IsMkdocsProject: PushTest = {
    name: "IsMkdocsProject",
    mapping: inv => inv.project.hasFile("mkdocs.yml"),
};
