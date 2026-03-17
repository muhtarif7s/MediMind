
"use client";

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMediMind } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { ChevronRight, Stethoscope, BrainCircuit, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WelcomePage() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const { t, profile, user, isUserLoading } = useMediMind();
  const router = useRouter();

  const isRTL = profile.language === 'ar';

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const onSelect = useCallback(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  const onboardingSteps = [
    {
      title: t('welcome1_title'),
      description: t('welcome1_desc'),
      icon: Stethoscope,
      image: PlaceHolderImages.find(img => img.id === 'welcome-clinic')?.imageUrl,
      color: "from-blue-600 to-cyan-500"
    },
    {
      title: t('welcome2_title'),
      description: t('welcome2_desc'),
      icon: BrainCircuit,
      image: PlaceHolderImages.find(img => img.id === 'welcome-ai')?.imageUrl,
      color: "from-purple-600 to-indigo-500"
    },
    {
      title: t('welcome3_title'),
      description: t('welcome3_desc'),
      icon: ShieldCheck,
      image: PlaceHolderImages.find(img => img.id === 'welcome-records')?.imageUrl,
      color: "from-emerald-600 to-teal-500"
    }
  ];

  const handleNext = () => {
    if (current === onboardingSteps.length - 1) {
      router.push('/login');
    } else {
      api?.scrollNext();
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-slate-950 overflow-hidden relative" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Background Animated Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={cn(
          "absolute -top-1/4 -left-1/4 w-[150%] h-[150%] bg-gradient-to-br opacity-20 blur-[100px] transition-all duration-1000",
          onboardingSteps[current].color
        )} />
      </div>

      <header className="p-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/30">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-white tracking-tight">{t('appTitle')}</span>
        </div>
        <Button 
          variant="ghost" 
          className="text-white/60 hover:text-white font-bold text-xs"
          onClick={() => router.push('/login')}
        >
          {t('skip')}
        </Button>
      </header>

      <div className="flex-1 flex flex-col relative z-10">
        <Carousel setApi={setApi} className="w-full h-full">
          <CarouselContent className="h-full">
            {onboardingSteps.map((step, index) => (
              <CarouselItem key={index} className="h-full flex flex-col items-center justify-center px-8 text-center space-y-8">
                <div className="relative group">
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-tr opacity-20 blur-2xl rounded-full scale-110",
                    step.color
                  )} />
                  <div className="relative h-64 w-64 md:h-80 md:w-80 rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 animate-in fade-in zoom-in duration-700">
                    <img 
                      src={step.image} 
                      alt={step.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-4 -right-4 h-16 w-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center shadow-xl">
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                </div>

                <div className="space-y-4 max-w-sm animate-in slide-in-from-bottom-8 duration-700 delay-200">
                  <h2 className="text-3xl font-bold text-white leading-tight">
                    {step.title}
                  </h2>
                  <p className="text-sm text-white/60 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      <footer className="p-10 flex flex-col items-center space-y-8 z-20">
        <div className="flex gap-2">
          {onboardingSteps.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-1.5 transition-all duration-300 rounded-full",
                current === i ? "w-8 bg-primary" : "w-1.5 bg-white/20"
              )} 
            />
          ))}
        </div>

        <Button 
          onClick={handleNext}
          className="w-full h-14 rounded-2xl bg-white text-slate-950 hover:bg-white/90 font-bold text-lg shadow-xl active:scale-[0.98] transition-all group"
        >
          {current === onboardingSteps.length - 1 ? t('getStarted') : t('next')}
          {isRTL ? (
            <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          ) : (
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          )}
        </Button>
      </footer>
    </div>
  );
}
