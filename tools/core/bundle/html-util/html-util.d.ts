/** Types of elements found in htmlparser2's DOM */
declare enum ElementType {
  /** Type for the root element of a document */
  Root = 'root',
  /** Type for Text */
  Text = 'text',
  /** Type for <? ... ?> */
  Directive = 'directive',
  /** Type for <!-- ... --> */
  Comment = 'comment',
  /** Type for <script> tags */
  Script = 'script',
  /** Type for <style> tags */
  Style = 'style',
  /** Type for Any tag */
  Tag = 'tag',
  /** Type for <![CDATA[ ... ]]> */
  CDATA = 'cdata',
  /** Type for <!doctype ...> */
  Doctype = 'doctype',
}
interface SourceCodeLocation {
  /** One-based line index of the first character. */
  startLine: number;
  /** One-based column index of the first character. */
  startCol: number;
  /** Zero-based first character index. */
  startOffset: number;
  /** One-based line index of the last character. */
  endLine: number;
  /** One-based column index of the last character. Points directly *after* the last character. */
  endCol: number;
  /** Zero-based last character index. Points directly *after* the last character. */
  endOffset: number;
}
interface TagSourceCodeLocation extends SourceCodeLocation {
  startTag?: SourceCodeLocation;
  endTag?: SourceCodeLocation;
}
declare type ParentNode = Document | Element | CDATA;
declare type ChildNode = Text | Comment | ProcessingInstruction | Element | CDATA | Document;
/**
 * This object will be used as the prototype for Nodes when creating a
 * DOM-Level-1-compliant structure.
 */
declare abstract class Node {
  /** The type of the node. */
  abstract readonly type: ElementType;
  /** Parent of the node */
  parent: ParentNode | null;
  /** Previous sibling */
  prev: ChildNode | null;
  /** Next sibling */
  next: ChildNode | null;
  /** The start index of the node. Requires `withStartIndices` on the handler to be `true. */
  startIndex: number | null;
  /** The end index of the node. Requires `withEndIndices` on the handler to be `true. */
  endIndex: number | null;
  /**
   * `parse5` source code location info.
   *
   * Available if parsing with parse5 and location info is enabled.
   */
  sourceCodeLocation?: SourceCodeLocation | null;
  /**
   * [DOM spec](https://dom.spec.whatwg.org/#dom-node-nodetype)-compatible
   * node {@link type}.
   */
  abstract readonly nodeType: number;
  /**
   * Same as {@link parent}.
   * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
   */
  get parentNode(): ParentNode | null;
  set parentNode(parent: ParentNode | null);
  /**
   * Same as {@link prev}.
   * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
   */
  get previousSibling(): ChildNode | null;
  set previousSibling(prev: ChildNode | null);
  /**
   * Same as {@link next}.
   * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
   */
  get nextSibling(): ChildNode | null;
  set nextSibling(next: ChildNode | null);
  /**
   * Clone this node, and optionally its children.
   *
   * @param recursive Clone child nodes as well.
   * @returns A clone of the node.
   */
  cloneNode<T extends Node>(this: T, recursive?: boolean): T;
}
/**
 * A node that contains some data.
 */
declare abstract class DataNode extends Node {
  data: string;
  /**
   * @param data The content of the data node
   */
  constructor(data: string);
  /**
   * Same as {@link data}.
   * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
   */
  get nodeValue(): string;
  set nodeValue(data: string);
}
/**
 * Text within the document.
 */
declare class Text extends DataNode {
  type: ElementType.Text;
  get nodeType(): 3;
}
/**
 * Comments within the document.
 */
declare class Comment extends DataNode {
  type: ElementType.Comment;
  get nodeType(): 8;
}
/**
 * Processing instructions, including doc types.
 */
declare class ProcessingInstruction extends DataNode {
  'name': string;
  'type': ElementType.Directive;
  'constructor'(name: string, data: string);
  get 'nodeType'(): 1;
  /** If this is a doctype, the document type name (parse5 only). */
  'x-name'?: string;
  /** If this is a doctype, the document type public identifier (parse5 only). */
  'x-publicId'?: string;
  /** If this is a doctype, the document type system identifier (parse5 only). */
  'x-systemId'?: string;
}
/**
 * A `Node` that can have children.
 */
declare abstract class NodeWithChildren extends Node {
  children: ChildNode[];
  /**
   * @param children Children of the node. Only certain node types can have children.
   */
  constructor(children: ChildNode[]);
  /** First child of the node. */
  get firstChild(): ChildNode | null;
  /** Last child of the node. */
  get lastChild(): ChildNode | null;
  /**
   * Same as {@link children}.
   * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
   */
  get childNodes(): ChildNode[];
  set childNodes(children: ChildNode[]);
}
declare class CDATA extends NodeWithChildren {
  type: ElementType.CDATA;
  get nodeType(): 4;
}
/**
 * The root node of the document.
 */
declare class Document extends NodeWithChildren {
  'type': ElementType.Root;
  get 'nodeType'(): 9;
  /** [Document mode](https://dom.spec.whatwg.org/#concept-document-limited-quirks) (parse5 only). */
  'x-mode'?: 'no-quirks' | 'quirks' | 'limited-quirks';
}
/**
 * The description of an individual attribute.
 */
interface Attribute {
  name: string;
  value: string;
  namespace?: string;
  prefix?: string;
}
/**
 * An element within the DOM.
 */
declare class Element extends NodeWithChildren {
  'name': string;
  'attribs': {
    [name: string]: string;
  };
  'type': ElementType.Tag | ElementType.Script | ElementType.Style;
  /**
   * @param name Name of the tag, eg. `div`, `span`.
   * @param attribs Object mapping attribute names to attribute values.
   * @param children Children of the node.
   */
  'constructor'(
    name: string,
    attribs: {
      [name: string]: string;
    },
    children?: ChildNode[],
    type?: ElementType.Tag | ElementType.Script | ElementType.Style,
  );
  get 'nodeType'(): 1;
  /**
   * `parse5` source code location info, with start & end tags.
   *
   * Available if parsing with parse5 and location info is enabled.
   */
  'sourceCodeLocation'?: TagSourceCodeLocation | null;
  /**
   * Same as {@link name}.
   * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
   */
  get 'tagName'(): string;
  set 'tagName'(name: string);
  get 'attributes'(): Attribute[];
  /** Element namespace (parse5 only). */
  'namespace'?: string;
  /** Element attribute namespaces (parse5 only). */
  'x-attribsNamespace'?: Record<string, string>;
  /** Element attribute namespace-related prefixes (parse5 only). */
  'x-attribsPrefix'?: Record<string, string>;
}
/**
 * Node.nodeType
 * ---- supported types
 *  1 ELEMENT_NODE                  // PROCESSING_INSTRUCTION_NODE is also type 1 for doctype
 *  3 TEXT_NODE
 *  4 CDATA_SECTION_NODE            // XML-only
 *  8 COMMENT_NODE
 *  9 DOCUMENT_NODE
 * ---- unsupported types
 *  2 ATTRIBUTE_NODE
 *  7 PROCESSING_INSTRUCTION_NODE   // XML-only except for <!DOCTYPE html>
 * 10 DOCUMENT_TYPE_NODE
 * 11 DOCUMENT_FRAGMENT_NODE
 */
/**
 * Many of these functions can handle multiple nodes, even though their names
 * may suggest that they handle a single node at a time.
 */
export declare namespace HTML_UTIL {
  namespace NODE_TYPE {
    type Node = Comment | Document | Element | ProcessingInstruction | Text;
    type ChildNode = Comment | Document | Element | ProcessingInstruction | Text;
    type ParentNode = Document | Element;
    function Comment(node?: Node): node is Comment;
    function Document(node?: Node): node is Document;
    function Tag(node?: Node): node is Element;
    function Directive(node?: Node): node is ProcessingInstruction;
    function Text(node?: Node): node is Text;
    function Node(node?: Node): node is NODE_TYPE.Node;
    function ChildNode(node?: Node): node is NODE_TYPE.ChildNode;
    function ParentNode(node?: Node): node is NODE_TYPE.ParentNode;
  }
  /**
   * A wrapper class around DOM Nodes.
   */
  class ClassDOMNode {
    readonly $node: NODE_TYPE.Node;
    constructor($node: NODE_TYPE.Node);
    get childNodes(): ClassDOMNode[];
    get name(): string | undefined;
    get nodeType(): 1 | 3 | 8 | 9;
    get parentNode(): ClassDOMNode | undefined;
    get type(): 'comment' | 'directive' | 'doctype' | 'root' | 'script' | 'style' | 'tag' | 'text';
  }
  function AppendChild(parentNode: ClassDOMNode, newNodes: ClassDOMNode | ClassDOMNode[]): void;
  /** non-standard api
   * 1. parseDocument(`html`, `options`)
   * 2. querySelector(document, `query`)
   * @return first matching node or `undefined`
   */
  function ExtractNode(html: string, query: string, options?: Parameters<typeof HTML_UTIL.ParseDocument>[1]): ClassDOMNode | undefined;
  function GetAttribute(node: ClassDOMNode, attributeName: string): string | undefined;
  function GetAttributeNames(node: ClassDOMNode): string[];
  function GetHTML(
    node: ClassDOMNode,
    options?: {
      render_empty_string_for_empty_attribute_value?: boolean;
      use_self_closing_tags_for_empty_tags?: boolean;
      xml_mode?: boolean | 'foreign';
      encode_reserved_characters_for_html?: boolean | 'utf8';
      decode_reserved_characters_for_html?: boolean;
    },
  ): string;
  /** non-standard api
   * - The getter function for `Node.nodeValue`.
   * @return the value of a Comment, Directive, or Text node
   */
  function GetValue(node: ClassDOMNode): string | undefined;
  function HasAttribute(node: ClassDOMNode, attributeName: string): boolean;
  /** non-standard api
   * - The mirror function to InsertBefore.
   */
  function InsertAfter(existingNode: ClassDOMNode, newNodes: ClassDOMNode | ClassDOMNode[]): void;
  function InsertBefore(existingNode: ClassDOMNode, newNodes: ClassDOMNode | ClassDOMNode[]): void;
  /** non-standard api
   * - Checks if `parentNode` is the parent of `node`.
   */
  function IsParentOf(parentNode: ClassDOMNode, node: ClassDOMNode): boolean;
  /** non-standard api
   * - Merges a delimited attribute, i.e. class and style, from two nodes.
   * - Stores the merged value into the first node.
   */
  function MergeDelimitedAttribute(intoNode: ClassDOMNode, fromNode: ClassDOMNode, attributeName: string, delimiter: string): void;
  /** non-standard api
   * - Parses the `html` string into a Document node.
   */
  function ParseDocument(
    html: string,
    options?: {
      xml_mode?: boolean;
      decode_reserved_characters_for_html?: boolean;
      convert_tag_names_to_lowercase?: boolean;
      convert_attribute_names_to_lowercase?: boolean;
      recognize_CDATA?: boolean;
      recognize_self_closing_tags?: boolean;
      include_source_start_indices_for_nodes?: boolean;
      include_source_end_indices_for_nodes?: boolean;
    },
  ): ClassDOMNode;
  function QuerySelector(node: ClassDOMNode, query: string): ClassDOMNode | undefined;
  function QuerySelectorAll(node: ClassDOMNode, query: string): ClassDOMNode[];
  function RemoveAttribute(node: ClassDOMNode, attributeName: string): void;
  function RemoveChild(parentNode: ClassDOMNode, existingNodes: ClassDOMNode | ClassDOMNode[]): void;
  /** non-standard api
   * - Removes `existingNodes` from its Parent node if it has a parent.
   */
  function RemoveNode(existingNodes: ClassDOMNode | ClassDOMNode[]): void;
  function ReplaceChild(parentNode: ClassDOMNode, existingNode: ClassDOMNode, newNodes: ClassDOMNode | ClassDOMNode[]): void;
  /** non-standard api
   * - 1. Removes `newNodes` from its Parent node if it has a parent.
   * - 2. Replaces `existingNode` within its Parent node, if it has a parent, with `newNodes`.
   * - 3. Removes `existingNode` from its Parent node if it has a parent.
   */
  function ReplaceNode(existingNode: ClassDOMNode, newNodes: ClassDOMNode | ClassDOMNode[]): void;
  function SetAttribute(node: ClassDOMNode, attributeName: string, attributeValue: string): void;
  /** non-standard api
   * - The setter function for `Node.nodeValue`.
   * - Sets the value of a Comment, Directive, or Text node.
   */
  function SetValue(node: ClassDOMNode, value: string): void;
}
export {};
