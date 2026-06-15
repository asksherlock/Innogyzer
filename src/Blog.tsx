import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getPosts } from './services/payload';
import type { Post } from './services/payload';

const Blog = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    getPosts().then((data) => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="relative z-10 min-h-screen pt-40 pb-32">
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6 text-gradient-animate tracking-tighter"
          >
            Insights & Innovación
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/60 text-lg max-w-2xl mx-auto"
          >
            Explora nuestros últimos artículos sobre inteligencia artificial, diseño estratégico y el futuro de las organizaciones.
          </motion.p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="w-12 h-12 border-4 border-[#dcea22]/30 border-t-[#dcea22] rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-32 text-white/40">
            <p>Aún no hay artículos publicados.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/blog/${post.slug}`} className="block h-full group">
                  <div className="glass-panel p-6 rounded-3xl border border-white/5 h-full flex flex-col hover:border-[#dcea22]/30 transition-colors bg-black/40 backdrop-blur-md">
                    <div className="w-full h-48 bg-white/5 rounded-2xl mb-6 overflow-hidden relative">
                      {post.heroImage ? (
                        <img 
                          src={`http://localhost:3000${post.heroImage.url}`} 
                          alt={post.heroImage.alt || post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white/20">
                          Innogyzer
                        </div>
                      )}
                    </div>
                    <p className="text-[#dcea22] text-sm font-medium mb-3">
                      {new Date(post.publishedAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <h2 className="text-xl font-bold text-white mb-4 line-clamp-2 group-hover:text-[#dcea22] transition-colors">
                      {post.title}
                    </h2>
                    <div className="mt-auto pt-6 flex items-center text-sm text-white/50 font-medium group-hover:text-white transition-colors">
                      Leer artículo <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
