import React, { useState } from 'react';
import { BookOpen, Calendar, Clock, User, ArrowLeft, ArrowRight } from 'lucide-react';
import { BlogItem, BlogsConfig } from '../types';
import { resolveMediaLink } from '../utils/mediaResolver';

interface BlogProps {
  blogsConfig: BlogsConfig;
  blogs: BlogItem[];
}

export default function Blog({ blogsConfig, blogs }: BlogProps) {
  const [selectedBlog, setSelectedBlog] = useState<BlogItem | null>(null);

  // Return to lists
  if (selectedBlog) {
    // Collect images sequence
    const gallery = Array.isArray(selectedBlog.galleryImages) 
      ? selectedBlog.galleryImages.filter(img => img && !img.includes('pexels.com')) 
      : [];
    const hasPostImage = selectedBlog.imageUrl && !selectedBlog.imageUrl.includes('pexels.com');
    const images = gallery.length > 0 ? gallery : (hasPostImage ? [selectedBlog.imageUrl] : []);

    return (
      <article className="py-20 bg-slate-50 min-h-screen" id="blog-reader-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <button
            type="button"
            onClick={() => setSelectedBlog(null)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-ocean-accent hover:text-ocean-medium mb-8 cursor-pointer group"
          >
            <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform shrink-0" />
            Back to Articles List
          </button>
 
          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-ocean-dark leading-tight mb-4">
              {selectedBlog.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-slate-500 border-b border-slate-200/80 pb-4">
              <span className="inline-flex items-center gap-1">
                <Calendar size={14} className="shrink-0" />
                {selectedBlog.date}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock size={14} className="shrink-0" />
                {selectedBlog.readTime}
              </span>
              <span className="inline-flex items-center gap-1">
                <User size={14} className="shrink-0" />
                By {selectedBlog.author}
              </span>
            </div>
          </header>
 
          {/* Render blog gallery list support (3 to 5 images per blog specified) */}
          {images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10" id="blog-image-grid">
              {images.map((img, idx) => {
                const resolvedImg = resolveMediaLink(img || '', 'image').displayUrl || img;
                return (
                  <div key={idx} className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm aspect-video">
                    <img
                      src={resolvedImg}
                      alt={`${selectedBlog.title} attachment ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-102 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                );
              })}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-10 shadow-sm leading-relaxed prose prose-slate">
            <p className="text-slate-700 font-light whitespace-pre-line text-sm md:text-base">
              {selectedBlog.content}
            </p>
          </div>

        </div>
      </article>
    );
  }

  const hasTitle = !!(blogsConfig?.title && blogsConfig.title.trim() !== '');
  const hasDescription = !!(blogsConfig?.description && blogsConfig.description.trim() !== '');
  const hasBlogs = Array.isArray(blogs) && blogs.length > 0;

  if (!hasTitle && !hasDescription && !hasBlogs && !selectedBlog) return null;

  return (
    <section id="blog" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title bar banner */}
        {(hasTitle || hasDescription) && (
          <div className="text-center mb-16">
            <div className="flex justify-center mb-4">
              <div className="bg-ocean-light p-3 rounded-full text-ocean-accent shadow-sm shrink-0">
                <BookOpen size={28} className="shrink-0" />
              </div>
            </div>
            {hasTitle && (
              <h2 className="text-3xl font-serif font-bold text-ocean-dark mb-4">
                {blogsConfig.title}
              </h2>
            )}
            {hasDescription && (
              <p className="text-slate-600 max-w-2xl mx-auto text-sm md:text-base font-light">
                {blogsConfig.description}
              </p>
            )}
            <div className="w-16 h-1 bg-ocean-accent mx-auto rounded-full mt-5" />
          </div>
        )}

        {/* Blogs cards layout */}
        {hasBlogs ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((post) => {
              const hasCover = !!(post.imageUrl && !post.imageUrl.includes('pexels.com'));
              const resolvedCoverVal = hasCover ? (resolveMediaLink(post.imageUrl, 'image').displayUrl || post.imageUrl) : '';
              return (
                <div
                  key={post.id}
                  className="flex flex-col bg-slate-50 rounded-xl overflow-hidden border border-slate-100 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group h-full"
                >
                  {hasCover && (
                    <div className="h-52 overflow-hidden relative">
                      <div className="absolute inset-0 bg-ocean-dark/10 group-hover:bg-transparent transition-colors z-10 duration-300" />
                      <img
                        src={resolvedCoverVal}
                        alt={post.title}
                        className="w-full h-full object-cover transform group-hover:scale-103 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-3.5 text-xs text-slate-400 mb-3 font-mono">
                      {post.date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="shrink-0" />
                          {post.date}
                        </span>
                      )}
                      {post.readTime && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="shrink-0" />
                          {post.readTime}
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif font-bold text-lg text-ocean-dark mb-3.5 leading-snug group-hover:text-ocean-accent transition-colors">
                      {post.title}
                    </h3>

                    {post.excerpt && (
                      <p className="text-slate-600 text-xs md:text-sm leading-relaxed mb-6 font-light line-clamp-3 flex-grow">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between mt-auto">
                      {post.author && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                          <User size={12} className="text-ocean-accent shrink-0" />
                          {post.author}
                        </span>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => setSelectedBlog(post)}
                        className="text-ocean-accent hover:text-ocean-medium font-bold text-xs flex items-center gap-1 group/btn cursor-pointer ml-auto"
                      >
                        Read Now
                        <ArrowRight size={12} className="transform group-hover/btn:translate-x-0.5 transition-transform shrink-0" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm max-w-lg mx-auto">
            <BookOpen className="mx-auto text-slate-300 mb-3 h-10 w-10 animate-pulse" />
            <p className="text-sm font-medium text-slate-500">No blog posts or research logs yet.</p>
            <p className="text-xs text-slate-400 mt-1">Please log in to the administrator workspace to publish research summaries, field records, and educational posts.</p>
          </div>
        )}

      </div>
    </section>
  );
}
