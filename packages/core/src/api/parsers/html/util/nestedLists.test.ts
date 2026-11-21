import { afterEach, describe, expect, it } from "vite-plus/test";
import { nestedListsToBlockNoteStructure } from "./nestedLists.js";

async function testHTML(html: string) {
  const htmlNode = nestedListsToBlockNoteStructure(html);
  expect(htmlNode.innerHTML).toMatchSnapshot();
}

describe("Lift nested lists", () => {
  it("Lifts nested bullet lists", async () => {
    const html = `<ul>
    <li>
       Bullet List Item 1
       <ul>
          <li>
             Nested Bullet List Item 1
          </li>
          <li>
             Nested Bullet List Item 2
          </li>
       </ul>
    </li>
    <li>
    Bullet List Item 2
    </li>
 </ul>`;
    await testHTML(html);
  });

  it("Lifts nested bullet lists without li", async () => {
    const html = `<ul>
       Bullet List Item 1
       <ul>
          <li>
             Nested Bullet List Item 1
          </li>
          <li>
             Nested Bullet List Item 2
          </li>
       </ul>
    <li>
    Bullet List Item 2
    </li>
 </ul>`;
    await testHTML(html);
  });

  it("Lifts nested bullet lists with content after nested list", async () => {
    const html = `<ul>
    <li>
       Bullet List Item 1
       <ul>
          <li>
             Nested Bullet List Item 1
          </li>
          <li>
             Nested Bullet List Item 2
          </li>
       </ul>
       More content in list item 1
    </li>
    <li>
    Bullet List Item 2
    </li>
 </ul>`;
    await testHTML(html);
  });

  it("Lifts multiple bullet lists", async () => {
    const html = `<ul>
    <li>
       Bullet List Item 1
       <ul>
          <li>
             Nested Bullet List Item 1
          </li>
          <li>
             Nested Bullet List Item 2
          </li>
       </ul>
       <ul>
          <li>
             Nested Bullet List Item 3
          </li>
          <li>
             Nested Bullet List Item 4
          </li>
       </ul>
    </li>
    <li>
    Bullet List Item 2
    </li>
 </ul>`;
    await testHTML(html);
  });

  it("Lifts multiple bullet lists with content in between", async () => {
    const html = `<ul>
    <li>
       Bullet List Item 1
       <ul>
          <li>
             Nested Bullet List Item 1
          </li>
          <li>
             Nested Bullet List Item 2
          </li>
       </ul>
       In between content
       <ul>
          <li>
             Nested Bullet List Item 3
          </li>
          <li>
             Nested Bullet List Item 4
          </li>
       </ul>
    </li>
    <li>
    Bullet List Item 2
    </li>
 </ul>`;
    await testHTML(html);
  });

  it("Lifts nested numbered lists", async () => {
    const html = `<ol>
    <li>
       Numbered List Item 1
       <ol>
          <li>
             Nested Numbered List Item 1
          </li>
          <li>
             Nested Numbered List Item 2
          </li>
       </ol>
    </li>
    <li>
       Numbered List Item 2
    </li>
 </ol>`;
    await testHTML(html);
  });

  it("Lifts nested mixed lists", async () => {
    const html = `<ol>
    <li>
       Numbered List Item 1
       <ul>
          <li>
             Bullet List Item 1
          </li>
          <li>
          Bullet List Item 2
          </li>
       </ul>
    </li>
    <li>
       Numbered List Item 2
    </li>
 </ol>`;
    await testHTML(html);
  });
});

describe("content after a nested list", () => {
  const append = Element.prototype.append;

  afterEach(() => {
    Element.prototype.append = append;
  });

  // The HTML is in a document without a browsing context. In the active
  // document, an element of the HTML can load a resource and run an event
  // handler.
  it("stays out of the active document", () => {
    const inActiveDocument: string[] = [];
    Element.prototype.append = function (
      this: Element,
      ...nodes: (Node | string)[]
    ) {
      append.apply(this, nodes);
      for (const node of nodes) {
        if (
          typeof node !== "string" &&
          node.ownerDocument === document &&
          node.nodeName === "IMG"
        ) {
          inActiveDocument.push(node.nodeName);
        }
      }
    };

    const htmlNode = nestedListsToBlockNoteStructure(
      `<ul><li>Item<ul><li>Nested item</li></ul><img src="image.png"></li></ul>`,
    );

    // The content after the nested list is in a list item of its own.
    expect(htmlNode.innerHTML).toMatchInlineSnapshot(
      `"<ul><div><li>Item</li><div data-node-type="blockGroup"><ul><li>Nested item</li></ul></div></div><li><img src="image.png"></li></ul>"`,
    );
    expect(inActiveDocument).toEqual([]);
  });
});
