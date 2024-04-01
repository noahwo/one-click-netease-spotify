import docai from "docai";

await docai({
  llm: {
    apiKey: "YOUR_API_KEY",
    modelProvider: "mistral",
    modelName: "mistral-tiny",
  },
  outputDir: "./generated",
  files: ["./test2.ts", "./test.js"],
});
