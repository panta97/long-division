import "katex/dist/katex.min.css";
import katex from "katex";
import { useEffect, useRef } from "react";

interface KatexRenderProps {
  expression: string;
}

export const KatexRender = ({ expression }: KatexRenderProps) => {
  const divRef = useRef(null);

  useEffect(() => {
    if (!divRef.current) return;
    // katex.render("c = {a^2 + b^3}", divRef.current, {
    //   throwOnError: true,
    // });
    katex.render(expression, divRef.current, {
      displayMode: true,
      leqno: false,
      fleqn: false,
      throwOnError: true,
      errorColor: "#cc0000",
      strict: "warn",
      output: "htmlAndMathml",
      trust: false,
      macros: { "\\f": "#1f(#2)" },
    });
  }, [expression]);

  return <div ref={divRef}></div>;
};
