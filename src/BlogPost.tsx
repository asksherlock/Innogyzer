import React, { useEffect, useState } from 'react';

import { useParams, Link } from 'react-router-dom';
import { getPostBySlug } from './services/payload';
import type { Post } from './services/payload';

// Recursive renderer for Payload Lexical RichText
const renderLexicalNode = (node: any, i: number): React.ReactNode => {
  if (node.type === 'text') {
    return (
      <span 
        key={i} 
        className={`
          ${node.format === 1 ? 'font-bold text-white' : ''} 
          ${node.format === 2 ? 'italic text-white/90' : ''}
          ${node.format === 8 ? 'underline' : ''}
        `}
      >
        {node.text}
      </span>
    );
  }
  if (node.type === 'paragraph') {
    return (
      <p key={i} className="mb-6 text-lg text-white/80 leading-relaxed">
        {node.children?.map((child: any, j: number) => renderLexicalNode(child, j))}
      </p>
    );
  }
  if (node.type === 'heading') {
    const Tag = `h${node.tag?.replace('h', '') || '2'}` as any;
    return (
      <Tag key={i} className="text-2xl md:text-3xl font-bold text-white mt-12 mb-6">
        {node.children?.map((c: any, j: number) => renderLexicalNode(c, j))}
      </Tag>
    );
  }
  if (node.type === 'list') {
    const Tag = node.tag === 'ol' ? 'ol' : 'ul';
    return (
      <Tag key={i} className={`mb-6 pl-6 ${node.tag === 'ol' ? 'list-decimal' : 'list-disc'} text-lg text-white/80 space-y-2`}>
        {node.children?.map((child: any, j: number) => renderLexicalNode(child, j))}
      </Tag>
    );
  }
  if (node.type === 'listitem') {
    return (
      <li key={i}>
        {node.children?.map((child: any, j: number) => renderLexicalNode(child, j))}
      </li>
    );
  }
  if (node.type === 'upload') {
    return (
      <div key={i} className="my-10 w-full rounded-2xl overflow-hidden bg-white/5 border border-white/10">
        <img 
          src={`https://innogyzer-lms.vercel.app${node.value?.url}`} 
          alt={node.value?.alt || 'Blog Image'}
          className="w-full h-auto object-cover"
        />
      </div>
    );
  }
  if (node.type === 'quote') {
    return (
       <blockquote key={i} className="border-l-4 border-[#dcea22] pl-6 my-8 text-xl italic text-white/90">
         {node.children?.map((child: any, j: number) => renderLexicalNode(child, j))}
       </blockquote>
    );
  }
  if (node.type === 'link') {
    return (
      <a key={i} href={node.fields?.url} className="text-[#dcea22] hover:underline" target={node.fields?.newTab ? "_blank" : "_self"}>
         {node.children?.map((child: any, j: number) => renderLexicalNode(child, j))}
      </a>
    );
  }
  
  // Fallback for unknown nodes that have children
  if (node.children) {
    return <React.Fragment key={i}>{node.children.map((child: any, j: number) => renderLexicalNode(child, j))}</React.Fragment>;
  }

  return null;
}

const renderLexical = (content: any) => {
  if (!content || !content.root || !content.root.children) return null;
  return content.root.children.map((node: any, i: number) => renderLexicalNode(node, i));
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (slug) {
      getPostBySlug(slug).then((data) => {
        setPost(data);
        setLoading(false);
      });
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen pt-40 flex justify-center">
        <div className="w-12 h-12 border-4 border-[#dcea22]/30 border-t-[#dcea22] rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen pt-40 flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-4">Artículo no encontrado</h1>
        <Link to="/blog" className="text-[#dcea22] hover:underline">Volver al blog</Link>
      </div>
    );
  }

  return (
    <article className="relative z-10 min-h-screen pt-32 pb-32">
      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        
        <Link to="/blog" className="inline-flex items-center text-white/50 hover:text-[#dcea22] mb-12 transition-colors">
          <span className="mr-2">←</span> Volver al blog
        </Link>

        <header className="mb-16">
          <p className="text-[#dcea22] font-medium tracking-widest uppercase mb-6 text-sm">
            {new Date(post.publishedAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-10 leading-tight">
            {post.title}
          </h1>
          
          {post.heroImage && (
            <div className="w-full h-[400px] md:h-[500px] rounded-[32px] overflow-hidden bg-white/5 border border-white/10">
              <img 
                src={`https://innogyzer-lms.vercel.app${post.heroImage.url}`} 
                alt={post.heroImage.alt || post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </header>

        <div className="prose prose-invert max-w-none prose-lg">
          {renderLexical(post.content)}
        </div>
      </div>
    </article>
  );
};

export default BlogPost;
