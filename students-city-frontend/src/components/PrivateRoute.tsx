import React from "react";
import { Redirect, Route, RouteProps } from "react-router-dom";
import { IonSpinner, IonContent } from "@ionic/react";
import { useAuth } from "../hooks/useAuth";

interface PrivateRouteProps extends RouteProps {
  component: React.ComponentType<RouteProps>;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  component: Component,
  ...rest
}) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <IonContent className="ion-padding">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <IonSpinner name="crescent" />
        </div>
      </IonContent>
    );
  }

  return (
    <Route
      {...rest}
      render={(props) => {
        if (isAuthenticated) {
          return <Component {...props} />;
        } else {
          return (
            <Redirect
              to={{
                pathname: "/login",
                state: { from: props.location },
              }}
            />
          );
        }
      }}
    />
  );
};

export default PrivateRoute;
