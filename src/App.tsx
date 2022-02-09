import { useState } from "react";
import { KatexRender } from "./KatexRender";
import { getKatexLongDivision, longDivision, Polynomial } from "./logic";

function App() {
  const [dividend, setDividend] = useState("8x^4+0x^3+6x^2-3x+1");
  const [divisor, setDivisor] = useState("2x^2-x+2");
  const [expression, setExpression] = useState("");

  const handleDivision = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const polDividend = Polynomial.buildFromString(dividend);
    const polDivisor = Polynomial.buildFromString(divisor);

    const result = longDivision(polDividend, polDivisor);
    const resultExp = getKatexLongDivision(result);
    setExpression(resultExp);

    // setExpression(polDividend.getKatex());
  };

  return (
    <div className="m-6">
      <div>
        <div className="border p-4">
          <form
            className="flex flex-col w-[200px] space-y-2 mx-auto"
            onSubmit={(e) => handleDivision(e)}
          >
            <input
              value={dividend}
              onChange={(e) => setDividend(e.target.value)}
              type="text"
              className="border dark:border-white border-black border-dashed px-1 focus:border-transparent focus:outline-offset-[-1px] focus:outline-dashed focus:outline-blue-600 dark:bg-inherit"
            />
            <span className="border-t border-black dark:border-white" />
            <input
              value={divisor}
              onChange={(e) => setDivisor(e.target.value)}
              type="text"
              className="border dark:border-white border-black border-dashed px-1 focus:border-transparent focus:outline-offset-[-1px] focus:outline-dashed focus:outline-blue-600 dark:bg-inherit"
            />
            <button className="border">Divide</button>
          </form>
        </div>
        <KatexRender expression={expression} />
      </div>
    </div>
  );
}

export default App;
