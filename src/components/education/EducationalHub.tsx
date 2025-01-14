"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Book, Video, ArrowRight, BookOpen } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: number;
  thumbnail: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  lessons: number;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

export function EducationalHub() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeTab, setActiveTab] = useState<'articles' | 'courses'>('articles');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const loadContent = async () => {
      try {
        const [articlesRes, coursesRes] = await Promise.all([
          fetch('/api/education/articles'),
          fetch('/api/education/courses')
        ]);

        const [articlesData, coursesData] = await Promise.all([
          articlesRes.json(),
          coursesRes.json()
        ]);

        setArticles(articlesData);
        setCourses(coursesData);
      } catch (error) {
        console.error('Failed to load educational content:', error);
      }
    };

    loadContent();
  }, []);

  const categories = ['all', 'investing', 'trading', 'crypto', 'analysis'];

  const filteredArticles = articles.filter(article => 
    selectedCategory === 'all' || article.category === selectedCategory
  );

  const renderArticles = () => (
    filteredArticles.map((article) => (
      <motion.div
        key={article.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group glass rounded-xl overflow-hidden hover:border-primary/50 transition-colors"
      >
        <div className="aspect-video relative">
          <img
            src={article.thumbnail}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        </div>
        <div className="p-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-primary capitalize">{article.category}</span>
            <span className="text-xs text-gray-400">{article.readTime} min read</span>
          </div>
          <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <p className="text-gray-400 text-sm mb-4">{article.description}</p>
          <button className="text-primary flex items-center gap-2 text-sm hover:gap-3 transition-all">
            Read More <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    ))
  );

  const renderCourses = () => (
    courses.map((course) => (
      <motion.div
        key={course.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-6 hover:border-primary/50 transition-colors"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
            <p className="text-gray-400 text-sm">{course.description}</p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full ${
            course.level === 'Beginner' ? 'bg-green-500/20 text-green-500' :
            course.level === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-500' :
            'bg-red-500/20 text-red-500'
          }`}>
            {course.level}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div>
            <BookOpen className="w-4 h-4 inline-block mr-1" />
            {course.lessons} lessons
          </div>
          <div>
            <Video className="w-4 h-4 inline-block mr-1" />
            {course.duration}
          </div>
        </div>
        <button className="w-full mt-4 btn-primary">
          Start Learning
        </button>
      </motion.div>
    ))
  );

  return (
    <div className="space-y-6">
      {/* Tab and Category Selection */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Educational Hub</h2>
          <p className="text-gray-400">Learn, grow, and master your financial journey</p>
        </div>

        <div className="flex gap-2 bg-background/50 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('articles')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'articles' ? 'bg-primary text-white' : 'text-gray-400'
            }`}
          >
            <Book className="w-4 h-4 inline-block mr-2" />
            Articles
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'courses' ? 'bg-primary text-white' : 'text-gray-400'
            }`}
          >
            <Video className="w-4 h-4 inline-block mr-2" />
            Courses
          </button>
        </div>
      </div>

      {/* Category Filter for Articles */}
      {activeTab === 'articles' && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full capitalize whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-background/50 text-gray-400 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Display Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === 'articles' ? renderArticles() : renderCourses()}
      </div>
    </div>
  );
}
