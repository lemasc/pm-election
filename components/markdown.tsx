/* eslint-disable react/display-name */
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import { Components } from "react-markdown/src/ast-to-react";

export default function MarkDownComponent({ content }: { content: string }): JSX.Element {
  const components: Components = {
    li: ({ node, ordered, children, ...props }) => (
      <li {...props}>
        <div className="content-sublist">{children}</div>
      </li>
    ),
    a: ({ node, href, ...props }) => {
      if (href && (href.charAt(0) === "/" || href.charAt(0) === "#")) {
        // Use next/link for client navigation
        return (
          <Link href={href}>
            <a {...props} />
          </Link>
        );
      }
      return <a target="_blank" {...props} />;
    },
  };
  return (
    <ReactMarkdown className="content" components={components} remarkPlugins={[gfm]}>
      {content}
    </ReactMarkdown>
  );
}
