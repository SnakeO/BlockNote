let _detachedDoc: Document | null = null;

/**
 * A document without a browsing context: content in it cannot load a resource
 * or run an event handler. All callers share one document. A caller only makes
 * elements with it, and does not change the document itself.
 *
 * The rule for content from outside the editor (a paste, a drop, an HTML or
 * markdown string, the HTML of an export):
 * - You have an HTML string: parse it in an element of this document
 *   (`detachedDoc().createElement("div")`, then set its `innerHTML`).
 * - You have a node of parsed HTML and need one more element for it: use
 *   `node.ownerDocument.createElement(...)`. The element is then in the
 *   document of the node, and no node moves to a different document.
 * - Never use the global `document` for this. An element of the active
 *   document takes each node that it gets into the active document, also when
 *   the element is not in the page.
 *
 * Similar to https://github.com/ProseMirror/prosemirror-view/blob/1251b2b412656a2a06263e4187574beb43651273/src/clipboard.ts#L204
 * See https://github.com/TypeCellOS/BlockNote/issues/601
 */
export function detachedDoc(): Document {
  return (
    _detachedDoc ||
    (_detachedDoc = document.implementation.createHTMLDocument("title"))
  );
}
