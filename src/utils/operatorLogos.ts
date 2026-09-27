// Service Operator Logo Helper for D'Alexis Accessorio y Transferencia

export const OPERATOR_LOGOS: Record<string, string> = {
  moncash: '/images/mon cash.jpg',
  natcash: '/images/natcash.jpg',
  natcom: '/images/natcom.jpg',
  digicel: '/images/mon cash.jpg', // Digicel / Moncash family
  claro: '/images/claro.jpg',
  altice: '/images/altice.png',
  zelle: '/images/Zelle.png',
  pappadap: '/images/pappadap.jpg',
};

export const getOperatorLogo = (operator: string): string => {
  const cleanKey = operator ? operator.toLowerCase().trim() : '';
  return OPERATOR_LOGOS[cleanKey] || OPERATOR_LOGOS.moncash;
};
