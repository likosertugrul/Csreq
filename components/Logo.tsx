type Props = { size?: number; spin?: boolean; alt?: string };

export default function Logo({ size = 28, spin = false, alt = "csreq" }: Props) {
  return (
    <img
      src={spin ? "/logos/logo-03.svg" : "/logo.svg"}
      width={size}
      height={size}
      alt={alt}
      style={{ display: "block", flexShrink: 0 }}
    />
  );
}
