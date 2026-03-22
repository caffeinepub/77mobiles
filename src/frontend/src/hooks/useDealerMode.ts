import { useState } from "react";

const KEY = "77mobiles_dealer_mode";

export function useDealerMode() {
  const [dealerMode, setDealerModeState] = useState(
    () => localStorage.getItem(KEY) === "true",
  );

  const setDealerMode = (val: boolean) => {
    localStorage.setItem(KEY, String(val));
    setDealerModeState(val);
  };

  return { dealerMode, setDealerMode };
}
