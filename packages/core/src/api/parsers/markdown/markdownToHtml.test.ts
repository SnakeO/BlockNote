// @vitest-environment node
import { runInNewContext } from "node:vm";
import { describe, expect } from "vite-plus/test";
import { markdownToHtml } from "./markdownToHtml.js";

describe("markdownToHtml", () => {
  // A line that starts with a pipe, has 60 more pipes, and does not end with
  // a pipe. It is not a table row.
  const pipeLine = "|" + " a |".repeat(60) + " x";

  // The test runner cannot stop a synchronous call: a parse that does not end
  // blocks the test run. `runInNewContext` stops the parse after 5 seconds,
  // and the test fails.
  //
  // The result is without the line end after `<br>`: the test is about the
  // time and the structure, not about that detail of the HTML.
  function markdownToHtmlWithTimeLimit(markdown: string): string {
    const html: unknown = runInNewContext(
      "markdownToHtml(markdown)",
      { markdownToHtml, markdown },
      { timeout: 5000 },
    );
    return String(html).replaceAll("<br>\n", "<br>");
  }

  it("keeps a line with many pipes and no last pipe in the paragraph", () => {
    expect(markdownToHtmlWithTimeLimit(`x\n${pipeLine}\n`)).toBe(
      `<p>x<br>${pipeLine}</p>`,
    );
  });

  it("keeps a line with many pipes and no last pipe in the quote", () => {
    expect(markdownToHtmlWithTimeLimit(`> q\n${pipeLine}\n`)).toBe(
      `<blockquote><p>q<br>${pipeLine}</p></blockquote>`,
    );
  });
});
