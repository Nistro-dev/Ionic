import { useHistory } from "react-router-dom";
import { useCallback } from "react";

export const useNavigation = () => {
  const history = useHistory();

  const navigateTo = useCallback(
    (path: string, state?: unknown) => {
      try {
        history.push(path, state);
      } catch (error) {
        console.error("Navigation error:", error);
        window.location.href = path;
      }
    },
    [history]
  );

  const replaceTo = useCallback(
    (path: string, state?: unknown) => {
      try {
        history.replace(path, state);
      } catch (error) {
        console.error("Navigation error:", error);
        window.location.href = path;
      }
    },
    [history]
  );

  const goBack = useCallback(() => {
    try {
      if (history.length > 1) {
        history.goBack();
      } else {
        history.push("/dashboard");
      }
    } catch (error) {
      console.error("Navigation error:", error);
      window.location.href = "/dashboard";
    }
  }, [history]);

  return {
    navigateTo,
    replaceTo,
    goBack,
    history,
  };
};