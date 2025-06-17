import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import PrivateRoute from './PrivateRoute';
import OfflineBanner from './OfflineBanner';
import { useNetworkContext } from '../contexts/NetworkContext';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import Places from '../pages/Places';
import AddPlace from '../pages/AddPlace';
import PlaceDetail from '../pages/PlaceDetail';
import MapPage from '../pages/MapPage';

const AppContent: React.FC = () => {
  const { isOnline } = useNetworkContext();

  return (
    <>
      <OfflineBanner isOffline={!isOnline} />
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/login">
            <Login />
          </Route>
          <Route exact path="/register">
            <Register />
          </Route>
          <PrivateRoute exact path="/dashboard" component={Dashboard} />
          <PrivateRoute exact path="/profile" component={Profile} />
          <PrivateRoute exact path="/places" component={Places} />
          <PrivateRoute exact path="/places/add" component={AddPlace} />
          <PrivateRoute exact path="/places/:id" component={PlaceDetail} />
          <PrivateRoute exact path="/map" component={MapPage} />
          <Route exact path="/">
            <Redirect to="/dashboard" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </>
  );
};

export default AppContent;
