import { useUserContext } from "@Context/UserContext";

export function useSubmitEmail() {
  const {login } = useUserContext();

  const submitEmailCallAble = (callback,email) => {
    login(callback,email);
  };

  return { submitEmailCallAble };
}