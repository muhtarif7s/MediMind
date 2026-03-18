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
import { Stethoscope, BrainCircuit, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function WelcomeView() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const { t, profile } = useMediMind();
  const router = useRouter();

  // Determine RTL based on current language
  const isRTL = (profile?.language || 'ar') === 'ar';

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
      color: "from-blue-600 to-cyan-500",
      iconColor: "text-blue-400"
    },
    {
      title: t('welcome2_title'),
      description: t('welcome2_desc'),
      icon: BrainCircuit,
      image: PlaceHolderImages.find(img => img.id === 'welcome-ai')?.imageUrl,
      color: "from-purple-600 to-indigo-500",
      iconColor: "text-purple-400"
    },
    {
      title: t('welcome3_title'),
      description: t('welcome3_desc'),
      icon: ShieldCheck,
      image: PlaceHolderImages.find(img => img.id === 'welcome-records')?.imageUrl,
      color: "from-emerald-600 to-teal-500",
      iconColor: "text-emerald-400"
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
        <Link href="/login" className="text-white/60 hover:text-white font-bold text-xs">
          {t('skip')}
        </Link>
      </header>

      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <Carousel 
          setApi={setApi} 
          opts={{ 
            direction: isRTL ? 'rtl' : 'ltr',
            align: 'start',
            containScroll: 'trimSnaps'
          }} 
          className="w-full h-full"
        >
          <CarouselContent className="h-full">
            {onboardingSteps.map((step, index) => (
              <CarouselItem key={index} className="h-full flex flex-col items-center justify-center px-8 text-center space-y-10">
                <div className="relative group">
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-tr opacity-25 blur-3xl rounded-full scale-125",
                    step.color
                  )} />
                  <div className="relative h-64 w-64 md:h-80 md:w-80 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/5 animate-in fade-in zoom-in duration-700">
                    {step.image ? (
                      <img 
                        src={step.image} 
                        alt={step.title}
                        className="h-full w-full object-cover"
                        data-ai-hint="medical clinic"
                      />
                    ) : (
                      <div className="h-full w-full bg-slate-900 flex items-center justify-center">
                        <step.icon className="h-20 w-20 text-white/10" />
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-6 -inline-end-6 h-20 w-20 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] flex items-center justify-center shadow-2xl">
                    <step.icon className={cn("h-10 w-10", step.iconColor)} />
                  </div>
                </div>

                <div className="space-y-6 max-w-sm animate-in slide-in-from-bottom-8 duration-700 delay-200">
                  <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight">
                    {step.title}
                  </h2>
                  <p className="text-sm md:text-base text-white/50 leading-relaxed font-medium">
                    {step.description}
                  </p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      <footer className="p-10 flex flex-col items-center space-y-10 z-20">
        <div className="flex gap-2.5">
          {onboardingSteps.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-1.5 transition-all duration-500 rounded-full",
                current === i ? "w-10 bg-primary" : "w-2 bg-white/10"
              )} 
            />
          ))}
        </div>

        <Button 
          onClick={handleNext}
          className="w-full h-16 rounded-[2rem] bg-white text-slate-950 hover:bg-white/90 font-bold text-xl shadow-2xl shadow-white/5 active:scale-[0.97] transition-all group"
        >
          {current === onboardingSteps.length - 1 ? t('getStarted') : t('next')}
          {isRTL ? (
            <ArrowLeft className="mr-2 h-6 w-6 group-hover:-translate-x-1.5 transition-transform" />
          ) : (
            <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1.5 transition-transform" />
          )}
        </Button>
      </footer>
    </div>
  );
}
