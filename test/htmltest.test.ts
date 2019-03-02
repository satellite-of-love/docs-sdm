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

import * as assert from "assert";
import { htmltestLogInterpreter } from "../lib/machine/htmltest";

describe("htmltest log interpretation", () => {
  it("Lists the missing websites", async () => {
    const logSample = `htmltest started at 08:17:09 on site
========================================================================
user/dashboard/index.html
  request exceeded our ExternalTimeout --- user/dashboard/index.html --> https://app.atomist.como
========================================================================
✘✘✘ failed in 15.203366125s
1 errors in 65 documents
`;
    const result = htmltestLogInterpreter(logSample);

    assert.strictEqual(result.message, "htmltest: 1 errors in 65 documents");
    assert.strictEqual(result.relevantPart,
      `user/dashboard/index.html
  request exceeded our ExternalTimeout --- user / dashboard / index.html --> https://app.atomist.como
`);
  });
});