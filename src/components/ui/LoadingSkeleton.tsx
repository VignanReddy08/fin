import React from 'react';
import { cn } from '../../lib/utils';
import { Card, CardContent, CardHeader } from './card';

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <Card className={cn("overflow-hidden border-border bg-card/50", className)}>
      <CardHeader className="gap-2 p-4">
        <div className="h-5 w-1/3 bg-muted rounded animate-pulse" />
        <div className="h-4 w-1/4 bg-muted/60 rounded animate-pulse" />
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        <div className="h-4 w-full bg-muted/50 rounded animate-pulse" />
        <div className="h-4 w-5/6 bg-muted/50 rounded animate-pulse" />
        <div className="h-4 w-4/6 bg-muted/50 rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}

export function SkeletonTable({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("w-full border border-border rounded-lg overflow-hidden bg-card/50", className)}>
      <div className="flex border-b border-border bg-muted/20 p-4 gap-4">
        <div className="h-4 w-1/4 bg-muted rounded animate-pulse" />
        <div className="h-4 w-1/4 bg-muted rounded animate-pulse" />
        <div className="h-4 w-1/4 bg-muted rounded animate-pulse" />
        <div className="h-4 w-1/4 bg-muted rounded animate-pulse" />
      </div>
      <div className="flex flex-col">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex p-4 gap-4 border-b border-border/50 last:border-0">
            <div className="h-4 w-1/4 bg-muted/50 rounded animate-pulse" />
            <div className="h-4 w-1/4 bg-muted/50 rounded animate-pulse" />
            <div className="h-4 w-1/4 bg-muted/50 rounded animate-pulse" />
            <div className="h-4 w-1/4 bg-muted/50 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonKPI({ className }: { className?: string }) {
  return (
    <Card className={cn("border-border bg-card/50", className)}>
      <CardContent className="p-6 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-8 w-32 bg-muted/80 rounded animate-pulse" />
          <div className="h-3 w-20 bg-muted/50 rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

export function SkeletonChart({ className }: { className?: string }) {
  return (
    <Card className={cn("border-border bg-card/50 flex flex-col", className)}>
      <CardHeader className="pb-2">
        <div className="h-5 w-40 bg-muted rounded animate-pulse" />
      </CardHeader>
      <CardContent className="flex-1 flex items-end gap-2 p-6 pt-4 h-[300px]">
        {Array.from({ length: 12 }).map((_, i) => (
          <div 
            key={i} 
            className="flex-1 bg-muted/40 rounded-t animate-pulse" 
            style={{ height: `${Math.max(20, Math.random() * 100)}%` }} 
          />
        ))}
      </CardContent>
    </Card>
  );
}
