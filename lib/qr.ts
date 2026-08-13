import QRCode from 'qrcode';

// The QR encodes only the verification URL — never member data directly
// (spec: "The QR code should NOT contain sensitive information"). Any
// phone camera app can already resolve this without a custom in-app
// scanner, since it's a plain URL; that's why there's no separate
// "scan" feature built here — the OS camera does that job.
export async function verificationQrDataUrl(frlId: string, baseUrl: string): Promise<string> {
  const url = `${baseUrl}/verify/team/${encodeURIComponent(frlId)}`;
  return QRCode.toDataURL(url, { margin: 1, width: 240 });
}
