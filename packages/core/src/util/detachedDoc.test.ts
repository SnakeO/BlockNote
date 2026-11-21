import { DOMParser } from "prosemirror-model";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { BlockNoteEditor } from "../editor/BlockNoteEditor.js";

describe("the parse rules with HTML that is in the active document", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // The parse rules do not control the document of the nodes that they get.
  // A clone of a node of the active document is in the active document, where
  // it loads its resource and runs its event handler again.
  it("make no element and no clone in the active document", () => {
    const editor = BlockNoteEditor.create();
    const html = document.createElement("div");
    html.innerHTML =
      `<ul><li><img src="image.png"></li></ul>` +
      `<details><summary><p>Toggle</p></summary><img src="image.png"></details>` +
      `<p>Paragraph</p>`;
    const cloneNode = vi.spyOn(Node.prototype, "cloneNode");
    const createElement = vi.spyOn(document, "createElement");

    const parsed = DOMParser.fromSchema(editor.pmSchema).parse(html, {
      topNode: editor.pmSchema.nodes.blockGroup.create(),
    });

    const clonedInActiveDocument = cloneNode.mock.contexts
      .filter(
        (source): source is Node =>
          source instanceof Node && source.ownerDocument === document,
      )
      .map((source) => source.nodeName);
    expect(clonedInActiveDocument).toEqual([]);
    expect(createElement).not.toHaveBeenCalled();
    // The result is the same as for HTML in `detachedDoc()`.
    const blocks: string[] = [];
    parsed.descendants((node) => {
      if (node.type.isInGroup("blockContent")) {
        blocks.push(node.type.name);
      }
    });
    expect(blocks).toEqual([
      "bulletListItem",
      "image",
      "toggleListItem",
      "image",
      "paragraph",
    ]);
  });
});
