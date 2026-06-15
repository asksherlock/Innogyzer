import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { getPostBySlug } from './services/payload';
import type { Post } from './services/payload';

// Simple renderer for Payload Lexical RichText
const renderLexical = (content: any) => {
  if (!content || !content.root || !content.root.children) return null;
  
  return content.root.children.map((node: any, i: number) => {
    if (node.type === 'paragraph') {
      return (
        <p key={i} className="mb-6 text-lg text-white/80 leading-relaxed">
          {node.children?.map((child: any, j: number) => (
            <span 
              key={j} 
              className={`
                ${child.format === 1 ? 'font-bold text-white' : ''} 
                ${child.format === 2 ? 'italic' : ''}
              `}
            >
              {child.text}
            </span>
          ))}
        </p>
      );
    }
    if (node.type === 'heading') {
      const Tag = `h${node.tag.replace('h', '')}` as any;
      return (
        <Tag key={i} className="text-2xl md:text-3xl font-bold text-white mt-12 mb-6">
          {node.children?.map((c: any) => c.text).join('')}
        </Tag>
      );
    }
    // Very basic fallback
    return <div key={i}>{JSON.stringify(node)}</div>;
  });
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
                src={`http://localhost:3000${post.heroImage.url}`} 
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
