"use client";

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useClinic } from '@/lib/store';
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
  const { t, profile } = useClinic();
  const router = useRouter();

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

  const getStepImage = (id: string) => {
    return PlaceHolderImages.find(img => img.id === id)?.imageUrl;
  };

  const onboardingSteps = [
    {
      title: t('welcome1_title'),
      description: t('welcome1_desc'),
      icon: Stethoscope,
      image: getStepImage('welcome-clinic'),
      color: "from-slate-900 to-[#08668d]/40",
      iconColor: "text-[#08668d]"
    },
    {
      title: t('welcome2_title'),
      description: t('welcome2_desc'),
      icon: BrainCircuit,
      image: getStepImage('welcome-ai'),
      color: "from-slate-900 to-[#0c4a6e]/40",
      iconColor: "text-sky-400"
    },
    {
      title: t('welcome3_title'),
      description: t('welcome3_desc'),
      icon: ShieldCheck,
      image: getStepImage('welcome-records'),
      color: "from-slate-900 to-[#134e4a]/40",
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
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={cn(
          "absolute -top-1/4 -left-1/4 w-[150%] h-[150%] bg-gradient-to-br opacity-30 blur-[100px] transition-all duration-1000",
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
              <CarouselItem key={index} className="h-full flex flex-col items-center justify-center px-8 text-center space-y-8 md:space-y-12">
                <div className="relative group">
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-tr opacity-20 blur-3xl rounded-full scale-125",
                    step.color
                  )} />
                  <div className="relative h-64 w-64 md:h-80 md:w-80 rounded-[3rem] overflow-hidden shadow-2xl border-2 border-white/5 bg-slate-900/50 animate-in fade-in zoom-in duration-700">
                    {step.image ? (
                      <img 
                        src={step.image} 
                        alt={step.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        data-ai-hint="medical clinic"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-slate-800">
                         <step.icon className="h-20 w-20 text-white/10" />
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-4 -inline-end-4 h-16 w-16 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl z-20">
                    <step.icon className={cn("h-8 w-8", step.iconColor)} />
                  </div>
                </div>

                <div className="space-y-4 md:space-y-6 max-w-sm animate-in slide-in-from-bottom-8 duration-700 delay-200">
                  <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight tracking-tight drop-shadow-sm px-2">
                    {step.title}
                  </h2>
                  <p className="text-sm md:text-lg text-white/60 leading-relaxed font-semibold px-4">
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
                current === i ? "w-10 bg-primary shadow-[0_0_15px_rgba(8,102,141,0.6)]" : "w-2 bg-white/10"
              )} 
            />
          ))}
        </div>

        <Button 
          onClick={handleNext}
          className="w-full h-16 rounded-2xl bg-white text-slate-950 hover:bg-white/90 font-bold text-lg shadow-2xl active:scale-[0.97] transition-all group"
        >
          {current === onboardingSteps.length - 1 ? t('getStarted') : t('next')}
          {isRTL ? (
            <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1.5 transition-transform" />
          ) : (
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1.5 transition-transform" />
          )}
        </Button>
      </footer>
    </div>
  );
}