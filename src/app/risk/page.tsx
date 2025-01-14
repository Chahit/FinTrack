'use client';

import { useEffect } from "react";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
import { AIAgentChat } from "@/components/ai/AIAgentChat";
import { gsap } from "gsap";
import { motion } from "framer-motion";
import { SparklesCore } from "@/components/ui/sparkles";

export default function RiskPage() {
  useEffect(() => {
    // Animation for page load
    gsap.from(".risk-card", {
      y: 100,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: "power3.out"
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <BackgroundGradient className="rounded-[22px] p-4 sm:p-10">
        <div className="h-[40rem] w-full bg-black flex flex-col items-center justify-center overflow-hidden rounded-md">
          <h1 className="md:text-7xl text-3xl lg:text-8xl font-bold text-center text-white relative z-20">
            Risk Analysis
          </h1>
          <div className="w-[40rem] h-40 relative">
            <SparklesCore
              background="transparent"
              minSize={0.4}
              maxSize={1}
              particleDensity={1200}
              className="w-full h-full"
              particleColor="#8B5CF6"
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <CardContainer className="risk-card">
                <CardBody className="bg-black/50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-purple-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto h-auto rounded-xl p-6 border">
                  <CardItem translateZ="50" className="text-xl font-bold text-white mb-4">
                    Portfolio Health Analysis
                  </CardItem>
                  <CardItem translateZ="30" className="text-white/60 mb-4">
                    Ask about your portfolio's health, diversification, and risk metrics. Get personalized recommendations for optimization.
                  </CardItem>
                  <AIAgentChat
                    agentType="portfolio"
                    title="Portfolio Health Analysis"
                    description="Get detailed insights about your portfolio's performance and risk metrics"
                  />
                </CardBody>
              </CardContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <CardContainer className="risk-card">
                <CardBody className="bg-black/50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-purple-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto h-auto rounded-xl p-6 border">
                  <CardItem translateZ="50" className="text-xl font-bold text-white mb-4">
                    Market News Analysis
                  </CardItem>
                  <CardItem translateZ="30" className="text-white/60 mb-4">
                    Get curated news and insights about your portfolio holdings and the broader market conditions.
                  </CardItem>
                  <AIAgentChat
                    agentType="news"
                    title="Market News Analysis"
                    description="Stay informed with AI-curated market news"
                  />
                </CardBody>
              </CardContainer>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="risk-card"
          >
            <CardContainer>
              <CardBody className="bg-black/50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-purple-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto h-auto rounded-xl p-6 border">
                <CardItem translateZ="50" className="text-xl font-bold text-white mb-4">
                  Technical Analysis Insights
                </CardItem>
                <CardItem translateZ="30" className="text-white/60 mb-4">
                  Get detailed technical analysis for any asset in your portfolio or potential investments.
                </CardItem>
                <AIAgentChat
                  agentType="technical"
                  title="Technical Analysis Insights"
                  description="Advanced technical analysis powered by AI"
                />
              </CardBody>
            </CardContainer>
          </motion.div>
        </div>
      </BackgroundGradient>
    </div>
  );
}
