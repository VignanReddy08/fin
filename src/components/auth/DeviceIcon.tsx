import { Monitor, Smartphone, Tablet, Globe } from 'lucide-react';

export function DeviceTypeIcon({ device, className = 'h-5 w-5' }: { device: string; className?: string }) {
  const d = device.toLowerCase();
  if (d.includes('mobile') || d.includes('phone')) return <Smartphone className={className} />;
  if (d.includes('tablet') || d.includes('ipad')) return <Tablet className={className} />;
  return <Monitor className={className} />;
}

export function BrowserIcon({ browser, className = 'h-4 w-4' }: { browser: string; className?: string }) {
  // Use Globe as a generic fallback since custom browser icons may not be exported in this version
  return <Globe className={className} />;
}

export default function DeviceIcon({ device, browser, className }: { device: string; browser?: string; className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 ${className || ''}`}>
      <DeviceTypeIcon device={device} className="h-4 w-4 text-gray-400" />
      {browser && <BrowserIcon browser={browser} className="h-3.5 w-3.5 text-gray-500" />}
    </div>
  );
}
