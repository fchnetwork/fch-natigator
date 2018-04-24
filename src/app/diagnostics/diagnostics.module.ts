import { CommonModule } from "@angular/common";
import { NgModule, ModuleWithProviders } from "@angular/core";
import { AppUIModule } from "../app.ui.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { SharedModule } from "../shared/shared.module";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { HttpClient } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { AppRoutingModule } from "../app.routes";
import { AuthenticationService } from "../account/services/authentication-service/authentication.service";
import { CanActivateViaAuthGuard } from "../app.guard";
import { ModalService } from "../shared/services/modal.service";
import { OverviewComponent } from './overview/overview.component';

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, '../assets/i18n/', '.json');
}

@NgModule({
    entryComponents: [

    ],
    imports: [
        FormsModule,
        AppUIModule,
        CommonModule,
        ReactiveFormsModule,
        SharedModule,
    ],
    declarations: [
        OverviewComponent
    ],
    providers: [
        AuthenticationService,
        ModalService,
        CanActivateViaAuthGuard
    ]
})

export class DiagnosticsModule {
    static forRoot(): ModuleWithProviders {
      return {
        ngModule: DiagnosticsModule,
        providers: [
        ]
      };
    }
  }
  