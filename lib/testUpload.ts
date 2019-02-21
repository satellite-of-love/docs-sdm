import { S3 } from "aws-sdk";
import * as fs from "fs-extra";

function upload(path: string) {
    return fs.readFile(path).then(async content => {
        await fs.writeFile("local-test-image.png", content, "binary");
        const s3 = new S3();
        s3.putObject({
            Bucket: "docs-sdm.atomist.com",
            Key: "test-image.png",
            Body: content,
            ContentType: "image/png",
        }, (err, data) => {
            if (err) {
                console.log("Dun dun dun");
                console.log(err);
            } else {
                console.log("yay");
                console.log(data);

                console.log("ll -l ./local-test-image.png" +
                    "\nll -l " + path +
                    "\naws s3 ls s3://docs-sdm.atomist.com/test-image.png" +
                    "\nopen http://docs-sdm.atomist.com.s3-website.us-west-2.amazonaws.com/test-image.png")
            }
        })
    });
}

upload("/Users/jessitron/code/atomist/docs/docs/img/atomist-logo.png");