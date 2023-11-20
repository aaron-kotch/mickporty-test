export function useCurrency() {
  const currency = "RM";
  const decimalPoint = 2;

  const formatCurrency = (value) => {
    return value || value === 0 ? `${currency} ${value.toFixed(decimalPoint)}` : '';
  };

  return { formatCurrency };
}
