import { useUserContext } from "@Context/UserContext";

export function useAction() {
  const { isLoggedIn, login } = useUserContext();

  const checkIsActionCallable = (callback) => {
    if (isLoggedIn) {
      callback();
    } else {
      login(callback);
    }
  };

  return { checkIsActionCallable };
}