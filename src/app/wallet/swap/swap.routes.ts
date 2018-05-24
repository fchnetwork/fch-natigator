import { Routes, RouterModule } from '@angular/router';
import { NgModule } from "@angular/core"; 
import { CreateSwapComponent } from '@app/wallet/swap/components/create-swap/create-swap.component';
import { LoadSwapComponent } from '@app/wallet/swap/components/load-swap/load-swap.component';

const SWAP_ROUTES: Routes = [{
  path: '', 
  children: [
    {
      path: 'create',
      component: CreateSwapComponent,
    },
    {
      path: 'load',
      component: LoadSwapComponent,
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(SWAP_ROUTES)],
  exports: [RouterModule]
})
export class SwapRoutingModule { }