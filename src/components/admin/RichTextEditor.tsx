import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { Button } from "@/components/ui/button"

// 1. Ensinamos a extensão de Imagem a entender e guardar a propriedade "width" (largura)
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: element => element.getAttribute('width'),
        renderHTML: attributes => {
          if (!attributes.width) {
            return {}
          }
          return {
            width: attributes.width,
            style: `width: ${attributes.width}`, // Força o CSS a respeitar a largura
          }
        },
      },
    }
  },
})

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      CustomImage.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4',
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
    // CENÁRIO A: Se uma imagem já estiver clicada/selecionada, vamos apenas editar o tamanho dela!
    if (editor.isActive('image')) {
      const currentWidth = editor.getAttributes('image').width || '';
      const newWidth = window.prompt('🔄 Alterar tamanho da imagem selecionada\n\nDigite a largura (Ex: 100%, 500px, 300px). \nDeixe em branco para voltar ao tamanho original:', currentWidth);
      
      if (newWidth !== null) {
        // Formata o texto para garantir que tem 'px' ou '%' no final
        const formattedWidth = newWidth.includes('%') || newWidth.includes('px') || newWidth === '' ? newWidth : `${newWidth}px`;
        
        if (formattedWidth === '') {
            editor.chain().focus().updateAttributes('image', { width: null }).run();
        } else {
            editor.chain().focus().updateAttributes('image', { width: formattedWidth }).run();
        }
      }
      return;
    }

    // CENÁRIO B: Se não tiver imagem selecionada, pede a URL para inserir uma nova
    const url = window.prompt('1️⃣ Cole a URL da imagem aqui:');
    if (url) {
      const width = window.prompt('2️⃣ Qual o tamanho da imagem? \n\n(Ex: 100%, 500px, 300px). \nDeixe em branco para manter o tamanho original:');
      
      if (width) {
        const formattedWidth = width.includes('%') || width.includes('px') ? width : `${width}px`;
        editor.chain().focus().insertContent({
          type: 'image',
          attrs: {
            src: url,
            width: formattedWidth
          }
        }).run();
      } else {
        editor.chain().focus().setImage({ src: url }).run();
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2 p-1 border border-input rounded-md bg-muted/50">
        {/* BOTÕES DE FORMATAÇÃO */}
        <Button type="button" variant={editor.isActive('bold') ? 'default' : 'outline'} size="sm" onClick={() => editor.chain().focus().toggleBold().run()}>Negrito</Button>
        <Button type="button" variant={editor.isActive('italic') ? 'default' : 'outline'} size="sm" onClick={() => editor.chain().focus().toggleItalic().run()}>Itálico</Button>
        <Button type="button" variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'outline'} size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>Título H2</Button>
        <Button type="button" variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'outline'} size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>Título H3</Button>
        <Button type="button" variant={editor.isActive('bulletList') ? 'default' : 'outline'} size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()}>Lista</Button>
        
        {/* BOTÃO DE IMAGEM INTELIGENTE */}
        <Button
          type="button"
          // O botão fica com estilo de 'destaque' e muda de texto se você clicar em cima de uma imagem no texto!
          variant={editor.isActive('image') ? 'default' : 'outline'}
          size="sm"
          onClick={addImage}
          className="ml-auto"
        >
          {editor.isActive('image') ? '📏 Editar Tamanho' : '🖼️ Inserir Imagem'}
        </Button>
      </div>
      
      <EditorContent editor={editor} />
    </div>
  );
}
