import { useEditor, EditorContent, ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { Button } from "@/components/ui/button"
import { useRef, useState } from 'react'
import { ImagePlus, Link2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'

// =========================================================================
// 1. COMPONENTE VISUAL DA IMAGEM COM O SLIDER DE TAMANHO
// =========================================================================
const ResizableImageNode = (props: any) => {
  const { node, updateAttributes, selected } = props;
  const width = node.attrs.width || 100;

  return (
    <NodeViewWrapper 
      className="relative inline-block max-w-full my-4" 
      style={{ width: `${width}%` }}
    >
      <img 
        src={node.attrs.src} 
        className={`w-full h-auto rounded-lg transition-all ${selected ? 'ring-4 ring-primary/50' : 'shadow-sm'}`} 
        alt="Imagem do artigo" 
      />

      {/* Painel Flutuante que aparece SÓ QUANDO clica na imagem */}
      {selected && (
        <div 
          contentEditable={false} // Impede que a pessoa consiga digitar aqui dentro
          className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm border border-border shadow-lg p-2.5 rounded-lg flex items-center gap-3 z-50 transition-all"
        >
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tamanho</span>
          <input
            type="range"
            min="10"
            max="100"
            value={width}
            onChange={(e) => updateAttributes({ width: e.target.value })}
            className="w-24 cursor-pointer accent-primary"
          />
          <span className="text-xs font-bold text-foreground w-8 text-right">{width}%</span>
        </div>
      )}
    </NodeViewWrapper>
  );
};

// =========================================================================
// 2. EXTENSÃO DO TIPTAP CONFIGURADA PARA USAR O COMPONENTE ACIMA
// =========================================================================
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: 100,
        parseHTML: element => element.style.width ? element.style.width.replace('%', '') : '100',
        renderHTML: attributes => {
          return {
            style: `width: ${attributes.width}%`,
          }
        },
      },
    }
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageNode)
  }
})

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const inputImagemRef = useRef<HTMLInputElement>(null);
  const [enviandoImagem, setEnviandoImagem] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      CustomImage.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        className: 'prose prose-sm dark:prose-invert min-h-[300px] max-w-none text-justify font-sans border border-input bg-background rounded-md p-4 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      },
    },
  });

  if (!editor) return null;

  const inserirImagem = (src: string) => {
    editor.chain().focus().insertContent({ type: 'image', attrs: { src, width: 100 } }).run();
  };

  const addImageByUrl = () => {
    const url = window.prompt('Cole a URL da imagem aqui:');
    if (url) inserirImagem(url);
  };

  const enviarImagem = async (arquivo: File) => {
    if (!arquivo.type.startsWith('image/')) {
      toast.error('Escolha um arquivo de imagem (JPG, PNG, WebP ou GIF).');
      return;
    }
    if (arquivo.size > 10 * 1024 * 1024) {
      toast.error('A imagem passa de 10 MB. Reduza o tamanho e tente de novo.');
      return;
    }
    setEnviandoImagem(true);
    const nomeLimpo = arquivo.name.toLowerCase().normalize('NFD').replace(/[^a-z0-9.]+/g, '-');
    const caminho = `articles/${Date.now()}-${nomeLimpo}`;
    const { error } = await supabase.storage.from('media').upload(caminho, arquivo, { contentType: arquivo.type });
    setEnviandoImagem(false);
    if (error) {
      toast.error(`Erro ao enviar imagem: ${error.message}`);
      return;
    }
    inserirImagem(supabase.storage.from('media').getPublicUrl(caminho).data.publicUrl);
    toast.success('Imagem inserida no texto.');
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2 p-1 border border-input rounded-md bg-muted/50">
        <Button type="button" variant={editor.isActive('bold') ? 'default' : 'outline'} size="sm" onClick={() => editor.chain().focus().toggleBold().run()}>Negrito</Button>
        <Button type="button" variant={editor.isActive('italic') ? 'default' : 'outline'} size="sm" onClick={() => editor.chain().focus().toggleItalic().run()}>Itálico</Button>
        <Button type="button" variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'outline'} size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>Título H2</Button>
        <Button type="button" variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'outline'} size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>Título H3</Button>
        <Button type="button" variant={editor.isActive('bulletList') ? 'default' : 'outline'} size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()}>Lista</Button>

        <div className="ml-auto flex flex-wrap gap-2">
          <input
            ref={inputImagemRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const arquivo = e.target.files?.[0];
              e.target.value = '';
              if (arquivo) enviarImagem(arquivo);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={enviandoImagem}
            onClick={() => inputImagemRef.current?.click()}
            className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
          >
            <ImagePlus className="mr-1 h-4 w-4" aria-hidden="true" />
            {enviandoImagem ? 'Enviando...' : 'Enviar imagem'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addImageByUrl}
            className="hover:bg-secondary hover:text-foreground"
          >
            <Link2 className="mr-1 h-4 w-4" aria-hidden="true" />
            Imagem por link
          </Button>
        </div>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
