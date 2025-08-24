export const formatINR = (amount, options = {}) => {
  if (!amount && amount !== 0) return '₹0';
  
  const { compact = true } = options;
  const absAmount = Math.abs(amount);
  const isNegative = amount < 0;

  if (compact) {
    if (absAmount >= 10000000) {
      const crores = absAmount / 10000000;
      return `${isNegative ? '-' : ''}₹${crores.toFixed(1)}Cr`;
    } else if (absAmount >= 100000) {
      const lakhs = absAmount / 100000;
      return `${isNegative ? '-' : ''}₹${lakhs.toFixed(1)}L`;
    } else if (absAmount >= 1000) {
      const thousands = absAmount / 1000;
      return `${isNegative ? '-' : ''}₹${thousands.toFixed(1)}K`;
    }
  }

  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  } catch (error) {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
};

export const formatINRDetailed = (amount, options = {}) => {
  if (!amount && amount !== 0) return '₹0';
  
  const { showDecimals = false } = options;
  
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: showDecimals ? 2 : 0
    }).format(amount);
  } catch (error) {
    const formatted = amount.toLocaleString('en-IN', {
      maximumFractionDigits: showDecimals ? 2 : 0
    });
    return `₹${formatted}`;
  }
};

export const parseINRAmount = (inrString) => {
  if (!inrString) return 0;
  
  const cleanedString = inrString.replace(/[₹,\s]/g, '');
  
  if (cleanedString.endsWith('Cr')) {
    return parseFloat(cleanedString.replace('Cr', '')) * 10000000;
  } else if (cleanedString.endsWith('L')) {
    return parseFloat(cleanedString.replace('L', '')) * 100000;
  } else if (cleanedString.endsWith('K')) {
    return parseFloat(cleanedString.replace('K', '')) * 1000;
  }
  
  return parseFloat(cleanedString) || 0;
};

export const currencySymbol = '₹';
export const currencyCode = 'INR';

export default {
  formatINR,
  formatINRDetailed,
  parseINRAmount,
  currencySymbol,
  currencyCode
};
