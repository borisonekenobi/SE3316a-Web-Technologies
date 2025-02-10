import {Routes} from '@angular/router';
import {DashboardPage} from './pages/dashboard/dashboard.page';
import {AboutPage} from './pages/about/about.page';
import {ContactPage} from './pages/contact/contact.page';
import {LoginPage} from './pages/login/login.page';
import {ProfilePage} from './pages/profile/profile.page';
import {LogoutPage} from './pages/logout/logout.page';
import {VerifyEmailPage} from './pages/verify-email/verify-email.page';
import {DestinationsPage} from './pages/destinations/destinations.page';
import {DestinationPage} from './pages/destination/destination.page';
import {ListsPage} from './pages/lists/lists.page';
import {ListPage} from './pages/list/list.page';

export const routes: Routes = [
  {path: '', component: DashboardPage, title: 'Dashboard - Destination Picker'},
  {path: 'about', component: AboutPage, title: 'About - Destination Picker'},
  {path: 'contact', component: ContactPage, title: 'Contact - Destination Picker'},
  {path: 'login', component: LoginPage, title: 'Login - Destination Picker'},
  {path: 'profile', component: ProfilePage, title: 'Me - Destination Picker'},
  {path: 'profile/:id', component: ProfilePage},
  {path: 'logout', component: LogoutPage, title: 'Logout - Destination Picker'},
  {path: 'verify/:id', component: VerifyEmailPage, title: 'Verify Email - Destination Picker'},
  {path: 'destinations', component: DestinationsPage, title: 'Destinations - Destination Picker'},
  {path: 'destinations/:id', component: DestinationPage},
  {path: 'lists', component: ListsPage, title: 'Lists - Destination Picker'},
  {path: 'lists/:id', component: ListPage},
];
