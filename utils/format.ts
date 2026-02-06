export function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `Rp ${(amount / 1000).toFixed(0)}K`;
  }
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

export function formatFullCurrency(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    dalam_proses: 'Dalam Proses',
    siap_diambil: 'Siap Diambil',
    selesai: 'Selesai',
    terlambat: 'Terlambat',
    antrian: 'Antrian',
    dicuci: 'Dicuci',
    disetrika: 'Disetrika',
  };
  return labels[status] || status;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 18) return 'Selamat sore';
  return 'Selamat malam';
}
