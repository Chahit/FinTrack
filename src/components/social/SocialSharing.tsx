"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Twitter, Facebook, Linkedin, Link as LinkIcon } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import toast from 'react-hot-toast';

interface ShareableContent {
  title: string;
  description: string;
  url: string;
  image?: string;
}

export function SocialSharing({ content }: { content: ShareableContent }) {
  const [isOpen, setIsOpen] = useState(false);

  const shareToTwitter = () => {
    const text = `Check out my portfolio performance on FinTrack! ${content.title}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(content.url)}`;
    window.open(url, '_blank');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(content.url)}`;
    window.open(url, '_blank');
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(content.url)}`;
    window.open(url, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(content.url);
    toast.success('Link copied to clipboard!');
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <button className="btn-secondary">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-background border border-border rounded-xl shadow-xl p-6">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <h2 className="text-xl font-semibold mb-4">Share {content.title}</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={shareToTwitter}
                  className="flex items-center justify-center gap-2 p-3 rounded-lg bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-[#1DA1F2]"
                >
                  <Twitter className="w-5 h-5" />
                  Twitter
                </button>
                
                <button
                  onClick={shareToFacebook}
                  className="flex items-center justify-center gap-2 p-3 rounded-lg bg-[#4267B2]/10 hover:bg-[#4267B2]/20 text-[#4267B2]"
                >
                  <Facebook className="w-5 h-5" />
                  Facebook
                </button>
                
                <button
                  onClick={shareToLinkedIn}
                  className="flex items-center justify-center gap-2 p-3 rounded-lg bg-[#0077B5]/10 hover:bg-[#0077B5]/20 text-[#0077B5]"
                >
                  <Linkedin className="w-5 h-5" />
                  LinkedIn
                </button>
                
                <button
                  onClick={copyLink}
                  className="flex items-center justify-center gap-2 p-3 rounded-lg bg-gray-500/10 hover:bg-gray-500/20 text-gray-500"
                >
                  <LinkIcon className="w-5 h-5" />
                  Copy Link
                </button>
              </div>

              <div className="bg-background/50 rounded-lg p-4">
                <div className="flex items-center gap-4">
                  {content.image && (
                    <img
                      src={content.image}
                      alt={content.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-medium">{content.title}</h3>
                    <p className="text-sm text-gray-400">{content.description}</p>
                  </div>
                </div>
              </div>

              <Dialog.Close asChild>
                <button className="mt-6 w-full btn-secondary">
                  Close
                </button>
              </Dialog.Close>
            </motion.div>
          </AnimatePresence>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
