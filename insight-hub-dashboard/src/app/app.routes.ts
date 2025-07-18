import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { SettingsComponent } from './components/settings/settings.component';
import { SensorSimulatorComponent } from './components/sensor-simulator/sensor-simulator.component';
import { AlertsComponent } from './components/alerts/alerts.component';
import { EntryPointComponent } from './components/entry-point/entry-point.component'
import { StreetLightManagementComponent } from './components/dashboards/street-light-management/street-light-management.component';
import { SensorDashboardComponent } from './components/sensor-dashboard/sensor-dashboard.component';




export const routes: Routes = [
    { path: 'entry', component: EntryPointComponent },
    
    {
        path: '',
        redirectTo: 'auth',
        pathMatch: 'full'
    },
    {
        path: 'auth',
        component: AuthComponent,
    },
    {
        path: 'home',
        component: HomeComponent
    },
    {
        path: 'profile',
        component: ProfileComponent
    },  
    { 
        path: 'forgot-password',
        component: ForgotPasswordComponent
    },
    {
        path: 'settings',
        component: SettingsComponent
    },
    {
        path: 'simulate',
        component: SensorSimulatorComponent
    },
    { path: 'alerts', component: AlertsComponent },
      {
    path: 'sensor-dashboard',
    component: SensorDashboardComponent
    },
    {
  path: 'street-light-management',
  component: StreetLightManagementComponent
}

];
