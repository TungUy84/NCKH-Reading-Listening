import React, { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = 'Nhập nội dung bài học...', 
  className = '' 
}) => {
  // Cấu hình toolbar với đầy đủ tính năng
  const modules = useMemo(() => ({
    toolbar: [
      // Heading và kích thước chữ
      [{ 'header': [1, 2, 3, false] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      
      // Format text
      ['bold', 'italic', 'underline', 'strike'],
      
      // Màu sắc
      [{ 'color': [] }, { 'background': [] }],
      
      // Căn lề
      [{ 'align': [] }],
      
      // Lists và indent
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      
      // Chèn media
      ['link', 'image', 'video'],
      
      // Clear formatting
      ['clean']
    ]
  }), []);

  const formats = [
    'header', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'align',
    'list', 'bullet', 'indent',
    'link', 'image', 'video'
  ];

  return (
    <div className={`rich-text-editor-wrapper ${className}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="bg-white"
      />
      <style>{`
        .rich-text-editor-wrapper .ql-container {
          min-height: 400px;
          font-size: 15px;
          font-family: inherit;
        }
        
        .rich-text-editor-wrapper .ql-toolbar {
          background: #f8fafc;
          border-color: #cbd5e1;
          border-radius: 0.75rem 0.75rem 0 0;
          padding: 12px;
        }
        
        .rich-text-editor-wrapper .ql-container {
          border-color: #cbd5e1;
          border-radius: 0 0 0.75rem 0.75rem;
        }
        
        .rich-text-editor-wrapper .ql-editor {
          padding: 20px;
        }
        
        .rich-text-editor-wrapper .ql-editor.ql-blank::before {
          color: #94a3b8;
          font-style: normal;
        }
        
        /* Style cho các button trong toolbar */
        .rich-text-editor-wrapper .ql-toolbar button:hover,
        .rich-text-editor-wrapper .ql-toolbar button:focus {
          color: #3b82f6;
        }
        
        .rich-text-editor-wrapper .ql-toolbar button.ql-active {
          color: #3b82f6;
        }
        
        /* Style cho dropdown */
        .rich-text-editor-wrapper .ql-toolbar .ql-picker-label:hover,
        .rich-text-editor-wrapper .ql-toolbar .ql-picker-label.ql-active {
          color: #3b82f6;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
