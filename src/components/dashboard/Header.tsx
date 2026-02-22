
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMediMind } from "@/lib/store";

export function Header({ userName }: { userName: string }) {
  const { t } = useMediMind();

  return (
    <header className="flex items-center justify-between p-6 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border-2 border-primary">
          <AvatarImage src="https://picsum.photos/seed/user1/200/200" />
          <AvatarFallback>{userName[0]}</AvatarFallback>
        </Avatar>
        <div className="text-start">
          <p className="text-xs text-muted-foreground">{t('goodMorning')},</p>
          <h1 className="text-lg font-bold">{userName}</h1>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
          <Search className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full"></span>
        </Button>
      </div>
    </header>
  );
}
