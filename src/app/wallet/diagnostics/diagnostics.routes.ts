import {Routes, RouterModule} from '@angular/router';
import { NgModule } from "@angular/core";
import { OverviewComponent } from './overview/overview.component';

export const DIAGNOSTICS_ROUTES: Routes = [
  {
    path: '',
    component: OverviewComponent,
    children: []
  }
];

@NgModule({
  imports: [RouterModule.forChild(DIAGNOSTICS_ROUTES)],
  exports: [RouterModule]
})
export class DiagnosticsRoutingModule { }
