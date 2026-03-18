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
import { Stethoscope, BrainCircuit, ShieldCheck, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
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
      color: "from-blue-600/40 via-slate-900/10 to-transparent",
      blobColor: "bg-blue-500/20",
      iconColor: "text-blue-400"
    },
    {
      title: t('welcome2_title'),
      description: t('welcome2_desc'),
      icon: BrainCircuit,
      image: getStepImage('welcome-ai'),
      color: "from-sky-500/40 via-slate-900/10 to-transparent",
      blobColor: "bg-sky-400/20",
      iconColor: "text-sky-300"
    },
    {
      title: t('welcome3_title'),
      description: t('welcome3_desc'),
      icon: ShieldCheck,
      image: getStepImage('welcome-records'),
      color: "from-emerald-600/40 via-slate-900/10 to-transparent",
      blobColor: "bg-emerald-500/20",
      iconColor: "text-emerald-300"
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
      {/* Dynamic Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={cn(
          "absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] transition-all duration-1000 animate-pulse-soft",
          onboardingSteps[current].blobColor
        )} />
        <div className={cn(
          "absolute bottom-[-5%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] transition-all duration-1000 animate-pulse-soft delay-700",
          onboardingSteps[current].blobColor
        )} />
        <div className={cn(
          "absolute inset-0 bg-gradient-to-b opacity-40 transition-colors duration-1000",
          onboardingSteps[current].color
        )} />
      </div>

      <header className="p-6 flex justify-between items-center z-30">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="h-10 w-10 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/40 group-hover:scale-110 transition-transform">
            <Stethoscope className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-white tracking-tight text-lg">{t('appTitle')}</span>
        </div>
        <Link href="/login" className="text-white/40 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors">
          {t('skip')}
        </Link>
      </header>

      <div className="flex-1 flex flex-col relative z-20 overflow-hidden">
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
              <CarouselItem key={index} className="h-full flex flex-col items-center justify-center px-8 text-center">
                <div className="relative mb-12 animate-float">
                  {/* Decorative Glow Ring */}
                  <div className={cn(
                    "absolute -inset-4 bg-gradient-to-tr opacity-20 blur-2xl rounded-full animate-pulse",
                    step.blobColor
                  )} />
                  
                  <div className="relative h-64 w-64 md:h-80 md:w-80 rounded-[3.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/10 bg-slate-900/50">
                    {step.image ? (
                      <img 
                        src={step.image} 
                        alt={step.title}
                        className="h-full w-full object-cover"
                        data-ai-hint="medical clinical office"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-slate-800">
                         <step.icon className="h-24 w-24 text-white/5" />
                      </div>
                    )}
                    {/* Glassmorphism Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  </div>

                  {/* Floating Action Badge */}
                  <div className="absolute -bottom-6 -right-6 h-20 w-20 bg-white/5 backdrop-blur-3xl border border-white/20 rounded-3xl flex items-center justify-center shadow-2xl z-30 animate-bounce delay-300">
                    <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center">
                      <step.icon className={cn("h-8 w-8", step.iconColor)} />
                    </div>
                  </div>
                </div>

                <div className="space-y-6 max-w-sm">
                  <div key={`title-${index}`} className="animate-in slide-in-from-bottom-12 fade-in duration-700">
                    <h2 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-xl flex items-center justify-center gap-2">
                      {step.title}
                      {index === 1 && <Sparkles className="h-6 w-6 text-sky-400 animate-pulse" />}
                    </h2>
                  </div>
                  <div key={`desc-${index}`} className="animate-in slide-in-from-bottom-8 fade-in duration-700 delay-300">
                    <p className="text-base md:text-lg text-white/50 leading-relaxed font-medium px-4">
                      {step.description}
                    </p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      <footer className="p-10 flex flex-col items-center space-y-12 z-30">
        <div className="flex gap-3">
          {onboardingSteps.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-1.5 transition-all duration-700 rounded-full",
                current === i 
                  ? "w-12 bg-primary shadow-[0_0_20px_rgba(8,102,141,0.8)]" 
                  : "w-3 bg-white/10"
              )} 
            />
          ))}
        </div>

        <div className="w-full relative group">
          {current === onboardingSteps.length - 1 && (
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-sky-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
          )}
          <Button 
            onClick={handleNext}
            className={cn(
              "relative w-full h-18 rounded-2xl font-black text-xl shadow-2xl active:scale-[0.97] transition-all flex items-center justify-center gap-3",
              current === onboardingSteps.length - 1 
                ? "bg-white text-slate-950 hover:bg-slate-100" 
                : "bg-primary text-white hover:bg-primary/90"
            )}
          >
            {current === onboardingSteps.length - 1 ? t('getStarted') : t('next')}
            <div className={cn(
              "transition-transform duration-300",
              isRTL ? "group-hover:-translate-x-2" : "group-hover:translate-x-2"
            )}>
              {isRTL ? <ArrowLeft className="h-6 w-6" /> : <ArrowRight className="h-6 w-6" />}
            </div>
          </Button>
        </div>
      </footer>
    </div>
  );
}
