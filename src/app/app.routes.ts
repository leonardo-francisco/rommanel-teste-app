import { Routes } from '@angular/router';
import { ClientListComponent } from './client/client-list/client-list.component';
import { ClientAddComponent } from './client/client-add/client-add.component';
import { ClientUpdateComponent } from './client/client-update/client-update.component';

export const routes: Routes = [
  {path: '', component: ClientListComponent},
  {path: 'client-list', component: ClientListComponent},
  {path: 'client-add', component: ClientAddComponent},
  {path: 'client-update/:id', component: ClientUpdateComponent},
];
