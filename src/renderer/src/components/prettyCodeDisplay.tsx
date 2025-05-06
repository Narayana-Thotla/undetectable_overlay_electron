import React from 'react';

const PrettyCodeDisplay = ({ code }) => {
  // Split code into lines
  const lines = code.trim().split('\n');

  const formatLine = (line, index) => {
    if (line.includes("// Solution")) {
      return (
        <div key={index} className="mt-4 mb-1 font-bold text-green-600">
          🔹 {line.replace("// ", "")}
        </div>
      );
    }

    if (line.includes("//")) {
      const [codePart, comment] = line.split("//");
      return (
        <div key={index}>
          <code className="text-gray-800">{codePart.trim()}</code>
          <span className="text-blue-500 ml-2 italic">// {comment.trim()}</span>
        </div>
      );
    }

    return (
      <div key={index}>
        <code className="text-gray-800">{line}</code>
      </div>
    );
  };

  return (
    <div className="bg-gray-100 p-4 rounded-md font-mono text-sm overflow-auto max-h-[500px]">
      {/* <div className="text-lg font-semibold mb-2 text-purple-700">📘 C++ Two Sum Solutions</div> */}
      {lines.map((line, index) => formatLine(line, index))}
    </div>
  );
};

export default PrettyCodeDisplay;
