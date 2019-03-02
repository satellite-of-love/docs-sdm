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
  request exceeded our ExternalTimeout-- - user / dashboard / index.html-- > https://app.atomist.como
`);
    });
});