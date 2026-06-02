import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { Button } from "@/components/ui/button"

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4', // Deixa as imagens bonitas e responsivas
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      // Atualiza o estado do formulário sempre que o texto muda
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        // Aplica as classes do shadcn e o 'prose' justificado para visualização em tempo real
        className: 'prose prose-sm dark:prose-invert min-h-[300px] max-w-none text-justify font-sans border border-input bg-background rounded-md p-4 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      },
    },
  });

  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt('Cole a URL da imagem aqui:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Barra de ferramentas estilizada com os botões do seu projeto */}
      <div className="flex flex-wrap gap-2 p-1 border border-input rounded-md bg-muted/50">
        <Button
          type="button"
          variant={editor.isActive('bold') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Negrito
        </Button>
        <Button
          type="button"
          variant={editor.isActive('italic') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Itálico
        </Button>
        <Button
          type="button"
          variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          Título H2
        </Button>
        <Button
          type="button"
          variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          Título H3
        </Button>
        <Button
          type="button"
          variant={editor.isActive('bulletList') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          Lista
        </Button>
        
        {/* NOVO BOTÃO DE IMAGEM */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addImage}
          className="ml-auto"
        >
          🖼️ Inserir Imagem
        </Button>
      </div>
      
      {/* Área onde o utilizador vai digitar */}
      <EditorContent editor={editor} />
    </div>
  );
}
