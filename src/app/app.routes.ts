import { QrScannerComponent } from './shared/components/qr-scanner/qr-scanner.component';
import { ExternalModule } from './external/external.module';
import { AccountModule } from './account/account.module';
import { WalletModule } from './wallet/wallet.module';
import { AuthenticationGuard } from './core/authentication/auth-guards/authentication.guard';
import { RouterModule, PreloadAllModules } from "@angular/router";
import { NgModule } from "@angular/core";

const ROUTES = [
  {
    path: '',
    redirectTo: 'wallet',
    pathMatch: 'full'
  },
  // TO PREVENT LAZY LOADING OF COMPONENTS ACCESSIBLE IMMEDIATELY AFTER LOAD
  {
    path: 'account',
    loadChildren: 'app/account/account.module#AccountModule'
  },
  {
    path: 'wallet',
    canActivate: [AuthenticationGuard],
    loadChildren: 'app/wallet/wallet.module#WalletModule'
  },
  {
    path: 'external',
    canActivate: [AuthenticationGuard],
    loadChildren: 'app/external/external.module#ExternalModule'
  },
  {
    path: '**',
    redirectTo: '/not-found'
  }

];

@NgModule({
  imports: [RouterModule.forRoot(ROUTES)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
