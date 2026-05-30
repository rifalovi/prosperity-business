import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "u", "s",
  "h2", "h3",
  "ul", "ol", "li",
  "a", "img",
  "blockquote", "code", "pre",
];

const ALLOWED_ATTRS: sanitizeHtml.IOptions["allowedAttributes"] = {
  a: ["href", "target", "rel"],
  img: ["src", "alt", "width", "height"],
};

export function sanitizeContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRS,
    allowedSchemes: ["https", "http"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  });
}
