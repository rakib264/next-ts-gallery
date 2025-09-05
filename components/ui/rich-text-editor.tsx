'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import 'react-quill/dist/quill.snow.css';

// React 19 removed ReactDOM.findDOMNode. Some older editors still call it.
// Provide a minimal client-side polyfill so libraries like react-quill keep working.
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ReactDOM: any = require('react-dom');
  if (ReactDOM && typeof ReactDOM.findDOMNode !== 'function') {
    ReactDOM.findDOMNode = (instance: any) => {
      if (!instance) return null;
      // If a ref object was passed, return the current element
      if (instance.current) return instance.current;
      // If it's already a DOM node, return as is
      if (instance.nodeType) return instance;
      return null;
    };
  }
}

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => (
    <div className="h-[200px] border border-gray-200 rounded-lg p-4 bg-gray-50 animate-pulse flex items-center justify-center">
      <div className="text-gray-500">Loading editor...</div>
    </div>
  ),
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Quill modules configuration
const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'align': [] }],
    ['link', 'image'],
    ['blockquote', 'code-block'],
    ['clean']
  ],
  clipboard: {
    matchVisual: false,
  }
};

// Quill editor formats
const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'align',
  'link', 'image',
  'blockquote', 'code-block'
];

export default function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const [editorValue, setEditorValue] = React.useState(value);

  React.useEffect(() => {
    setEditorValue(value);
  }, [value]);

  const handleChange = (content: string) => {
    setEditorValue(content);
    onChange(content);
  };

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden bg-white ${className}`}>
      <ReactQuill
        theme="snow"
        value={editorValue}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{
          height: '200px',
        }}
        className="min-h-[200px] [&_.ql-editor]:min-h-[150px] [&_.ql-editor]:text-gray-700 [&_.ql-editor]:text-sm [&_.ql-toolbar]:border-gray-200 [&_.ql-container]:border-gray-200"
      />
    </div>
  );
}
