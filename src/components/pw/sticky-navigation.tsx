import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Brand } from "./brand";

const BackContext = createContext<{ register: (handler: (() => void) | null) => void } | null>(null);
export function useStepBack(handler: (() => void) | null) {
  const context = useContext(BackContext);
  const latest = useRef(handler);
  latest.current = handler;
  const active = handler !== null;
  useEffect(() => {
    if (!context || !active) return;
    context.register(() => latest.current?.());
    return () => context.register(null);
  }, [context, active]);
}

export function StickyNavigation({ back, navigation, children }: { back?: "/" | "/buyer/properties" | "/buyer" | "/owner"; navigation?: ReactNode; children: ReactNode }) {
  const router = useRouter();
  const handler = useRef<(() => void) | null>(null);
  const context = useRef({ register: (next: (() => void) | null) => { handler.current = next; } });
  return <BackContext.Provider value={context.current}>
    <header className="sticky top-0 z-30 border-b bg-background">
      <div className="px-4 py-2 sm:px-6"><Brand /></div>
      {back && <div className="px-2 pb-1"><Button variant="ghost" size="sm" onClick={() => {
        if (handler.current) { handler.current(); return; }
        if ((router.history.location.state.__TSR_index ?? 0) > 0) router.history.back();
        else void router.navigate({ to: back });
      }}><ArrowLeft />Back</Button></div>}
      {navigation}
    </header>
    {children}
  </BackContext.Provider>;
}