/* eslint-disable react/display-name */
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import { Components } from "react-markdown/lib/ast-to-react";
import Link from "next/link";

export default function MarkDownComponent({
  content,
}: {
  content: string;
}): JSX.Element {
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
    <ReactMarkdown components={components} remarkPlugins={[gfm]}>
      {content}
    </ReactMarkdown>
  );
}
