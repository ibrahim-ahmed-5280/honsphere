import { useTheme } from './ThemeProvider';

type Props = { lightPath?: string; darkPath?: string; alt: string; width?: number; height?: number; className?: string };

export function BrandLogo({ lightPath = '/brand/HS Logo-13.png', darkPath, alt, width = 218, height = 59, className = '' }: Props) {
  const { theme } = useTheme();
  const useDarkAsset = theme === 'dark' && Boolean(darkPath);
  return <img className={`${className}${theme === 'dark' && !useDarkAsset ? ' brand-logo-fallback' : ''}`.trim()}
    src={useDarkAsset ? darkPath : lightPath} alt={alt} width={width} height={height} />;
}
