import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Button } from '@/components/ui/button';
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Quote,
    Code,
    Undo,
    Redo,
    Link as LinkIcon,
    Image as ImageIcon
} from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    onImageUpload?: (file: File) => Promise<string | null>;
    className?: string;
}

const MenuBar = ({ editor, onImageUpload }: { editor: Editor | null, onImageUpload?: (file: File) => Promise<string | null> }) => {
    if (!editor) {
        return null;
    }

    const addImage = useCallback(() => {
        if (!onImageUpload) return;

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async () => {
            if (input.files?.length) {
                const file = input.files[0];
                const url = await onImageUpload(file);
                if (url) {
                    editor.chain().focus().setImage({ src: url }).run();
                }
            }
        };
        input.click();
    }, [editor, onImageUpload]);

    const setLink = useCallback(() => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) {
            return;
        }

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    return (
        <div className="border-b p-2 flex flex-wrap gap-1 bg-muted/20">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn(editor.isActive('bold') ? 'bg-muted' : '')}
                type="button"
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn(editor.isActive('italic') ? 'bg-muted' : '')}
                type="button"
            >
                <Italic className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={cn(editor.isActive('heading', { level: 2 }) ? 'bg-muted' : '')}
                type="button"
            >
                <Heading1 className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={cn(editor.isActive('heading', { level: 3 }) ? 'bg-muted' : '')}
                type="button"
            >
                <Heading2 className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn(editor.isActive('bulletList') ? 'bg-muted' : '')}
                type="button"
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn(editor.isActive('orderedList') ? 'bg-muted' : '')}
                type="button"
            >
                <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={cn(editor.isActive('blockquote') ? 'bg-muted' : '')}
                type="button"
            >
                <Quote className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={cn(editor.isActive('codeBlock') ? 'bg-muted' : '')}
                type="button"
            >
                <Code className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={setLink}
                className={cn(editor.isActive('link') ? 'bg-muted' : '')}
                type="button"
            >
                <LinkIcon className="h-4 w-4" />
            </Button>
            {onImageUpload && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={addImage}
                    type="button"
                >
                    <ImageIcon className="h-4 w-4" />
                </Button>
            )}
            <div className="flex-1" />
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                type="button"
            >
                <Undo className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                type="button"
            >
                <Redo className="h-4 w-4" />
            </Button>
        </div>
    );
};

const RichTextEditor = ({ content, onChange, onImageUpload, className }: RichTextEditorProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Markdown,
            Image.configure({
                inline: true,
            }),
            Link.configure({
                openOnClick: false,
            }),
        ],
        content,
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[200px] p-4',
            },
        },
        onUpdate: ({ editor }) => {
            const markdown = (editor.storage as any).markdown?.getMarkdown();
            onChange(markdown || "");
        },
    });

    return (
        <div className={cn("border rounded-md overflow-hidden bg-background", className)}>
            <MenuBar editor={editor} onImageUpload={onImageUpload} />
            <EditorContent editor={editor} />
        </div>
    );
};

export default RichTextEditor;
