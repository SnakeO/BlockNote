import { afterEach, describe, expect, it } from "vite-plus/test";

import { htmlToMarkdown } from "./htmlToMarkdown.js";

describe("the HTML that htmlToMarkdown reads", () => {
  const innerHTML = Object.getOwnPropertyDescriptor(
    Element.prototype,
    "innerHTML",
  )!;

  afterEach(() => {
    Object.defineProperty(Element.prototype, "innerHTML", innerHTML);
  });

  // In the active document, an element of the HTML can load a resource and
  // run an event handler: each video of an export starts a second request.
  it("stays out of the active document", () => {
    const inActiveDocument: string[] = [];
    Object.defineProperty(Element.prototype, "innerHTML", {
      ...innerHTML,
      set(this: Element, html: string) {
        innerHTML.set!.call(this, html);
        if (this.ownerDocument === document) {
          for (const video of this.querySelectorAll("video")) {
            inActiveDocument.push(video.nodeName);
          }
        }
      },
    });

    const markdown = htmlToMarkdown(
      `<p>Text</p><video src="video.mp4"></video>`,
    );

    expect(markdown).toBe("Text\n\n![](video.mp4)\n");
    expect(inActiveDocument).toEqual([]);
  });
});
