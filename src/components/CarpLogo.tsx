export default function CarpLogo({ size = 48 }: { size?: number }) {
  return <img src="/logo.png" alt="CARP" width={size} height={size} className="object-contain" />;
}
