import { afterEach, describe, expect, it } from "vite-plus/test";

import { BlockNoteEditor } from "../editor/BlockNoteEditor.js";

describe("the children of a details element in an HTML parse", () => {
  const appendChild = Node.prototype.appendChild;

  afterEach(() => {
    Node.prototype.appendChild = appendChild;
  });

  // The HTML parser reads the HTML in a document without a browsing context.
  // In the active document, an element of the HTML can load a resource and
  // run an event handler.
  it("stay out of the active document", () => {
    const editor = BlockNoteEditor.create();
    const inActiveDocument: string[] = [];
    Node.prototype.appendChild = function <T extends Node>(
      this: Node,
      child: T,
    ): T {
      const result = appendChild.call(this, child) as T;
      if (child.ownerDocument === document && child.nodeName === "IMG") {
        inActiveDocument.push(child.nodeName);
      }
      return result;
    };

    const blocks = editor.tryParseHTMLToBlocks(
      `<details><summary>Toggle</summary><img src="image.png" onerror="window.fired = true"></details>`,
    );

    expect(inActiveDocument).toEqual([]);
    // The image is in the result, with the URL as the HTML has it.
    expect(blocks[0]).toMatchObject({
      type: "toggleListItem",
      children: [{ type: "image", props: { url: "image.png" } }],
    });
  });
});
